import { api } from "./client";
import type { Client, SummaryResponse, TimelineResponse } from "@/types";

export async function fetchClients(): Promise<Client[]> {
  const resp = await api.get<Client[]>("/api/clients/");
  return resp.data;
}

function buildParams(month: string, clientId: string): URLSearchParams {
  const params = new URLSearchParams();
  if (month) params.set("month", month);
  if (clientId) params.set("client", clientId);
  return params;
}

export async function fetchSummary(month: string, clientId: string): Promise<SummaryResponse> {
  const params = buildParams(month, clientId);
  const resp = await api.get<SummaryResponse>(`/api/dashboard/summary/?${params.toString()}`);
  return resp.data;
}

export async function fetchTimeline(month: string, clientId: string): Promise<TimelineResponse> {
  const params = buildParams(month, clientId);
  const resp = await api.get<TimelineResponse>(`/api/dashboard/orders-timeline/?${params.toString()}`);
  return resp.data;
}
