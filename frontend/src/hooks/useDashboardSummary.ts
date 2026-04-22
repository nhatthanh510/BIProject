import { useQuery } from "@tanstack/react-query";

import { fetchSummary } from "@/api/dashboard";
import type { DashboardFilters } from "./useDashboardFilters";

export function useDashboardSummary(filters: DashboardFilters) {
  return useQuery({
    queryKey: ["dashboard", "summary", filters],
    queryFn: () => fetchSummary({ month: filters.month, clientId: filters.clientId }),
  });
}
