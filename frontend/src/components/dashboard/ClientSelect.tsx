import { useTranslation } from "react-i18next";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDashboardFilters } from "@/hooks/useDashboardFilters";
import { useClients } from "@/hooks/useClients";

const ALL = "__all__";

export function ClientSelect() {
  const { t } = useTranslation();
  const { filters, setClient } = useDashboardFilters();
  const { data: clients = [] } = useClients();

  const value = filters.clientId || ALL;

  return (
    <Select
      value={value}
      onValueChange={(v) => setClient(v === ALL ? "" : v)}
    >
      <SelectTrigger className="w-[140px] sm:w-[200px]">
        <SelectValue placeholder={t("topbar.client")} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{t("topbar.all_clients")}</SelectItem>
        {clients.map((c) => (
          <SelectItem key={c.id} value={String(c.id)}>
            {c.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
