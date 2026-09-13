"use client";

import { useState, useCallback } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { css } from "styled-system/css";
import { Spinner } from "@/components/ds";
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

// ─── Styles ──────────────────────────────────────────────────────────────────

const headRow = css({ display: "flex", justifyContent: "space-between", alignItems: "center", mb: "24px" });
const titleCss = css({ textStyle: "heading", fontWeight: 600, color: "ink" });
const subCss = css({ textStyle: "body", color: "ink2" });
const markAllBtn = css({
  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px",
  minW: "64px", px: "8px", py: "6px", border: "none", borderRadius: "4px", bg: "transparent",
  textStyle: "ui", fontWeight: 500, color: "#0071e3",
  cursor: "pointer",
  _hover: { bg: "rgba(0, 113, 227, 0.05)" },
  _disabled: { color: "rgba(0,0,0,0.26)", cursor: "default", pointerEvents: "none" },
  "& svg": { display: "block" },
});
const centerBlock = css({ display: "flex", justifyContent: "center", py: "64px" });
const errorText = css({ textStyle: "lead", color: "#d32f2f" });
const emptyCard = css({
  bg: "surface", borderRadius: "12px", borderWidth: "1px", borderStyle: "solid", borderColor: "hairline",
  p: "64px", textAlign: "center",
});
const emptyIcon = css({ color: "rgba(0,0,0,0.2)", mb: "16px", display: "inline-block" });
const emptyTitle = css({ textStyle: "lead", fontWeight: 500, color: "ink" });
const emptyBody = css({ textStyle: "body", color: "ink2" });
const list = css({ display: "flex", flexDirection: "column", gap: "12px" });
const row = css({
  p: "16px", borderRadius: "12px", borderWidth: "1px", borderStyle: "solid",
  borderColor: "hairline", bg: "white", transition: "all 0.2s",
  _hover: { borderColor: "rgba(0,0,0,0.2)" },
  "&[data-unread]": { borderColor: "rgba(37, 99, 235, 0.2)", bg: "rgba(37, 99, 235, 0.03)" },
});
const rowInner = css({ display: "flex", gap: "12px", alignItems: "flex-start" });
const dot = css({ w: "10px", h: "10px", borderRadius: "50%", mt: "6px", flexShrink: 0 });
const rowBody = css({ flex: 1, minW: 0 });
const rowHead = css({ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap", mb: "4px" });
const rowTitle = css({ textStyle: "body", fontWeight: 600, color: "ink" });
const typeChip = css({
  display: "inline-flex", alignItems: "center", h: "18px", px: "8px", borderRadius: "999px",
  textStyle: "micro", fontWeight: 500, whiteSpace: "nowrap",
});
const unreadDot = css({ w: "6px", h: "6px", borderRadius: "50%", bg: "#2563eb", flexShrink: 0 });
const rowText = css({ textStyle: "body", color: "ink2", mb: "6px" });
const rowFoot = css({ display: "flex", justifyContent: "space-between", alignItems: "center" });
const stamp = css({ textStyle: "meta", color: "ink3" });
const markOneBtn = css({
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  minW: "auto", p: 0, border: "none", bg: "transparent", textStyle: "micro", fontWeight: 500, color: "#0071e3", cursor: "pointer",
  _hover: { bg: "transparent", textDecoration: "underline" },
  _disabled: { color: "rgba(0,0,0,0.26)", cursor: "default", pointerEvents: "none" },
});
const loadMoreWrap = css({ display: "flex", justifyContent: "center", pt: "8px" });
const loadMoreBtn = css({
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  minW: "64px", h: "36.5px", px: "15px", borderRadius: "8px",
  borderWidth: "1px", borderStyle: "solid", borderColor: "rgba(0,0,0,0.15)",
  bg: "transparent", textStyle: "ui", fontWeight: 500, color: "ink2", cursor: "pointer",
  _hover: { borderColor: "rgba(0,0,0,0.3)", bg: "rgba(0,0,0,0.02)" },
  _disabled: { color: "rgba(0,0,0,0.26)", borderColor: "rgba(0,0,0,0.12)", cursor: "default", pointerEvents: "none" },
});

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
    <div>
      {/* Header */}
      <div className={headRow}>
        <div>
          <h5 className={titleCss}>Notifications</h5>
          {unreadCount > 0 && (
            <p className={subCss}>
              {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <button type="button" className={markAllBtn} disabled={markingAll} onClick={handleMarkAll}>
            {markingAll ? <Spinner size={14} /> : <CheckCheck size={16} />}
            Mark all as read
          </button>
        )}
      </div>

      {/* Content */}
      {loading && notifications.length === 0 ? (
        <div className={centerBlock}>
          <Spinner size={40} style={{ color: "#1976d2" }} />
        </div>
      ) : error ? (
        <div className={centerBlock}>
          <p className={errorText}>{error}</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className={emptyCard}>
          <Bell size={48} className={emptyIcon} />
          <p className={emptyTitle}>No notifications yet</p>
          <p className={emptyBody}>You will be notified about proposals, orders, and reviews here.</p>
        </div>
      ) : (
        <div className={list}>
          {notifications.map((notification: Notification) => (
            <div key={notification.id} className={row} data-unread={notification.readAt === null ? "" : undefined}>
              <div className={rowInner}>
                {/* Color dot */}
                <span className={dot} style={{ background: getNotificationColor(notification.type) }} />

                {/* Content */}
                <div className={rowBody}>
                  <div className={rowHead}>
                    <p className={rowTitle}>{notification.title}</p>
                    <span
                      className={typeChip}
                      style={{ background: `${getNotificationColor(notification.type)}18`, color: getNotificationColor(notification.type) }}>
                      {getTypeLabel(notification.type)}
                    </span>
                    {notification.readAt === null && <span className={unreadDot} />}
                  </div>
                  <p className={rowText}>{notification.body}</p>
                  <div className={rowFoot}>
                    <span className={stamp}>{timeAgo(notification.createdAt)}</span>
                    {notification.readAt === null && (
                      <button
                        type="button"
                        className={markOneBtn}
                        disabled={markingId === notification.id}
                        onClick={() => handleMarkOne(notification.id)}>
                        {markingId === notification.id ? <Spinner size={10} /> : "Mark as read"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Load More */}
          {meta && meta.current_page < meta.last_page && (
            <div className={loadMoreWrap}>
              <button type="button" className={loadMoreBtn} disabled={loading} onClick={loadMore}>
                {loading ? <Spinner size={16} /> : "Load more"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
