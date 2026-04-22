import { useTranslation } from "react-i18next";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useClients } from "@/hooks/useClients";

interface ClientSelectProps {
  value: number | null;
  onChange: (value: number | null) => void;
}

const ALL = "all";

export function ClientSelect({ value, onChange }: ClientSelectProps) {
  const { t } = useTranslation();
  const { data: clients } = useClients();

  return (
    <Select
      value={value === null ? ALL : String(value)}
      onValueChange={(next) => onChange(next === ALL ? null : Number(next))}
    >
      <SelectTrigger className="min-w-[12rem]">
        <SelectValue placeholder={t("topbar.customer")} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{t("topbar.all_customers")}</SelectItem>
        {clients?.map((client) => (
          <SelectItem key={client.id} value={String(client.id)}>
            {client.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
