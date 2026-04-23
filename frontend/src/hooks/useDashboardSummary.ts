import { useQuery } from "@tanstack/react-query";

import { fetchSummary } from "@/api/dashboard";
import type { DashboardFilters } from "@/types";

export function useDashboardSummary(filters: DashboardFilters) {
  return useQuery({
    queryKey: ["dashboard", "summary", filters],
    queryFn: () => fetchSummary(filters.month, filters.clientId),
  });
}
