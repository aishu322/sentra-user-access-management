export type AuthUser = {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    is_active: boolean;
};

export type AuthSession = {
    accessToken: string;
    refreshToken: string;
    user: AuthUser | null;
};
