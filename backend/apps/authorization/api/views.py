from django.core.exceptions import ValidationError
from django.shortcuts import get_object_or_404

from rest_framework import generics, status
from rest_framework.response import Response

from apps.authorization.api.serializers import (
    PermissionSerializer,
    RolePermissionSerializer,
    RoleSerializer,
    AssignRoleSerializer,
    ReplaceRolesSerializer,
    UserRoleSerializer,
)
from apps.users.api.serializers import EmptySerializer

from apps.authorization.constants import Permissions
from apps.authorization.models import (
    Permission,
    Role,
)
from apps.authorization.services import AuthorizationManagementService
from apps.common.permissions import AuthenticatedRBACPermission
from apps.common.views import EnterpriseListAPIView
from apps.users.models import User


class RoleListCreateAPIView(EnterpriseListAPIView):

    serializer_class = RoleSerializer
    permission_classes = [AuthenticatedRBACPermission]
    search_fields = (
        "name",
        "code",
    )

    ordering_fields = (
        "name",
        "created_at",
    )

    filterset_fields = (
        "is_active",
        "is_system",
    )    

    def get_queryset(self):

        queryset = AuthorizationManagementService.list_roles()

        search = self.request.query_params.get("search")

        if search:
            queryset = queryset.filter(name__icontains=search)

        ordering = self.request.query_params.get(
            "ordering",
            "name",
        )

        return queryset.order_by(ordering)

    def get_permissions(self):

        if self.request.method == "GET":
            self.required_permission = Permissions.ROLES_VIEW
        else:
            self.required_permission = Permissions.ROLES_CREATE

        return super().get_permissions()

    def perform_create(self, serializer):

        AuthorizationManagementService.create_role(
            serializer.validated_data
        )


class RoleDetailAPIView(generics.RetrieveUpdateDestroyAPIView):

    serializer_class = RoleSerializer
    permission_classes = [AuthenticatedRBACPermission]

    queryset = Role.objects.all()

    def get_permissions(self):

        if self.request.method == "GET":
            self.required_permission = Permissions.ROLES_VIEW

        elif self.request.method in ["PUT", "PATCH"]:
            self.required_permission = Permissions.ROLES_UPDATE

        else:
            self.required_permission = Permissions.ROLES_DELETE

        return super().get_permissions()

    def perform_update(self, serializer):

        try:

            AuthorizationManagementService.update_role(
                self.get_object(),
                serializer.validated_data,
            )

        except ValidationError as exc:

            raise ValidationError(exc)

    def perform_destroy(self, instance):

        try:

            AuthorizationManagementService.delete_role(instance)

        except ValidationError as exc:

            raise ValidationError(exc)


class PermissionListAPIView(generics.ListAPIView):

    serializer_class = PermissionSerializer
    permission_classes = [AuthenticatedRBACPermission]

    required_permission = Permissions.ROLES_VIEW

    def get_queryset(self):

        queryset = Permission.objects.filter(
            is_active=True,
        )

        search = self.request.query_params.get("search")

        if search:
            queryset = queryset.filter(
                name__icontains=search,
            )

        return queryset.order_by(
            "module",
            "action",
        )


class RolePermissionAPIView(generics.GenericAPIView):

    serializer_class = RolePermissionSerializer
    permission_classes = [AuthenticatedRBACPermission]

    required_permission = Permissions.ROLES_UPDATE

    def get(self, request, pk):

        role = get_object_or_404(
            Role,
            pk=pk,
        )

        permissions = AuthorizationManagementService.get_role_permissions(
            role
        )

        serializer = PermissionSerializer(
            permissions,
            many=True,
        )

        return Response(serializer.data)

    def put(self, request, pk):

        role = get_object_or_404(
            Role,
            pk=pk,
        )

        serializer = self.get_serializer(
            data=request.data,
        )

        serializer.is_valid(
            raise_exception=True,
        )

        AuthorizationManagementService.assign_permissions(
            role,
            serializer.validated_data["permission_ids"],
        )

        return Response(
            {
                "detail": "Permissions updated successfully."
            },
            status=status.HTTP_200_OK,
        )
        



class UserRoleAssignAPIView(generics.GenericAPIView):
    """
    Assign a role to a user.
    """

    serializer_class = AssignRoleSerializer
    permission_classes = [AuthenticatedRBACPermission]

    required_permission = Permissions.USERS_UPDATE

    def post(self, request, user_id):

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        AuthorizationManagementService.assign_role(
            user_id=user_id,
            role_id=serializer.validated_data["role_id"],
        )

        return Response(
            {"detail": "Role assigned successfully."},
            status=status.HTTP_200_OK,
        )


class UserRoleAPIView(generics.GenericAPIView):
    """
    List or replace roles assigned to a user.
    """

    permission_classes = [AuthenticatedRBACPermission]

    def get_serializer_class(self):
        if self.request.method == "GET":
            return UserRoleSerializer
        return ReplaceRolesSerializer

    def get_permissions(self):
        if self.request.method == "GET":
            self.required_permission = Permissions.USERS_VIEW
        else:
            self.required_permission = Permissions.USERS_UPDATE

        return super().get_permissions()

    def get(self, request, user_id):

        roles = AuthorizationManagementService.user_roles(user_id)

        serializer = UserRoleSerializer(
            roles,
            many=True,
        )

        return Response(serializer.data)

    def put(self, request, user_id):

        serializer = ReplaceRolesSerializer(
            data=request.data
        )

        serializer.is_valid(raise_exception=True)

        AuthorizationManagementService.replace_roles(
            user_id=user_id,
            role_ids=serializer.validated_data["role_ids"],
        )

        return Response(
            {
                "detail": "Roles updated successfully."
            },
            status=status.HTTP_200_OK,
        )


class UserRoleRemoveAPIView(generics.GenericAPIView):
    """
    Remove one role from a user.
    """

    permission_classes = [AuthenticatedRBACPermission]

    required_permission = Permissions.USERS_UPDATE
    serializer_class = EmptySerializer
    
    def delete(self, request, user_id, role_id):

        AuthorizationManagementService.remove_role(
            user_id=user_id,
            role_id=role_id,
        )

        return Response(
            status=status.HTTP_204_NO_CONTENT,
        )