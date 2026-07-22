import {
    Navigate,
    Outlet,
} from "react-router-dom";

import { useAuth } from "../providers/AuthProvider";

export default function PublicRoute() {
    const { token, refreshToken } = useAuth();

    if (token || refreshToken) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
}
