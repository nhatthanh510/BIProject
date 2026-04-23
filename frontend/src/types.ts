export type UserRole = "admin" | "analyst" | "viewer";

export interface User {
  id: number;
  email: string;
  username: string;
  role: UserRole;
  full_name: string;
}

export interface Client {
  id: number;
  name: string;
  external_id: string | null;
  is_active: boolean;
}

export interface LoginResponse {
  access: string;
  user: User;
}

export interface RefreshResponse {
  access: string;
}

export interface KpiValue {
  value: number;
}

export interface TokenStatus {
  tokens_used: number;
  quota: number;
  percent_used: number;
}

export interface SummaryFilters {
  month: string;
  client_id: number | null;
}

export interface RevenueStatus {
  month_to_date: number;
  today: number;
  projected_month: number;
  target_month: number;
  pace_pct: number;
  currency: string;
}

export interface SummaryResponse {
  filters: SummaryFilters;
  as_of: string;
  kpis: {
    orders_month: KpiValue;
    orders_total: KpiValue;
    orders_today: KpiValue;
    token_status: TokenStatus;
    revenue: RevenueStatus;
  };
}

export interface TimelinePoint {
  date: string;
  orders: number;
}

export interface TimelineResponse {
  filters: SummaryFilters;
  as_of: string;
  points: TimelinePoint[];
}

export interface DashboardFilters {
  month: string;
  clientId: string;
}
