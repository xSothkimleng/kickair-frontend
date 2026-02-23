"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "@/lib/api";
import { getEcho } from "@/lib/echo";
import { Message } from "@/types/message";

interface UseChatReturn {
  messages: Message[];
  loading: boolean;
  error: string | null;
  sending: boolean;
  sendMessage: (body: string) => Promise<Message | null>;
  markAsRead: () => Promise<void>;
}

export function useChat(conversationId: number | null): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const channelRef = useRef<ReturnType<ReturnType<typeof getEcho>["private"]> | null>(null);

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    if (!conversationId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/api/conversations/${conversationId}/messages`);
      setMessages(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch messages");
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  // Send message
  const sendMessage = useCallback(
    async (body: string): Promise<Message | null> => {
      if (!conversationId || !body.trim()) return null;

      try {
        setSending(true);
        const response = await api.post(`/api/conversations/${conversationId}/messages`, {
          body: body.trim(),
        });
        const newMessage = response.data;
        // Add message immediately for sender (real-time event will also arrive but we dedupe)
        setMessages((prev) => {
          // Check if message already exists (from real-time)
          if (prev.some((m) => m.id === newMessage.id)) {
            return prev;
          }
          return [...prev, newMessage];
        });
        return newMessage;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to send message");
        return null;
      } finally {
        setSending(false);
      }
    },
    [conversationId]
  );

  // Mark messages as read
  const markAsRead = useCallback(async () => {
    if (!conversationId) return;

    try {
      await api.put(`/api/conversations/${conversationId}/messages/read`, {});
    } catch (err) {
      console.error("Failed to mark messages as read:", err);
    }
  }, [conversationId]);

  // Fetch messages when conversation changes
  useEffect(() => {
    if (conversationId) {
      fetchMessages();
    } else {
      setMessages([]);
    }
  }, [conversationId, fetchMessages]);

  // Subscribe to real-time messages
  useEffect(() => {
    if (!conversationId) return;

    try {
      const echo = getEcho();
      const channel = echo.private(`conversation.${conversationId}`);
      channelRef.current = channel;

      channel.listen(".message.sent", (event: { message: Message }) => {
        setMessages((prev) => {
          // Dedupe: check if message already exists
          if (prev.some((m) => m.id === event.message.id)) {
            return prev;
          }
          return [...prev, event.message];
        });
      });
    } catch (err) {
      console.error("Failed to subscribe to conversation channel:", err);
    }

    return () => {
      if (conversationId) {
        try {
          const echo = getEcho();
          echo.leave(`conversation.${conversationId}`);
        } catch (err) {
          console.error("Failed to leave conversation channel:", err);
        }
      }
      channelRef.current = null;
    };
  }, [conversationId]);

  return {
    messages,
    loading,
    error,
    sending,
    sendMessage,
    markAsRead,
  };
}