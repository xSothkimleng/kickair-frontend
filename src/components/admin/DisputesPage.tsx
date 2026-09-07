"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { css, cx } from "styled-system/css";
import { Scale } from "lucide-react";
import type { AdminDispute, DisputeOutcome } from "@/types/order";
import { useAdminStats, useDisputes } from "./queries";
import { Avatar, EmptyState, ErrorState, Loading, Pager, Panel, Pill, Segmented, page, PageHeader, row, table, text } from "./ui";
import { ago, money, waiting } from "./format";
import { outcomeLabel } from "./labels";

export function DisputeStatus({ status, outcome }: { status: "open" | "resolved"; outcome: DisputeOutcome | null }) {
  if (status === "open" || !outcome) return <Pill tone="amber" dot>Open</Pill>;
  const o = outcomeLabel[outcome];
  return <Pill tone={o.tone}>{o.label}</Pill>;
}

const parties = css({ display: "inline-flex", alignItems: "center", "& > *:not(:first-child)": { ml: "-6px", boxShadow: "0 0 0 2px var(--td-surface)", borderRadius: "999px" } });

export default function DisputesPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<"open" | "resolved">("open");
  const [pageNo, setPageNo] = useState(1);
  const stats = useAdminStats();
  const disputes = useDisputes(filter, pageNo);

  const list: AdminDispute[] = disputes.data?.data ?? [];
  const rows = [...list].sort((a, b) => (filter === "open" ? +new Date(a.opened_at) - +new Date(b.opened_at) : +new Date(b.resolved_at ?? b.opened_at) - +new Date(a.resolved_at ?? a.opened_at)));
  const openCount = stats.data?.disputes.open_count;
  const first = (name: string) => name.split(" ")[0];

  return (
    <div className={page}>
      <PageHeader title="Disputes" description="Either side can raise a dispute on an active order. Only one can be open per order at a time, and disputes are numbered so the history stays readable." />
      <div className={cx(row({ between: true }), css({ mb: "14px" }))}>
        <Segmented value={filter} onChange={(f) => { setFilter(f); setPageNo(1); }} items={[{ value: "open", label: "Open", count: openCount }, { value: "resolved", label: "Resolved" }]} />
        {filter === "resolved" ? <span className={text({ size: "sm", tone: 3 })}>Includes disputes continued with feedback</span> : null}
      </div>
      <Panel>
        {disputes.isLoading ? <Loading /> : disputes.isError ? <ErrorState onRetry={() => disputes.refetch()} /> : rows.length === 0 ? (
          <EmptyState icon={<Scale size={20} />} title={filter === "open" ? "No open disputes" : "No resolved disputes yet"} body="When a client or freelancer raises a dispute on an order, it shows up here with the full order record." />
        ) : (
          <table className={table}>
            <thead>
              <tr><th>Dispute</th><th>Raised by</th><th>Parties</th><th className="num">Amount</th><th>{filter === "open" ? "Waiting" : "Resolved"}</th><th>Status</th></tr>
            </thead>
            <tbody>
              {rows.map((d) => (
                <tr key={d.id} data-clickable onClick={() => router.push(`/admin/disputes/${d.id}`)}>
                  <td>
                    <p className={text({ weight: 600 })}>Dispute #{d.sequence} <span className={text({ tone: 3, weight: 400 })}>on order #{d.order.id}</span></p>
                    <p className={cx(text({ size: "sm", tone: 2, truncate: true }), css({ maxW: "420px" }))}>{d.order.title}</p>
                  </td>
                  <td><Pill tone={d.opened_by === "client" ? "blue" : "purple"} outline>{d.opened_by === "client" ? "Client" : "Freelancer"}</Pill></td>
                  <td>
                    <div className={row({ gap: 2 })}>
                      <span className={parties}><Avatar name={d.client.name} size="xs" seed={d.client.id} src={d.client.avatar_url} /><Avatar name={d.freelancer.name} size="xs" seed={d.freelancer.id} src={d.freelancer.avatar_url} /></span>
                      <span className={text({ size: "sm", tone: 2 })}>{first(d.client.name)} · {first(d.freelancer.name)}</span>
                    </div>
                  </td>
                  <td className="num"><span className={text({ weight: 600, mono: true })}>{money(d.order.price)}</span></td>
                  <td>{filter === "open" ? <><p className={text({ weight: 500 })}>{waiting(d.opened_at)}</p><p className={text({ size: "sm", tone: 3 })}>opened {ago(d.opened_at)}</p></> : <p className={text({ tone: 2 })}>{d.resolved_at ? ago(d.resolved_at) : "—"}</p>}</td>
                  <td><DisputeStatus status={d.status} outcome={d.outcome} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <Pager meta={disputes.data?.meta} onPage={setPageNo} noun="disputes" />
      </Panel>
    </div>
  );
}
