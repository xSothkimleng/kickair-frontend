"use client";

import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { qk } from "@/lib/queryKeys";
import { Conversation } from "@/types/message";

interface UseConversationsReturn {
  conversations: Conversation[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateConversation: (conversationId: number, updates: Partial<Conversation>) => void;
}

export function useConversations(): UseConversationsReturn {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: qk.conversations(),
    queryFn: async () => {
      const response = await api.get("/api/conversations");
      return (response.data ?? []) as Conversation[];
    },
  });

  const updateConversation = useCallback(
    (conversationId: number, updates: Partial<Conversation>) => {
      queryClient.setQueryData<Conversation[]>(qk.conversations(), (prev) =>
        (prev ?? []).map((conv) => (conv.id === conversationId ? { ...conv, ...updates } : conv))
      );
    },
    [queryClient]
  );

  return {
    conversations: data ?? [],
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : "Failed to fetch conversations") : null,
    refetch: async () => {
      await refetch();
    },
    updateConversation,
  };
}
