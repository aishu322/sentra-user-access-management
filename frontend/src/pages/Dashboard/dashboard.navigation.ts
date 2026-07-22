import {
    Clock3,
    LayoutGrid,
    ShieldCheck,
    Users,
} from "lucide-react";

import type { DashboardNavItem } from "./dashboard.types";

export const dashboardNavItems: DashboardNavItem[] = [
    {
        label: "Dashboard",
        to: "/",
        icon: LayoutGrid,
        end: true,
    },
    {
        label: "Users",
        to: "/users",
        icon: Users,
    },
    {
        label: "Roles & Permissions",
        to: "/roles",
        icon: ShieldCheck,
    },
    {
        label: "Audit Log",
        to: "/audit",
        icon: Clock3,
    },
];
