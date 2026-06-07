"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Badge, IconButton, Popover, Box, Typography, CircularProgress, Button,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import StorefrontIcon from "@mui/icons-material/Storefront";
import WorkIcon from "@mui/icons-material/Work";
import GavelIcon from "@mui/icons-material/Gavel";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import { api } from "@/lib/api";
import { Notification, NotificationType } from "@/types/notification";
import { useAuth } from "@/components/context/AuthContext";
import { registerBellRefresh } from "@/components/layout/GlobalNotificationToast";

const ICON_FOR: Partial<Record<NotificationType, { icon: React.ReactNode; color: string }>> = {
  admin_service_pending: { icon: <StorefrontIcon sx={{ fontSize: 16 }} />, color: "#d97706" },
  admin_job_pending:     { icon: <WorkIcon sx={{ fontSize: 16 }} />,       color: "#d97706" },
  admin_dispute_opened:  { icon: <GavelIcon sx={{ fontSize: 16 }} />,      color: "#dc2626" },
  admin_kyc_pending:     { icon: <VerifiedUserIcon sx={{ fontSize: 16 }} />, color: "#2563eb" },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function AdminNotificationBell() {
  const { user } = useAuth();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchUnreadCount = useCallback(async () => {
    try {
      setUnreadCount(await api.getUnreadCount());
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    if (!user?.is_admin) return;
    fetchUnreadCount();
    const id = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(id);
  }, [user, fetchUnreadCount]);

  // Let Pusher toasts trigger an immediate badge refresh (no 30s wait)
  useEffect(() => {
    registerBellRefresh(fetchUnreadCount);
  }, [fetchUnreadCount]);

  const handleOpen = async (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
    setLoading(true);
    try {
      const res = await api.getNotifications();
      setNotifications(res.data);
      setUnreadCount(0);
      if (res.data.some((n) => !n.readAt)) {
        api.markAllNotificationsRead().catch(() => {});
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => setAnchorEl(null);

  const handleClick = async (n: Notification) => {
    if (!n.readAt) {
      api.markNotificationRead(n.id).catch(() => {});
      setNotifications((prev) => prev.map((x) => x.id === n.id ? { ...x, readAt: new Date().toISOString() } : x));
    }
    const link = typeof n.data?.link === "string" ? n.data.link : null;
    if (link) {
      handleClose();
      router.push(link);
    }
  };

  return (
    <>
      <IconButton onClick={handleOpen} size="small" sx={{ color: "rgba(0,0,0,0.7)" }}>
        <Badge badgeContent={unreadCount || null} color="error" max={99}>
          <NotificationsIcon sx={{ fontSize: 22 }} />
        </Badge>
      </IconButton>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{ paper: { sx: { borderRadius: 2, boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)", mt: 1, overflow: "hidden", width: 340 } } }}
      >
        <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
          <Typography sx={{ fontSize: 14, fontWeight: 600 }}>Admin Notifications</Typography>
        </Box>

        {loading ? (
          <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
            <CircularProgress size={24} />
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ p: 4, textAlign: "center", color: "rgba(0,0,0,0.4)" }}>
            <NotificationsNoneIcon sx={{ fontSize: 32, mb: 1 }} />
            <Typography sx={{ fontSize: 13 }}>No notifications</Typography>
          </Box>
        ) : (
          <Box sx={{ maxHeight: 420, overflowY: "auto" }}>
            {notifications.map((n) => {
              const style = ICON_FOR[n.type];
              const link = typeof n.data?.link === "string" ? n.data.link : null;
              return (
                <Box
                  key={n.id}
                  onClick={() => handleClick(n)}
                  sx={{
                    px: 2, py: 1.5, display: "flex", gap: 1.25,
                    cursor: link ? "pointer" : "default",
                    bgcolor: n.readAt ? "transparent" : "rgba(25,118,210,0.04)",
                    borderBottom: "1px solid rgba(0,0,0,0.04)",
                    "&:hover": { bgcolor: "rgba(0,0,0,0.04)" },
                    transition: "background 0.12s",
                  }}
                >
                  {style && (
                    <Box sx={{ mt: 0.25, color: style.color, flexShrink: 0 }}>{style.icon}</Box>
                  )}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
                      <Typography sx={{ fontSize: 13, fontWeight: n.readAt ? 400 : 600, color: "rgba(0,0,0,0.85)", lineHeight: 1.4 }}>
                        {n.title}
                      </Typography>
                      {!n.readAt && <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#1976d2", flexShrink: 0, mt: 0.75 }} />}
                    </Box>
                    <Typography sx={{ fontSize: 12, color: "rgba(0,0,0,0.55)", mt: 0.25, lineHeight: 1.5 }}>{n.body}</Typography>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 0.5 }}>
                      <Typography sx={{ fontSize: 10, color: "rgba(0,0,0,0.35)" }}>{timeAgo(n.createdAt)}</Typography>
                      {link && <Typography sx={{ fontSize: 10, color: "#1976d2", fontWeight: 500 }}>View →</Typography>}
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}

        <Box sx={{ borderTop: "1px solid rgba(0,0,0,0.08)", p: 1, textAlign: "center" }}>
          <Button
            onClick={() => { handleClose(); router.push("/admin/notifications"); }}
            sx={{ fontSize: 12, textTransform: "none", color: "rgba(0,0,0,0.6)", "&:hover": { color: "black", bgcolor: "transparent" } }}
          >
            View all notifications
          </Button>
        </Box>
      </Popover>
    </>
  );
}
