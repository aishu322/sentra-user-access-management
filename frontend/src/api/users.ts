import api from "./axios";
import type { PaginatedResponse } from "./pagination";

export type UserListItem = {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    is_active: boolean;
    is_staff: boolean;
    date_joined: string;
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

export async function listUsers(params: UsersQueryParams = {}) {
    const response = await api.get<PaginatedResponse<UserListItem>>("/users/users/", {
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

    return response.data;
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

