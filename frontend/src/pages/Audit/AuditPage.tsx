import { useMemo, useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { listAuditLogs, type AuditLogItem } from "../../api/audit";
import { getApiErrorMessage } from "../../api/error";
import { dashboardNavItems } from "../Dashboard/dashboard.navigation";
import DashboardLayout from "../../layouts/DashboardLayout";
import PaginationControls from "../../components/PaginationControls";
import "../../styles/admin-pages.css";
import "./AuditPage.css";
import { downloadTextFile, escapeCsvValue } from "../../utils/download";
import { useAuth } from "../../providers/AuthProvider";
import Sidebar from "../Dashboard/components/Sidebar";
import { buildSidebarUser } from "../../utils/sidebar";
import { getAuthenticatedProfileSummary } from "../../api/rbac";

const PAGE_SIZE = 6;

function formatTimestamp(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    const pad = (input: number) => String(input).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(
        date.getHours()
    )}:${pad(date.getMinutes())}`;
}

function getActionTone(action: string) {
    if (action.startsWith("auth.")) {
        return "blue";
    }

    if (action.startsWith("role.")) {
        return "purple";
    }

    return "teal";
}

export default function AuditPage() {
    const [page, setPage] = useState(1);
    const [actionFilter, setActionFilter] = useState("all");

    const logsQuery = useQuery({
        queryKey: ["audit-page", page, actionFilter],
        queryFn: () =>
            listAuditLogs({
                page,
                pageSize: PAGE_SIZE,
                action: actionFilter === "all" ? undefined : actionFilter,
                ordering: "-created_at",
            }),
    });

    const actionsQuery = useQuery({
        queryKey: ["audit-actions"],
        queryFn: async () => {
            const response = await listAuditLogs({
                page: 1,
                pageSize: 100,
                ordering: "-created_at",
            });

            return Array.from(
                new Set(response.results.map((entry) => entry.action))
            ).sort();
        },
    });

    const total = logsQuery.data?.count ?? 0;
    const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const currentPage = Math.min(page, pageCount);

    const exportQuery = useQuery({
        queryKey: ["audit-export", actionFilter],
        queryFn: () =>
            listAuditLogs({
                page: 1,
                pageSize: 100,
                action: actionFilter === "all" ? undefined : actionFilter,
                ordering: "-created_at",
            }),
        enabled: false,
    });

    const exportLogs = async () => {
        const response = await exportQuery.refetch();
        const headers = ["Timestamp", "Actor", "Action", "Detail"];
        const csvLines = [
            headers.join(","),
            ...((response.data?.results ?? []).map((entry: AuditLogItem) =>
                [
                    escapeCsvValue(formatTimestamp(entry.created_at)),
                    escapeCsvValue(entry.user),
                    escapeCsvValue(entry.action),
                    escapeCsvValue(entry.description),
                ].join(",")
            ) ?? []),
        ];

        downloadTextFile("audit-log-export.csv", csvLines.join("\n"), "text/csv;charset=utf-8");
    };

    const actionOptions = useMemo(() => {
        return actionsQuery.data ?? [];
    }, [actionsQuery.data]);

    const loading = logsQuery.isLoading && !logsQuery.data;
    const error = logsQuery.isError;
    const rows = logsQuery.data?.results ?? [];

    return (
        <DashboardLayout sidebar={<AuditSidebar navItems={dashboardNavItems} />}>
            <section className="audit-page" aria-labelledby="audit-page-title">
                <header className="dashboard-header audit-page__header">
                    <div>
                        <h1 id="audit-page-title">Audit Log</h1>
                        <p>Append-only record of every sensitive action</p>
                    </div>
                    <div className="admin-toolbar__actions audit-page__actions">
                        <label>
                            <span className="sr-only">All actions</span>
                            <select
                                className="admin-select audit-page__select"
                                value={actionFilter}
                                onChange={(event) => {
                                    setActionFilter(event.target.value);
                                    setPage(1);
                                }}
                            >
                                <option value="all">All actions</option>
                                {actionOptions.map((action) => (
                                    <option key={action} value={action}>
                                        {action}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <button type="button" className="admin-button" onClick={exportLogs}>
                            <DownloadIcon />
                            Export to Excel
                        </button>
                    </div>
                </header>

                <section className="admin-card audit-page__card">
                    {loading ? (
                        <div className="admin-loading">
                            <div className="admin-spinner" aria-hidden="true" />
                        </div>
                    ) : error ? (
                        <div className="admin-error">
                            <p>{getApiErrorMessage(logsQuery.error, "Unable to load audit logs.")}</p>
                            <button
                                type="button"
                                className="admin-button admin-button--primary"
                                onClick={() => logsQuery.refetch()}
                            >
                                Retry
                            </button>
                        </div>
                    ) : rows.length === 0 ? (
                        <div className="admin-empty">No audit events found.</div>
                    ) : (
                        <>
                            <table className="admin-table audit-page__table">
                                <thead>
                                    <tr>
                                        <th>TIMESTAMP ↓</th>
                                        <th>ACTOR</th>
                                        <th>ACTION</th>
                                        <th>DETAIL</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((row) => (
                                        <tr key={row.id}>
                                            <td className="audit-page__timestamp">
                                                {formatTimestamp(row.created_at)}
                                            </td>
                                            <td className="audit-page__actor">
                                                {row.user}
                                            </td>
                                            <td>
                                                <span
                                                    className={`audit-page__badge audit-page__badge--${getActionTone(
                                                        row.action
                                                    )}`}
                                                >
                                                    {row.action}
                                                </span>
                                            </td>
                                            <td className="audit-page__detail">
                                                {row.description}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <PaginationControls
                                page={currentPage}
                                pageCount={pageCount}
                                onPrevious={() => setPage((current) => Math.max(1, current - 1))}
                                onNext={() => setPage((current) => Math.min(pageCount, current + 1))}
                                isPreviousDisabled={currentPage <= 1}
                                isNextDisabled={currentPage >= pageCount}
                            />
                            <div className="audit-page__meta">
                                <span>
                                    {`Showing ${Math.min((currentPage - 1) * PAGE_SIZE + 1, total)}–${Math.min(
                                        currentPage * PAGE_SIZE,
                                        total
                                    )} of ${total}`}
                                </span>
                                <span>server-side · page_size={PAGE_SIZE}</span>
                            </div>
                        </>
                    )}
                </section>
            </section>
        </DashboardLayout>
    );
}

function AuditSidebar({
    navItems,
}: {
    navItems: typeof dashboardNavItems;
}) {
    const auth = useAuth();
    const profileQuery = useQuery({
        queryKey: ["profile-summary"],
        queryFn: getAuthenticatedProfileSummary,
    });

    if (profileQuery.data) {
        return (
            <Sidebar
                navItems={navItems}
                user={{
                    name: profileQuery.data.displayName,
                    role: profileQuery.data.roleName,
                    avatarLabel: profileQuery.data.avatarLabel,
                }}
            />
        );
    }

    const sidebarUser = buildSidebarUser(
        [auth.user?.first_name, auth.user?.last_name].filter(Boolean).join(" ") || null,
        auth.user?.email ?? null,
        "Loading..."
    );

    return <Sidebar navItems={navItems} user={sidebarUser} />;
}

function DownloadIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M8 2.5V9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path
                d="M5.5 7.5L8 10L10.5 7.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path d="M3.5 12.5H12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    );
}
