import { Card, CardContent } from "@/components/ui/card";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

interface TokenStatusCardProps {
  label: string;
  tokensUsed: number;
  quota: number;
  percentUsed: number;
  locale: "de" | "en";
}

export function TokenStatusCard({ label, tokensUsed, quota, percentUsed, locale }: TokenStatusCardProps) {
  const barColor =
    percentUsed >= 80 ? "bg-destructive" : percentUsed >= 50 ? "bg-amber-500" : "bg-primary";

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="mt-3 text-3xl font-semibold tabular-nums">
          {formatNumber(tokensUsed, locale)}
        </div>
        <div className="mt-1 text-sm font-medium tabular-nums text-amber-600">
          {formatNumber(quota, locale)}
        </div>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn("h-full transition-all", barColor)}
            style={{ width: `${Math.min(100, Math.max(0, percentUsed))}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
