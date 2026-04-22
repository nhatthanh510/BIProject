import { useQuery } from "@tanstack/react-query";

import { fetchClients } from "@/api/dashboard";

export function useClients() {
  return useQuery({
    queryKey: ["clients"],
    queryFn: fetchClients,
    staleTime: 5 * 60 * 1000,
  });
}
