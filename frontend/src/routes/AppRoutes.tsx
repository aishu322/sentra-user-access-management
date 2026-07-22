import {
    BrowserRouter,
    Navigate,
    Routes,
    Route,
} from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";

import LoginPage from "../pages/Login/LoginPage";
import DashboardPage from "../pages/Dashboard/DashboardPage";
import UsersPage from "../pages/Users/UsersPage";
import RolesPage from "../pages/Roles/RolesPage";
import AuditPage from "../pages/Audit/AuditPage";
import NotFoundPage from "../pages/NotFound/NotFoundPage";
import RegisterPage from "../pages/Register/RegisterPage";

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>

                <Route element={<PublicRoute />}>
                    <Route
                        path="/login"
                        element={<LoginPage />}
                    />
                    <Route
                        path="/register"
                        element={<RegisterPage />}
                    />
                </Route>

                <Route element={<ProtectedRoute />}>

                    <Route
                        path="/"
                        element={
                            <Navigate
                                to="/dashboard"
                                replace
                            />
                        }
                    />

                    <Route
                        path="/dashboard"
                        element={<DashboardPage />}
                    />

                    <Route
                        path="/users"
                        element={<UsersPage />}
                    />

                    <Route
                        path="/roles"
                        element={<RolesPage />}
                    />

                    <Route
                        path="/audit"
                        element={<AuditPage />}
                    />

                </Route>

                <Route
                    path="*"
                    element={<NotFoundPage />}
                />

            </Routes>
        </BrowserRouter>
    );
}
