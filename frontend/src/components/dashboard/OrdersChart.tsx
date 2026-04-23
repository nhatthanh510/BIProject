import { useMemo } from "react";
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

interface ChartPoint {
  day: string;
  orders: number;
  date: string;
}

export function OrdersChart({ points, isLoading }: OrdersChartProps) {
  const { t } = useTranslation();

  const data = useMemo<ChartPoint[]>(
    () =>
      points.map((p) => {
        const d = p.date.slice(-2); // "YYYY-MM-DD" -> "DD"
        return { day: d, orders: p.orders, date: p.date };
      }),
    [points],
  );

  if (isLoading && data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground sm:h-80">
        {t("common.loading")}
      </div>
    );
  }
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground sm:h-80">
        {t("dashboard.chart.empty")}
      </div>
    );
  }

  return (
    <div className="h-64 w-full sm:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 12, right: 16, left: 0, bottom: 12 }}>
          <defs>
            <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 6" vertical={false} stroke="hsl(210 20% 88%)" />
          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: "hsl(215 16% 47%)" }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: "hsl(215 16% 47%)" }}
            width={40}
            allowDecimals={false}
          />
          <Tooltip
            cursor={{ stroke: "#3b82f6", strokeDasharray: "3 3" }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const count = payload[0].value as number;
              return (
                <div className="rounded-md border bg-popover px-3 py-1.5 text-sm font-medium text-popover-foreground shadow">
                  {t("dashboard.chart.tooltip_orders", { count })}
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
            dot={{ r: 2.5, stroke: "#3b82f6", fill: "#fff", strokeWidth: 2 }}
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
