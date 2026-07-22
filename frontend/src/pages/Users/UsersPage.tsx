import { useEffect, useMemo, useState, type FormEvent } from "react";

import DashboardLayout from "../../layouts/DashboardLayout";
import { dashboardNavItems } from "../Dashboard/dashboard.navigation";
import "../../styles/admin-pages.css";
import "./UsersPage.css";
import Modal from "../../components/Modal";
import PaginationControls from "../../components/PaginationControls";
import { getApiErrorMessage, getApiFieldErrors } from "../../api/error";
import { activateUser, createUser, deactivateUser, listUsers, updateUser, type UserListItem } from "../../api/users";
import { listRoles } from "../../api/roles";
import { listAuditLogs } from "../../api/audit";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { downloadTextFile, escapeCsvValue } from "../../utils/download";
import { getUserRoles, type UserRoleAssignment } from "../../api/rbac";
import { getAuthenticatedProfileSummary } from "../../api/rbac";
import { useAuth } from "../../providers/AuthProvider";
import Sidebar from "../Dashboard/components/Sidebar";
import { buildSidebarUser } from "../../utils/sidebar";

type UserRow = UserListItem & {
    roles: UserRoleAssignment[];
    lastLogin: string;
};

type UserFormState = {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
};

const PAGE_SIZE = 4;
const USER_PAGE_SIZE = 100;

function formatName(user: UserListItem | UserRow) {
    const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ").trim();
    return fullName || user.email.split("@")[0] || user.email;
}

function getInitials(value: string) {
    const parts = value
        .split(" ")
        .map((part) => part.trim())
        .filter(Boolean);

    if (!parts.length) {
        return "U";
    }

    if (parts.length === 1) {
        return parts[0].slice(0, 2).toUpperCase();
    }

    return parts
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("");
}

function formatLoginTimestamp(value: string) {
    if (!value) {
        return "—";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    const pad = (input: number) => String(input).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(
        date.getHours()
    )}:${pad(date.getMinutes())}`;
}

async function loadLastLogin(email: string) {
    const response = await listAuditLogs({
        page: 1,
        pageSize: 1,
        action: "auth.login",
        search: email,
        ordering: "-created_at",
    });

    return response.results[0]?.created_at ?? "";
}

export default function UsersPage() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [page, setPage] = useState(1);
    const [activeFormMode, setActiveFormMode] = useState<"create" | "edit" | null>(null);
    const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
    const [formError, setFormError] = useState("");
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [formState, setFormState] = useState<UserFormState>({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        isActive: true,
    });

    useEffect(() => {
        const handle = window.setTimeout(() => {
            setSearch(searchInput.trim());
            setPage(1);
        }, 250);

        return () => window.clearTimeout(handle);
    }, [searchInput]);

    const usersQuery = useQuery({
        queryKey: ["users-page", search, statusFilter],
        queryFn: async () => {
            const [usersResponse, rolesResponse] = await Promise.all([
                listUsers({
                    page: 1,
                    pageSize: USER_PAGE_SIZE,
                    search: search || undefined,
                    isActive:
                        statusFilter === "all"
                            ? null
                            : statusFilter === "active",
                    ordering: "email",
                }),
                listRoles({ page: 1, pageSize: 100, ordering: "name" }),
            ]);

            const decoratedUsers = await Promise.all(
                usersResponse.results.map(async (user) => {
                    const [roles, lastLogin] = await Promise.all([
                        getUserRoles(user.id).catch(() => [] as UserRoleAssignment[]),
                        loadLastLogin(user.email).catch(() => ""),
                    ]);

                    return {
                        ...user,
                        roles,
                        lastLogin,
                    };
                })
            );

            return {
                users: decoratedUsers,
                total: usersResponse.count,
                roles: rolesResponse.results,
            };
        },
    });

    const visibleRoles = usersQuery.data?.roles ?? [];

    const filteredUsers = useMemo(() => {
        const rows = usersQuery.data?.users ?? [];

        if (roleFilter === "all") {
            return rows;
        }

        return rows.filter((row) =>
            row.roles.some(
                (role) =>
                    role.role_code === roleFilter ||
                    role.role_name.toLowerCase() === roleFilter.toLowerCase()
            )
        );
    }, [roleFilter, usersQuery.data?.users]);

    const totalRows = filteredUsers.length;
    const pageCount = Math.max(1, Math.ceil(totalRows / PAGE_SIZE));

    useEffect(() => {
        if (page > pageCount) {
            setPage(pageCount);
        }
    }, [page, pageCount]);

    const pagedUsers = filteredUsers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const createMutation = useMutation({
        mutationFn: createUser,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["users-page"] });
            setActiveFormMode(null);
            setFormError("");
            setFieldErrors({});
        },
        onError: (error) => {
            const apiErrors = getApiFieldErrors(error);
            setFormError(apiErrors.formError ?? getApiErrorMessage(error, "Unable to create the user."));
            setFieldErrors(apiErrors.fieldErrors);
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ userId, payload }: { userId: number; payload: Parameters<typeof updateUser>[1] }) =>
            updateUser(userId, payload),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["users-page"] });
            setActiveFormMode(null);
            setFormError("");
            setFieldErrors({});
        },
        onError: (error) => {
            const apiErrors = getApiFieldErrors(error);
            setFormError(apiErrors.formError ?? getApiErrorMessage(error, "Unable to update the user."));
            setFieldErrors(apiErrors.fieldErrors);
        },
    });

    const activateMutation = useMutation({
        mutationFn: activateUser,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["users-page"] });
        },
    });

    const deactivateMutation = useMutation({
        mutationFn: deactivateUser,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["users-page"] });
        },
    });

    const exportCsv = () => {
        const headers = ["Name", "Email", "Role", "Status", "Last Login"];
        const lines = [
            headers.join(","),
            ...filteredUsers.map((user) =>
                [
                    escapeCsvValue(formatName(user)),
                    escapeCsvValue(user.email),
                    escapeCsvValue(user.roles[0]?.role_name ?? user.roles[0]?.role_code ?? "User"),
                    escapeCsvValue(user.is_active ? "Active" : "Inactive"),
                    escapeCsvValue(formatLoginTimestamp(user.lastLogin)),
                ].join(",")
            ),
        ];

        downloadTextFile("users-export.csv", lines.join("\n"), "text/csv;charset=utf-8");
    };

    const openCreateUser = () => {
        setSelectedUser(null);
        setFormError("");
        setFieldErrors({});
        setFormState({
            email: "",
            password: "",
            firstName: "",
            lastName: "",
            isActive: true,
        });
        setActiveFormMode("create");
    };

    const openEditUser = (user: UserRow) => {
        setSelectedUser(user);
        setFormError("");
        setFieldErrors({});
        setFormState({
            email: user.email,
            password: "",
            firstName: user.first_name,
            lastName: user.last_name,
            isActive: user.is_active,
        });
        setActiveFormMode("edit");
    };

    const submitUserForm = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setFormError("");
        setFieldErrors({});

        if (!formState.email.trim()) {
            setFieldErrors({ email: "Email is required." });
            return;
        }

        if (!formState.firstName.trim()) {
            setFieldErrors({ firstName: "First name is required." });
            return;
        }

        if (!formState.lastName.trim()) {
            setFieldErrors({ lastName: "Last name is required." });
            return;
        }

        if (activeFormMode === "create" && !formState.password.trim()) {
            setFieldErrors({ password: "Password is required." });
            return;
        }

        if (activeFormMode === "create") {
            await createMutation.mutateAsync({
                email: formState.email.trim(),
                password: formState.password,
                first_name: formState.firstName.trim(),
                last_name: formState.lastName.trim(),
                is_active: formState.isActive,
            });
            return;
        }

        if (!selectedUser) {
            return;
        }

        await updateMutation.mutateAsync({
            userId: selectedUser.id,
            payload: {
                first_name: formState.firstName.trim(),
                last_name: formState.lastName.trim(),
                is_active: formState.isActive,
            },
        });
    };

    const isSubmitting =
        createMutation.isPending || updateMutation.isPending || activateMutation.isPending || deactivateMutation.isPending;

    const showLoading = usersQuery.isLoading && !usersQuery.data;
    const showError = usersQuery.isError;

    return (
        <DashboardLayout
            sidebar={<UserSidebar navItems={dashboardNavItems} />}
        >
            <section className="users-page" aria-labelledby="users-page-title">
                <header className="dashboard-header users-page__header">
                    <div>
                        <h1 id="users-page-title">Users</h1>
                        <p>{`${filteredUsers.length} of ${usersQuery.data?.total ?? 0} users match`}</p>
                    </div>
                    <button type="button" className="admin-button admin-button--primary" onClick={openCreateUser}>
                        + Add user
                    </button>
                </header>

                <section className="users-page__toolbar admin-toolbar" aria-label="User filters">
                    <div className="admin-toolbar__group users-page__toolbar-group">
                        <label className="users-page__search">
                            <span className="sr-only">Search by name or email</span>
                            <input
                                className="admin-input users-page__search-input"
                                type="search"
                                placeholder="Search by name or email..."
                                value={searchInput}
                                onChange={(event) => setSearchInput(event.target.value)}
                            />
                        </label>
                        <label>
                            <span className="sr-only">Filter by role</span>
                            <select
                                className="admin-select users-page__select"
                                value={roleFilter}
                                onChange={(event) => {
                                    setRoleFilter(event.target.value);
                                    setPage(1);
                                }}
                            >
                                <option value="all">All roles</option>
                                {visibleRoles.map((role) => (
                                    <option key={role.id} value={role.code}>
                                        {role.name}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label>
                            <span className="sr-only">Filter by status</span>
                            <select
                                className="admin-select users-page__select"
                                value={statusFilter}
                                onChange={(event) => {
                                    setStatusFilter(event.target.value);
                                    setPage(1);
                                }}
                            >
                                <option value="all">All statuses</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </label>
                    </div>
                    <div className="admin-toolbar__actions">
                        <button type="button" className="admin-button" onClick={exportCsv}>
                            <DownloadIcon />
                            Export to Excel
                        </button>
                    </div>
                </section>

                <section className="admin-card users-page__table-card" aria-label="Users table">
                    {showLoading ? (
                        <div className="admin-loading">
                            <div className="admin-spinner" aria-hidden="true" />
                        </div>
                    ) : showError ? (
                        <div className="admin-error">
                            <p>{getApiErrorMessage(usersQuery.error, "Unable to load users.")}</p>
                            <button
                                type="button"
                                className="admin-button admin-button--primary"
                                onClick={() => usersQuery.refetch()}
                            >
                                Retry
                            </button>
                        </div>
                    ) : totalRows === 0 ? (
                        <div className="admin-empty">No users match the current filters.</div>
                    ) : (
                        <>
                            <table className="admin-table users-page__table">
                                <thead>
                                    <tr>
                                        <th>USER ↑</th>
                                        <th>ROLES</th>
                                        <th>STATUS</th>
                                        <th>LAST LOGIN</th>
                                        <th>ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pagedUsers.map((user) => (
                                        <tr key={user.id}>
                                            <td>
                                                <div className="users-page__identity">
                                                    <div className="users-page__avatar" aria-hidden="true">
                                                        {getInitials(formatName(user))}
                                                    </div>
                                                    <div className="users-page__identity-text">
                                                        <strong>{formatName(user)}</strong>
                                                        <span>{user.email}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="admin-pill users-page__role-pill">
                                                    {user.roles[0]?.role_name ?? user.roles[0]?.role_code ?? "User"}
                                                </span>
                                            </td>
                                            <td>
                                                <span
                                                    className={
                                                        user.is_active
                                                            ? "admin-status"
                                                            : "admin-status admin-status--inactive"
                                                    }
                                                >
                                                    {user.is_active ? "Active" : "Inactive"}
                                                </span>
                                            </td>
                                            <td className="users-page__timestamp">
                                                {formatLoginTimestamp(user.lastLogin)}
                                            </td>
                                            <td>
                                                <div className="users-page__row-actions">
                                                    <button
                                                        type="button"
                                                        className="admin-button users-page__action"
                                                        onClick={() => openEditUser(user)}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className={
                                                            user.is_active
                                                                ? "admin-button admin-button--danger users-page__action"
                                                                : "admin-button users-page__action"
                                                        }
                                                        onClick={() =>
                                                            (user.is_active
                                                                ? deactivateMutation
                                                                : activateMutation
                                                            ).mutate(user.id)
                                                        }
                                                        disabled={isSubmitting}
                                                    >
                                                        {user.is_active ? "Deactivate" : "Activate"}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <PaginationControls
                                page={page}
                                pageCount={pageCount}
                                onPrevious={() => setPage((current) => Math.max(1, current - 1))}
                                onNext={() => setPage((current) => Math.min(pageCount, current + 1))}
                                isPreviousDisabled={page <= 1}
                                isNextDisabled={page >= pageCount}
                            />
                            <div className="users-page__meta">
                                <span>
                                    {`Showing ${Math.min((page - 1) * PAGE_SIZE + 1, totalRows)}–${Math.min(
                                        page * PAGE_SIZE,
                                        totalRows
                                    )} of ${totalRows}`}
                                </span>
                                <span>server-side · page_size={PAGE_SIZE}</span>
                            </div>
                        </>
                    )}
                </section>
            </section>

            <Modal
                open={activeFormMode !== null}
                title={activeFormMode === "create" ? "Add user" : "Edit user"}
                onClose={() => setActiveFormMode(null)}
                footer={
                    <>
                        <button
                            type="button"
                            className="admin-button"
                            onClick={() => setActiveFormMode(null)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            form="user-form"
                            className="admin-button admin-button--primary"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Saving..." : "Save user"}
                        </button>
                    </>
                }
            >
                <form id="user-form" className="admin-form" onSubmit={submitUserForm}>
                    {formError ? <div className="admin-error">{formError}</div> : null}
                    <label className="admin-field">
                        <span>Email</span>
                        <input
                            type="email"
                            value={formState.email}
                            onChange={(event) =>
                                setFormState((current) => ({ ...current, email: event.target.value }))
                            }
                            disabled={activeFormMode === "edit"}
                        />
                        {fieldErrors.email ? <small className="users-page__field-error">{fieldErrors.email}</small> : null}
                    </label>
                    {activeFormMode === "create" ? (
                        <label className="admin-field">
                            <span>Password</span>
                            <input
                                type="password"
                                value={formState.password}
                                onChange={(event) =>
                                    setFormState((current) => ({
                                        ...current,
                                        password: event.target.value,
                                    }))
                                }
                            />
                            {fieldErrors.password ? <small className="users-page__field-error">{fieldErrors.password}</small> : null}
                        </label>
                    ) : null}
                    <label className="admin-field">
                        <span>First name</span>
                        <input
                            type="text"
                            value={formState.firstName}
                            onChange={(event) =>
                                setFormState((current) => ({ ...current, firstName: event.target.value }))
                            }
                        />
                        {fieldErrors.firstName ? <small className="users-page__field-error">{fieldErrors.firstName}</small> : null}
                    </label>
                    <label className="admin-field">
                        <span>Last name</span>
                        <input
                            type="text"
                            value={formState.lastName}
                            onChange={(event) =>
                                setFormState((current) => ({ ...current, lastName: event.target.value }))
                            }
                        />
                        {fieldErrors.lastName ? <small className="users-page__field-error">{fieldErrors.lastName}</small> : null}
                    </label>
                    <label className="admin-field users-page__switch">
                        <span>Status</span>
                        <select
                            className="admin-select"
                            value={formState.isActive ? "active" : "inactive"}
                            onChange={(event) =>
                                setFormState((current) => ({
                                    ...current,
                                    isActive: event.target.value === "active",
                                }))
                            }
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </label>
                </form>
            </Modal>
        </DashboardLayout>
    );
}

function UserSidebar({
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
            <path
                d="M8 2.5V9.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
            <path
                d="M5.5 7.5L8 10L10.5 7.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M3.5 12.5H12.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
        </svg>
    );
}
