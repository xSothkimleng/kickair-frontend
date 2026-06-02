"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Box, Typography, CircularProgress, Button } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import StorefrontIcon from "@mui/icons-material/Storefront";
import WorkIcon from "@mui/icons-material/Work";
import GavelIcon from "@mui/icons-material/Gavel";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import { api } from "@/lib/api";
import { Notification, NotificationType } from "@/types/notification";

const ICON_FOR: Partial<Record<NotificationType, { icon: React.ReactNode; color: string }>> = {
  admin_service_pending: { icon: <StorefrontIcon sx={{ fontSize: 18 }} />, color: "#d97706" },
  admin_job_pending:     { icon: <WorkIcon sx={{ fontSize: 18 }} />,       color: "#d97706" },
  admin_dispute_opened:  { icon: <GavelIcon sx={{ fontSize: 18 }} />,      color: "#dc2626" },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function AdminNotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchNotifications = useCallback(async (pageNum: number, append: boolean) => {
    try {
      const res = await api.getNotifications(pageNum);
      setNotifications(prev => append ? [...prev, ...res.data] : res.data);
      setHasMore((res.meta?.current_page ?? 1) < (res.meta?.last_page ?? 1));
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications(1, false);
  }, [fetchNotifications]);

  const handleClick = async (n: Notification) => {
    if (!n.readAt) {
      api.markNotificationRead(n.id).catch(() => {});
      setNotifications(prev => prev.map(x => (x.id === n.id ? { ...x, readAt: new Date().toISOString() } : x)));
    }
    const link = typeof n.data?.link === "string" ? n.data.link : null;
    if (link) router.push(link);
  };

  const handleMarkAll = async () => {
    setMarkingAll(true);
    try {
      await api.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })));
    } catch {
      // ignore
    } finally {
      setMarkingAll(false);
    }
  };

  const handleLoadMore = async () => {
    const nextPage = page + 1;
    setPage(nextPage);
    setLoadingMore(true);
    fetchNotifications(nextPage, true);
  };

  const unreadCount = notifications.filter(n => !n.readAt).length;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 880, mx: "auto" }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
        <Box>
          <Typography sx={{ fontSize: 24, fontWeight: 600 }}>Notifications</Typography>
          {unreadCount > 0 && (
            <Typography sx={{ fontSize: 13, color: "rgba(0,0,0,0.5)", mt: 0.5 }}>{unreadCount} unread</Typography>
          )}
        </Box>
        {unreadCount > 0 && (
          <Button
            onClick={handleMarkAll}
            disabled={markingAll}
            startIcon={<CheckIcon sx={{ fontSize: 14 }} />}
            sx={{ fontSize: 12, textTransform: "none", color: "rgba(0,0,0,0.6)", "&:hover": { color: "black", bgcolor: "rgba(0,0,0,0.04)" } }}>
            {markingAll ? "Marking..." : "Mark all as read"}
          </Button>
        )}
      </Box>

      {/* List */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress size={32} />
        </Box>
      ) : notifications.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <NotificationsNoneIcon sx={{ fontSize: 40, color: "rgba(0,0,0,0.25)", mb: 1 }} />
          <Typography sx={{ fontSize: 14, color: "rgba(0,0,0,0.4)" }}>No notifications yet</Typography>
        </Box>
      ) : (
        <Box sx={{ bgcolor: "white", borderRadius: 2, border: "1px solid rgba(0,0,0,0.08)", overflow: "hidden" }}>
          {notifications.map((n, idx) => {
            const style = ICON_FOR[n.type];
            const link = typeof n.data?.link === "string" ? n.data.link : null;
            return (
              <Box
                key={n.id}
                onClick={() => handleClick(n)}
                sx={{
                  px: 3,
                  py: 2,
                  cursor: link || !n.readAt ? "pointer" : "default",
                  bgcolor: n.readAt ? "white" : "rgba(25,118,210,0.03)",
                  borderBottom: idx < notifications.length - 1 ? "1px solid rgba(0,0,0,0.06)" : "none",
                  display: "flex",
                  gap: 2,
                  alignItems: "flex-start",
                  "&:hover": { bgcolor: "rgba(0,0,0,0.02)" },
                }}>
                <Box sx={{ pt: 0.5, flexShrink: 0, color: style?.color ?? "rgba(0,0,0,0.4)" }}>
                  {style?.icon ?? <NotificationsNoneIcon sx={{ fontSize: 18 }} />}
                </Box>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
                    <Typography sx={{ fontSize: 13, fontWeight: n.readAt ? 400 : 600, color: "rgba(0,0,0,0.85)", lineHeight: 1.4 }}>
                      {n.title}
                    </Typography>
                    {!n.readAt && <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#1976d2", flexShrink: 0, mt: 0.6 }} />}
                  </Box>
                  <Typography sx={{ fontSize: 12, color: "rgba(0,0,0,0.6)", mt: 0.25, lineHeight: 1.5 }}>{n.body}</Typography>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 0.5 }}>
                    <Typography sx={{ fontSize: 11, color: "rgba(0,0,0,0.35)" }}>{timeAgo(n.createdAt)}</Typography>
                    {link && <Typography sx={{ fontSize: 11, color: "#1976d2", fontWeight: 500 }}>View →</Typography>}
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>
      )}

      {/* Load more */}
      {hasMore && !loading && (
        <Box sx={{ textAlign: "center", mt: 3 }}>
          <Button
            onClick={handleLoadMore}
            disabled={loadingMore}
            sx={{ textTransform: "none", fontSize: 13, color: "rgba(0,0,0,0.6)", "&:hover": { color: "black", bgcolor: "rgba(0,0,0,0.04)" } }}>
            {loadingMore ? <CircularProgress size={16} sx={{ mr: 1 }} /> : null}
            Load more
          </Button>
        </Box>
      )}
    </Box>
  );
}
