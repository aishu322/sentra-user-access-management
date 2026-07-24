from django.shortcuts import get_object_or_404

from apps.audit.models import AuditLog


def get_audit_logs():
    """
    Return all audit logs ordered by newest first.
    """
    return (
        AuditLog.objects
        .select_related("user")
        .order_by("-created_at")
    )


def get_audit_log_by_id(pk: int):
    """
    Return a single audit log.
    """
    return get_object_or_404(
        AuditLog.objects.select_related("user"),
        pk=pk,
    )


def get_recent_audit_logs(limit: int = 10):
    """
    Return latest audit logs.
    """
    return (
        AuditLog.objects
        .select_related("user")
        .order_by("-created_at")[:limit]
    )