"use client";

import { useEffect, useState } from "react";
import { Snackbar, Alert, Typography, Box } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import ChatBubbleIcon from "@mui/icons-material/ChatBubbleOutline";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/context/AuthContext";
import { getEcho } from "@/lib/echo";
import { invalidateForNotification } from "@/lib/realtimeInvalidation";
import { Notification } from "@/types/notification";

interface Toast {
  id: string;
  title: string;
  body: string;
  variant?: "notification" | "message";
}

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

export default function GlobalNotificationToast() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [queue, setQueue] = useState<Toast[]>([]);
  const current = queue[0] ?? null;

  useEffect(() => {
    if (!user) return;

    let echo: ReturnType<typeof getEcho>;
    try { echo = getEcho(); } catch { return; }

    const channel = echo.private(`user.${user.id}`);

    channel.listen(".notification.created", (data: Partial<Notification> & { created_at?: string; role?: string }) => {
      setQueue(prev => [
        ...prev,
        { id: data.id ?? String(Date.now()), title: data.title ?? "New notification", body: data.body ?? "", variant: "notification" },
      ]);
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
      setQueue(prev => [
        ...prev,
        { id: `msg-${msg?.id ?? Date.now()}`, title: `New message from ${senderName}`, body: preview, variant: "message" },
      ]);
      triggerMessageRefresh();
    });

    return () => {
      try { echo.leave(`private-user.${user.id}`); } catch {}
    };
  }, [user?.id, queryClient]);

  const handleClose = () => {
    setQueue(prev => prev.slice(1));
  };

  return (
    <Snackbar
      open={!!current}
      autoHideDuration={5000}
      onClose={handleClose}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      sx={{ top: { xs: 72, sm: 80 } }}
    >
      <Alert
        icon={current?.variant === "message" ? <ChatBubbleIcon sx={{ fontSize: 18 }} /> : <NotificationsIcon sx={{ fontSize: 18 }} />}
        severity="info"
        onClose={handleClose}
        sx={{
          minWidth: 280,
          maxWidth: 380,
          boxShadow: "0 4px 12px rgba(15,23,42,0.12)",
          borderRadius: "10px",
          bgcolor: "#FFFFFF",
          border: "1px solid #E2E8F0",
          color: "#0F172A",
          "& .MuiAlert-icon": { color: "#1976d2" },
          "& .MuiAlert-message": { width: "100%" },
        }}
      >
        <Box>
          <Typography sx={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3, mb: 0.25 }}>
            {current?.title}
          </Typography>
          <Typography sx={{ fontSize: 12, color: "#64748B", lineHeight: 1.4 }}>
            {current?.body}
          </Typography>
        </Box>
      </Alert>
    </Snackbar>
  );
}
