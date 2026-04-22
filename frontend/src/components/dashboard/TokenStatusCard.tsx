import { Coins } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

interface TokenStatusCardProps {
  label: string;
  tokensUsed: number;
  quota: number;
  percentUsed: number;
  locale: string;
}

export function TokenStatusCard({ label, tokensUsed, quota, percentUsed, locale }: TokenStatusCardProps) {
  const width = Math.min(100, Math.max(0, percentUsed));
  const barColor = percentUsed > 80 ? "bg-destructive" : percentUsed > 50 ? "bg-amber-500" : "bg-primary";

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
          <Coins className="h-4 w-4" />
          <span>{label}</span>
        </div>
        <div className="text-3xl font-semibold tracking-tight">{formatNumber(tokensUsed, locale)}</div>
        <div className="mt-1 text-xs font-medium text-amber-600">
          {formatNumber(quota, locale)}
        </div>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn("h-full transition-all", barColor)}
            style={{ width: `${width}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
