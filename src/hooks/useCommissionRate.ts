"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

/**
 * The platform's seller-side commission rate (e.g. 0.2), fetched from the
 * backend so the preview math can never drift from what's actually charged.
 * Returns null until loaded.
 */
export function useCommissionRate(): number | null {
  const { data } = useQuery({
    queryKey: ["platform-config"],
    queryFn: async () => (await api.get("/api/platform-config")).data as { commission_rate: number },
    staleTime: 60 * 60 * 1000,
  });
  return data?.commission_rate ?? null;
}
