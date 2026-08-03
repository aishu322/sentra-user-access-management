export { login } from "./auth";
export type { LoginRequest, LoginResponse } from "./auth";
export const ENDPOINTS = {
  LOGIN: "/auth/login/",
  LOGOUT: "/auth/logout/",
  REFRESH: "/auth/token/refresh/",
  USERS: "/users/",
  ROLES: "/roles/",
  PERMISSIONS: "/permissions/",
  AUDIT: "/audit/",
  DASHBOARD: "/dashboard/stats/",
}