import { useQuery } from "@tanstack/react-query";

import { getDashboard } from "../../../api/dashboard";

export function useDashboardPageData() {
    return useQuery({
        queryKey: ["dashboard"],
        queryFn: getDashboard,
    });
}