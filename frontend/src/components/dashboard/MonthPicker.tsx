import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { formatMonthLabel, parseMonthKey, toMonthKey } from "@/lib/format";

interface MonthPickerProps {
  value: string; // YYYY-MM
  onChange: (value: string) => void;
}

export function MonthPicker({ value, onChange }: MonthPickerProps) {
  const { i18n } = useTranslation();
  const locale = i18n.language.startsWith("de") ? "de" : "en";
  const selected = parseMonthKey(value);
  const [viewYear, setViewYear] = useState(selected.getFullYear());
  const [open, setOpen] = useState(false);

  const months = useMemo(
    () =>
      Array.from({ length: 12 }).map((_, index) => {
        const d = new Date(viewYear, index, 1);
        const label = new Intl.DateTimeFormat(locale === "de" ? "de-DE" : "en-US", { month: "short" }).format(d);
        return { key: toMonthKey(d), label };
      }),
    [viewYear, locale],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Calendar className="h-4 w-4" />
          <span>{formatMonthLabel(selected, locale)}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="end">
        <div className="mb-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Previous year"
            onClick={() => setViewYear((y) => y - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">{viewYear}</span>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Next year"
            onClick={() => setViewYear((y) => y + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {months.map((month) => {
            const isSelected = month.key === value;
            return (
              <button
                key={month.key}
                type="button"
                onClick={() => {
                  onChange(month.key);
                  setOpen(false);
                }}
                className={cn(
                  "rounded-md px-2 py-1.5 text-sm transition-colors",
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent hover:text-accent-foreground",
                )}
              >
                {month.label}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
