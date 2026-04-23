import { useQuery } from "@tanstack/react-query";

import { fetchTimeline } from "@/api/dashboard";
import type { DashboardFilters } from "@/types";

export function useOrdersTimeline(filters: DashboardFilters) {
  return useQuery({
    queryKey: ["dashboard", "timeline", filters],
    queryFn: () => fetchTimeline(filters.month, filters.clientId),
  });
}
