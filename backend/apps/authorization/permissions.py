from rest_framework.permissions import BasePermission

from apps.authorization.services import AuthorizationService


class HasPermission(BasePermission):
    """
    Enterprise RBAC permission class.
    """

    # -------------------------
    # User permissions
    # -------------------------
    USER_VIEW = "users.view"
    USER_CREATE = "users.create"
    USER_UPDATE = "users.update"
    USER_DELETE = "users.delete"

    # -------------------------
    # Role permissions
    # -------------------------
    ROLE_VIEW = "roles.view"
    ROLE_CREATE = "roles.create"
    ROLE_UPDATE = "roles.update"
    ROLE_DELETE = "roles.delete"

    # -------------------------
    # Permission permissions
    # -------------------------
    PERMISSION_VIEW = "permissions.view"
    PERMISSION_CREATE = "permissions.create"
    PERMISSION_UPDATE = "permissions.update"
    PERMISSION_DELETE = "permissions.delete"

    # -------------------------
    # Dashboard
    # -------------------------
    DASHBOARD_VIEW = "dashboard.view"
    
    AUDIT_VIEW = "audit.view"

    message = "You do not have permission to perform this action."

    def has_permission(self, request, view):
        required_permission = getattr(
            view,
            "required_permission",
            None,
        )

        if required_permission is None:
            return True

        return AuthorizationService.has_permission(
            request.user,
            required_permission,
        )