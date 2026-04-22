import { api } from "./client";
import type { Client, SummaryResponse, TimelineResponse } from "@/types";

export interface DashboardFilters {
  month: string; // YYYY-MM
  clientId: number | null;
}

function params(filters: DashboardFilters): Record<string, string> {
  const out: Record<string, string> = { month: filters.month };
  if (filters.clientId !== null) out.client = String(filters.clientId);
  return out;
}

export async function fetchSummary(filters: DashboardFilters): Promise<SummaryResponse> {
  const res = await api.get<SummaryResponse>("/api/dashboard/summary/", { params: params(filters) });
  return res.data;
}

export async function fetchTimeline(filters: DashboardFilters): Promise<TimelineResponse> {
  const res = await api.get<TimelineResponse>("/api/dashboard/orders-timeline/", { params: params(filters) });
  return res.data;
}

export async function fetchClients(): Promise<Client[]> {
  const res = await api.get<Client[]>("/api/clients/");
  return res.data;
}
