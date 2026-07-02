"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/queryKeys";
import { api } from "@/lib/api";

export function useMyCustomOrders() {
  return useQuery({ queryKey: qk.customOrders.mine(), queryFn: () => api.getMyCustomOrders() });
}

export function useIncomingCustomOrders() {
  return useQuery({ queryKey: qk.customOrders.incoming(), queryFn: () => api.getIncomingCustomOrders() });
}

export function useCustomOrder(id: number | string) {
  return useQuery({
    queryKey: qk.customOrders.detail(id),
    queryFn: () => api.getCustomOrder(id),
    enabled: id !== undefined && id !== null && id !== "",
    // The milestone workspace is a two-party live surface — poll so the other
    // side's funding/submission/approval appears without a manual refresh.
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
  });
}

/**
 * After any custom-order action, refresh every custom-order list/detail plus the
 * wallet + orders that also reflect the change.
 */
export function useCoInvalidate() {
  const qc = useQueryClient();
  return async () => {
    await qc.invalidateQueries({ queryKey: qk.customOrders.all() });
    qc.invalidateQueries({ queryKey: qk.wallet() });
    qc.invalidateQueries({ queryKey: qk.orders.all() });
    qc.invalidateQueries({ queryKey: qk.dashboard.client() });
    qc.invalidateQueries({ queryKey: qk.dashboard.freelancer() });
  };
}
