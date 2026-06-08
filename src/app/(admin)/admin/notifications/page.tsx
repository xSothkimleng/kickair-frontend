"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Box, Typography, Button, Skeleton } from "@mui/material";
import { Check as CheckIcon, ArrowForwardOutlined } from "@mui/icons-material";
import { api } from "@/lib/api";
import { Notification } from "@/types/notification";
import { tokens } from "@/theme";
import { TypeTile, UnreadDot, typeMeta, getNotificationRoute, notifTimeAgo, notifGroup } from "@/components/notifications/shared";

function adminRoute(n: Notification): string | null {
  return typeof n.data?.link === "string" ? n.data.link : getNotificationRoute(n);
}

function PageCard({ n, onOpen }: { n: Notification; onOpen: (n: Notification) => void }) {
  const unread = !n.readAt;
  const route = adminRoute(n);
  const cta = typeMeta(n.type).cta;
  const button = route && (
    <Button onClick={e => { e.stopPropagation(); onOpen(n); }} endIcon={<ArrowForwardOutlined sx={{ fontSize: 15 }} />}
      sx={{ height: { xs: 36, sm: 38 }, px: 1.75, borderRadius: "999px", bgcolor: "rgba(0,0,0,0.05)", color: "#000", textTransform: "none", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", flex: { xs: 1, sm: "none" }, "&:hover": { bgcolor: "rgba(0,0,0,0.1)" } }}>
      {cta}
    </Button>
  );
  return (
    <Box role="button" tabIndex={0} onClick={() => onOpen(n)}
      sx={{ display: "flex", gap: { xs: 1.625, sm: 2 }, p: { xs: 2, sm: "18px 20px" }, alignItems: "flex-start", cursor: "pointer",
        bgcolor: unread ? `rgba(${tokens.accentRgb},0.05)` : tokens.surface,
        border: "1px solid", borderColor: unread ? `rgba(${tokens.accentRgb},0.18)` : tokens.border,
        borderRadius: `${tokens.radius.cardSm}px`, transition: "border-color .15s, background .15s",
        "&:hover": { borderColor: tokens.borderStrong } }}>
      <TypeTile type={n.type} size={44} />
      <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 1.125, sm: 0.875 }, minWidth: 0, flex: 1 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.625 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {unread && <UnreadDot />}
            <Typography sx={{ fontSize: { xs: 14.5, sm: 15 }, fontWeight: unread ? 600 : 500, letterSpacing: "-0.01em", lineHeight: 1.3, color: tokens.text }}>{n.title}</Typography>
          </Box>
          <Typography sx={{ fontSize: { xs: 13, sm: 13.5 }, lineHeight: 1.5, color: tokens.text2, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{n.body}</Typography>
        </Box>
        <Typography sx={{ fontSize: 12, color: tokens.text3, fontWeight: 500 }}>{notifTimeAgo(n.createdAt)}</Typography>
        {button && <Box sx={{ display: { xs: "flex", sm: "none" }, mt: 0.25 }}>{button}</Box>}
      </Box>
      {button && <Box sx={{ display: { xs: "none", sm: "flex" }, alignSelf: "center", flex: "none" }}>{button}</Box>}
    </Box>
  );
}

function PageCardSkeleton() {
  return (
    <Box sx={{ display: "flex", gap: 2, p: "18px 20px", alignItems: "flex-start", bgcolor: tokens.surface, border: `1px solid ${tokens.border}`, borderRadius: `${tokens.radius.cardSm}px` }}>
      <Skeleton variant="rounded" width={44} height={44} sx={{ borderRadius: "11px" }} />
      <Box sx={{ flex: 1, pt: "2px" }}>
        <Skeleton variant="text" width="46%" height={20} /><Skeleton variant="text" width="100%" /><Skeleton variant="text" width="72%" /><Skeleton variant="text" width={64} />
      </Box>
      <Skeleton variant="rounded" width={104} height={38} sx={{ borderRadius: "999px", alignSelf: "center", display: { xs: "none", sm: "block" } }} />
    </Box>
  );
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
      setNotifications(prev => (append ? [...prev, ...res.data] : res.data));
      setHasMore((res.meta?.current_page ?? 1) < (res.meta?.last_page ?? 1));
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => { fetchNotifications(1, false); }, [fetchNotifications]);

  const openNotif = (n: Notification) => {
    if (!n.readAt) {
      api.markNotificationRead(n.id).catch(() => {});
      setNotifications(prev => prev.map(x => (x.id === n.id ? { ...x, readAt: new Date().toISOString() } : x)));
    }
    const route = adminRoute(n);
    if (route) router.push(route);
  };

  const handleMarkAll = async () => {
    setMarkingAll(true);
    try {
      await api.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })));
    } catch { /* ignore */ } finally {
      setMarkingAll(false);
    }
  };

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    setLoadingMore(true);
    fetchNotifications(next, true);
  };

  const total = notifications.length;
  const unreadCount = notifications.filter(n => !n.readAt).length;
  const groups: ["Today" | "Earlier", Notification[]][] = (["Today", "Earlier"] as const)
    .map(g => [g, notifications.filter(n => notifGroup(n.createdAt) === g)] as ["Today" | "Earlier", Notification[]])
    .filter(([, items]) => items.length > 0);

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 760, mx: "auto" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1.5, flexWrap: "wrap", mb: { xs: 2.5, md: 3 } }}>
        <Box>
          <Typography sx={{ fontSize: { xs: 24, md: 28 }, fontWeight: 600, letterSpacing: "-0.025em" }}>Notifications</Typography>
          {!loading && (
            <Typography sx={{ fontSize: 14, color: tokens.text2, mt: 0.5 }}>
              {total === 0 ? "You're all caught up." : unreadCount > 0
                ? <><Box component="span" sx={{ color: tokens.text, fontWeight: 600 }}>{unreadCount} unread</Box> · {total} total</>
                : <>All read · {total} total</>}
            </Typography>
          )}
        </Box>
        {!loading && unreadCount > 0 && (
          <Button onClick={handleMarkAll} disabled={markingAll} startIcon={<CheckIcon sx={{ fontSize: 16 }} />}
            sx={{ height: 40, px: 2, borderRadius: "999px", bgcolor: "rgba(0,0,0,0.05)", color: "#000", textTransform: "none", fontSize: 13, fontWeight: 600, "&:hover": { bgcolor: "rgba(0,0,0,0.1)" } }}>
            {markingAll ? "Marking…" : "Mark all as read"}
          </Button>
        )}
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>{[0, 1, 2, 3, 4, 5].map(i => <PageCardSkeleton key={i} />)}</Box>
      ) : total === 0 ? (
        <Box sx={{ bgcolor: tokens.surface, border: `1px solid ${tokens.border}`, borderRadius: `${tokens.radius.card}px`, p: { xs: 7, md: 9 }, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 2 }}>
          <Box sx={{ width: 76, height: 76, borderRadius: "50%", bgcolor: tokens.canvas, border: `1px solid ${tokens.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CheckIcon sx={{ fontSize: 30, color: tokens.text3 }} />
          </Box>
          <Box sx={{ maxWidth: 320 }}>
            <Typography sx={{ fontSize: 19, fontWeight: 600, letterSpacing: "-0.015em" }}>No notifications yet</Typography>
            <Typography sx={{ fontSize: 14, lineHeight: 1.5, color: tokens.text2, mt: 0.75 }}>New moderation activity — pending listings, disputes, KYC — will show up here.</Typography>
          </Box>
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 2.75, md: 3.25 } }}>
          {groups.map(([g, items]) => (
            <Box key={g} sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
              <Typography sx={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: tokens.text3, px: 0.25 }}>{g}</Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
                {items.map(n => <PageCard key={n.id} n={n} onOpen={openNotif} />)}
              </Box>
            </Box>
          ))}
          {hasMore && (
            <Box sx={{ display: "flex", justifyContent: "center", pt: 0.5 }}>
              <Button onClick={handleLoadMore} disabled={loadingMore}
                sx={{ height: 42, px: 3.5, borderRadius: "999px", bgcolor: "rgba(0,0,0,0.05)", color: "#000", textTransform: "none", fontSize: 13.5, fontWeight: 600, "&:hover": { bgcolor: "rgba(0,0,0,0.1)" } }}>
                {loadingMore ? "Loading…" : "Load more"}
              </Button>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
