from django.urls import path

from .views import (
    UserListCreateAPIView,
    UserDetailAPIView,
    UserActivateAPIView,
    UserDeactivateAPIView,
    UserResetPasswordAPIView,
)

urlpatterns = [
    path(
        "users/",
        UserListCreateAPIView.as_view(),
        name="user-list",
    ),
    path(
        "users/<int:pk>/",
        UserDetailAPIView.as_view(),
        name="user-detail",
    ),
    path(
        "users/<int:pk>/activate/",
        UserActivateAPIView.as_view(),
        name="user-activate",
    ),
    path(
        "users/<int:pk>/deactivate/",
        UserDeactivateAPIView.as_view(),
        name="user-deactivate",
    ),
    path(
        "users/<int:pk>/reset-password/",
        UserResetPasswordAPIView.as_view(),
        name="user-reset-password",
    ),
]