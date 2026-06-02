"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { qk } from "@/lib/queryKeys";

export function useClientDashboard() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: qk.dashboard.client(),
    queryFn: () => api.getClientDashboard(),
  });

  return {
    data: data ?? null,
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : "Failed to load dashboard") : null,
    refetch,
  };
}
