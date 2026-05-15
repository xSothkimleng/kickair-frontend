"use client";
import { useState, useEffect, useCallback } from "react";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { Badge, IconButton, Popover, Box, Typography, CircularProgress, Divider, Button } from "@mui/material";
import Link from "next/link";
import { api } from "@/lib/api";
import { Notification } from "@/types/notification";
import { useAuth } from "@/components/context/AuthContext";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

interface NotificationColumnProps {
  title: string;
  notifications: Notification[];
  onMarkRead: (id: string) => void;
}

function NotificationColumn({ title, notifications, onMarkRead }: NotificationColumnProps) {
  return (
    <Box sx={{ width: 280, display: "flex", flexDirection: "column" }}>
      <Typography
        sx={{
          fontSize: 11,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          color: "rgba(0,0,0,0.45)",
          px: 2,
          py: 1.25,
          borderBottom: "1px solid rgba(0,0,0,0.06)",
        }}>
        {title}
      </Typography>
      <Box sx={{ overflowY: "auto", maxHeight: 380 }}>
        {notifications.length === 0 ? (
          <Typography sx={{ fontSize: 12, color: "rgba(0,0,0,0.4)", p: 3, textAlign: "center" }}>
            No notifications
          </Typography>
        ) : (
          notifications.map(n => (
            <Box
              key={n.id}
              onClick={() => !n.readAt && onMarkRead(n.id)}
              sx={{
                px: 2,
                py: 1.5,
                cursor: n.readAt ? "default" : "pointer",
                bgcolor: n.readAt ? "transparent" : "rgba(25,118,210,0.04)",
                borderBottom: "1px solid rgba(0,0,0,0.04)",
                "&:hover": { bgcolor: "rgba(0,0,0,0.05)" },
              }}>
              <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
                <Typography
                  sx={{
                    fontSize: 12,
                    fontWeight: n.readAt ? 400 : 600,
                    color: "rgba(0,0,0,0.85)",
                    lineHeight: 1.4,
                  }}>
                  {n.title}
                </Typography>
                {!n.readAt && (
                  <Box
                    sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#1976d2", flexShrink: 0, mt: 0.5 }}
                  />
                )}
              </Box>
              <Typography sx={{ fontSize: 11, color: "rgba(0,0,0,0.55)", mt: 0.25, lineHeight: 1.5 }}>
                {n.body}
              </Typography>
              <Typography sx={{ fontSize: 10, color: "rgba(0,0,0,0.35)", mt: 0.5 }}>
                {timeAgo(n.createdAt)}
              </Typography>
            </Box>
          ))
        )}
      </Box>
    </Box>
  );
}

export function NotificationBell() {
  const { user } = useAuth();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const isFreelancer = user?.is_freelancer ?? false;
  const isClient = user?.is_client ?? false;

  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await api.getUnreadCount();
      setUnreadCount(count);
    } catch {
      // ignore network errors silently
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchUnreadCount();
    const id = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(id);
  }, [user, fetchUnreadCount]);

  const handleOpen = async (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
    setLoading(true);
    try {
      const res = await api.getNotifications();
      setNotifications(res.data);
      setUnreadCount(0);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => setAnchorEl(null);

  const handleMarkRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n)));
    } catch {
      // ignore
    }
  };

  // Null-role = legacy notifications without a role tag — show in all visible columns
  const freelancerNotifs = notifications.filter(n => n.role === "freelancer" || n.role === null).slice(0, 5);
  const clientNotifs = notifications.filter(n => n.role === "client" || n.role === null).slice(0, 5);
  const showTwo = isFreelancer && isClient;

  return (
    <>
      <IconButton onClick={handleOpen} size='small' sx={{ color: "rgba(0,0,0,0.7)" }}>
        <Badge badgeContent={unreadCount || null} color='error' max={99}>
          <NotificationsIcon sx={{ fontSize: 20 }} />
        </Badge>
      </IconButton>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            sx: {
              borderRadius: 2,
              boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
              mt: 1,
              overflow: "hidden",
            },
          },
        }}>
        <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
          <Typography sx={{ fontSize: 14, fontWeight: 600 }}>Notifications</Typography>
        </Box>

        {loading ? (
          <Box sx={{ p: 4, display: "flex", justifyContent: "center", width: showTwo ? 560 : 280 }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <Box sx={{ display: "flex" }}>
            {isFreelancer && (
              <NotificationColumn title='Freelancer' notifications={freelancerNotifs} onMarkRead={handleMarkRead} />
            )}
            {showTwo && <Divider orientation='vertical' flexItem />}
            {isClient && (
              <NotificationColumn title='Client' notifications={clientNotifs} onMarkRead={handleMarkRead} />
            )}
          </Box>
        )}

        <Box sx={{ borderTop: "1px solid rgba(0,0,0,0.08)", p: 1, textAlign: "center" }}>
          <Button
            component={Link as React.ElementType}
            href='/notifications'
            onClick={handleClose}
            sx={{ fontSize: 12, textTransform: "none", color: "rgba(0,0,0,0.6)", "&:hover": { color: "black", bgcolor: "transparent" } }}>
            View all notifications
          </Button>
        </Box>
      </Popover>
    </>
  );
}
