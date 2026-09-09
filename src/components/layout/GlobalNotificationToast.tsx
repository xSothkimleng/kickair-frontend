"use client";

import { useEffect } from "react";
import { Bell, MessageCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { css } from "styled-system/css";
import { toast } from "@/components/ds";
import { useAuth } from "@/components/context/AuthContext";
import { getEcho } from "@/lib/echo";
import { invalidateForNotification } from "@/lib/realtimeInvalidation";
import { ensureSubscribed } from "@/lib/webPush";
import { Notification } from "@/types/notification";

// Re-export so NotificationBell can trigger a count refresh
let _refreshBell: (() => void) | null = null;
export function registerBellRefresh(fn: () => void) { _refreshBell = fn; }
export function triggerBellRefresh() { _refreshBell?.(); }

// Multiple subscribers (navbar MessageBell + dashboard message tab) may want a refresh,
// so this uses a set rather than a single slot. Returns an unsubscribe function.
const _messageRefreshers = new Set<() => void>();
export function registerMessageRefresh(fn: () => void): () => void {
  _messageRefreshers.add(fn);
  return () => { _messageRefreshers.delete(fn); };
}
export function triggerMessageRefresh() { _messageRefreshers.forEach(fn => fn()); }

// Admin work-queues (KYC review, marketplace approvals, disputes) use manual fetch, so
// they subscribe here to refetch live when a relevant admin notification arrives. The
// callback receives the notification type so each queue can ignore unrelated ones.
const _adminRefreshers = new Set<(type?: string) => void>();
export function registerAdminRefresh(fn: (type?: string) => void): () => void {
  _adminRefreshers.add(fn);
  return () => { _adminRefreshers.delete(fn); };
}
export function triggerAdminRefresh(type?: string) { _adminRefreshers.forEach(fn => fn(type)); }

const toastIconCss = css({ color: "accent", mt: "1px", flexShrink: 0 });

/**
 * Realtime bridge: subscribes to the user's private Echo channel and surfaces new
 * notifications / chat messages as app toasts (via the ds toaster mounted in the
 * root layout — 5 s auto-hide) while nudging the bells and cached queries. Renders nothing.
 */
export default function GlobalNotificationToast() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id;

  useEffect(() => {
    if (!userId) return;

    // Silent web-push keep-alive: if the user already granted browser-notification
    // permission (and hasn't opted out), refresh the subscription with the API.
    // Fire-and-forget — a failure must never affect the realtime toasts below.
    ensureSubscribed().catch(() => {});

    let echo: ReturnType<typeof getEcho>;
    try { echo = getEcho(); } catch { return; }

    const channel = echo.private(`user.${userId}`);

    channel.listen(".notification.created", (data: Partial<Notification> & { created_at?: string; role?: string }) => {
      toast.info({
        title: data.title ?? "New notification",
        description: data.body ?? "",
        icon: <Bell size={18} className={toastIconCss} />,
      });
      // Refresh the bell badge
      triggerBellRefresh();
      // Refresh whatever page data this notification affects (live, no reload).
      invalidateForNotification(queryClient, data.type);
      // Admin alerts also nudge the open admin work-queue to refetch.
      if (data.role === "admin") triggerAdminRefresh(data.type);
    });

    // New chat messages arrive on the user channel too (see MessageSent::broadcastOn),
    // so we can show a toast + bump the message indicator without the chat being open.
    channel.listen(".message.sent", (data: { message?: { id?: number; body?: string; type?: string; sender?: { name?: string } } }) => {
      const msg = data.message;
      const senderName = msg?.sender?.name ?? "Someone";
      const preview = msg?.type === "file" ? "Sent a file" : (msg?.body || "New message");
      toast.info({
        title: `New message from ${senderName}`,
        description: preview,
        icon: <MessageCircle size={18} className={toastIconCss} />,
      });
      triggerMessageRefresh();
    });

    return () => {
      try { echo.leave(`private-user.${userId}`); } catch {}
    };
  }, [userId, queryClient]);

  return null;
}
