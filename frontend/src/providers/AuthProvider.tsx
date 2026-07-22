/* eslint-disable react-refresh/only-export-components */

import {
    createContext,
    useEffect,
    useContext,
    useState,
} from "react";

import { logout as logoutApi } from "../api/auth";
import type { ReactNode } from "react";
import type { AuthSession, AuthUser } from "../types/auth";
import {
    clearStoredAuthSession,
    getStoredAuthSession,
    setStoredAuthSession,
    subscribeToAuthSessionChanges,
} from "./authSession";

type AuthContextType = {
    token: string | null;
    refreshToken: string | null;
    user: AuthUser | null;
    login: (session: AuthSession) => void;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({
    children,
}: {
    children: ReactNode;
}) {
    const initialSession = getStoredAuthSession();

    const [token, setToken] = useState<string | null>(
        initialSession?.accessToken ?? null
    );

    const [refreshToken, setRefreshToken] = useState<string | null>(
        initialSession?.refreshToken ?? null
    );

    const [user, setUser] = useState<AuthUser | null>(
        initialSession?.user ?? null
    );

    useEffect(() => {
        return subscribeToAuthSessionChanges(() => {
            const session = getStoredAuthSession();

            setToken(session?.accessToken ?? null);
            setRefreshToken(session?.refreshToken ?? null);
            setUser(session?.user ?? null);
        });
    }, []);

    function login(session: AuthSession) {
        setStoredAuthSession(session);
        setToken(session.accessToken);
        setRefreshToken(session.refreshToken);
        setUser(session.user);
    }

    async function logout() {
        try {
            if (refreshToken) {
                await logoutApi(refreshToken);
            }
        } catch {}
        clearStoredAuthSession();

        setToken(null);
        setRefreshToken(null);
        setUser(null);
    }

    return (
        <AuthContext.Provider
            value={{
                token,
                refreshToken,
                user,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used inside AuthProvider"
        );
    }

    return context;
}
