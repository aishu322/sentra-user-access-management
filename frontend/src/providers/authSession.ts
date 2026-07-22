import type { AuthSession, AuthUser } from "../types/auth";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const USER_KEY = "auth_user";
const AUTH_SESSION_EVENT = "auth-session-change";

function canUseStorage() {
    return typeof window !== "undefined";
}

function readStoredUser(): AuthUser | null {
    if (!canUseStorage()) {
        return null;
    }

    const rawUser = sessionStorage.getItem(USER_KEY);

    if (!rawUser) {
        return null;
    }

    try {
        return JSON.parse(rawUser) as AuthUser;
    } catch {
        return null;
    }
}

function emitSessionChange() {
    if (!canUseStorage()) {
        return;
    }

    window.dispatchEvent(new Event(AUTH_SESSION_EVENT));
}

export function getStoredAuthSession(): AuthSession | null {
    if (!canUseStorage()) {
        return null;
    }

    const accessToken = sessionStorage.getItem(ACCESS_TOKEN_KEY);
    const refreshToken = sessionStorage.getItem(REFRESH_TOKEN_KEY);
    const user = readStoredUser();

    if (!accessToken || !refreshToken) {
        return null;
    }

    return {
        accessToken,
        refreshToken,
        user,
    };
}

export function setStoredAuthSession(session: AuthSession) {
    if (!canUseStorage()) {
        return;
    }

    sessionStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken);
    sessionStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken);

    if (session.user) {
        sessionStorage.setItem(USER_KEY, JSON.stringify(session.user));
    } else {
        sessionStorage.removeItem(USER_KEY);
    }

    emitSessionChange();
}

export function updateStoredAccessToken(accessToken: string) {
    if (!canUseStorage()) {
        return;
    }

    sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    emitSessionChange();
}

export function clearStoredAuthSession() {
    if (!canUseStorage()) {
        return;
    }

    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    emitSessionChange();
}

export function subscribeToAuthSessionChanges(
    listener: () => void
) {
    if (!canUseStorage()) {
        return () => {};
    }

    const handleSessionChange = () => {
        listener();
    };

    window.addEventListener(AUTH_SESSION_EVENT, handleSessionChange);
    window.addEventListener("storage", handleSessionChange);

    return () => {
        window.removeEventListener(
            AUTH_SESSION_EVENT,
            handleSessionChange
        );
        window.removeEventListener("storage", handleSessionChange);
    };
}

export function getStoredAccessToken() {
    if (!canUseStorage()) {
        return null;
    }

    return sessionStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getStoredRefreshToken() {
    if (!canUseStorage()) {
        return null;
    }

    return sessionStorage.getItem(REFRESH_TOKEN_KEY);
}
