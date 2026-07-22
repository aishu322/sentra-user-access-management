import api from "axios";

import type { AuthSession, AuthUser } from "../types/auth";

type ApiResponse<T> = {
    success: boolean;
    message: string;
    data: T;
};

export type LoginRequest = {
    email: string;
    password: string;
};

export type LoginResponse = {
    access: string;
    refresh: string;
    user: AuthUser;
};

export type RefreshResponse = {
    access: string;
};

export async function login(
    payload: LoginRequest
): Promise<AuthSession> {
    const response = await api.post<ApiResponse<LoginResponse>>(
        "/auth/login/",
        payload
    );

    return {
        accessToken: response.data.data.access,
        refreshToken: response.data.data.refresh,
        user: response.data.data.user,
    };
}

export async function refreshAccessToken(refresh: string) {
    const response = await api.post<ApiResponse<RefreshResponse>>(
        "/auth/refresh/",
        {
            refresh,
        }
    );

    return response.data.data;
}

export async function getCurrentUser() {
    const response = await api.get<ApiResponse<AuthUser>>("/auth/me/");

    return response.data.data;
}

export type RegisterRequest = {
    full_name: string;
    email: string;
    password: string;
    confirm_password: string;
};

export async function logout(refresh: string): Promise<void> {
    await api.post("/auth/logout/", {
        refresh,
    });
}
