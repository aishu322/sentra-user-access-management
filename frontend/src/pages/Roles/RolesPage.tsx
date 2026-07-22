import { useEffect, useMemo, useState, type FormEvent } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getDashboard } from "../../api/dashboard";
import { getApiErrorMessage, getApiFieldErrors } from "../../api/error";
import {
    createRole,
    getRole,
    listPermissions,
    listRoles,
    updateRole,
    updateRolePermissions,
    type PermissionItem,
    type RoleListItem,
} from "../../api/roles";
import { dashboardNavItems } from "../Dashboard/dashboard.navigation";
import DashboardLayout from "../../layouts/DashboardLayout";
import Modal from "../../components/Modal";
import "../../styles/admin-pages.css";
import "./RolesPage.css";
import { useAuth } from "../../providers/AuthProvider";
import Sidebar from "../Dashboard/components/Sidebar";
import { buildSidebarUser } from "../../utils/sidebar";
import { getAuthenticatedProfileSummary } from "../../api/rbac";
import type { DashboardSidebarUser } from "../Dashboard/dashboard.types";

type RoleFormState = {
    name: string;
    code: string;
    description: string;
    isActive: boolean;
};

function groupPermissions(permissions: PermissionItem[]) {
    const grouped = new Map<string, PermissionItem[]>();

    permissions.forEach((permission) => {
        const key = permission.module.toUpperCase();
        const current = grouped.get(key) ?? [];
        current.push(permission);
        grouped.set(key, current);
    });

    return Array.from(grouped.entries()).map(([title, groupedPermissions]) => ({
        title,
        permissions: groupedPermissions,
    }));
}

function buildRoleDescription(role: RoleListItem | null) {
    if (!role) {
        return "";
    }

    return role.description || "No description available";
}

export default function RolesPage() {
    const queryClient = useQueryClient();
    const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
    const [permissionDraft, setPermissionDraft] = useState<number[]>([]);
    const [roleFormOpen, setRoleFormOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<RoleListItem | null>(null);
    const [roleFormError, setRoleFormError] = useState("");
    const [roleFieldErrors, setRoleFieldErrors] = useState<Record<string, string>>({});
    const [roleFormState, setRoleFormState] = useState<RoleFormState>({
        name: "",
        code: "",
        description: "",
        isActive: true,
    });

    const overviewQuery = useQuery({
        queryKey: ["roles-overview"],
        queryFn: async () => {
            const [overview, rolesResponse, permissionsResponse] = await Promise.all([
                getDashboard(),
                listRoles({ page: 1, pageSize: 100, ordering: "name" }),
                listPermissions(),
            ]);

            const counts = new Map<string, number>();
            overview.users_per_role.forEach((role) => {
                counts.set(role.code.toLowerCase(), role.user_count);
                counts.set(role.name.toLowerCase(), role.user_count);
            });

            const roles = rolesResponse.results.map((role) => ({
                ...role,
                user_count: counts.get(role.code.toLowerCase()) ?? counts.get(role.name.toLowerCase()) ?? 0,
            }));

            return {
                roles,
                permissions: permissionsResponse.results,
            };
        },
    });

    const roles = overviewQuery.data?.roles ?? [];
    const permissions = overviewQuery.data?.permissions ?? [];
    const groupedPermissions = useMemo(() => groupPermissions(permissions), [permissions]);

    useEffect(() => {
        if (selectedRoleId || !roles.length) {
            return;
        }

        setSelectedRoleId(roles[0].id);
    }, [roles, selectedRoleId]);

    const selectedRoleSummary = useMemo(
        () => roles.find((role) => role.id === selectedRoleId) ?? null,
        [roles, selectedRoleId]
    );

    const selectedRoleQuery = useQuery({
        queryKey: ["role-detail", selectedRoleId],
        queryFn: () => getRole(selectedRoleId as number),
        enabled: Boolean(selectedRoleId),
    });

    useEffect(() => {
        const permissionIds = selectedRoleQuery.data?.permissions.map((permission) => permission.id) ?? [];
        setPermissionDraft(permissionIds);
    }, [selectedRoleQuery.data]);

    const roleCounts = useMemo(() => {
        return roles.reduce<Record<string, number>>((accumulator, role) => {
            accumulator[role.code.toLowerCase()] = role.user_count;
            accumulator[role.name.toLowerCase()] = role.user_count;
            return accumulator;
        }, {});
    }, [roles]);

    const openCreateRole = () => {
        setEditingRole(null);
        setRoleFormError("");
        setRoleFieldErrors({});
        setRoleFormState({
            name: "",
            code: "",
            description: "",
            isActive: true,
        });
        setRoleFormOpen(true);
    };

    const openEditRole = (role: RoleListItem) => {
        setEditingRole(role);
        setRoleFormError("");
        setRoleFieldErrors({});
        setRoleFormState({
            name: role.name,
            code: role.code,
            description: role.description,
            isActive: role.is_active,
        });
        setRoleFormOpen(true);
    };

    const createRoleMutation = useMutation({
        mutationFn: createRole,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["roles-overview"] });
            setRoleFormOpen(false);
        },
        onError: (error) => {
            const apiErrors = getApiFieldErrors(error);
            setRoleFormError(apiErrors.formError ?? getApiErrorMessage(error, "Unable to create the role."));
            setRoleFieldErrors(apiErrors.fieldErrors);
        },
    });

    const updateRoleMutation = useMutation({
        mutationFn: async ({ roleId, payload }: { roleId: number; payload: Parameters<typeof updateRole>[1] }) =>
            updateRole(roleId, payload),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["roles-overview"] });
            await queryClient.invalidateQueries({ queryKey: ["role-detail"] });
            setRoleFormOpen(false);
        },
        onError: (error) => {
            const apiErrors = getApiFieldErrors(error);
            setRoleFormError(apiErrors.formError ?? getApiErrorMessage(error, "Unable to update the role."));
            setRoleFieldErrors(apiErrors.fieldErrors);
        },
    });

    const permissionMutation = useMutation({
        mutationFn: async (payload: { roleId: number; permissionIds: number[] }) =>
            updateRolePermissions(payload.roleId, { permission_ids: payload.permissionIds }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["roles-overview"] });
            await queryClient.invalidateQueries({ queryKey: ["role-detail"] });
        },
    });

    const handleRoleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setRoleFormError("");
        setRoleFieldErrors({});

        if (!roleFormState.name.trim()) {
            setRoleFieldErrors({ name: "Role name is required." });
            return;
        }

        if (!roleFormState.code.trim()) {
            setRoleFieldErrors({ code: "Role code is required." });
            return;
        }

        if (editingRole) {
            await updateRoleMutation.mutateAsync({
                roleId: editingRole.id,
                payload: {
                    name: roleFormState.name.trim(),
                    code: roleFormState.code.trim(),
                    description: roleFormState.description.trim(),
                    is_active: roleFormState.isActive,
                },
            });
            return;
        }

        await createRoleMutation.mutateAsync({
            name: roleFormState.name.trim(),
            code: roleFormState.code.trim(),
            description: roleFormState.description.trim(),
            is_active: roleFormState.isActive,
        });
    };

    const handlePermissionToggle = async (permissionId: number) => {
        if (!selectedRoleSummary || selectedRoleQuery.data?.is_system) {
            return;
        }

        const nextPermissionIds = permissionDraft.includes(permissionId)
            ? permissionDraft.filter((value) => value !== permissionId)
            : [...permissionDraft, permissionId];

        setPermissionDraft(nextPermissionIds);

        try {
            await permissionMutation.mutateAsync({
                roleId: selectedRoleSummary.id,
                permissionIds: nextPermissionIds,
            });
        } catch {
            setPermissionDraft(
                selectedRoleQuery.data?.permissions.map((permission) => permission.id) ?? []
            );
        }
    };

    const selectedRolePermissionMap = useMemo(
        () => new Set(permissionDraft),
        [permissionDraft]
    );

    const loading = overviewQuery.isLoading && !overviewQuery.data;
    const error = overviewQuery.isError;
    const saving = createRoleMutation.isPending || updateRoleMutation.isPending || permissionMutation.isPending;

    return (
        <DashboardLayout sidebar={<RoleSidebar navItems={dashboardNavItems} />}>
            <section className="roles-page" aria-labelledby="roles-page-title">
                <header className="dashboard-header roles-page__header">
                    <div>
                        <h1 id="roles-page-title">Roles &amp; Permissions</h1>
                        <p>Changes apply immediately and are written to the audit log</p>
                    </div>
                    <button type="button" className="admin-button admin-button--primary" onClick={openCreateRole}>
                        + New role
                    </button>
                </header>

                {loading ? (
                    <section className="admin-loading roles-page__loading">
                        <div className="admin-spinner" aria-hidden="true" />
                    </section>
                ) : error ? (
                    <section className="admin-card roles-page__error">
                        <div className="admin-error">
                            <p>{getApiErrorMessage(overviewQuery.error, "Unable to load roles.")}</p>
                            <button
                                type="button"
                                className="admin-button admin-button--primary"
                                onClick={() => overviewQuery.refetch()}
                            >
                                Retry
                            </button>
                        </div>
                    </section>
                ) : (
                    <section className="roles-page__grid">
                        <aside className="admin-card roles-page__list" aria-label="Role list">
                            {roles.map((role) => {
                                const isActive = role.id === selectedRoleId;
                                const count = roleCounts[role.code.toLowerCase()] ?? 0;

                                return (
                                    <button
                                        key={role.id}
                                        type="button"
                                        className={
                                            isActive
                                                ? "roles-page__role-card roles-page__role-card--active"
                                                : "roles-page__role-card"
                                        }
                                        onClick={() => setSelectedRoleId(role.id)}
                                        onDoubleClick={() => openEditRole(role)}
                                    >
                                        <div>
                                            <strong>{role.name}</strong>
                                            <span>{buildRoleDescription(role)}</span>
                                        </div>
                                        <small>{`${count} users`}</small>
                                    </button>
                                );
                            })}
                        </aside>

                        <section className="admin-card roles-page__details">
                            <div className="roles-page__details-header">
                                <div>
                                    <h2>{selectedRoleQuery.data?.name ?? selectedRoleSummary?.name ?? "Role"}</h2>
                                    <p>{selectedRoleQuery.data?.description ?? selectedRoleSummary?.description ?? ""}</p>
                                </div>
                                {selectedRoleQuery.data?.is_system ? (
                                    <span className="roles-page__system-badge">System role — locked</span>
                                ) : null}
                            </div>

                            <div className="roles-page__sections">
                                {groupedPermissions.map((group) => (
                                    <section key={group.title} className="roles-page__permission-group">
                                        <h3>{group.title}</h3>
                                        <div className="roles-page__permission-grid">
                                            {group.permissions.map((permission) => {
                                                const checked = selectedRolePermissionMap.has(permission.id);
                                                const disabled = Boolean(selectedRoleQuery.data?.is_system) || saving;

                                                return (
                                                    <label
                                                        key={permission.id}
                                                        className={
                                                            checked
                                                                ? "roles-page__permission-card roles-page__permission-card--checked"
                                                                : "roles-page__permission-card"
                                                        }
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={checked}
                                                            disabled={disabled}
                                                            onChange={() => handlePermissionToggle(permission.id)}
                                                            aria-label={permission.code}
                                                        />
                                                        <span className="roles-page__permission-copy">
                                                            <strong>{permission.code}</strong>
                                                            <span>{permission.description}</span>
                                                        </span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </section>
                                ))}
                            </div>
                        </section>
                    </section>
                )}
            </section>

            <Modal
                open={roleFormOpen}
                title={editingRole ? "Edit role" : "Create role"}
                onClose={() => setRoleFormOpen(false)}
                footer={
                    <>
                        <button
                            type="button"
                            className="admin-button"
                            onClick={() => setRoleFormOpen(false)}
                            disabled={createRoleMutation.isPending || updateRoleMutation.isPending}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            form="role-form"
                            className="admin-button admin-button--primary"
                            disabled={createRoleMutation.isPending || updateRoleMutation.isPending}
                        >
                            {editingRole ? "Save role" : "Create role"}
                        </button>
                    </>
                }
            >
                <form id="role-form" className="admin-form" onSubmit={handleRoleSubmit}>
                    {roleFormError ? <div className="admin-error">{roleFormError}</div> : null}
                    <label className="admin-field">
                        <span>Name</span>
                        <input
                            type="text"
                            value={roleFormState.name}
                            onChange={(event) =>
                                setRoleFormState((current) => ({ ...current, name: event.target.value }))
                            }
                        />
                        {roleFieldErrors.name ? <small className="roles-page__field-error">{roleFieldErrors.name}</small> : null}
                    </label>
                    <label className="admin-field">
                        <span>Code</span>
                        <input
                            type="text"
                            value={roleFormState.code}
                            onChange={(event) =>
                                setRoleFormState((current) => ({ ...current, code: event.target.value }))
                            }
                        />
                        {roleFieldErrors.code ? <small className="roles-page__field-error">{roleFieldErrors.code}</small> : null}
                    </label>
                    <label className="admin-field">
                        <span>Description</span>
                        <textarea
                            value={roleFormState.description}
                            onChange={(event) =>
                                setRoleFormState((current) => ({
                                    ...current,
                                    description: event.target.value,
                                }))
                            }
                        />
                    </label>
                    <label className="admin-field">
                        <span>Status</span>
                        <select
                            className="admin-select"
                            value={roleFormState.isActive ? "active" : "inactive"}
                            onChange={(event) =>
                                setRoleFormState((current) => ({
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

function RoleSidebar({
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
        const sidebarUser: DashboardSidebarUser = {
            name: profileQuery.data.displayName,
            role: profileQuery.data.roleName,
            avatarLabel: profileQuery.data.avatarLabel,
        };

        return (
            <Sidebar
                navItems={navItems}
                user={sidebarUser}
            />
        );
    }

    const sidebarUser: DashboardSidebarUser = buildSidebarUser(
        [auth.user?.first_name, auth.user?.last_name]
            .filter(Boolean)
            .join(" "),
        auth.user?.email,
        "Loading..."
    );

    return (
        <Sidebar
            navItems={navItems}
            user={sidebarUser}
        />
    );
}