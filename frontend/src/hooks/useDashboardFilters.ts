import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router";

import { toMonthKey } from "@/lib/format";
import type { DashboardFilters } from "@/types";

export function useDashboardFilters() {
  const [params, setParams] = useSearchParams();

  const filters: DashboardFilters = useMemo(
    () => ({
      month: params.get("month") || toMonthKey(new Date()),
      clientId: params.get("client") || "",
    }),
    [params],
  );

  const setMonth = useCallback(
    (month: string) => {
      const next = new URLSearchParams(params);
      next.set("month", month);
      setParams(next, { replace: true });
    },
    [params, setParams],
  );

  const setClient = useCallback(
    (clientId: string) => {
      const next = new URLSearchParams(params);
      if (clientId) next.set("client", clientId);
      else next.delete("client");
      setParams(next, { replace: true });
    },
    [params, setParams],
  );

  return { filters, setMonth, setClient };
}
