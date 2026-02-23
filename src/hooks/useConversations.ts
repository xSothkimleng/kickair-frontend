"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { Conversation } from "@/types/message";

interface UseConversationsReturn {
  conversations: Conversation[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateConversation: (conversationId: number, updates: Partial<Conversation>) => void;
}

export function useConversations(): UseConversationsReturn {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/api/conversations");
      setConversations(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch conversations");
    } finally {
      setLoading(false);
    }
  }, []);

  const updateConversation = useCallback(
    (conversationId: number, updates: Partial<Conversation>) => {
      setConversations((prev) =>
        prev.map((conv) => (conv.id === conversationId ? { ...conv, ...updates } : conv))
      );
    },
    []
  );

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return {
    conversations,
    loading,
    error,
    refetch: fetchConversations,
    updateConversation,
  };
}