import { useQuery } from "@tanstack/react-query";

import { fetchTimeline } from "@/api/dashboard";
import type { DashboardFilters } from "./useDashboardFilters";

export function useOrdersTimeline(filters: DashboardFilters) {
  return useQuery({
    queryKey: ["dashboard", "timeline", filters],
    queryFn: () => fetchTimeline({ month: filters.month, clientId: filters.clientId }),
  });
}
