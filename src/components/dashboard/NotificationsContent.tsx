"use client";

import { useState, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Stack,
  Paper,
  Chip,
} from "@mui/material";
import {
  NotificationsNoneOutlined,
  DoneAllOutlined,
} from "@mui/icons-material";
import { api } from "@/lib/api";
import { Notification, NotificationType } from "@/types/notification";
import { useNotifications } from "@/hooks/useNotifications";

// ─── Helpers ────────────────────────────────────────────────────────────────

const timeAgo = (iso: string) => {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

const getNotificationColor = (type: NotificationType) => {
  switch (type) {
    case "proposal_submitted": return "#2563eb";
    case "proposal_accepted": return "#16a34a";
    case "proposal_rejected": return "#dc2626";
    case "order_placed": return "#9333ea";
    case "order_completed": return "#16a34a";
    case "order_cancelled": return "#6b7280";
    case "review_received": return "#f59e0b";
    default: return "#6b7280";
  }
};

const getTypeLabel = (type: NotificationType) => {
  switch (type) {
    case "proposal_submitted": return "Proposal";
    case "proposal_accepted": return "Proposal";
    case "proposal_rejected": return "Proposal";
    case "order_placed": return "Order";
    case "order_completed": return "Order";
    case "order_cancelled": return "Order";
    case "review_received": return "Review";
    default: return "Notification";
  }
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function NotificationsContent() {
  const { notifications, loading, error, meta, loadMore, refetch } = useNotifications();
  const [markingAll, setMarkingAll] = useState(false);
  const [markingId, setMarkingId] = useState<string | null>(null);

  const unreadCount = notifications.filter(n => n.readAt === null).length;

  const handleMarkOne = useCallback(async (id: string) => {
    setMarkingId(id);
    try {
      await api.markNotificationRead(id);
      await refetch();
    } catch {
      // silently ignore
    } finally {
      setMarkingId(null);
    }
  }, [refetch]);

  const handleMarkAll = useCallback(async () => {
    setMarkingAll(true);
    try {
      await api.markAllNotificationsRead();
      await refetch();
    } catch {
      // silently ignore
    } finally {
      setMarkingAll(false);
    }
  }, [refetch]);

  return (
    <Box>
      {/* Header */}
      <Stack direction='row' justifyContent='space-between' alignItems='center' mb={3}>
        <Box>
          <Typography variant='h5' fontWeight={600}>
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Typography variant='body2' color='text.secondary'>
              {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
            </Typography>
          )}
        </Box>
        {unreadCount > 0 && (
          <Button
            variant='text'
            startIcon={markingAll ? <CircularProgress size={14} /> : <DoneAllOutlined sx={{ fontSize: 16 }} />}
            disabled={markingAll}
            onClick={handleMarkAll}
            sx={{
              textTransform: "none",
              color: "#0071e3",
              fontSize: 13,
              "&:hover": { bgcolor: "rgba(0, 113, 227, 0.05)" },
            }}>
            Mark all as read
          </Button>
        )}
      </Stack>

      {/* Content */}
      {loading && notifications.length === 0 ? (
        <Box display='flex' justifyContent='center' py={8}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box display='flex' justifyContent='center' py={8}>
          <Typography color='error'>{error}</Typography>
        </Box>
      ) : notifications.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            border: "1px solid rgba(0,0,0,0.08)",
            p: 8,
            textAlign: "center",
          }}>
          <NotificationsNoneOutlined sx={{ fontSize: 48, color: "rgba(0,0,0,0.2)", mb: 2 }} />
          <Typography variant='body1' fontWeight={500} mb={0.5}>
            No notifications yet
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            You will be notified about proposals, orders, and reviews here.
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={1.5}>
          {notifications.map((notification: Notification) => (
            <Paper
              elevation={0}
              key={notification.id}
              sx={{
                p: 2,
                borderRadius: 3,
                border: "1px solid",
                borderColor: notification.readAt === null ? "rgba(37, 99, 235, 0.2)" : "rgba(0,0,0,0.08)",
                bgcolor: notification.readAt === null ? "rgba(37, 99, 235, 0.03)" : "white",
                transition: "all 0.2s",
                "&:hover": { borderColor: "rgba(0,0,0,0.2)" },
              }}>
              <Stack direction='row' spacing={1.5} alignItems='flex-start'>
                {/* Color dot */}
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    bgcolor: getNotificationColor(notification.type),
                    mt: 0.75,
                    flexShrink: 0,
                  }}
                />

                {/* Content */}
                <Box flex={1} minWidth={0}>
                  <Stack direction='row' spacing={1} alignItems='center' mb={0.5} flexWrap='wrap'>
                    <Typography variant='body2' fontWeight={600}>
                      {notification.title}
                    </Typography>
                    <Chip
                      label={getTypeLabel(notification.type)}
                      size='small'
                      sx={{
                        height: 18,
                        fontSize: 9,
                        fontWeight: 500,
                        bgcolor: `${getNotificationColor(notification.type)}18`,
                        color: getNotificationColor(notification.type),
                      }}
                    />
                    {notification.readAt === null && (
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          bgcolor: "#2563eb",
                          flexShrink: 0,
                        }}
                      />
                    )}
                  </Stack>
                  <Typography variant='body2' color='text.secondary' mb={0.75}>
                    {notification.body}
                  </Typography>
                  <Stack direction='row' justifyContent='space-between' alignItems='center'>
                    <Typography variant='caption' color='text.disabled'>
                      {timeAgo(notification.createdAt)}
                    </Typography>
                    {notification.readAt === null && (
                      <Button
                        size='small'
                        disabled={markingId === notification.id}
                        onClick={() => handleMarkOne(notification.id)}
                        sx={{
                          fontSize: 11,
                          textTransform: "none",
                          color: "#0071e3",
                          p: 0,
                          minWidth: "auto",
                          "&:hover": { bgcolor: "transparent", textDecoration: "underline" },
                        }}>
                        {markingId === notification.id ? <CircularProgress size={10} /> : "Mark as read"}
                      </Button>
                    )}
                  </Stack>
                </Box>
              </Stack>
            </Paper>
          ))}

          {/* Load More */}
          {meta && meta.current_page < meta.last_page && (
            <Box display='flex' justifyContent='center' pt={1}>
              <Button
                variant='outlined'
                disabled={loading}
                onClick={loadMore}
                sx={{
                  textTransform: "none",
                  borderRadius: 2,
                  borderColor: "rgba(0,0,0,0.15)",
                  color: "text.secondary",
                  fontSize: 13,
                  "&:hover": { borderColor: "rgba(0,0,0,0.3)", bgcolor: "rgba(0,0,0,0.02)" },
                }}>
                {loading ? <CircularProgress size={16} /> : "Load more"}
              </Button>
            </Box>
          )}
        </Stack>
      )}
    </Box>
  );
}
