"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Check } from "lucide-react";
import { css } from "styled-system/css";
import { Container } from "styled-system/jsx";
import { Skeleton } from "@/components/ds";
import { api } from "@/lib/api";
import { Notification } from "@/types/notification";
import { useAuth } from "@/components/context/AuthContext";
import { TypeTile, RoleChip, UnreadDot, typeMeta, getNotificationRoute, notifTimeAgo, notifGroup } from "@/components/notifications/shared";
import { invalidateForNotification } from "@/lib/realtimeInvalidation";
import PushToggle from "@/components/notifications/PushToggle";

type RoleTab = "all" | "freelancer" | "client" | "admin";

// ── Page chrome ──
const pageCss = css({ minH: "100vh", bg: "canvas", pb: "48px" });
const headerColCss = css({ display: "flex", flexDirection: "column", gap: { base: "14px", md: "18px" } });
const headerRowCss = css({ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", flexWrap: "wrap" });
const titleCss = css({ fontSize: { base: "27px", md: "34px" }, fontWeight: 600, letterSpacing: "-0.025em", lineHeight: 1.5, color: "ink" });
const subCss = css({ fontSize: { base: "13.5px", md: "14.5px" }, color: "ink2", mt: "6px", lineHeight: 1.5 });
const subStrongCss = css({ color: "ink", fontWeight: 600 });
const actionsCss = css({ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" });
// Neutral pill buttons (Mark all / CTA / Load more) — hand-rolled like the originals.
const pillRaw = css.raw({ appearance: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer", fontFamily: "inherit", borderRadius: "999px", bg: "rgba(0,0,0,0.05)", color: "#000", fontWeight: 600, whiteSpace: "nowrap", lineHeight: 1.75, transition: "background-color .25s", _hover: { bg: "rgba(0,0,0,0.1)" }, _disabled: { opacity: 0.5, cursor: "default", pointerEvents: "none" } });
const markAllCss = css(pillRaw, { h: "40px", px: "16px", fontSize: "13px", gap: "8px", "& svg": { ml: "-4px" } });
const tabsRowCss = css({ display: "flex", gap: "8px", flexWrap: "wrap" });
const tabRaw = css.raw({ appearance: "none", display: "inline-flex", alignItems: "center", gap: "7px", h: "36px", px: "16px", borderRadius: "999px", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: "13px", fontWeight: 500 });
const tabOnCss = css(tabRaw, { bg: "#000", color: "#fff", _hover: { bg: "#000" } });
const tabOffCss = css(tabRaw, { bg: "rgba(0,0,0,0.05)", color: "ink2", _hover: { bg: "rgba(0,0,0,0.09)" } });
const tabCountRaw = css.raw({ fontFamily: "mono", fontSize: "11.5px", fontWeight: 600 });
const tabCountOnCss = css(tabCountRaw, { opacity: 0.65, color: "#fff" });
const tabCountOffCss = css(tabCountRaw, { opacity: 1, color: "ink3" });
const bodyCss = css({ mt: { base: "20px", md: "24px" } });
const listCss = css({ display: "flex", flexDirection: "column", gap: "10px" });
const emptyCss = css({ bg: "surface", borderWidth: "1px", borderStyle: "solid", borderColor: "hairline", borderRadius: "card", p: { base: "56px", md: "72px" }, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "16px" });
const emptyCircleCss = css({ w: "76px", h: "76px", borderRadius: "50%", bg: "canvas", borderWidth: "1px", borderStyle: "solid", borderColor: "hairline", display: "flex", alignItems: "center", justifyContent: "center", color: "ink3" });
const emptyTextCss = css({ maxW: "320px" });
const emptyTitleCss = css({ fontSize: "19px", fontWeight: 600, letterSpacing: "-0.015em", lineHeight: 1.5 });
const emptyBodyCss = css({ fontSize: "14px", lineHeight: 1.5, color: "ink2", mt: "6px" });
const groupsCss = css({ display: "flex", flexDirection: "column", gap: { base: "22px", md: "26px" } });
const groupCss = css({ display: "flex", flexDirection: "column", gap: "10px" });
const groupLabelCss = css({ fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "ink3", px: "2px", lineHeight: 1.5 });
const loadMoreWrapCss = css({ display: "flex", justifyContent: "center", pt: "4px" });
const loadMoreCss = css(pillRaw, { h: "42px", px: "28px", fontSize: "13.5px" });

// ── Cards ──
const cardRaw = css.raw({ display: "flex", gap: { base: "13px", sm: "16px" }, p: { base: "16px", sm: "18px 20px" }, alignItems: "flex-start", cursor: "pointer", borderWidth: "1px", borderStyle: "solid", borderRadius: "cardSm", transition: "border-color .15s, background .15s", _hover: { borderColor: "hairlineStrong" } });
const cardUnreadCss = css(cardRaw, { bg: "rgba(0,113,227,0.05)", borderColor: "rgba(0,113,227,0.18)" });
const cardReadCss = css(cardRaw, { bg: "surface", borderColor: "hairline" });
const cardColCss = css({ display: "flex", flexDirection: "column", gap: { base: "9px", sm: "7px" }, minW: 0, flex: 1 });
const cardTextCss = css({ display: "flex", flexDirection: "column", gap: "5px" });
const cardTitleRowCss = css({ display: "flex", alignItems: "center", gap: "8px" });
const cardTitleRaw = css.raw({ fontSize: { base: "14.5px", sm: "15px" }, letterSpacing: "-0.01em", lineHeight: 1.3, color: "ink" });
const cardTitleUnreadCss = css(cardTitleRaw, { fontWeight: 600 });
const cardTitleReadCss = css(cardTitleRaw, { fontWeight: 500 });
const cardBodyCss = css({ fontSize: { base: "13px", sm: "13.5px" }, lineHeight: 1.5, color: "ink2", lineClamp: 2 });
const cardMetaCss = css({ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" });
const cardTimeCss = css({ fontSize: "12px", color: "ink3", fontWeight: 500, whiteSpace: "nowrap" });
const ctaCss = css(pillRaw, { h: { base: "36px", sm: "38px" }, px: "14px", fontSize: "13px", flex: { base: "1", sm: "none" }, gap: "8px", "& svg": { mr: "-4px" } });
const ctaMobileWrapCss = css({ display: { base: "flex", sm: "none" }, mt: "2px" });
const ctaDesktopWrapCss = css({ display: { base: "none", sm: "flex" }, alignSelf: "center", flex: "none" });
const skCardCss = css({ display: "flex", gap: "16px", p: "18px 20px", alignItems: "flex-start", bg: "surface", borderWidth: "1px", borderStyle: "solid", borderColor: "hairline", borderRadius: "cardSm" });
const skColCss = css({ flex: 1, pt: "2px" });
const skBtnWrapCss = css({ alignSelf: "center", display: { base: "none", sm: "block" } });

function PageCard({ n, showRole, onOpen }: { n: Notification; showRole: boolean; onOpen: (n: Notification) => void }) {
  const unread = !n.readAt;
  const route = getNotificationRoute(n);
  const cta = typeMeta(n.type).cta;

  const button = route && (
    <button type="button" onClick={e => { e.stopPropagation(); onOpen(n); }} className={ctaCss}>
      {cta}
      <ArrowRight size={20} />
    </button>
  );

  return (
    <div role="button" tabIndex={0} onClick={() => onOpen(n)} className={unread ? cardUnreadCss : cardReadCss}>
      <TypeTile type={n.type} size={44} />
      <div className={cardColCss}>
        <div className={cardTextCss}>
          <div className={cardTitleRowCss}>
            {unread && <UnreadDot />}
            <div className={unread ? cardTitleUnreadCss : cardTitleReadCss}>{n.title}</div>
          </div>
          <div className={cardBodyCss}>{n.body}</div>
        </div>
        <div className={cardMetaCss}>
          <span className={cardTimeCss}>{notifTimeAgo(n.createdAt)}</span>
          {showRole && <RoleChip role={n.role} />}
        </div>
        {/* mobile: button below */}
        {button && <div className={ctaMobileWrapCss}>{button}</div>}
      </div>
      {button && <div className={ctaDesktopWrapCss}>{button}</div>}
    </div>
  );
}

function PageCardSkeleton() {
  return (
    <div className={skCardCss}>
      <Skeleton variant="rect" width={44} height={44} />
      <div className={skColCss}>
        <Skeleton variant="text" width="46%" height={20} /><Skeleton variant="text" width="100%" /><Skeleton variant="text" width="72%" /><Skeleton variant="text" width={64} />
      </div>
      <div className={skBtnWrapCss}><Skeleton variant="circle" width={104} height={38} /></div>
    </div>
  );
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [tab, setTab] = useState<RoleTab>("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const isFreelancer = user?.is_freelancer ?? false;
  const isClient = user?.is_client ?? false;
  const isAdmin = user?.is_admin ?? false;
  const showRole = (isFreelancer && isClient) || isAdmin;

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

  const markRead = (id: string) => {
    api.markNotificationRead(id).catch(() => {});
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n)));
  };

  const openNotif = (n: Notification) => {
    if (!n.readAt) markRead(n.id);
    // Refresh the destination's cached queries so the page shows fresh data.
    invalidateForNotification(queryClient, n.type);
    const route = getNotificationRoute(n);
    if (route) router.push(route);
  };

  const handleMarkAll = async () => {
    setMarkingAll(true);
    try {
      await api.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })));
    } catch {
      /* ignore */
    } finally {
      setMarkingAll(false);
    }
  };

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    setLoadingMore(true);
    fetchNotifications(next, true);
  };

  const matchesTab = (n: Notification) => {
    if (tab === "all") return true;
    if (tab === "admin") return n.role === "admin";
    return n.role === tab || n.role === null;
  };
  const filtered = notifications.filter(matchesTab);
  const unreadCount = notifications.filter(n => !n.readAt).length;
  const total = notifications.length;

  const tabs: [RoleTab, string][] = [
    ["all", "All"],
    ...(isFreelancer ? [["freelancer", "Freelancer"] as [RoleTab, string]] : []),
    ...(isClient ? [["client", "Client"] as [RoleTab, string]] : []),
    ...(isAdmin ? [["admin", "Admin"] as [RoleTab, string]] : []),
  ];
  const tabCount = (t: RoleTab) => notifications.filter(n => (t === "all" ? true : t === "admin" ? n.role === "admin" : n.role === t || n.role === null)).length;

  // group filtered into Today / Earlier (preserving order)
  const groups: ["Today" | "Earlier", Notification[]][] = (["Today", "Earlier"] as const)
    .map(g => [g, filtered.filter(n => notifGroup(n.createdAt) === g)] as ["Today" | "Earlier", Notification[]])
    .filter(([, items]) => items.length > 0);

  return (
    <div className={pageCss}>
      <Container maxW="720px" px={{ base: "16px", sm: "24px" }} pt={{ base: "28px", md: "40px" }}>
        {/* Header */}
        <div className={headerColCss}>
          <div className={headerRowCss}>
            <div>
              <div className={titleCss}>Notifications</div>
              {!loading && (
                <div className={subCss}>
                  {total === 0 ? "You're all caught up." : unreadCount > 0
                    ? <><span className={subStrongCss}>{unreadCount} unread</span> · {total} total</>
                    : <>All read · {total} total</>}
                </div>
              )}
            </div>
            <div className={actionsCss}>
              <PushToggle />
              {!loading && unreadCount > 0 && (
                <button type="button" onClick={handleMarkAll} disabled={markingAll} className={markAllCss}>
                  <Check size={20} />
                  {markingAll ? "Marking…" : "Mark all as read"}
                </button>
              )}
            </div>
          </div>

          {showRole && !loading && total > 0 && (
            <div className={tabsRowCss}>
              {tabs.map(([id, label]) => {
                const on = tab === id;
                const c = tabCount(id);
                return (
                  <button key={id} type="button" onClick={() => setTab(id)} className={on ? tabOnCss : tabOffCss}>
                    {label}{c > 0 && <span className={on ? tabCountOnCss : tabCountOffCss}>{c}</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Body */}
        <div className={bodyCss}>
          {loading ? (
            <div className={listCss}>{[0, 1, 2, 3, 4, 5].map(i => <PageCardSkeleton key={i} />)}</div>
          ) : filtered.length === 0 ? (
            <div className={emptyCss}>
              <div className={emptyCircleCss}>
                <Check size={30} />
              </div>
              <div className={emptyTextCss}>
                <div className={emptyTitleCss}>No notifications yet</div>
                <div className={emptyBodyCss}>When there&rsquo;s activity on your orders, proposals, listings and disputes, you&rsquo;ll see it here.</div>
              </div>
            </div>
          ) : (
            <div className={groupsCss}>
              {groups.map(([g, items]) => (
                <div key={g} className={groupCss}>
                  <div className={groupLabelCss}>{g}</div>
                  <div className={listCss}>
                    {items.map(n => <PageCard key={n.id} n={n} showRole={showRole} onOpen={openNotif} />)}
                  </div>
                </div>
              ))}
              {hasMore && (
                <div className={loadMoreWrapCss}>
                  <button type="button" onClick={handleLoadMore} disabled={loadingMore} className={loadMoreCss}>
                    {loadingMore ? "Loading…" : "Load more"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
