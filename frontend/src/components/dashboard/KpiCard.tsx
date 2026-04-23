import type { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";

interface KpiCardProps {
  icon?: ReactNode;
  label: string;
  value: ReactNode;
}

export function KpiCard({ icon, label, value }: KpiCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {icon}
          <span>{label}</span>
        </div>
        <div className="mt-3 text-3xl font-semibold tabular-nums">{value}</div>
      </CardContent>
    </Card>
  );
}
