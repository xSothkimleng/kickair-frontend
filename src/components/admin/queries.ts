"use client";

import { useMutation, useQuery, useQueryClient, type QueryKey } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { qk } from "@/lib/queryKeys";

/**
 * React Query hooks for the admin console. Every list lives under the `admin`
 * key prefix, so a realtime admin alert or any successful action can refresh
 * the whole console with one invalidation (see `useAdminInvalidate`).
 */

export function useAdminStats() {
  return useQuery({ queryKey: qk.admin.stats(), queryFn: () => api.getAdminDashboardStats(), staleTime: 15_000 });
}
export function useFinanceStats() {
  return useQuery({ queryKey: qk.admin.financeStats(), queryFn: () => api.getAdminStats() });
}
export function useKycQueue(status: string, page: number) {
  return useQuery({ queryKey: qk.admin.kyc({ status, page }), queryFn: () => api.getAdminKyc(page, status), placeholderData: (prev) => prev });
}
export function useDisputes(status: string, page: number) {
  return useQuery({ queryKey: qk.admin.disputes({ status, page }), queryFn: () => api.getAdminDisputes(page, status), placeholderData: (prev) => prev });
}
export function useServices(status: string, page: number, enabled = true) {
  return useQuery({ queryKey: qk.admin.services({ status, page }), queryFn: () => api.getAdminServices(status, page), placeholderData: (prev) => prev, enabled });
}
export function useJobPosts(status: string, page: number, enabled = true) {
  return useQuery({ queryKey: qk.admin.jobs({ status, page }), queryFn: () => api.getAdminJobPosts(status, page), placeholderData: (prev) => prev, enabled });
}
export function useWithdrawals(status: string, page: number, enabled = true) {
  return useQuery({ queryKey: qk.admin.withdrawals({ status, page }), queryFn: () => api.getAdminWithdrawals(page, status), placeholderData: (prev) => prev, enabled });
}
export function useTransactions(type: string, page: number, enabled = true) {
  return useQuery({ queryKey: qk.admin.transactions({ type, page }), queryFn: () => api.getAdminTransactions(page, type || undefined), placeholderData: (prev) => prev, enabled });
}
export function useUsers(params: { page?: number; search?: string; role?: string; kyc?: string; status?: string; sort?: string; dir?: "asc" | "desc" }) {
  return useQuery({ queryKey: qk.admin.users(params), queryFn: () => api.getAdminUsers(params), placeholderData: (prev) => prev });
}
export function useUser(id: number) {
  return useQuery({ queryKey: qk.admin.user(id), queryFn: () => api.getAdminUser(id), enabled: Number.isFinite(id) });
}
export function useCategories() {
  return useQuery({ queryKey: qk.admin.categories(), queryFn: () => api.getAdminCategories(), staleTime: 5 * 60_000 });
}
export function useSkills() {
  return useQuery({ queryKey: qk.admin.skills(), queryFn: () => api.getAdminSkills(), staleTime: 5 * 60_000 });
}
export function useNotifications(page = 1) {
  return useQuery({ queryKey: [...qk.notifications.list(), page], queryFn: () => api.getNotifications(page), placeholderData: (prev) => prev });
}
export function useUnreadCount() {
  return useQuery({ queryKey: qk.notifications.unreadCount(), queryFn: () => api.getUnreadCount(), staleTime: 15_000 });
}

/** Refresh every admin query (queues, counts, reference data) plus any extra keys. */
export function useAdminInvalidate() {
  const qc = useQueryClient();
  return (extra: QueryKey[] = []) => {
    qc.invalidateQueries({ queryKey: qk.admin.all() });
    extra.forEach((key) => qc.invalidateQueries({ queryKey: key }));
  };
}

/**
 * A mutation that refreshes the console when it succeeds. Pages pass the API
 * call and get back `mutateAsync` plus `isPending` for the button state.
 */
export function useAdminAction<TArgs, TResult = unknown>(fn: (args: TArgs) => Promise<TResult>, opts: { invalidate?: QueryKey[] } = {}) {
  const invalidate = useAdminInvalidate();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => invalidate(opts.invalidate),
  });
}
