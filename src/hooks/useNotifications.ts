"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { Notification } from "@/types/notification";

interface Meta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const fetchPage = useCallback(async (pageNum: number, append: boolean) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getNotifications(pageNum);
      const items = Array.isArray(response.data) ? response.data : [];
      setNotifications(prev => append ? [...prev, ...items] : items);
      setMeta(response.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPage(1, false);
  }, [fetchPage]);

  const loadMore = useCallback(() => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPage(nextPage, true);
  }, [page, fetchPage]);

  const refetch = useCallback(async () => {
    setPage(1);
    await fetchPage(1, false);
  }, [fetchPage]);

  return { notifications, meta, loading, error, loadMore, refetch };
}
