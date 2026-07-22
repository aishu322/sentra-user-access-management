import type { ReactNode } from "react";

type DashboardLayoutProps = {
    sidebar: ReactNode;
    children: ReactNode;
};

export default function DashboardLayout({
    sidebar,
    children,
}: DashboardLayoutProps) {
    return (
        <div className="dashboard-shell">
            {sidebar}
            <main className="dashboard-main">{children}</main>
        </div>
    );
}
