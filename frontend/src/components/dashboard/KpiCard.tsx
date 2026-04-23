import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";

interface KpiCardProps {
  icon?: ReactNode;
  label: string;
  value: ReactNode;
  /** Raw numeric value; used to color the flash green (up) or red (down). */
  numericValue?: number;
  sublabel?: ReactNode;
}

type Flash = "up" | "down" | "neutral";

const FADE_MS = 1200;
const FLASH_MS = 1800;

export function KpiCard({ icon, label, value, numericValue, sublabel }: KpiCardProps) {
  const valueKey = typeof value === "string" || typeof value === "number" ? String(value) : undefined;
  const [tick, setTick] = useState(0);
  const [flash, setFlash] = useState<Flash>("neutral");
  const prevKey = useRef<string | undefined>(valueKey);
  const prevNum = useRef<number | undefined>(numericValue);

  useEffect(() => {
    if (valueKey === undefined) return;
    if (prevKey.current === undefined) {
      prevKey.current = valueKey;
      prevNum.current = numericValue;
      return;
    }
    if (prevKey.current !== valueKey) {
      let next: Flash = "neutral";
      if (
        typeof numericValue === "number" &&
        typeof prevNum.current === "number" &&
        numericValue !== prevNum.current
      ) {
        next = numericValue > prevNum.current ? "up" : "down";
      }
      prevKey.current = valueKey;
      prevNum.current = numericValue;
      setFlash(next);
      setTick((n) => n + 1);
    }
  }, [valueKey, numericValue]);

  const animName =
    flash === "up" ? "kpi-flash-up" : flash === "down" ? "kpi-flash-down" : "kpi-fade-in";
  const duration = flash === "neutral" ? FADE_MS : FLASH_MS;

  // Re-trigger by keying on `tick` — React remounts the node and the CSS
  // animation runs fresh each time.
  const style: CSSProperties = {
    animation: `${animName} ${duration}ms ease-out both`,
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {icon}
          <span>{label}</span>
        </div>
        <div className="mt-3 h-9">
          <div
            key={`${valueKey}-${tick}`}
            className="text-3xl font-semibold tabular-nums"
            style={style}
          >
            {value}
          </div>
        </div>
        {sublabel && <div className="mt-1 text-xs text-muted-foreground">{sublabel}</div>}
      </CardContent>
    </Card>
  );
}
