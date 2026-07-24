from django.db import transaction
from django.shortcuts import get_object_or_404
from django.core.exceptions import ValidationError

from apps.users.models import User
from apps.audit.services import AuditService

from apps.authorization.models import (
    Permission,
    Role,
    RolePermission,
    UserRole,
)

from apps.authorization.selectors import (
    get_user_permissions,
    get_user_roles,
)
from apps.common.constants import SUPER_ADMIN


class AuthorizationService:
    """
    Enterprise RBAC service.
    """

    @staticmethod
    def user_roles(user):
        return get_user_roles(user)

    @staticmethod
    def user_permissions(user):
        return get_user_permissions(user)

    @staticmethod
    def is_super_admin(user):
        roles = get_user_roles(user)

        return any(
            assignment.role.code == SUPER_ADMIN
            for assignment in roles
        )

    @staticmethod
    def has_permission(user, permission_code):

        if not user.is_authenticated:
            return False

        if AuthorizationService.is_super_admin(user):
            return True

        permissions = get_user_permissions(user)

        return permission_code in permissions

class AuthorizationManagementService:
    """
    Business logic for Role & Permission management.
    """

    @staticmethod
    def list_roles():
        return (
            Role.objects
            .prefetch_related("role_permissions")
            .all()
        )

    @staticmethod
    def get_role(role_id):
        return get_object_or_404(
            Role,
            id=role_id,
        )

    @staticmethod
    def create_role(validated_data):

        if Role.objects.filter(code=validated_data["code"]).exists():
            raise ValidationError("Role code already exists.")

        role = Role.objects.create(**validated_data)

        AuditService.create_log(
            action="CREATE_ROLE",
            description=f"Role '{role.name}' created.",
        )

        return role

    @staticmethod
    def update_role(role, validated_data):

        if role.is_system:
            raise ValidationError(
                "System roles cannot be modified."
            )

        for field, value in validated_data.items():
            setattr(role, field, value)

        role.save()

        AuditService.create_log(
            action="UPDATE_ROLE",
            description=f"Role '{role.name}' updated.",
        )

        return role

    @staticmethod
    def delete_role(role):

        if role.is_system:
            raise ValidationError(
                "System roles cannot be deleted."
            )

        role_name = role.name

        role.delete()

        AuditService.create_log(
            action="DELETE_ROLE",
            description=f"Role '{role_name}' deleted.",
        )

    @staticmethod
    @transaction.atomic
    def assign_permissions(role, permission_ids):

        if role.is_system:
            raise ValidationError(
                "Permissions of system roles cannot be modified."
            )

        RolePermission.objects.filter(
            role=role
        ).delete()

        permissions = Permission.objects.filter(
            id__in=permission_ids,
            is_active=True,
        )

        RolePermission.objects.bulk_create(
            [
                RolePermission(
                    role=role,
                    permission=permission,
                )
                for permission in permissions
            ]
        )

        AuditService.create_log(
            action="ASSIGN_PERMISSIONS",
            description=f"Permissions updated for role '{role.name}'.",
        )

        return role

    @staticmethod
    def get_role_permissions(role):

        return Permission.objects.filter(
            permission_roles__role=role
        )
        
    @staticmethod
    @transaction.atomic
    def assign_role(user_id, role_id):
        """
        Assign a role to a user.
        """

        user = get_object_or_404(User, pk=user_id)
        role = get_object_or_404(Role, pk=role_id)

        if not role.is_active:
            raise ValidationError(
                "Cannot assign an inactive role."
            )

        assignment, created = UserRole.objects.get_or_create(
            user=user,
            role=role,
        )

        if not created:
            raise ValidationError(
                "User already has this role."
            )

        AuditService.create_log(
            user=user,
            action="ASSIGN_ROLE",
            description=f"Assigned role '{role.name}' to '{user.email}'.",
        )

        return assignment

    @staticmethod
    @transaction.atomic
    def remove_role(user_id, role_id):
        """
        Remove a role from a user.
        """

        user = get_object_or_404(User, pk=user_id)
        role = get_object_or_404(Role, pk=role_id)

        assignment = get_object_or_404(
            UserRole,
            user=user,
            role=role,
        )

        assignment.delete()

        AuditService.create_log(
            user=user,
            action="REMOVE_ROLE",
            description=f"Removed role '{role.name}' from '{user.email}'.",
        )

    @staticmethod
    @transaction.atomic
    def replace_roles(user_id, role_ids):
        """
        Replace all user roles.
        """

        user = get_object_or_404(User, pk=user_id)

        roles = Role.objects.filter(
            id__in=role_ids,
            is_active=True,
        )

        UserRole.objects.filter(
            user=user,
        ).delete()

        UserRole.objects.bulk_create(
            [
                UserRole(
                    user=user,
                    role=role,
                )
                for role in roles
            ]
        )

        AuditService.create_log(
            user=user,
            action="REPLACE_ROLES",
            description=f"Updated roles for '{user.email}'.",
        )

        return UserRole.objects.filter(
            user=user,
        ).select_related("role")

    @staticmethod
    def user_roles(user_id):
        """
        Return all roles assigned to a user.
        """

        user = get_object_or_404(User, pk=user_id)

        return (
            UserRole.objects
            .filter(user=user)
            .select_related("role")
            .order_by("role__name")
        )