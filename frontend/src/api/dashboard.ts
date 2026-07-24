import api from "./axios";

import type {
    DashboardData,
} from "../pages/Dashboard/dashboard.types";

export async function getDashboard(): Promise<DashboardData> {
    const response = await api.get<DashboardData>("/dashboard/");

    console.log("Dashboard API Response:", response.data);

    return response.data;
}