from django.urls import path

from .views import (
    PermissionListAPIView,
    RoleDetailAPIView,
    RoleListCreateAPIView,
    RolePermissionAPIView,
    UserRoleAssignAPIView,
    UserRoleAPIView,
    UserRoleRemoveAPIView,
)

urlpatterns = [
    path(
        "roles/",
        RoleListCreateAPIView.as_view(),
        name="role-list",
    ),
    path(
        "roles/<int:pk>/",
        RoleDetailAPIView.as_view(),
        name="role-detail",
    ),
    path(
        "permissions/",
        PermissionListAPIView.as_view(),
        name="permission-list",
    ),
    path(
        "roles/<int:pk>/permissions/",
        RolePermissionAPIView.as_view(),
        name="role-permissions",
    ),


    path(
        "users/<int:user_id>/roles/assign/",
        UserRoleAssignAPIView.as_view(),
        name="user-role-assign",
    ),

    path(
        "users/<int:user_id>/roles/",
        UserRoleAPIView.as_view(),
        name="user-roles",
    ),

    path(
        "users/<int:user_id>/roles/<int:role_id>/",
        UserRoleRemoveAPIView.as_view(),
        name="user-role-remove",
    ),
]