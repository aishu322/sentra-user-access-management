import {
    Navigate,
    Outlet,
} from "react-router-dom";

import { useAuth } from "../providers/AuthProvider";

export default function ProtectedRoute() {
    const { token, refreshToken } = useAuth();

    if (!token && !refreshToken) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}
