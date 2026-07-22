import { useMemo } from "react";

import { getApiErrorMessage } from "../../api/error";
import { useAuth } from "../../providers/AuthProvider";
import DashboardLayout from "../../layouts/DashboardLayout";
import ActivityCard from "./components/ActivityCard";
import Sidebar from "./components/Sidebar";
import StatCard from "./components/StatCard";
import { dashboardNavItems } from "./dashboard.navigation";
import { useDashboardPageData } from "./hooks/useDashboardPageData";
import type { DashboardPageData } from "./dashboard.types";
import "./DashboardPage.css";

type DashboardPageProps = {
    data?: DashboardPageData;
};

function buildFallbackSidebarUser(name: string | null | undefined) {
    const resolvedName = name?.trim() || "Loading";

    const initials = resolvedName
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

function DashboardLoadingState() {
    return (
        <section
            className="dashboard-state dashboard-state--loading"
            aria-busy="true"
            aria-live="polite"
            aria-label="Loading dashboard"
        >
            <div className="dashboard-skeleton dashboard-skeleton--title" />
            <div className="dashboard-skeleton dashboard-skeleton--subtitle" />

            <section className="dashboard-stats" aria-hidden="true">
                {Array.from({ length: 4 }).map((_, index) => (
                    <article className="stat-card stat-card--skeleton" key={index}>
                        <span className="dashboard-skeleton dashboard-skeleton--label" />
                        <span className="dashboard-skeleton dashboard-skeleton--value" />
                    </article>
                ))}
            </section>

            <section className="activity-card activity-card--skeleton">
                <div className="activity-card__header">
                    <div className="dashboard-skeleton dashboard-skeleton--section-title" />
                    <div className="dashboard-skeleton dashboard-skeleton--link" />
                </div>

                <div className="dashboard-skeleton-group" aria-hidden="true">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div className="dashboard-skeleton-row" key={index}>
                            <span className="dashboard-skeleton dashboard-skeleton--timestamp" />
                            <span className="dashboard-skeleton dashboard-skeleton--badge" />
                            <span className="dashboard-skeleton dashboard-skeleton--text" />
                        </div>
                    ))}
                </div>
            </section>
        </section>
    );
}

function DashboardErrorState({
    message,
    onRetry,
}: {
    message: string;
    onRetry: () => void;
}) {
    return (
        <section className="dashboard-state dashboard-state--error" role="alert">
            <h1>Dashboard unavailable</h1>
            <p>{message}</p>
            <button className="dashboard-retry" type="button" onClick={onRetry}>
                Try again
            </button>
        </section>
    );
}

export default function DashboardPage({
    data,
}: DashboardPageProps) {
    const auth = useAuth();
    const query = useDashboardPageData({
        enabled: !data,
    });

    const viewModel = data ?? query.data;

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

    const isLoading = !data && query.isLoading && !viewModel;
    const errorMessage =
        !data && query.isError
            ? getApiErrorMessage(query.error, "We couldn't load the dashboard.")
            : null;

    return (
        <DashboardLayout
            sidebar={
                <Sidebar
                    navItems={viewModel?.navItems ?? dashboardNavItems}
                    user={sidebarUser}
                />
            }
        >
            {isLoading && <DashboardLoadingState />}

            {!isLoading && errorMessage && (
                <DashboardErrorState
                    message={errorMessage}
                    onRetry={() => {
                        void query.refetch();
                    }}
                />
            )}

            {!isLoading && !errorMessage && viewModel && (
                <section
                    className="dashboard-content"
                    aria-labelledby="dashboard-title"
                >
                    <header className="dashboard-header">
                        <div>
                            <h1 id="dashboard-title">{viewModel.title}</h1>
                            <p>{viewModel.subtitle}</p>
                        </div>
                    </header>

                    <section
                        className="dashboard-stats"
                        aria-label="Key statistics"
                    >
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
            )}
        </DashboardLayout>
    );
}
