import { LogOut } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

import type {
    DashboardNavItem,
    DashboardSidebarUser,
} from "../dashboard.types";

import { useAuth } from "../../../providers/AuthProvider";

type SidebarProps = {
    brandName?: string;
    navItems: DashboardNavItem[];
    user: DashboardSidebarUser;
};

export default function Sidebar({
    brandName = "Sentra",
    navItems,
    user,
}: SidebarProps) {
    const auth = useAuth();
    const navigate = useNavigate();

    async function handleLogout() {
        await auth.logout();
        navigate("/login", { replace: true });
    }

    return (
        <aside className="dashboard-sidebar">
            <div>
                <NavLink
                    className="dashboard-brand"
                    to="/dashboard"
                    aria-label={brandName}
                >
                    <span
                        className="dashboard-brand__mark"
                        aria-hidden="true"
                    >
                        S
                    </span>

                    <span className="dashboard-brand__name">
                        {brandName}
                    </span>
                </NavLink>

                <nav
                    className="dashboard-nav"
                    aria-label="Primary navigation"
                >
                    <ul className="dashboard-nav__list">
                        {navItems.map((item) => {
                            const Icon = item.icon;

                            return (
                                <li key={item.to}>
                                    <NavLink
                                        to={item.to}
                                        end={item.end}
                                        className={({ isActive }) =>
                                            `dashboard-nav__link${
                                                isActive
                                                    ? " dashboard-nav__link--active"
                                                    : ""
                                            }`
                                        }
                                    >
                                        <Icon
                                            size={18}
                                            aria-hidden="true"
                                        />

                                        <span>{item.label}</span>
                                    </NavLink>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            </div>

            <div className="dashboard-sidebar__footer">
                <div
                    className="dashboard-sidebar__divider"
                    aria-hidden="true"
                />

                <div className="dashboard-profile">
                    <div
                        className="dashboard-profile__avatar"
                        aria-hidden="true"
                    >
                        {user.avatarLabel}
                    </div>

                    <div className="dashboard-profile__meta">
                        <strong>{user.name}</strong>

                        <span>{user.role}</span>
                    </div>

                    <button
                        className="dashboard-profile__logout"
                        type="button"
                        onClick={handleLogout}
                        aria-label="Logout"
                    >
                        <LogOut
                            size={18}
                            aria-hidden="true"
                        />
                    </button>
                </div>
            </div>
        </aside>
    );
}