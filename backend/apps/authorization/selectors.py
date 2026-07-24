from django.shortcuts import get_object_or_404

from apps.authorization.models import (
    Permission,
    Role,
    UserRole,
    RolePermission,
)


# ==========================
# Existing RBAC Selectors
# ==========================

def get_user_roles(user):
    return (
        UserRole.objects
        .filter(user=user)
        .select_related("role")
    )


def get_user_permissions(user):
    return (
        Permission.objects
        .filter(
            permission_roles__role__user_roles__user=user,
            is_active=True,
        )
        .values_list("code", flat=True)
        .distinct()
    )


# ==========================
# Role Management Selectors
# ==========================

def list_roles():
    return (
        Role.objects
        .prefetch_related(
            "role_permissions__permission",
        )
        .order_by("name")
    )


def get_role_by_id(pk):
    return get_object_or_404(
        Role.objects.prefetch_related(
            "role_permissions__permission",
        ),
        pk=pk,
    )


def list_permissions():
    return (
        Permission.objects
        .filter(is_active=True)
        .order_by("module", "action")
    )


def get_permission_by_id(pk):
    return get_object_or_404(Permission, pk=pk)


def get_role_permissions(role):
    return (
        RolePermission.objects
        .filter(role=role)
        .select_related("permission")
    )


def get_available_roles():
    return (
        Role.objects
        .filter(is_active=True)
        .order_by("name")
    )


def get_role_users(role):
    return (
        UserRole.objects
        .filter(role=role)
        .select_related(
            "user",
            "role",
        )
        .prefetch_related(
            "role__role_permissions__permission",
        )
    )


def get_user_role(user, role):
    return get_object_or_404(
        UserRole.objects.select_related(
            "user",
            "role",
        ),
        user=user,
        role=role,
    )


def get_user_role_by_id(pk):
    return get_object_or_404(
        UserRole.objects.select_related(
            "user",
            "role",
        ),
        pk=pk,
    )


def get_user_roles_by_user(user):
    return (
        UserRole.objects
        .filter(user=user)
        .select_related("role")
        .prefetch_related(
            "role__role_permissions__permission",
        )
        .order_by("role__name")
    )