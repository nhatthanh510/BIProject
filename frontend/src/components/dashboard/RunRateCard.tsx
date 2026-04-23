import { TrendingDown, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

interface RunRateCardProps {
  projected: number;
  target: number;
  pacePct: number;
  currency: string;
  locale: "de" | "en";
}

export function RunRateCard({ projected, target, pacePct, currency, locale }: RunRateCardProps) {
  const { t } = useTranslation();
  const onTrack = pacePct >= 100;
  const Icon = onTrack ? TrendingUp : TrendingDown;
  const tone = onTrack ? "text-emerald-600" : "text-amber-600";
  const barColor = onTrack ? "bg-emerald-500" : "bg-amber-500";

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-sm text-muted-foreground">{t("dashboard.kpi.projected_month")}</div>
        <div className="mt-3 text-3xl font-semibold tabular-nums">
          {formatCurrency(projected, locale, currency)}
        </div>
        <div className={cn("mt-1 flex items-center gap-1 text-sm font-medium tabular-nums", tone)}>
          <Icon className="h-4 w-4" />
          <span>{pacePct.toFixed(0)}%</span>
          <span className="text-muted-foreground font-normal">
            {" "}
            {t("dashboard.kpi.of_target", { target: formatCurrency(target, locale, currency) })}
          </span>
        </div>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn("h-full transition-all", barColor)}
            style={{ width: `${Math.min(100, Math.max(0, pacePct))}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
