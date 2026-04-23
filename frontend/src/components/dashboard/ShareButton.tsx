import { useState } from "react";
import { Check, Copy, Mail, Send } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatCurrency, formatMonthLabel, formatNumber } from "@/lib/format";
import type { SummaryResponse } from "@/types";

interface ShareButtonProps {
  summary: SummaryResponse | undefined;
  monthKey: string;
  clientName: string | null;
  locale: "de" | "en";
}

function buildSnapshot(
  summary: SummaryResponse,
  monthKey: string,
  clientName: string | null,
  locale: "de" | "en",
  t: (key: string, opts?: Record<string, unknown>) => string,
): { subject: string; body: string } {
  const kpis = summary.kpis;
  const rev = kpis.revenue;
  const currency = rev?.currency ?? "EUR";
  const monthLabel = formatMonthLabel(monthKey, locale);
  const scope = clientName ?? t("topbar.all_clients");

  const subject = t("dashboard.share.subject", { month: monthLabel, scope });

  const lines = [
    t("dashboard.share.header", { month: monthLabel, scope }),
    "",
    `${t("dashboard.kpi.revenue_month")}: ${formatCurrency(rev?.month_to_date ?? 0, locale, currency)}`,
    `${t("dashboard.kpi.revenue_today")
      .replace("{{value}}", formatCurrency(rev?.today ?? 0, locale, currency))}`,
    `${t("dashboard.kpi.projected_month")}: ${formatCurrency(rev?.projected_month ?? 0, locale, currency)} (${(rev?.pace_pct ?? 0).toFixed(0)}% ${t("dashboard.share.of_target")})`,
    "",
    `${t("dashboard.kpi.orders_month")}: ${formatNumber(kpis.orders_month.value, locale)}`,
    `${t("dashboard.kpi.orders_today")}: ${formatNumber(kpis.orders_today.value, locale)}`,
    `${t("dashboard.kpi.orders_total")}: ${formatNumber(kpis.orders_total.value, locale)}`,
    "",
    `${t("dashboard.kpi.token_status")}: ${formatNumber(kpis.token_status.tokens_used, locale)} / ${formatNumber(kpis.token_status.quota, locale)} (${kpis.token_status.percent_used.toFixed(1)}%)`,
    "",
    t("dashboard.share.footer", { ts: new Date(summary.as_of).toLocaleString(locale === "de" ? "de-DE" : "en-US") }),
  ];

  return { subject, body: lines.join("\n") };
}

export function ShareButton({ summary, monthKey, clientName, locale }: ShareButtonProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const disabled = !summary;

  const onCopy = async () => {
    if (!summary) return;
    const { body } = buildSnapshot(summary, monthKey, clientName, locale, t);
    try {
      await navigator.clipboard.writeText(body);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard may be blocked (insecure context). Fall back to a prompt.
      window.prompt(t("dashboard.share.copy_fallback"), body);
    }
  };

  const onEmail = () => {
    if (!summary) return;
    const { subject, body } = buildSnapshot(summary, monthKey, clientName, locale, t);
    const href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = href;
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          aria-label={t("dashboard.send")}
          disabled={disabled}
        >
          <Send className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 p-2">
        <button
          type="button"
          onClick={onCopy}
          className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent"
        >
          {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
          {copied ? t("dashboard.share.copied") : t("dashboard.share.copy")}
        </button>
        <button
          type="button"
          onClick={onEmail}
          className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent"
        >
          <Mail className="h-4 w-4" />
          {t("dashboard.share.email")}
        </button>
      </PopoverContent>
    </Popover>
  );
}
