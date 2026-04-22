import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import { toMonthKey } from "@/lib/format";

export interface DashboardFilters {
  month: string; // YYYY-MM
  clientId: number | null;
}

const currentMonthKey = () => toMonthKey(new Date());

export function useDashboardFilters() {
  const [params, setParams] = useSearchParams();

  const filters: DashboardFilters = useMemo(() => {
    const month = params.get("month") || currentMonthKey();
    const clientRaw = params.get("client");
    const clientId = clientRaw ? Number(clientRaw) : null;
    return { month, clientId: Number.isFinite(clientId) ? clientId : null };
  }, [params]);

  const setMonth = useCallback(
    (month: string) => {
      const next = new URLSearchParams(params);
      next.set("month", month);
      setParams(next, { replace: true });
    },
    [params, setParams],
  );

  const setClient = useCallback(
    (clientId: number | null) => {
      const next = new URLSearchParams(params);
      if (clientId === null) next.delete("client");
      else next.set("client", String(clientId));
      setParams(next, { replace: true });
    },
    [params, setParams],
  );

  return { filters, setMonth, setClient };
}
