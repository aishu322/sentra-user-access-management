from rest_framework.generics import ListAPIView, RetrieveAPIView

from apps.audit.api.serializers import AuditLogSerializer
from apps.audit.selectors import (
    get_audit_logs,
    get_audit_log_by_id,
)
from apps.authorization.permissions import HasPermission
from apps.common.permissions import AuthenticatedRBACPermission
from apps.common.views import EnterpriseListAPIView


class AuditLogListAPIView(EnterpriseListAPIView):
    """
    List all audit logs.
    """

    serializer_class = AuditLogSerializer

    permission_classes = [
        AuthenticatedRBACPermission,
    ]

    required_permission = HasPermission.AUDIT_VIEW
    
    search_fields = (
        "action",
        "description",
        "user__email",
    )

    ordering_fields = (
        "created_at",
    )

    filterset_fields = (
        "action",
    )

    def get_queryset(self):
        return get_audit_logs()


class AuditLogDetailAPIView(RetrieveAPIView):
    """
    Retrieve a single audit log.
    """

    serializer_class = AuditLogSerializer

    permission_classes = [
        AuthenticatedRBACPermission,
    ]

    required_permission = HasPermission.AUDIT_VIEW

    lookup_url_kwarg = "pk"

    def get_object(self):
        return get_audit_log_by_id(
            self.kwargs["pk"]
        )