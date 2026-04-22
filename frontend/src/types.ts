export interface User {
  id: number;
  email: string;
  username: string;
  role: "admin" | "analyst" | "viewer";
  full_name: string;
}

export interface Client {
  id: number;
  name: string;
  external_id: string | null;
  is_active: boolean;
  created_at: string;
}

export interface LoginResponse {
  access: string;
  user: User;
}

export interface RefreshResponse {
  access: string;
}

export interface SummaryResponse {
  filters: { month: string; client_id: number | null };
  as_of: string;
  kpis: {
    orders_month: { value: number };
    orders_total: { value: number };
    orders_today: { value: number };
    token_status: {
      tokens_used: number;
      quota: number;
      percent_used: number;
    };
  };
}

export interface TimelinePoint {
  date: string;
  orders: number;
}

export interface TimelineResponse {
  filters: { month: string; client_id: number | null };
  as_of: string;
  points: TimelinePoint[];
}
