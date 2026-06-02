"use client";

import { useEffect, useState } from "react";
import { Snackbar, Alert, Typography, Box } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useAuth } from "@/components/context/AuthContext";
import { getEcho } from "@/lib/echo";
import { Notification, NotificationType } from "@/types/notification";

interface Toast {
  id: string;
  title: string;
  body: string;
}

// Re-export so NotificationBell can trigger a count refresh
let _refreshBell: (() => void) | null = null;
export function registerBellRefresh(fn: () => void) { _refreshBell = fn; }
export function triggerBellRefresh() { _refreshBell?.(); }

export default function GlobalNotificationToast() {
  const { user } = useAuth();
  const [queue, setQueue] = useState<Toast[]>([]);
  const current = queue[0] ?? null;

  useEffect(() => {
    if (!user) return;

    let echo: ReturnType<typeof getEcho>;
    try { echo = getEcho(); } catch { return; }

    const channel = echo.private(`user.${user.id}`);

    channel.listen(".notification.created", (data: Partial<Notification> & { created_at?: string }) => {
      setQueue(prev => [
        ...prev,
        { id: data.id ?? String(Date.now()), title: data.title ?? "New notification", body: data.body ?? "" },
      ]);
      // Refresh the bell badge
      triggerBellRefresh();
    });

    return () => {
      try { echo.leave(`private-user.${user.id}`); } catch {}
    };
  }, [user?.id]);

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
        icon={<NotificationsIcon sx={{ fontSize: 18 }} />}
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
