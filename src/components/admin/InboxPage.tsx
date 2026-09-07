"use client";

import { useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { css, cx } from "styled-system/css";
import { Bell, Scale, ShieldCheck, Store, Wallet, ShoppingBag } from "lucide-react";
import { api } from "@/lib/api";
import { qk } from "@/lib/queryKeys";
import type { Notification, NotificationType } from "@/types/notification";
import { useNotifications, useUnreadCount } from "./queries";
import { adminNotificationRoute } from "./notify";
import { Btn, EmptyState, ErrorState, Loading, Pager, Panel, Segmented, page, PageHeader, row, text } from "./ui";
import { ago } from "./format";

const ICONS: Partial<Record<NotificationType, typeof Bell>> = {
  admin_kyc_pending: ShieldCheck, admin_dispute_opened: Scale, admin_service_pending: Store, admin_job_pending: Store,
  withdrawal_approved: Wallet, withdrawal_rejected: Wallet, order_placed: ShoppingBag, order_completed: ShoppingBag,
};
const rowCss = css({
  display: "flex", alignItems: "flex-start", gap: "14px", px: "20px", py: "14px", borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "var(--td-line)", _hover: { bg: "var(--td-surface-2)" }, "&:last-child": { borderBottom: "none" },
  "&[data-unread=true]": { bg: "var(--td-accent-soft)" }, "&[data-unread=true]:hover": { bg: "#E3E8FB" },
});
const ic = css({ w: "32px", h: "32px", borderRadius: "10px", display: "grid", placeItems: "center", bg: "var(--td-surface)", border: "1px solid var(--td-line)", color: "var(--td-ink-2)", flexShrink: 0 });
const dayHead = css({ px: "20px", py: "8px", fontSize: "11.5px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--td-ink-3)", bg: "var(--td-surface-2)", borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "var(--td-line)" });

function dayLabel(iso: string) {
  const days = Math.floor((new Date().setHours(0, 0, 0, 0) - new Date(iso).setHours(0, 0, 0, 0)) / 86_400_000);
  return days <= 0 ? "Today" : days === 1 ? "Yesterday" : "Earlier";
}

export default function InboxPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [pageNo, setPageNo] = useState(1);
  const notices = useNotifications(pageNo);
  const { data: unread = 0 } = useUnreadCount();

  const all = notices.data?.data ?? [];
  const list = filter === "all" ? all : all.filter((n) => !n.readAt);
  const groups = list.reduce<Record<string, Notification[]>>((acc, n) => { (acc[dayLabel(n.createdAt)] ??= []).push(n); return acc; }, {});
  const refresh = () => {
    qc.invalidateQueries({ queryKey: qk.notifications.list() });
    qc.invalidateQueries({ queryKey: qk.notifications.unreadCount() });
  };
  const markRead = (n: Notification) => { if (!n.readAt) api.markNotificationRead(n.id).then(refresh).catch(() => {}); };
  const markAll = () => api.markAllNotificationsRead().then(refresh).catch(() => {});

  return (
    <div className={page}>
      <PageHeader title="Inbox" description="Everything the platform wants you to know about: new submissions, disputes, payouts and sign-ups." actions={<Btn disabled={!unread} onClick={markAll}>Mark all as read</Btn>} />
      <div className={cx(row({ between: true }), css({ mb: "14px" }))}>
        <Segmented value={filter} onChange={setFilter} items={[{ value: "all", label: "All" }, { value: "unread", label: "Unread", count: unread }]} />
      </div>
      <Panel>
        {notices.isLoading ? <Loading /> : notices.isError ? <ErrorState onRetry={() => notices.refetch()} /> : list.length === 0 ? <EmptyState icon={<Bell size={20} />} title={filter === "unread" ? "You're all caught up" : "Nothing yet"} body={filter === "unread" ? "Unread notifications land here." : "New submissions, disputes and payouts will show up here."} /> : null}
        {(["Today", "Yesterday", "Earlier"] as const).filter((g) => groups[g]?.length).map((g) => (
          <div key={g}>
            <div className={dayHead}>{g}</div>
            {groups[g]!.map((n) => {
              const Icon = ICONS[n.type] ?? Bell;
              return (
                <Link key={n.id} href={adminNotificationRoute(n)} className={rowCss} data-unread={!n.readAt} onClick={() => markRead(n)}>
                  <span className={ic}><Icon size={15} /></span>
                  <div className={css({ minW: 0, flex: 1 })}>
                    <p className={text({ weight: n.readAt ? 500 : 600 })}>{n.title}</p>
                    <p className={text({ size: "sm", tone: 2 })}>{n.body}</p>
                  </div>
                  <span className={cx(text({ size: "xs", tone: 3 }), css({ whiteSpace: "nowrap", pt: "2px" }))}>{ago(n.createdAt)}</span>
                </Link>
              );
            })}
          </div>
        ))}
        <Pager meta={notices.data?.meta ?? undefined} onPage={setPageNo} noun="notifications" />
      </Panel>
    </div>
  );
}
