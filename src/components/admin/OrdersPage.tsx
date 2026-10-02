"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { css, cx } from "styled-system/css";
import { ClipboardList, Search } from "lucide-react";
import type { AdminOrder } from "@/lib/api";
import type { OrderStatus } from "@/types/order";
import { useOrders } from "./queries";
import { Avatar, EmptyState, ErrorState, Input, Loading, Pager, Panel, Pill, Select, page, PageHeader, row, searchWrap, table, text } from "./ui";
import { ago, dateTime, money, shortDate } from "./format";
import { orderLabel, orderTypeLabel } from "./labels";

type StatusF = "" | "open" | OrderStatus;

const amt = css({ fontVariantNumeric: "tabular-nums", fontWeight: 600 });

/** One line on where the order's money is, for the list. */
export function moneyLine(o: AdminOrder): string {
  const m = o.money;
  switch (m.state) {
    case "held": return "Held in escrow";
    case "released": return `${money(m.freelancer_receives)} to freelancer · ${money(m.platform_fee)} fee`;
    case "refunded": return "Refunded to client";
    case "split": return `${money(m.freelancer_receives)} to freelancer · ${money(m.client_refund)} refunded`;
    default: return "Paid per milestone";
  }
}

export function OrderStatusPill({ order }: { order: Pick<AdminOrder, "status"> }) {
  const s = orderLabel[order.status] ?? { tone: "neutral" as const, label: order.status };
  return <Pill tone={s.tone} dot={order.status === "disputed" || order.status === "delivered"}>{s.label}</Pill>;
}

function PartyCell({ p }: { p: AdminOrder["client"] }) {
  const inner = (
    <span className={row({ gap: 2 })}>
      <Avatar name={p.name} size="xs" seed={p.id ?? 0} src={p.avatar_url} />
      <span className={text({ truncate: true })}>{p.name}</span>
    </span>
  );
  // The row itself opens the order; a name opens that person instead.
  return p.id ? <Link href={`/admin/people/${p.id}`} onClick={(e) => e.stopPropagation()} className={css({ display: "inline-block", maxW: "180px", _hover: { textDecoration: "underline" } })}>{inner}</Link> : inner;
}

/**
 * The orders table, shared by the Orders screen and a person's page. With `viewerId`
 * (that person) it folds into four columns that fit beside the page's side panel:
 * the two party columns become "the other side", and the date moves under the title.
 */
export function OrdersTable({ rows, viewerId }: { rows: AdminOrder[]; viewerId?: number }) {
  const router = useRouter();
  const compact = viewerId != null;
  return (
    <table className={table}>
      <thead>
        {compact
          ? <tr><th>Order</th><th>With</th><th className="num">Amount</th><th>Status</th></tr>
          : <tr><th>Order</th><th>Client</th><th>Freelancer</th><th className="num">Amount</th><th>Status</th><th>Placed</th></tr>}
      </thead>
      <tbody>
        {rows.map((o) => {
          const buying = o.client.id === viewerId;
          const autoApprove = o.status === "delivered" && o.auto_approve_at ? <p className={text({ size: "micro", tone: 3 })}>Auto-approves {dateTime(o.auto_approve_at)}</p> : null;
          return (
            <tr key={o.id} data-clickable onClick={() => router.push(`/admin/orders/${o.id}`)}>
              <td>
                <p className={cx(text({ weight: 600, truncate: true }), css({ maxW: compact ? "230px" : "300px" }))}>{o.title}</p>
                <p className={text({ size: "micro", tone: 3, mono: true })}>{o.reference} · {compact ? shortDate(o.created_at) : orderTypeLabel[o.type]}</p>
              </td>
              {compact ? (
                <td><p className={text({ size: "micro", tone: 3 })}>{buying ? "Buying from" : "Selling to"}</p><PartyCell p={buying ? o.freelancer : o.client} /></td>
              ) : (
                <><td><PartyCell p={o.client} /></td><td><PartyCell p={o.freelancer} /></td></>
              )}
              <td className="num"><span className={amt}>{money(o.price)}</span>{compact ? null : <p className={text({ size: "micro", tone: 3 })}>{moneyLine(o)}</p>}</td>
              <td>
                <OrderStatusPill order={o} />
                {compact ? <p className={cx(text({ size: "micro", tone: 3 }), css({ maxW: "170px" }))}>{moneyLine(o)}</p> : null}
                {autoApprove}
              </td>
              {compact ? null : <td><p className={text({ tone: 2 })}>{shortDate(o.created_at)}</p><p className={text({ size: "micro", tone: 3 })}>{ago(o.created_at)}</p></td>}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default function OrdersPage() {
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusF>("");
  const [pageNo, setPageNo] = useState(1);

  // Debounce typing so every keystroke doesn't hit the API.
  useEffect(() => { const t = setTimeout(() => { setSearch(q.trim()); setPageNo(1); }, 300); return () => clearTimeout(t); }, [q]);

  const orders = useOrders({ page: pageNo, status: status || undefined, search: search || undefined });
  const rows = orders.data?.data ?? [];

  return (
    <div className={page}>
      <PageHeader title="Orders" description="Every order on the platform and where its money is. This screen is for looking things up: money only moves through approval, cancellation or a dispute decision." />
      <div className={cx(row({ gap: 2, wrap: true }), css({ mb: "14px" }))}>
        <div className={cx(searchWrap, css({ w: "340px" }))}>
          <Search size={15} />
          <Input placeholder="Order number, or a client or freelancer's name or email" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Select value={status} onChange={(e) => { setStatus(e.target.value as StatusF); setPageNo(1); }} className={css({ w: "200px" })}>
          <option value="">Any status</option>
          <option value="open">All in progress</option>
          {(Object.keys(orderLabel) as OrderStatus[]).map((s) => <option key={s} value={s}>{orderLabel[s].label}</option>)}
        </Select>
        <div className={css({ ml: "auto" })} />
        {orders.data ? <span className={text({ size: "meta", tone: 3 })}>{orders.data.meta.total.toLocaleString("en-US")} {orders.data.meta.total === 1 ? "order" : "orders"}</span> : null}
      </div>

      <Panel>
        {orders.isLoading ? <Loading /> : orders.isError ? <ErrorState onRetry={() => orders.refetch()} /> : rows.length === 0 ? <EmptyState icon={<ClipboardList size={20} />} title="No orders match" body="Try a different number or name, or clear the status filter." /> : <OrdersTable rows={rows} />}
        <Pager meta={orders.data?.meta} onPage={setPageNo} noun="orders" />
      </Panel>
    </div>
  );
}
