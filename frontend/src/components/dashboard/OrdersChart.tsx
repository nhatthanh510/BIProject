import { useTranslation } from "react-i18next";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { TimelinePoint } from "@/types";

interface OrdersChartProps {
  points: TimelinePoint[];
  isLoading?: boolean;
}

export function OrdersChart({ points, isLoading }: OrdersChartProps) {
  const { t } = useTranslation();
  const data = points.map((p) => {
    const d = new Date(p.date);
    return { label: String(d.getDate()).padStart(2, "0"), orders: p.orders, fullDate: p.date };
  });

  if (isLoading) {
    return (
      <div className="flex h-80 items-center justify-center text-muted-foreground">
        {t("common.loading")}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex h-80 items-center justify-center text-muted-foreground">
        {t("dashboard.empty")}
      </div>
    );
  }

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 20, right: 24, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} width={40} />
          <Tooltip
            cursor={{ stroke: "#94a3b8", strokeDasharray: "4 4" }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const count = Number(payload[0].value ?? 0);
              const key = count === 1 ? "dashboard.chart.tooltip_orders_one" : "dashboard.chart.tooltip_orders";
              return (
                <div className="rounded-md border bg-background px-3 py-1.5 text-sm shadow-sm">
                  <div className="font-semibold">{t(key, { count })}</div>
                </div>
              );
            }}
          />
          <Area
            type="monotone"
            dataKey="orders"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#ordersGradient)"
            dot={{ r: 3, fill: "#fff", stroke: "#3b82f6", strokeWidth: 2 }}
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
