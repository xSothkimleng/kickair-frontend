"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { css, cx } from "styled-system/css";
import { ArrowUpRight, Scale, ShieldCheck, Store, Wallet } from "lucide-react";
import { useAdminStats, useNotifications, useUsers } from "./queries";
import { adminNotificationRoute } from "./notify";
import { Avatar, ErrorState, Eyebrow, Loading, Panel, PanelHead, Pill, grid, page, PageHeader, row, stack, text } from "./ui";
import { ago, longDate, money, num, oldest, plural, waiting } from "./format";
import { kycLabel, kycState, roleLabels } from "./labels";

const queueCard = css({
  display: "flex", flexDirection: "column", gap: "14px", p: "18px", bg: "var(--td-surface)", borderWidth: "1px", borderStyle: "solid", borderColor: "var(--td-line)", borderRadius: "14px",
  transition: "border-color .15s, box-shadow .15s, transform .15s", position: "relative",
  _hover: { borderColor: "var(--td-line-2)", boxShadow: "var(--td-shadow-sm)", transform: "translateY(-1px)" },
  "& .arrow": { position: "absolute", top: "16px", right: "16px", color: "var(--td-ink-3)", opacity: 0, transition: "opacity .15s" },
  "&:hover .arrow": { opacity: 1 },
});
const iconBox = css({ w: "34px", h: "34px", borderRadius: "10px", display: "grid", placeItems: "center", bg: "var(--td-hover)", color: "var(--td-ink-2)", "&[data-hot=true]": { bg: "var(--td-amber-soft)", color: "var(--td-amber)" } });
const bigNum = css({ fontSize: "30px", fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1, fontVariantNumeric: "tabular-nums" });
const kpiStrip = css({ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", "& > div": { p: "18px 20px", borderRightWidth: "1px", borderRightStyle: "solid", borderRightColor: "var(--td-line)" }, "& > div:last-child": { borderRight: "none" } });
const kpiNum = css({ fontSize: "24px", fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1.1, fontVariantNumeric: "tabular-nums", mt: "6px" });
const listRow = css({ display: "flex", alignItems: "center", gap: "12px", px: "20px", py: "11px", borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "var(--td-line)", _hover: { bg: "var(--td-surface-2)" }, "&:last-child": { borderBottom: "none" } });

const WEEK = 7 * 86_400_000;
const subscribeNoop = () => () => {};

export default function OverviewPage() {
  const stats = useAdminStats();
  const notices = useNotifications(1);
  const newest = useUsers({ sort: "joined", dir: "desc" });

  // Client-only clock (null on the server) so the greeting never causes a hydration mismatch.
  const minute = useSyncExternalStore(subscribeNoop, () => Math.floor(Date.now() / 60_000), () => 0);
  const now = minute ? new Date(minute * 60_000) : null;
  const hour = now?.getHours() ?? 12;
  const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const s = stats.data;
  const counts = {
    kyc: s?.kyc.pending_count ?? 0,
    listings: (s?.listings.pending_services ?? 0) + (s?.listings.pending_jobs ?? 0),
    payouts: s?.withdrawals.pending_count ?? 0,
    disputes: s?.disputes.open_count ?? 0,
  };
  const total = counts.kyc + counts.listings + counts.payouts + counts.disputes;
  const oldestAll = s ? oldest([s.kyc.oldest_at, s.listings.oldest_at, s.withdrawals.oldest_at, s.disputes.oldest_at]) : null;

  const queues = [
    { href: "/admin/verifications", icon: ShieldCheck, label: "Verifications", count: counts.kyc, sub: counts.kyc && s?.kyc.oldest_at ? `Oldest waiting ${waiting(s.kyc.oldest_at)}` : "Queue is clear" },
    { href: "/admin/listings", icon: Store, label: "Listings to review", count: counts.listings, sub: counts.listings ? `${plural(s?.listings.pending_services ?? 0, "service")} · ${plural(s?.listings.pending_jobs ?? 0, "job post")}` : "Queue is clear" },
    { href: "/admin/finance", icon: Wallet, label: "Payouts to approve", count: counts.payouts, sub: counts.payouts ? `${money(s?.withdrawals.pending_amount)} requested` : "Nothing pending" },
    { href: "/admin/disputes", icon: Scale, label: "Open disputes", count: counts.disputes, sub: counts.disputes && s?.disputes.oldest_at ? `Oldest waiting ${waiting(s.disputes.oldest_at)}` : "No open disputes", hot: true },
  ];

  const recent = (notices.data?.data ?? []).slice(0, 6);
  const nowMs = now?.getTime() ?? 0;
  const joined = now ? (newest.data?.data ?? []).filter((u) => nowMs - new Date(u.created_at).getTime() < WEEK).slice(0, 6) : [];

  return (
    <div className={page}>
      <PageHeader
        eyebrow={now ? longDate(now) : " "}
        title={greet}
        description={
          stats.isLoading ? "Checking the queues…"
          : stats.isError ? "The queues couldn't be loaded."
          : total ? <>{plural(total, "item")} waiting for a decision{oldestAll ? <>. The oldest has been waiting <b className={text({ weight: 600 })}>{waiting(oldestAll)}</b>.</> : "."}</>
          : "All queues are clear. Nice."
        }
      />

      <section className={stack({ gap: 3 })}>
        <Eyebrow>Needs a decision</Eyebrow>
        {stats.isError ? <Panel><ErrorState onRetry={() => stats.refetch()} /></Panel> : (
          <div className={grid({ cols: 4 })}>
            {queues.map((c) => (
              <Link key={c.href} href={c.href} className={queueCard}>
                <ArrowUpRight size={18} className="arrow" />
                <span className={iconBox} data-hot={c.hot && c.count > 0}><c.icon size={18} /></span>
                <div>
                  <p className={bigNum}>{stats.isLoading ? "–" : c.count}</p>
                  <p className={cx(text({ weight: 600 }), css({ mt: "8px" }))}>{c.label}</p>
                  <p className={text({ size: "sm", tone: 2 })}>{stats.isLoading ? " " : c.sub}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className={cx(stack({ gap: 3 }), css({ mt: "28px" }))}>
        <Eyebrow>Platform today</Eyebrow>
        <Panel>
          {s ? (
            <div className={kpiStrip}>
              <div>
                <p className={text({ size: "sm", tone: 2 })}>Gross volume today</p>
                <p className={kpiNum}>{money(s.gmv.today)}</p>
                <p className={cx(text({ size: "sm", tone: 3 }), css({ mt: "4px" }))}>{money(s.gmv.total)} all time</p>
              </div>
              <div>
                <p className={text({ size: "sm", tone: 2 })}>Sign-ups today</p>
                <p className={kpiNum}>{s.users.new_today}</p>
                <p className={cx(text({ size: "sm", tone: 3 }), css({ mt: "4px" }))}>{s.users.new_freelancers_today} freelancers · {s.users.new_clients_today} clients · {num(s.users.total)} total</p>
              </div>
              <div>
                <p className={text({ size: "sm", tone: 2 })}>Active orders</p>
                <p className={kpiNum}>{s.orders.active}</p>
                <p className={cx(text({ size: "sm", tone: 3 }), css({ mt: "4px" }))}>In progress right now</p>
              </div>
              <div>
                <p className={text({ size: "sm", tone: 2 })}>Completed today</p>
                <p className={kpiNum}>{s.orders.completed_today}</p>
                <p className={cx(text({ size: "sm", tone: 3 }), css({ mt: "4px" }))}>{num(s.orders.total_completed)} all time</p>
              </div>
            </div>
          ) : stats.isError ? <ErrorState onRetry={() => stats.refetch()} /> : <Loading />}
        </Panel>
      </section>

      <section className={cx(grid({ cols: 2 }), css({ mt: "28px", gap: "20px" }))}>
        <Panel>
          <PanelHead title="Recent activity" actions={<Link href="/admin/inbox" className={text({ size: "sm", tone: "accent", weight: 500 })}>Open inbox</Link>} />
          {notices.isLoading ? <Loading /> : recent.length === 0 ? <p className={cx(text({ size: "sm", tone: 3 }), css({ p: "20px" }))}>Nothing has happened yet.</p> : recent.map((n) => (
            <Link key={n.id} href={adminNotificationRoute(n)} className={listRow}>
              <span className={css({ w: "6px", h: "6px", borderRadius: "999px", bg: "var(--td-accent)", flexShrink: 0, "&[data-read=true]": { bg: "var(--td-line-2)" } })} data-read={!!n.readAt} />
              <div className={css({ minW: 0, flex: 1 })}>
                <p className={text({ size: "sm", weight: 600, truncate: true })}>{n.title}</p>
                <p className={text({ size: "sm", tone: 2, truncate: true })}>{n.body}</p>
              </div>
              <span className={text({ size: "xs", tone: 3 })}>{ago(n.createdAt)}</span>
            </Link>
          ))}
        </Panel>
        <Panel>
          <PanelHead title="Joined this week" meta={newest.data ? plural(joined.length, "person", "people") : undefined} actions={<Link href="/admin/people" className={text({ size: "sm", tone: "accent", weight: 500 })}>All people</Link>} />
          {newest.isLoading ? <Loading /> : joined.length === 0 ? <p className={cx(text({ size: "sm", tone: 3 }), css({ p: "20px" }))}>No sign-ups in the last 7 days.</p> : joined.map((u) => (
            <Link key={u.id} href={`/admin/people/${u.id}`} className={listRow}>
              <Avatar name={u.name} size="sm" seed={u.id} src={u.avatar_url} />
              <div className={css({ minW: 0, flex: 1 })}>
                <p className={text({ size: "sm", weight: 600, truncate: true })}>{u.name}</p>
                <p className={text({ size: "sm", tone: 2, truncate: true })}>{roleLabels(u).join(" · ") || "No role yet"}{u.email ? ` · ${u.email}` : ""}</p>
              </div>
              <div className={row({ gap: 2 })}>
                {u.is_freelancer ? <Pill tone={kycLabel[kycState(u.kyc_status)].tone}>{kycLabel[kycState(u.kyc_status)].label}</Pill> : null}
                <span className={text({ size: "xs", tone: 3 })}>{ago(u.created_at)}</span>
              </div>
            </Link>
          ))}
        </Panel>
      </section>
    </div>
  );
}
