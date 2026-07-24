from apps.dashboard.selectors import (
    get_dashboard_statistics,
    get_recent_activity,
    get_recent_users,
    get_users_per_role,
)

from django.core.cache import cache

class DashboardService:
    """
    Business logic for the dashboard.
    """

    @staticmethod
    def get_dashboard():

        """
        Return all dashboard data in a single response.
        """
        
        dashboard = cache.get("dashboard_data")

        if dashboard:
            return dashboard
        
        statistics = get_dashboard_statistics()

        recent_activity = [
            {
                "id": log.id,
                "user": log.user.email if log.user else "System",
                "action": log.action,
                "description": log.description,
                "created_at": log.created_at,
            }
            for log in get_recent_activity()
        ]

        recent_users = [
            {
                "id": user.id,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "is_active": user.is_active,
                "date_joined": user.date_joined,
            }
            for user in get_recent_users()
        ]

        users_per_role = [
            {
                "id": role.id,
                "name": role.name,
                "code": role.code,
                "user_count": role.user_count,
            }
            for role in get_users_per_role()
        ]

        dashboard = {
            "statistics": statistics,
            "recent_activity": recent_activity,
            "recent_users": recent_users,
            "users_per_role": users_per_role,
        }

        cache.set(
            "dashboard_data",
            dashboard,
            timeout=300,
        )

        return dashboard