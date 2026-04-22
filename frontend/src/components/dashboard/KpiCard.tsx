import type { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: string;
  icon?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function KpiCard({ label, value, icon, footer, className }: KpiCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="pt-6">
        <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
          {icon}
          <span>{label}</span>
        </div>
        <div className="text-3xl font-semibold tracking-tight">{value}</div>
        {footer && <div className="mt-2 text-xs text-muted-foreground">{footer}</div>}
      </CardContent>
    </Card>
  );
}
