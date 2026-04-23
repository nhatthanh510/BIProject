import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatMonthLabel, formatShortMonth, parseMonthKey, toMonthKey } from "@/lib/format";
import { useDashboardFilters } from "@/hooks/useDashboardFilters";
import { cn } from "@/lib/utils";

export function MonthPicker() {
  const { t, i18n } = useTranslation();
  const locale: "de" | "en" = i18n.language.startsWith("de") ? "de" : "en";
  const { filters, setMonth } = useDashboardFilters();

  const selected = parseMonthKey(filters.month);
  const [year, setYear] = useState(selected.getFullYear());
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Calendar className="h-4 w-4" />
          {t("topbar.month")}
          <span className="ml-1 font-normal text-muted-foreground">
            {formatMonthLabel(filters.month, locale)}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64">
        <div className="mb-3 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => setYear((y) => y - 1)} aria-label={t("common.prev")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm font-medium tabular-nums">{year}</div>
          <Button variant="ghost" size="icon" onClick={() => setYear((y) => y + 1)} aria-label={t("common.next")}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 12 }, (_, i) => i).map((i) => {
            const key = `${year}-${String(i + 1).padStart(2, "0")}`;
            const isSelected = filters.month === key;
            const isCurrent = toMonthKey(new Date()) === key;
            return (
              <Button
                key={i}
                type="button"
                variant={isSelected ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "h-9 justify-center",
                  !isSelected && isCurrent && "border border-primary/40",
                )}
                onClick={() => {
                  setMonth(key);
                  setOpen(false);
                }}
              >
                {formatShortMonth(i, locale)}
              </Button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
