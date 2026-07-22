import api from "./axios";

import { getCurrentUser } from "./auth";
import type { AuthUser } from "../types/auth";

export type UserRoleAssignment = {
    id: number;
    role_id: number;
    role_name: string;
    role_code: string;
};

export type RolePermission = {
    id: number;
    module: string;
    action: string;
    code: string;
    name: string;
    description: string;
    is_active: boolean;
};

export type RoleDetail = {
    id: number;
    name: string;
    code: string;
    description: string;
    is_system: boolean;
    is_active: boolean;
    permission_count: number;
    permissions: RolePermission[];
};

export type UserProfileSummary = {
    user: AuthUser;
    displayName: string;
    roleName: string;
    roleCode: string;
    permissionsGranted: number;
    avatarLabel: string;
};

function formatDisplayName(user: AuthUser) {
    const fullName = [user.first_name, user.last_name]
        .filter(Boolean)
        .join(" ")
        .trim();

    if (fullName) {
        return fullName;
    }

    return user.email.split("@")[0] || user.email;
}

function buildInitials(value: string) {
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

export async function getUserRoles(userId: number) {
    const response = await api.get<UserRoleAssignment[]>(
        `/users/${userId}/roles/`
    );

    return response.data;
}

export async function getRoleById(roleId: number) {
    const response = await api.get<RoleDetail>(`/roles/${roleId}/`);

    return response.data;
}

export async function getAuthenticatedProfileSummary() {
    const user = await getCurrentUser();
    const roles = await getUserRoles(user.id);

    const uniqueRoleIds = [...new Set(roles.map((role) => role.role_id))];
    const roleDetails = await Promise.all(
        uniqueRoleIds.map((roleId) => getRoleById(roleId))
    );

    const permissionsGranted = new Set(
        roleDetails.flatMap((role) =>
            role.permissions.map((permission) => permission.code)
        )
    ).size;

    const primaryRole = roles[0];
    const displayName = formatDisplayName(user);

    return {
        user,
        displayName,
        roleName: primaryRole?.role_name ?? "User",
        roleCode: primaryRole?.role_code ?? "user",
        permissionsGranted,
        avatarLabel: buildInitials(displayName),
    } satisfies UserProfileSummary;
}
