import api from "./axios";
import type { PaginatedResponse } from "./pagination";

export type UserRole = {
    id: number;
    role_id: number;
    role_name?: string;
    role_code?: string;
};
export type UserListItem = {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    is_active: boolean;
    is_staff: boolean;
    date_joined: string;

    roles?: UserRole[];
};

export type UserCreatePayload = {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    is_active: boolean;
};

export type UserUpdatePayload = {
    first_name: string;
    last_name: string;
    is_active: boolean;
};

export type UserCreateResponse = UserListItem;
export type UserUpdateResponse = UserListItem;

export type UsersQueryParams = {
    page?: number;
    pageSize?: number;
    search?: string;
    isActive?: boolean | null;
    ordering?: string;
};

type RawUsersResponse = PaginatedResponse<UserListItem> | UserListItem[];

function normalizeUsersResponse(response: RawUsersResponse): PaginatedResponse<UserListItem> {
    if (Array.isArray(response)) {
        return {
            count: response.length,
            next: null,
            previous: null,
            results: response,
        };
    }

    return {
        count: response.count,
        next: response.next,
        previous: response.previous,
        results: response.results ?? [],
    };
}

export async function listUsers(params: UsersQueryParams = {}) {
    const response = await api.get<RawUsersResponse>("/users/users/", {
        params: {
            page: params.page,
            page_size: params.pageSize,
            search: params.search,
            is_active:
                typeof params.isActive === "boolean"
                    ? String(params.isActive)
                    : undefined,
            ordering: params.ordering,
        },
    });

    return normalizeUsersResponse(response.data);
}

export async function getUserById(userId: number) {
    const response = await api.get<UserListItem>(`/users/users/${userId}/`);

    return response.data;
}

export async function createUser(payload: UserCreatePayload) {
    const response = await api.post<UserCreateResponse>("/users/users/", payload);

    return response.data;
}

export async function updateUser(userId: number, payload: UserUpdatePayload) {
    const response = await api.patch<UserUpdateResponse>(
        `/users/users/${userId}/`,
        payload
    );

    return response.data;
}

export async function activateUser(userId: number) {
    const response = await api.post<UserUpdateResponse>(`/users/users/${userId}/activate/`);

    return response.data;
}

export async function deactivateUser(userId: number) {
    const response = await api.post<UserUpdateResponse>(
        `/users/users/${userId}/deactivate/`
    );

    return response.data;
}

export async function assignRolesToUser(
    userId: number,
    roleIds: number[]
) {
    const response = await api.put(
        `/users/${userId}/roles/`,
        {
            role_ids: roleIds,
        }
    );

    return response.data;
}
