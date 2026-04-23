import { useEffect, useRef, useState, type ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  icon?: ReactNode;
  label: string;
  value: ReactNode;
  sublabel?: ReactNode;
}

export function KpiCard({ icon, label, value, sublabel }: KpiCardProps) {
  const valueKey = typeof value === "string" || typeof value === "number" ? String(value) : undefined;
  const [pulse, setPulse] = useState(false);
  const prev = useRef<string | undefined>(valueKey);

  useEffect(() => {
    if (valueKey === undefined) return;
    if (prev.current !== undefined && prev.current !== valueKey) {
      setPulse(true);
      const t = setTimeout(() => setPulse(false), 600);
      return () => clearTimeout(t);
    }
    prev.current = valueKey;
  }, [valueKey]);

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {icon}
          <span>{label}</span>
        </div>
        <div
          className={cn(
            "mt-3 text-3xl font-semibold tabular-nums transition-colors duration-500",
            pulse && "text-primary",
          )}
        >
          {value}
        </div>
        {sublabel && <div className="mt-1 text-xs text-muted-foreground">{sublabel}</div>}
      </CardContent>
    </Card>
  );
}
