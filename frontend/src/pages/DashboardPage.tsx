import { FileText, Files, Send, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { TokenStatusCard } from "@/components/dashboard/TokenStatusCard";
import { OrdersChart } from "@/components/dashboard/OrdersChart";
import { RefreshButton } from "@/components/dashboard/RefreshButton";
import { useDashboardFilters } from "@/hooks/useDashboardFilters";
import { useDashboardSummary } from "@/hooks/useDashboardSummary";
import { useOrdersTimeline } from "@/hooks/useOrdersTimeline";
import { useNow } from "@/hooks/useNow";
import { formatNumber } from "@/lib/format";

export function DashboardPage() {
  const { t, i18n } = useTranslation();
  const locale: "de" | "en" = i18n.language.startsWith("de") ? "de" : "en";
  const { filters } = useDashboardFilters();
  const summary = useDashboardSummary(filters);
  const timeline = useOrdersTimeline(filters);
  const now = useNow(60_000);

  const timeLabel = new Intl.DateTimeFormat(locale === "de" ? "de-DE" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(now);

  const kpis = summary.data?.kpis;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{t("dashboard.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("dashboard.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground sm:gap-3">
          <span className="hidden sm:inline">{t("dashboard.as_of", { time: timeLabel })}</span>
          <Button variant="outline" size="icon" aria-label={t("dashboard.send")}>
            <Send className="h-4 w-4" />
          </Button>
          <RefreshButton />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={<FileText className="h-4 w-4 text-primary" />}
          label={t("dashboard.kpi.orders_month")}
          value={formatNumber(kpis?.orders_month.value ?? 0, locale)}
        />
        <KpiCard
          icon={<Files className="h-4 w-4 text-primary" />}
          label={t("dashboard.kpi.orders_total")}
          value={formatNumber(kpis?.orders_total.value ?? 0, locale)}
        />
        <KpiCard
          icon={<TrendingUp className="h-4 w-4 text-primary" />}
          label={t("dashboard.kpi.orders_today")}
          value={formatNumber(kpis?.orders_today.value ?? 0, locale)}
        />
        <TokenStatusCard
          label={t("dashboard.kpi.token_status")}
          tokensUsed={kpis?.token_status.tokens_used ?? 0}
          quota={kpis?.token_status.quota ?? 0}
          percentUsed={kpis?.token_status.percent_used ?? 0}
          locale={locale}
        />
      </div>

      <Card>
        <CardContent className="pt-6">
          <h2 className="mb-2 text-lg font-semibold">{t("dashboard.chart.title")}</h2>
          <OrdersChart points={timeline.data?.points ?? []} isLoading={timeline.isLoading} />
        </CardContent>
      </Card>
    </div>
  );
}
