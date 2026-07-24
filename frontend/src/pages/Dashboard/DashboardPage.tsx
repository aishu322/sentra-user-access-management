import { useMemo } from "react";

import { getApiErrorMessage } from "../../api/error";
import { useAuth } from "../../providers/AuthProvider";
import DashboardLayout from "../../layouts/DashboardLayout";
import ActivityCard from "./components/ActivityCard";
import Sidebar from "./components/Sidebar";
import StatCard from "./components/StatCard";
import { dashboardNavItems } from "./dashboard.navigation";
import { useDashboardPageData } from "./hooks/useDashboardPageData";
import { mapDashboard } from "./dashboard.mappers";
import type { DashboardPageData } from "./dashboard.types";
import "./DashboardPage.css";

type DashboardPageProps = {
    data?: DashboardPageData;
};

function buildFallbackSidebarUser(name: string | null | undefined) {
    const resolvedName = name?.trim() || "Loading";

    const initials =
        resolvedName
            .split(" ")
            .map((part) => part.trim())
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase())
            .join("") || "L";

    return {
        name: resolvedName,
        role: "Loading...",
        avatarLabel: initials,
    };
}

export default function DashboardPage({
    data,
}: DashboardPageProps) {
    const auth = useAuth();

    const query = useDashboardPageData();

    const viewModel =
        data ??
        (query.data ? mapDashboard(query.data) : undefined);

    const sidebarUser = useMemo(() => {
        if (viewModel) {
            return {
                ...viewModel.sidebarUser,
                name:
                    [
                        auth.user?.first_name,
                        auth.user?.last_name,
                    ]
                        .filter(Boolean)
                        .join(" ")
                    || auth.user?.email
                    || viewModel.sidebarUser.name,
            };
        }

        return buildFallbackSidebarUser(
            [
                auth.user?.first_name,
                auth.user?.last_name,
            ]
                .filter(Boolean)
                .join(" ")
            || auth.user?.email
        );
    }, [
        auth.user?.email,
        auth.user?.first_name,
        auth.user?.last_name,
        viewModel,
    ]);

    const isLoading =
        query.isLoading && !viewModel;

    const errorMessage =
        query.isError
            ? getApiErrorMessage(
                  query.error,
                  "We couldn't load the dashboard."
              )
            : null;

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (errorMessage) {
        return <div>{errorMessage}</div>;
    }

    if (!viewModel) {
        return null;
    }

    return (
        <DashboardLayout
            sidebar={
                <Sidebar
                    navItems={
                        viewModel.navItems ??
                        dashboardNavItems
                    }
                    user={sidebarUser}
                />
            }
        >
            <section className="dashboard-content">
                <header className="dashboard-header">
                    <div>
                        <h1>{viewModel.title}</h1>
                        <p>{viewModel.subtitle}</p>
                    </div>
                </header>

                <section className="dashboard-stats">
                    {viewModel.stats.map((stat) => (
                        <StatCard
                            key={stat.label}
                            label={stat.label}
                            value={stat.value}
                            accent={stat.accent}
                        />
                    ))}
                </section>

                <ActivityCard
                    title="Recent activity"
                    viewAllHref={viewModel.auditHref}
                    activities={viewModel.activities}
                />
            </section>
        </DashboardLayout>
    );
}