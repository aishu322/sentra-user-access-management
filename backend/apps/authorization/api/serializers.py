from rest_framework import serializers

from apps.authorization.models import (
    Permission,
    Role,
    UserRole,
)
from apps.users.models import User
from drf_spectacular.utils import extend_schema_field


class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = (
            "id",
            "module",
            "action",
            "code",
            "name",
            "description",
            "is_active",
        )
        read_only_fields = fields


class RoleSerializer(serializers.ModelSerializer):
    permission_count = serializers.SerializerMethodField()
    permissions = serializers.SerializerMethodField()

    class Meta:
        model = Role
        fields = (
            "id",
            "name",
            "code",
            "description",
            "is_system",
            "is_active",
            "permission_count",
            "permissions",
        )

    def validate_name(self, value):
        qs = Role.objects.filter(name=value)

        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)

        if qs.exists():
            raise serializers.ValidationError(
                "A role with this name already exists."
            )

        return value

    def validate_code(self, value):
        qs = Role.objects.filter(code=value)

        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)

        if qs.exists():
            raise serializers.ValidationError(
                "A role with this code already exists."
            )

        return value

    def get_permission_count(self, obj):
        return sum(
            1
            for rp in obj.role_permissions.all()
            if rp.permission.is_active
        )
        
    @extend_schema_field(PermissionSerializer(many=True))
    def get_permissions(self, obj):
        role_permissions = obj.role_permissions.all()

        permissions = [
            rp.permission
            for rp in role_permissions
            if rp.permission.is_active
        ]

        permissions.sort(
            key=lambda p: (p.module, p.action)
        )

        return PermissionSerializer(
            permissions,
            many=True,
        ).data
        
class RolePermissionSerializer(serializers.Serializer):
    permission_ids = serializers.ListField(
        child=serializers.IntegerField(
            min_value=1,
        ),
        allow_empty=True,
    )

    def validate_permission_ids(self, value):
        existing = set(
            Permission.objects.filter(
                id__in=value,
                is_active=True,
            ).values_list("id", flat=True)
        )

        invalid = sorted(set(value) - existing)

        if invalid:
            raise serializers.ValidationError(
                f"Invalid permission ids: {invalid}"
            )

        return value
    
class UserRoleSerializer(serializers.ModelSerializer):
    """
    Display roles assigned to a user.
    """

    role_id = serializers.IntegerField(
        source="role.id",
        read_only=True,
    )

    role_name = serializers.CharField(
        source="role.name",
        read_only=True,
    )

    role_code = serializers.CharField(
        source="role.code",
        read_only=True,
    )

    class Meta:
        model = UserRole
        fields = (
            "id",
            "role_id",
            "role_name",
            "role_code",
        )


class AssignRoleSerializer(serializers.Serializer):
    """
    Assign one role to a user.
    """

    role_id = serializers.IntegerField()

    def validate_role_id(self, value):

        if not Role.objects.filter(
            id=value,
            is_active=True,
        ).exists():

            raise serializers.ValidationError(
                "Invalid or inactive role."
            )

        return value


class ReplaceRolesSerializer(serializers.Serializer):
    """
    Replace all roles assigned to a user.
    """

    role_ids = serializers.ListField(
        child=serializers.IntegerField(),
        allow_empty=True,
    )

    def validate_role_ids(self, value):

        roles = Role.objects.filter(
            id__in=value,
            is_active=True,
        )

        if len(value) != roles.count():

            raise serializers.ValidationError(
                "One or more roles are invalid or inactive."
            )

        return value


class UserWithRolesSerializer(serializers.ModelSerializer):
    """
    User details including assigned roles.
    """

    roles = serializers.SerializerMethodField()

    class Meta:
        model = User

        fields = (
            "id",
            "email",
            "first_name",
            "last_name",
            "is_active",
            "roles",
        )

    def get_roles(self, obj):

        assignments = (
            UserRole.objects
            .filter(user=obj)
            .select_related("role")
        )

        return UserRoleSerializer(
            assignments,
            many=True,
        ).data