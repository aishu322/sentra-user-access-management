from rest_framework.permissions import IsAuthenticated

from apps.authorization.permissions import HasPermission


class AuthenticatedRBACPermission(IsAuthenticated, HasPermission):
    """
    Requires:
    1. Authenticated user
    2. Required RBAC permission
    """

    def has_permission(self, request, view):
        authenticated = IsAuthenticated.has_permission(
            self,
            request,
            view,
        )

        if not authenticated:
            return False

        return HasPermission.has_permission(
            self,
            request,
            view,
        )