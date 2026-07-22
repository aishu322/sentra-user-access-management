import type { LucideIcon } from "lucide-react";

/* -------------------- API -------------------- */

export interface DashboardStatistics {
    total_users: number;
    active_users: number;
    inactive_users: number;
    total_roles: number;
    total_permissions: number;
    total_audit_logs: number;
}

export interface RecentUser {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    is_active: boolean;
    date_joined: string;
}

export interface RecentActivity {
    id: number;
    user: string;
    action: string;
    description: string;
    created_at: string;
}

export interface UsersPerRole {
    id: number;
    name: string;
    code: string;
    user_count: number;
}

export interface DashboardData {
    statistics: DashboardStatistics;
    recent_activity: RecentActivity[];
    recent_users: RecentUser[];
    users_per_role: UsersPerRole[];
}

/* -------------------- UI -------------------- */

export interface DashboardStatCard {
    label: string;
    value: string;
    accent: "blue" | "green" | "orange" | "purple";
}

export interface DashboardActivity {
    id: number;
    actor: string;
    action: string;
    description: string;
    timestamp: string;
}

export interface DashboardNavItem {
    label: string;
    to: string;
    icon: LucideIcon;
    end?: boolean;
}

export interface DashboardSidebarUser {
    name: string;
    role: string;
    avatarLabel: string;
}

export interface DashboardPageData {
    title: string;
    subtitle: string;

    stats: DashboardStatCard[];

    activities: DashboardActivity[];

    auditHref: string;

    navItems: DashboardNavItem[];

    sidebarUser: DashboardSidebarUser;
}