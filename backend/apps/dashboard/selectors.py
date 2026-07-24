from django.contrib.auth import get_user_model
from django.db.models import Count

from apps.audit.models import AuditLog
from apps.authorization.models import Permission, Role

User = get_user_model()


# -------------------------
# Dashboard Statistics
# -------------------------

def get_total_users():
    return User.objects.count()


def get_active_users():
    return User.objects.filter(
        is_active=True
    ).count()


def get_inactive_users():
    return User.objects.filter(
        is_active=False
    ).count()


def get_total_roles():
    return Role.objects.count()


def get_total_permissions():
    return Permission.objects.count()


def get_total_audit_logs():
    return AuditLog.objects.count()


# -------------------------
# Dashboard Widgets
# -------------------------

def get_recent_users(limit=5):
    return (
        User.objects
        .order_by("-date_joined")[:limit]
    )


def get_recent_audit_logs(limit=10):
    return (
        AuditLog.objects
        .select_related("user")
        .order_by("-created_at")[:limit]
    )


def get_users_per_role():
    return (
        Role.objects
        .prefetch_related(
            "role_permissions__permission",
            "role_users",
        )
        .annotate(
            user_count=Count("role_users"),
        )
        .order_by("name")
    )


# -------------------------
# Aggregated Dashboard
# -------------------------

def get_dashboard_statistics():
    return {
        "total_users": get_total_users(),
        "active_users": get_active_users(),
        "inactive_users": get_inactive_users(),
        "total_roles": get_total_roles(),
        "total_permissions": get_total_permissions(),
        "total_audit_logs": get_total_audit_logs(),
    }


def get_recent_activity(limit=10):
    return get_recent_audit_logs(limit)