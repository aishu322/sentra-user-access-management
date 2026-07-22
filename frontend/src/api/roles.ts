import api from "./axios";
import type { PaginatedResponse } from "./pagination";
import type { RoleDetail, RolePermission } from "./rbac";

export type RoleListItem = {
    id: number;
    name: string;
    code: string;
    description: string;
    is_system: boolean;
    is_active: boolean;
    permission_count: number;
    permissions: RolePermission[];
};

export type PermissionItem = {
    id: number;
    module: string;
    action: string;
    code: string;
    name: string;
    description: string;
    is_active: boolean;
};

export type RoleCreatePayload = {
    name: string;
    code: string;
    description: string;
    is_active: boolean;
    is_system?: boolean;
};

export type RoleUpdatePayload = RoleCreatePayload;

export type RolePermissionsPayload = {
    permission_ids: number[];
};

export type RoleUsersSummary = {
    id: number;
    name: string;
    code: string;
    user_count: number;
};

export type RolesPageModel = {
    roles: RoleListItem[];
    permissions: PermissionItem[];
    selectedRole: RoleDetail | null;
};

export async function listRoles(params: {
    page?: number;
    pageSize?: number;
    search?: string;
    ordering?: string;
    isActive?: boolean | null;
} = {}) {
    const response = await api.get<PaginatedResponse<RoleListItem>>("/roles/", {
        params: {
            page: params.page,
            page_size: params.pageSize,
            search: params.search,
            ordering: params.ordering,
            is_active:
                typeof params.isActive === "boolean"
                    ? String(params.isActive)
                    : undefined,
        },
    });

    return response.data;
}

export async function getRole(roleId: number) {
    const response = await api.get<RoleDetail>(`/roles/${roleId}/`);

    return response.data;
}

export async function createRole(payload: RoleCreatePayload) {
    const response = await api.post<RoleListItem>("/roles/", payload);

    return response.data;
}

export async function updateRole(roleId: number, payload: RoleUpdatePayload) {
    const response = await api.patch<RoleListItem>(`/roles/${roleId}/`, payload);

    return response.data;
}

export async function deleteRole(roleId: number) {
    await api.delete(`/roles/${roleId}/`);
}

export async function listPermissions() {
    const response = await api.get<PaginatedResponse<PermissionItem>>("/permissions/", {
        params: {
            page_size: 100,
            ordering: "module,action",
        },
    });

    return response.data;
}

export async function updateRolePermissions(
    roleId: number,
    payload: RolePermissionsPayload
) {
    const response = await api.put<RoleDetail>(
        `/roles/${roleId}/permissions/`,
        payload
    );

    return response.data;
}

