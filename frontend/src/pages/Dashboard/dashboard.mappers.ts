import { dashboardNavItems } from "./dashboard.navigation";

import type {
    DashboardData,
    DashboardPageData,
} from "./dashboard.types";

export function mapDashboard(
    api: DashboardData
): DashboardPageData {
    return {
        title: "Dashboard",

        subtitle:
            "Overview of your User Access Management platform.",

        navItems: dashboardNavItems,

        sidebarUser: {
            name: "Administrator",
            role: "System Administrator",
            avatarLabel: "A",
        },

        stats: [
            {
                label: "Users",
                value: api.statistics.total_users.toString(),
                accent: "blue",
            },
            {
                label: "Roles",
                value: api.statistics.total_roles.toString(),
                accent: "green",
            },
            {
                label: "Permissions",
                value:
                    api.statistics.total_permissions.toString(),
                accent: "purple",
            },
            {
                label: "Audit Logs",
                value:
                    api.statistics.total_audit_logs.toString(),
                accent: "orange",
            },
        ],

        activities: api.recent_activity.map((activity) => ({
            id: activity.id,
            actor: activity.user,
            action: activity.action,
            description: activity.description,
            timestamp: new Date(
                activity.created_at
            ).toLocaleString(),
        })),

        auditHref: "/audit",
    };
}