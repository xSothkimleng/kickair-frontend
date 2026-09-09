"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Bell, ChevronRight } from "lucide-react";
import { css } from "styled-system/css";
import { registerBellRefresh } from "@/components/layout/GlobalNotificationToast";
import { Indicator, PopoverPrimitive, Portal, Skeleton } from "@/components/ds";
import { api } from "@/lib/api";
import { Notification } from "@/types/notification";
import { useAuth } from "@/components/context/AuthContext";
import { TypeTile, RoleChip, UnreadDot, getNotificationRoute, notifTimeAgo } from "@/components/notifications/shared";
import { invalidateForNotification } from "@/lib/realtimeInvalidation";
import { bellBtnCss } from "./styles";

const POPUP_W = 380;

type RoleFilterValue = "all" | "freelancer" | "client";

// ── Popover shell ──
const positionerCss = css({ zIndex: 1400 });
const popCss = css({ w: `${POPUP_W}px`, bg: "white", color: "rgba(0,0,0,0.87)", borderRadius: "16px", overflow: "hidden", boxShadow: "0 16px 48px rgba(0,0,0,0.16)", outline: "none", animation: "pop .16s ease-out" });
const headerCss = css({ display: "flex", justifyContent: "space-between", alignItems: "center", p: "14px 14px 12px 16px" });
const titleRowCss = css({ display: "flex", alignItems: "center", gap: "9px" });
const titleCss = css({ fontSize: "16px", fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1.5 });
const bubbleCss = css({ display: "inline-flex", justifyContent: "center", alignItems: "center", minW: "20px", h: "20px", px: "6px", borderRadius: "999px", bg: "accent", color: "#fff", fontSize: "11px", fontWeight: 700 });
const markAllCss = css({ appearance: "none", border: 0, bg: "transparent", p: "6px 8px", cursor: "pointer", fontFamily: "inherit", fontSize: "12.5px", fontWeight: 600, color: "accent", borderRadius: "8px", whiteSpace: "nowrap", _hover: { bg: "accentFill" } });
const bodyCss = css({ borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "hairline", h: "396px", overflowY: "auto", overflowX: "hidden" });
const emptyCss = css({ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", h: "100%", gap: "12px", px: "28px" });
const emptyCircleCss = css({ w: "60px", h: "60px", borderRadius: "50%", bg: "canvas", borderWidth: "1px", borderStyle: "solid", borderColor: "hairline", display: "flex", alignItems: "center", justifyContent: "center", color: "ink3" });
const emptyTitleCss = css({ fontSize: "16px", fontWeight: 600, letterSpacing: "-0.015em", lineHeight: 1.5 });
const emptyBodyCss = css({ fontSize: "13px", lineHeight: 1.5, color: "ink2", mt: "4px" });
const nothingCss = css({ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: "4px", py: "56px", px: "28px" });
const nothingTitleCss = css({ fontSize: "13.5px", fontWeight: 600 });
const nothingBodyCss = css({ fontSize: "12.5px", color: "ink2" });
const footerCss = css({ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", w: "100%", h: "48px", borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "hairline", fontSize: "13.5px", fontWeight: 600, _hover: { bg: "surface2" }, "& svg": { color: "var(--colors-ink3)" } });

// ── Role filter ──
const filterWrapCss = css({ display: "flex", gap: "2px", p: "3px", m: "0 14px 4px", bg: "rgba(0,0,0,0.04)", borderRadius: "999px" });
const filterBtnRaw = css.raw({ appearance: "none", flex: 1, h: "28px", px: "6px", py: 0, border: 0, borderRadius: "999px", cursor: "pointer", fontFamily: "inherit", fontSize: "12px", fontWeight: 600, whiteSpace: "nowrap" });
const filterOnCss = css(filterBtnRaw, { bg: "surface", color: "ink", boxShadow: "0 1px 2px rgba(0,0,0,0.08)" });
const filterOffCss = css(filterBtnRaw, { bg: "transparent", color: "ink2", boxShadow: "none" });

// ── Rows ──
const rowRaw = css.raw({ display: "flex", gap: "11px", p: "11px 14px 11px 12px", cursor: "pointer", position: "relative", borderLeftWidth: "2px", borderLeftStyle: "solid", transition: "background .12s" });
const rowUnreadCss = css(rowRaw, { borderLeftColor: "accent", bg: "rgba(0,113,227,0.05)", _hover: { bg: "rgba(0,113,227,0.05)" } });
const rowReadCss = css(rowRaw, { borderLeftColor: "transparent", bg: "transparent", _hover: { bg: "surface2" } });
const rowColCss = css({ display: "flex", flexDirection: "column", gap: "3px", minW: 0, flex: 1 });
const rowTitleRowCss = css({ display: "flex", gap: "7px", alignItems: "flex-start" });
const rowTitleRaw = css.raw({ flex: 1, minW: 0, fontSize: "13px", letterSpacing: "-0.01em", lineHeight: 1.3, color: "ink", lineClamp: 1 });
const rowTitleUnreadCss = css(rowTitleRaw, { fontWeight: 600 });
const rowTitleReadCss = css(rowTitleRaw, { fontWeight: 500 });
const dotWrapCss = css({ mt: "5px" });
const rowBodyCss = css({ fontSize: "12px", lineHeight: 1.4, color: "ink2", lineClamp: 2 });
const rowMetaCss = css({ display: "flex", alignItems: "center", gap: "8px", mt: "1px" });
const rowTimeCss = css({ fontSize: "11px", color: "ink3", fontWeight: 500, whiteSpace: "nowrap" });
const rowViewCss = css({ display: "inline-flex", alignItems: "center", gap: "2px", ml: "auto", fontSize: "11.5px", fontWeight: 600, color: "ink3" });
const skRowCss = css({ display: "flex", gap: "11px", p: "11px 14px 11px 12px", borderLeft: "2px solid transparent" });
const skColCss = css({ flex: 1, pt: "1px" });

function RoleFilter({ value, onChange }: { value: RoleFilterValue; onChange: (v: RoleFilterValue) => void }) {
  const opts: [RoleFilterValue, string][] = [["all", "All"], ["freelancer", "Freelancer"], ["client", "Client"]];
  return (
    <div className={filterWrapCss}>
      {opts.map(([id, label]) => (
        <button key={id} type="button" onClick={() => onChange(id)} className={value === id ? filterOnCss : filterOffCss}>
          {label}
        </button>
      ))}
    </div>
  );
}

function PopupRow({ n, showRole, onClick }: { n: Notification; showRole: boolean; onClick: () => void }) {
  const dest = !!getNotificationRoute(n);
  const unread = !n.readAt;
  return (
    <div role="button" tabIndex={0} onClick={onClick} className={unread ? rowUnreadCss : rowReadCss}>
      <TypeTile type={n.type} size={34} />
      <div className={rowColCss}>
        <div className={rowTitleRowCss}>
          <div className={unread ? rowTitleUnreadCss : rowTitleReadCss}>{n.title}</div>
          {unread && <div className={dotWrapCss}><UnreadDot size={7} /></div>}
        </div>
        <div className={rowBodyCss}>{n.body}</div>
        <div className={rowMetaCss}>
          <span className={rowTimeCss}>{notifTimeAgo(n.createdAt)}</span>
          {showRole && <RoleChip role={n.role} />}
          {dest && (
            <span className={rowViewCss}>
              View <ChevronRight size={13} />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function PopupRowSkeleton() {
  return (
    <div className={skRowCss}>
      <Skeleton variant="rect" width={34} height={34} />
      <div className={skColCss}>
        <Skeleton variant="text" width="62%" /><Skeleton variant="text" width="100%" /><Skeleton variant="text" width="80%" /><Skeleton variant="text" width={52} />
      </div>
    </div>
  );
}

export function NotificationBell() {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<RoleFilterValue>("all");

  const showDual = (user?.is_freelancer ?? false) && (user?.is_client ?? false);

  const fetchUnreadCount = useCallback(async () => {
    try {
      setUnreadCount(await api.getUnreadCount());
    } catch {
      /* silent */
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchUnreadCount();
    const id = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(id);
  }, [user, fetchUnreadCount]);

  useEffect(() => registerBellRefresh(fetchUnreadCount), [fetchUnreadCount]);

  const handleOpen = async () => {
    setOpen(true);
    setLoading(true);
    setRole("all");
    try {
      const res = await api.getNotifications();
      setNotifications(res.data);
      setUnreadCount(0);
      if (res.data.some(n => !n.readAt)) api.markAllNotificationsRead().catch(() => {});
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => setOpen(false);

  const handleRowClick = (n: Notification) => {
    if (!n.readAt) {
      api.markNotificationRead(n.id).catch(() => {});
      setNotifications(prev => prev.map(x => (x.id === n.id ? { ...x, readAt: new Date().toISOString() } : x)));
    }
    // Refresh the queries behind the destination so the page shows fresh data,
    // not whatever was cached before the notification arrived.
    invalidateForNotification(queryClient, n.type);
    const route = getNotificationRoute(n);
    if (route) { router.push(route); handleClose(); }
  };

  const handleMarkAll = () => {
    api.markAllNotificationsRead().catch(() => {});
    setNotifications(prev => prev.map(n => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })));
  };

  const filtered = (showDual && role !== "all" ? notifications.filter(n => n.role === role || n.role === null) : notifications).slice(0, 7);
  const popupUnread = notifications.filter(n => !n.readAt).length;
  const hasAny = notifications.length > 0;

  return (
    <PopoverPrimitive.Root
      open={open}
      onOpenChange={d => { if (d.open) void handleOpen(); else handleClose(); }}
      positioning={{ placement: "bottom-end", gutter: 8, strategy: "fixed" }}
      portalled
      lazyMount
      unmountOnExit>
      <Indicator count={unreadCount} max={99}>
        <PopoverPrimitive.Trigger asChild>
          <button type="button" className={bellBtnCss} aria-label="Notifications">
            <Bell size={20} />
          </button>
        </PopoverPrimitive.Trigger>
      </Indicator>

      <Portal>
        <PopoverPrimitive.Positioner className={positionerCss}>
          <PopoverPrimitive.Content className={popCss}>
            {/* Header */}
            <div className={headerCss}>
              <div className={titleRowCss}>
                <div className={titleCss}>Notifications</div>
                {!loading && popupUnread > 0 && <span className={bubbleCss}>{popupUnread}</span>}
              </div>
              {!loading && hasAny && (
                <button type="button" onClick={handleMarkAll} className={markAllCss}>Mark all read</button>
              )}
            </div>

            {/* Body — fixed height so it never jumps between loading and loaded */}
            <div className={bodyCss}>
              {loading ? (
                [0, 1, 2, 3, 4].map(i => <PopupRowSkeleton key={i} />)
              ) : !hasAny ? (
                <div className={emptyCss}>
                  <div className={emptyCircleCss}>
                    <Bell size={26} />
                  </div>
                  <div>
                    <div className={emptyTitleCss}>You&rsquo;re all caught up</div>
                    <div className={emptyBodyCss}>New activity on your orders, proposals and listings will show up here.</div>
                  </div>
                </div>
              ) : (
                <>
                  {showDual && <RoleFilter value={role} onChange={setRole} />}
                  {filtered.length > 0 ? (
                    filtered.map(n => <PopupRow key={n.id} n={n} showRole={showDual} onClick={() => handleRowClick(n)} />)
                  ) : (
                    <div className={nothingCss}>
                      <div className={nothingTitleCss}>Nothing here</div>
                      <div className={nothingBodyCss}>No notifications for this view.</div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            {hasAny && (
              <Link href="/notifications" onClick={handleClose} className={footerCss}>
                View all notifications <ChevronRight size={15} />
              </Link>
            )}
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Positioner>
      </Portal>
    </PopoverPrimitive.Root>
  );
}
