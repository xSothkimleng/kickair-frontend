"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Badge, IconButton, Popover, Box, Typography, Skeleton, Button } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { ChevronRightOutlined } from "@mui/icons-material";
import { api } from "@/lib/api";
import { Notification } from "@/types/notification";
import { useAuth } from "@/components/context/AuthContext";
import { registerBellRefresh } from "@/components/layout/GlobalNotificationToast";
import { tokens } from "@/theme";
import { TypeTile, UnreadDot, getNotificationRoute, notifTimeAgo } from "@/components/notifications/shared";

const POPUP_W = 380;

function adminRoute(n: Notification): string | null {
  return typeof n.data?.link === "string" ? n.data.link : getNotificationRoute(n);
}

function PopupRow({ n, onClick }: { n: Notification; onClick: () => void }) {
  const dest = !!adminRoute(n);
  const unread = !n.readAt;
  return (
    <Box role="button" tabIndex={0} onClick={onClick}
      sx={{ display: "flex", gap: 1.375, p: "11px 14px 11px 12px", cursor: "pointer",
        borderLeft: `2px solid ${unread ? tokens.accent : "transparent"}`,
        bgcolor: unread ? `rgba(${tokens.accentRgb},0.05)` : "transparent",
        transition: "background .12s", "&:hover": { bgcolor: unread ? `rgba(${tokens.accentRgb},0.05)` : tokens.surface2 } }}>
      <TypeTile type={n.type} size={34} />
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.375, minWidth: 0, flex: 1 }}>
        <Box sx={{ display: "flex", gap: 0.875, alignItems: "flex-start" }}>
          <Typography sx={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: unread ? 600 : 500, letterSpacing: "-0.01em", lineHeight: 1.3, color: tokens.text, display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{n.title}</Typography>
          {unread && <Box sx={{ mt: "5px" }}><UnreadDot size={7} /></Box>}
        </Box>
        <Typography sx={{ fontSize: 12, lineHeight: 1.4, color: tokens.text2, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{n.body}</Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: "1px" }}>
          <Typography sx={{ fontSize: 11, color: tokens.text3, fontWeight: 500 }}>{notifTimeAgo(n.createdAt)}</Typography>
          {dest && (
            <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.25, ml: "auto", fontSize: 11.5, fontWeight: 600, color: tokens.text3 }}>
              View <ChevronRightOutlined sx={{ fontSize: 13 }} />
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}

function PopupRowSkeleton() {
  return (
    <Box sx={{ display: "flex", gap: 1.375, p: "11px 14px 11px 12px", borderLeft: "2px solid transparent" }}>
      <Skeleton variant="rounded" width={34} height={34} sx={{ borderRadius: "9px" }} />
      <Box sx={{ flex: 1, pt: "1px" }}>
        <Skeleton variant="text" width="62%" /><Skeleton variant="text" width="100%" /><Skeleton variant="text" width="80%" /><Skeleton variant="text" width={52} />
      </Box>
    </Box>
  );
}

export default function AdminNotificationBell() {
  const { user } = useAuth();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchUnreadCount = useCallback(async () => {
    try { setUnreadCount(await api.getUnreadCount()); } catch { /* silent */ }
  }, []);

  useEffect(() => {
    if (!user?.is_admin) return;
    fetchUnreadCount();
    const id = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(id);
  }, [user, fetchUnreadCount]);

  useEffect(() => registerBellRefresh(fetchUnreadCount), [fetchUnreadCount]);

  const handleOpen = async (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
    setLoading(true);
    try {
      const res = await api.getNotifications();
      setNotifications(res.data);
      setUnreadCount(0);
      if (res.data.some(n => !n.readAt)) api.markAllNotificationsRead().catch(() => {});
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  };
  const handleClose = () => setAnchorEl(null);

  const handleRowClick = (n: Notification) => {
    if (!n.readAt) {
      api.markNotificationRead(n.id).catch(() => {});
      setNotifications(prev => prev.map(x => (x.id === n.id ? { ...x, readAt: new Date().toISOString() } : x)));
    }
    const route = adminRoute(n);
    if (route) { router.push(route); handleClose(); }
  };

  const handleMarkAll = () => {
    api.markAllNotificationsRead().catch(() => {});
    setNotifications(prev => prev.map(n => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })));
  };

  const list = notifications.slice(0, 8);
  const popupUnread = notifications.filter(n => !n.readAt).length;
  const hasAny = notifications.length > 0;

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
        slotProps={{ paper: { sx: { width: POPUP_W, mt: 1, borderRadius: "16px", overflow: "hidden", boxShadow: "0 16px 48px rgba(0,0,0,0.16)" } } }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: "14px 14px 12px 16px" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.125 }}>
            <Typography sx={{ fontSize: 16, fontWeight: 600, letterSpacing: "-0.02em" }}>Notifications</Typography>
            {!loading && popupUnread > 0 && (
              <Box component="span" sx={{ display: "inline-flex", justifyContent: "center", alignItems: "center", minWidth: 20, height: 20, px: 0.75, borderRadius: "999px", bgcolor: tokens.accent, color: "#fff", fontSize: 11, fontWeight: 700 }}>{popupUnread}</Box>
            )}
          </Box>
          {!loading && hasAny && (
            <Box component="button" onClick={handleMarkAll} sx={{ border: 0, bgcolor: "transparent", p: "6px 8px", cursor: "pointer", font: "inherit", fontSize: 12.5, fontWeight: 600, color: tokens.accent, borderRadius: "8px", "&:hover": { bgcolor: tokens.accentFill } }}>Mark all read</Box>
          )}
        </Box>

        <Box sx={{ borderTop: `1px solid ${tokens.border}`, height: 396, overflowY: "auto" }}>
          {loading ? (
            [0, 1, 2, 3, 4].map(i => <PopupRowSkeleton key={i} />)
          ) : !hasAny ? (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", height: "100%", gap: 1.5, px: 3.5 }}>
              <Box sx={{ width: 60, height: 60, borderRadius: "50%", bgcolor: tokens.canvas, border: `1px solid ${tokens.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <NotificationsIcon sx={{ fontSize: 26, color: tokens.text3 }} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: 16, fontWeight: 600, letterSpacing: "-0.015em" }}>You&rsquo;re all caught up</Typography>
                <Typography sx={{ fontSize: 13, lineHeight: 1.5, color: tokens.text2, mt: 0.5 }}>New moderation activity will show up here.</Typography>
              </Box>
            </Box>
          ) : (
            list.map(n => <PopupRow key={n.id} n={n} onClick={() => handleRowClick(n)} />)
          )}
        </Box>

        {hasAny && (
          <Button onClick={() => { handleClose(); router.push("/admin/notifications"); }}
            sx={{ width: "100%", height: 48, borderTop: `1px solid ${tokens.border}`, borderRadius: 0, color: tokens.text, textTransform: "none", fontSize: 13.5, fontWeight: 600, gap: 0.75, "&:hover": { bgcolor: tokens.surface2 } }}>
            View all notifications <ChevronRightOutlined sx={{ fontSize: 15, color: tokens.text3 }} />
          </Button>
        )}
      </Popover>
    </>
  );
}
