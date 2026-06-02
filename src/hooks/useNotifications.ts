"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { qk } from "@/lib/queryKeys";

export function useNotifications() {
  const { data, isLoading, error, fetchNextPage, refetch } = useInfiniteQuery({
    queryKey: qk.notifications.list(),
    queryFn: ({ pageParam }) => api.getNotifications(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const m = lastPage.meta;
      return m && m.current_page < m.last_page ? m.current_page + 1 : undefined;
    },
  });

  const notifications = data?.pages.flatMap((p) => (Array.isArray(p.data) ? p.data : [])) ?? [];
  const meta = data?.pages.at(-1)?.meta ?? null;

  return {
    notifications,
    meta,
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : "Failed to load notifications") : null,
    loadMore: () => { fetchNextPage(); },
    refetch: async () => { await refetch(); },
  };
}
