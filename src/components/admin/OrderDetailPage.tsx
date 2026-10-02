"use client";

import Link from "next/link";
import { css, cx } from "styled-system/css";
import { ArrowLeft, FileText } from "lucide-react";
import OrderRecord from "@/components/dashboard/OrderRecord";
import { MONEY, platformFee } from "@/lib/moneyTerms";
import type { AdminOrderDetail } from "@/lib/api";
import ConversationPanel from "./ConversationPanel";
import { DisputeStatus } from "./DisputesPage";
import { OrderStatusPill } from "./OrdersPage";
import { useOrder } from "./queries";
import { Avatar, ErrorState, Eyebrow, Loading, Panel, PanelHead, Pill, grid, kvList, page, row, stack, table, text } from "./ui";
import { dateTime, money, shortDate } from "./format";
import { orderTypeLabel, txnMeta } from "./labels";

const back = css({ display: "inline-flex", alignItems: "center", gap: "6px", textStyle: "ui", fontWeight: 500, color: "var(--td-ink-2) !important", mb: "14px", _hover: { color: "var(--td-ink) !important" } });
const fileChip = css({ display: "inline-flex", alignItems: "center", gap: "6px", h: "26px", px: "8px", borderRadius: "7px", bg: "var(--td-hover)", textStyle: "meta", fontWeight: 500, color: "var(--td-ink-2) !important", maxW: "100%", "& span": { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } });
const listLink = css({ px: "16px", py: "12px", borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "var(--td-line)", _hover: { bg: "var(--td-surface-2)" }, "&:last-child": { borderBottom: "none" } });
const moneyRow = css({ display: "flex", justifyContent: "space-between", gap: "12px", textStyle: "ui", py: "7px", "& span:last-child": { fontVariantNumeric: "tabular-nums", fontWeight: 600 } });
const amt = css({ fontVariantNumeric: "tabular-nums", fontWeight: 600 });
const nowrap = css({ whiteSpace: "nowrap" });
// The shared OrderRecord renders `embedded` here (timeline only): this panel is its card and title.
const recordWrap = css({ p: "0 20px 20px" });

/** The sentence under the amount: where this order's money is right now. */
function moneyState(o: AdminOrderDetail): string {
  switch (o.money.state) {
    case "held": return o.status === "pending" ? "Held in escrow. The freelancer has not accepted yet." : "Held in escrow until the delivery is approved or a dispute is decided.";
    case "released": return "Released to the freelancer.";
    case "refunded": return o.status === "cancelled" ? "Order cancelled. Refunded to the client in full." : "Refunded to the client in full by a dispute decision.";
    case "split": return "Split between both parties by a dispute decision.";
    default: return "This older custom order is paid per milestone. Its payments are in the wallet movements below.";
  }
}

export default function OrderDetailPage({ id }: { id: number }) {
  const order = useOrder(id);
  const o = order.data;

  if (order.isLoading) return <div className={page}><Loading tall /></div>;
  if (order.isError || !o) {
    return (
      <div className={page}>
        <Link href="/admin/orders" className={back}><ArrowLeft size={14} /> Orders</Link>
        <Panel><ErrorState title="Order not found" body="It may have been removed, or the link is wrong." onRetry={() => order.refetch()} /></Panel>
      </div>
    );
  }

  const m = o.money;
  const co = o.custom_order;
  const openDispute = o.disputes.find((d) => d.status === "open");
  // The fee as a share of what the freelancer's side was worth, as charged at the time.
  const feeBase = m.freelancer_receives + m.platform_fee;
  const feePct = feeBase > 0 ? Math.round((m.platform_fee / feeBase) * 100) : null;

  return (
    <div className={page}>
      <Link href="/admin/orders" className={back}><ArrowLeft size={14} /> Orders</Link>
      <header className={cx(stack({ gap: 1 }), css({ mb: "22px" }))}>
        <Eyebrow>{o.reference} · {orderTypeLabel[o.type]} · placed {shortDate(o.created_at)}</Eyebrow>
        <div className={row({ gap: 3 })}>
          <h1 className={text({ size: "heading", weight: 600 })}>{o.title}</h1>
          <OrderStatusPill order={o} />
        </div>
        {o.status === "delivered" && o.auto_approve_at ? <p className={text({ tone: 2 })}>Waiting for the client&apos;s review. Approved automatically on {dateTime(o.auto_approve_at)} if they do not respond.</p> : null}
        {openDispute ? <p className={text({ tone: 2 })}>Dispute #{openDispute.sequence} is open. <Link href={`/admin/disputes/${openDispute.id}`} className={text({ tone: "accent", weight: 500 })}>Review and decide</Link></p> : null}
      </header>

      <div className={cx(grid({ cols: "main" }), css({ gap: "20px", alignItems: "start" }))}>
        <div className={stack({ gap: 4 })}>
          <Panel>
            <PanelHead title="Order record" meta="everything that happened, in order" />
            <div className={recordWrap}>
              <OrderRecord
                embedded
                orderId={o.id}
                createdAt={o.created_at}
                deliveryHistory={o.delivery_history}
                revisionHistory={o.revision_history}
                preEvents={co ? [
                  ...(co.requested_at ? [{ id: -101, event_type: "request_sent", description: "The client opened a custom request.", actor_role: "client" as const, created_at: co.requested_at }] : []),
                  ...(!(co.offers?.length) && co.offered_at ? [{ id: -102, event_type: "offer_sent", description: "The freelancer sent a custom offer.", actor_role: "freelancer" as const, created_at: co.offered_at }] : []),
                ] : undefined}
                rounds={co?.offers}
                roundsViewer="admin"
              />
            </div>
          </Panel>

          <Panel>
            <PanelHead title="Wallet movements" meta="every transaction this order caused" />
            {o.transactions.length === 0 ? <div className={cx(text({ size: "meta", tone: 3 }), css({ p: "20px" }))}>No wallet movements recorded for this order.</div> : (
              <table className={table}>
                <thead><tr><th>Wallet</th><th>Movement</th><th className="num">Amount</th><th>Status</th></tr></thead>
                <tbody>
                  {o.transactions.map((t) => (
                    <tr key={t.id}>
                      <td className={nowrap}>{t.user?.id ? <Link href={`/admin/people/${t.user.id}`} className={cx(row({ gap: 2 }), css({ _hover: { textDecoration: "underline" } }))}><Avatar name={t.user.name} size="xs" seed={t.user.id} /> {t.user.name}</Link> : <span className={text({ tone: 3 })}>—</span>}</td>
                      <td><p className={text({ tone: 2 })}>{t.description}</p><p className={text({ size: "micro", tone: 3, mono: true })}>{txnMeta(t.type).label} · {dateTime(t.created_at)} · #{t.id}</p></td>
                      <td className="num"><span className={amt}>{money(t.amount)}</span></td>
                      <td><Pill tone={t.status === "completed" ? "green" : t.status === "pending" ? "amber" : "neutral"}>{t.status === "completed" ? "Completed" : t.status === "pending" ? "Pending" : "Cancelled"}</Pill></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Panel>

          {o.conversation_id ? <ConversationPanel conversationId={o.conversation_id} client={o.client} freelancer={o.freelancer} /> : null}

          {co ? (
            <Panel>
              <PanelHead title="Agreed custom offer" meta="what both sides signed up for" />
              <div className={css({ p: "20px" })}>
                <dl className={kvList}>
                  <dt>Brief</dt><dd className={css({ whiteSpace: "pre-wrap" })}>{co.description || "—"}</dd>
                  <dt>Budget</dt><dd>{co.budget != null && co.budget !== "" ? money(co.budget) : "—"}</dd>
                  <dt>Timeline</dt><dd>{co.desired_timeline_days ? `${co.desired_timeline_days} days` : "—"}</dd>
                  {co.attachments.length ? <><dt>Attachments</dt><dd><span className={row({ gap: 2, wrap: true })}>{co.attachments.map((a) => <span key={a} className={fileChip}><FileText size={12} /> <span>{a}</span></span>)}</span></dd></> : null}
                  <dt>Scope</dt><dd className={css({ whiteSpace: "pre-wrap" })}>{co.scope || "—"}</dd>
                  <dt>Price</dt><dd className={text({ mono: true })}>{money(co.total ?? o.price)}</dd>
                  <dt>Delivery</dt><dd>{co.delivery_days ? `${co.delivery_days} days` : "—"}</dd>
                  <dt>Revisions</dt><dd>{co.revisions != null ? `${co.revisions} included` : "—"}</dd>
                  {co.offer_note ? <><dt>Note</dt><dd>“{co.offer_note}”</dd></> : null}
                </dl>
              </div>
            </Panel>
          ) : null}
        </div>

        <div className={stack({ gap: 4 })}>
          <Panel>
            <PanelHead title="Money" />
            <div className={cx(stack({ gap: 3 }), css({ p: "16px" }))}>
              <div>
                <p className={text({ size: "meta", tone: 2 })}>{MONEY.clientPays}</p>
                <p className={text({ size: "heading", weight: 600, mono: true })}>{money(m.price)}</p>
              </div>
              <p className={text({ size: "meta", tone: 2 })}>{moneyState(o)}</p>
              {m.state !== "milestones" ? (
                <div className={css({ borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "var(--td-line)", pt: "6px" })}>
                  {m.held > 0 ? <div className={moneyRow}><span className={text({ tone: 2 })}>{MONEY.committedToOrders}</span><span>{money(m.held)}</span></div> : null}
                  {m.freelancer_receives > 0 ? <div className={moneyRow}><span className={text({ tone: 2 })}>{MONEY.releasedToFreelancer}</span><span>{money(m.freelancer_receives)}</span></div> : null}
                  {m.platform_fee > 0 ? <div className={moneyRow}><span className={text({ tone: 2 })}>{feePct != null ? platformFee(feePct) : "Platform fee"}</span><span>{money(m.platform_fee)}</span></div> : null}
                  {m.client_refund > 0 ? <div className={moneyRow}><span className={text({ tone: 2 })}>{MONEY.refundedToClient}</span><span>{money(m.client_refund)}</span></div> : null}
                </div>
              ) : null}
            </div>
          </Panel>

          <Panel>
            <PanelHead title="Parties" />
            {[{ p: o.client, role: "Client" }, { p: o.freelancer, role: "Freelancer" }].map(({ p, role }) => (
              <Link key={role} href={p.id ? `/admin/people/${p.id}` : "#"} className={cx(row({ gap: 3 }), listLink)}>
                <Avatar name={p.name} seed={p.id ?? 0} src={p.avatar_url} />
                <div className={css({ minW: 0, flex: 1 })}>
                  <p className={text({ weight: 600, truncate: true })}>{p.name}</p>
                  <p className={text({ size: "meta", tone: 3, truncate: true })}>{role}{p.email ? ` · ${p.email}` : ""}</p>
                </div>
              </Link>
            ))}
          </Panel>

          <Panel>
            <PanelHead title="Disputes" meta={o.disputes.length ? undefined : "none"} />
            {o.disputes.length ? [...o.disputes].reverse().map((d) => (
              <Link key={d.id} href={`/admin/disputes/${d.id}`} className={cx(row({ gap: 3, between: true }), listLink)}>
                <div>
                  <p className={text({ weight: 600, size: "meta" })}>Dispute #{d.sequence}</p>
                  <p className={text({ size: "micro", tone: 3 })}>{d.resolved_at ? `resolved ${shortDate(d.resolved_at)}` : `opened ${shortDate(d.opened_at)}`}</p>
                </div>
                <DisputeStatus status={d.status} outcome={d.outcome} />
              </Link>
            )) : <div className={cx(text({ size: "meta", tone: 3 }), css({ p: "16px" }))}>No dispute has been raised on this order.</div>}
          </Panel>

          <Panel>
            <PanelHead title="Order" />
            <div className={css({ p: "16px" })}>
              <dl className={kvList}>
                <dt>Reference</dt><dd className={text({ mono: true })}>{o.reference}</dd>
                <dt>Origin</dt><dd>{orderTypeLabel[o.type]}</dd>
                {o.package ? <><dt>Package</dt><dd>{o.package}</dd></> : null}
                <dt>Placed</dt><dd>{dateTime(o.created_at)}</dd>
                <dt>Deliveries</dt><dd>{o.delivery_history.length}</dd>
                <dt>Revisions</dt><dd>{o.revision_history.length}</dd>
                {o.delivered_at ? <><dt>Last delivery</dt><dd>{dateTime(o.delivered_at)}</dd></> : null}
                <dt>Last change</dt><dd>{dateTime(o.updated_at)}</dd>
              </dl>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
