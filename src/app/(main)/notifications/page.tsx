"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Button,
  Tabs,
  Tab,
  Chip,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
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
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [tab, setTab] = useState<"all" | "freelancer" | "client">("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const isFreelancer = user?.is_freelancer ?? false;
  const isClient = user?.is_client ?? false;

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

  const handleMarkRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n)));
    } catch {
      // ignore
    }
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

  const filtered = notifications.filter(n => {
    if (tab === "freelancer") return n.role === "freelancer" || n.role === null;
    if (tab === "client") return n.role === "client" || n.role === null;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.readAt).length;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#fafafa", pb: 6 }}>
      <Container maxWidth='md' sx={{ pt: 5 }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
          <Box>
            <Typography sx={{ fontSize: 24, fontWeight: 600 }}>Notifications</Typography>
            {unreadCount > 0 && (
              <Typography sx={{ fontSize: 13, color: "rgba(0,0,0,0.5)", mt: 0.5 }}>
                {unreadCount} unread
              </Typography>
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

        {/* Role tabs — only show if user has both roles */}
        {isFreelancer && isClient && (
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            sx={{ mb: 2, borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
            <Tab label='All' value='all' sx={{ textTransform: "none", fontSize: 13 }} />
            <Tab label='Freelancer' value='freelancer' sx={{ textTransform: "none", fontSize: 13 }} />
            <Tab label='Client' value='client' sx={{ textTransform: "none", fontSize: 13 }} />
          </Tabs>
        )}

        {/* List */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress size={32} />
          </Box>
        ) : filtered.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography sx={{ fontSize: 14, color: "rgba(0,0,0,0.4)" }}>No notifications yet</Typography>
          </Box>
        ) : (
          <Box sx={{ bgcolor: "white", borderRadius: 2, border: "1px solid rgba(0,0,0,0.08)", overflow: "hidden" }}>
            {filtered.map((n, idx) => (
              <Box
                key={n.id}
                onClick={() => !n.readAt && handleMarkRead(n.id)}
                sx={{
                  px: 3,
                  py: 2,
                  cursor: n.readAt ? "default" : "pointer",
                  bgcolor: n.readAt ? "white" : "rgba(25,118,210,0.03)",
                  borderBottom: idx < filtered.length - 1 ? "1px solid rgba(0,0,0,0.06)" : "none",
                  display: "flex",
                  gap: 2,
                  alignItems: "flex-start",
                  "&:hover": { bgcolor: "rgba(0,0,0,0.02)" },
                }}>
                {/* Unread dot */}
                <Box sx={{ pt: 0.75, flexShrink: 0 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor: n.readAt ? "transparent" : "#1976d2",
                    }}
                  />
                </Box>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                    <Typography sx={{ fontSize: 13, fontWeight: n.readAt ? 400 : 600, color: "rgba(0,0,0,0.85)" }}>
                      {n.title}
                    </Typography>
                    {n.role && (
                      <Chip
                        label={n.role}
                        size='small'
                        sx={{
                          fontSize: 10,
                          height: 18,
                          textTransform: "capitalize",
                          bgcolor: n.role === "freelancer" ? "rgba(0,0,0,0.06)" : "rgba(25,118,210,0.08)",
                          color: n.role === "freelancer" ? "rgba(0,0,0,0.6)" : "#1565c0",
                        }}
                      />
                    )}
                  </Box>
                  <Typography sx={{ fontSize: 12, color: "rgba(0,0,0,0.6)", mt: 0.25, lineHeight: 1.5 }}>
                    {n.body}
                  </Typography>
                  <Typography sx={{ fontSize: 11, color: "rgba(0,0,0,0.35)", mt: 0.5 }}>
                    {timeAgo(n.createdAt)}
                  </Typography>
                </Box>
              </Box>
            ))}
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
      </Container>
    </Box>
  );
}
