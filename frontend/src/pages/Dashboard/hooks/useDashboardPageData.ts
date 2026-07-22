import { useQuery } from "@tanstack/react-query";

import { getDashboard } from "../../../api/dashboard";
import { mapDashboard } from "../dashboard.mappers";

export function useDashboardPageData({
    enabled = true,
}: {
    enabled?: boolean;
}) {
    return useQuery({
        queryKey: ["dashboard"],
        queryFn: async () => {
            const response = await getDashboard();
            return mapDashboard(response);
        },
        enabled,
    });
}