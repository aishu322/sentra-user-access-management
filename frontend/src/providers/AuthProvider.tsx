/* eslint-disable react-refresh/only-export-components */

import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";

import { logout as logoutApi } from "../api/auth";
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
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({
    children,
}: {
    children: ReactNode;
}) {
    const session = getStoredAuthSession();

    const [token, setToken] = useState<string | null>(
        session?.accessToken ?? null
    );

    const [refreshToken, setRefreshToken] = useState<string | null>(
        session?.refreshToken ?? null
    );

    const [user, setUser] = useState<AuthUser | null>(
        session?.user ?? null
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
        } catch {
            // ignore backend logout failures
        }

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