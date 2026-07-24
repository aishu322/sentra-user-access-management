from apps.audit.models import AuditLog
from apps.audit.selectors import (
    get_audit_log_by_id,
    get_audit_logs,
    get_recent_audit_logs,
)


class AuditService:
    """
    Enterprise Audit Service.

    Handles creation and retrieval of audit logs.
    """

    @staticmethod
    def create_log(
        *,
        user=None,
        action: str,
        description: str,
        ip_address: str = None,
        user_agent: str = "",
    ) -> AuditLog:
        """
        Create an audit log entry.
        """
        return AuditLog.objects.create(
            user=user,
            action=action,
            description=description,
            ip_address=ip_address,
            user_agent=user_agent,
        )

    @staticmethod
    def list_logs():
        """
        Return all audit logs.
        """
        return get_audit_logs()

    @staticmethod
    def get_log(pk: int):
        """
        Return a single audit log.
        """
        return get_audit_log_by_id(pk)

    @staticmethod
    def recent_logs(limit: int = 10):
        """
        Return recent audit logs.
        """
        return get_recent_audit_logs(limit)