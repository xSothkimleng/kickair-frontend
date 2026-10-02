"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { css, cx } from "styled-system/css";
import { ArrowLeft, Check, FileText, Image as ImageIcon, Paperclip } from "lucide-react";
import { api } from "@/lib/api";
import { qk } from "@/lib/queryKeys";
import OrderRecord, { requestDetailsOf } from "@/components/dashboard/OrderRecord";
import type { DisputeOutcome, EvidenceFile } from "@/types/order";
import ConversationPanel from "./ConversationPanel";
import { useToast } from "./toast";
import { Avatar, Btn, ErrorState, Input, Loading, Panel, PanelHead, Textarea, grid, kvList, page, row, stack, text, Eyebrow } from "./ui";
import { ago, dateTime, errorMessage, money, shortDate } from "./format";
import { outcomeLabel } from "./labels";
import { DisputeStatus } from "./DisputesPage";

const back = css({ display: "inline-flex", alignItems: "center", gap: "6px", textStyle: "ui", fontWeight: 500, color: "var(--td-ink-2) !important", mb: "14px", _hover: { color: "var(--td-ink) !important" } });
const banner = css({ display: "flex", alignItems: "center", gap: "12px", p: "12px 16px", borderRadius: "12px", mb: "20px", bg: "var(--td-amber-soft)", color: "var(--td-amber)", "&[data-kind=info]": { bg: "var(--td-blue-soft)", color: "var(--td-blue)" } });
const fileChip = css({ display: "inline-flex", alignItems: "center", gap: "6px", h: "26px", px: "8px", borderRadius: "7px", bg: "var(--td-hover)", textStyle: "meta", fontWeight: 500, color: "var(--td-ink-2) !important", maxW: "100%", "& span": { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, _hover: { bg: "var(--td-line)" } });
const optionCard = css({
  display: "flex", gap: "10px", alignItems: "flex-start", p: "11px 12px", borderRadius: "10px", borderWidth: "1px", borderStyle: "solid", borderColor: "var(--td-line)", cursor: "pointer", transition: "all .12s",
  _hover: { borderColor: "var(--td-line-2)", bg: "var(--td-surface-2)" },
  "&[data-on=true]": { borderColor: "var(--td-ink)", bg: "var(--td-surface)", boxShadow: "0 0 0 1px var(--td-ink)" },
  "& .radio": { w: "16px", h: "16px", borderRadius: "999px", border: "1.5px solid var(--td-line-2)", flexShrink: 0, mt: "2px", display: "grid", placeItems: "center", color: "#fff" },
  "&[data-on=true] .radio": { bg: "var(--td-ink)", borderColor: "var(--td-ink)" },
});
// The shared OrderRecord renders `embedded` here (timeline only): this panel is its card and title.
const recordWrap = css({ p: "0 20px 20px" });

const OPTIONS: { value: DisputeOutcome; label: string; help: string }[] = [
  { value: "full_client", label: "Refund the client", help: "Order ends. The full amount goes back to the client's wallet." },
  { value: "full_freelancer", label: "Pay the freelancer", help: "Order ends. The freelancer receives the full amount, minus the platform fee." },
  { value: "partial", label: "Split the amount", help: "Order ends. You decide how much of the amount the freelancer receives." },
  { value: "continue", label: "Continue with feedback", help: "No money moves. The order goes back to active with your note, and either side may dispute again." },
];

function Evidence({ title, name, statement, files }: { title: string; name: string; statement: string | null; files: EvidenceFile[] | null }) {
  return (
    <div className={cx(stack({ gap: 2 }), css({ p: "14px", borderRadius: "10px", bg: "var(--td-surface-2)", border: "1px solid var(--td-line)", minW: 0 }))}>
      <div>
        <p className={text({ weight: 600, size: "meta" })}>{title}</p>
        <p className={text({ size: "micro", tone: 3 })}>{name}</p>
      </div>
      {statement ? <p className={cx(text({ size: "meta", tone: 2 }), css({ whiteSpace: "pre-wrap" }))}>{statement}</p> : <p className={text({ size: "meta", tone: 3 })}>No statement submitted.</p>}
      {files?.length ? (
        <div className={row({ gap: 2, wrap: true })}>
          {files.map((f, i) => (
            <a key={i} href={f.url} target="_blank" rel="noreferrer" className={fileChip}>{f.file_type === "image" ? <ImageIcon size={12} /> : <Paperclip size={12} />} <span>{f.file_name}</span></a>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function DisputeDetailPage({ id }: { id: number }) {
  const toast = useToast();
  const qc = useQueryClient();

  // Same key the realtime layer already invalidates for admin_dispute alerts.
  const dispute = useQuery({ queryKey: qk.disputes.adminDetail(id), queryFn: () => api.getAdminDispute(id), enabled: Number.isFinite(id) });
  const d = dispute.data;

  const [outcome, setOutcome] = useState<DisputeOutcome | null>(null);
  const [partial, setPartial] = useState("");
  const [note, setNote] = useState("");
  const [resolving, setResolving] = useState(false);

  const conversationId = d?.order.conversation_id ?? null;

  if (dispute.isLoading) return <div className={page}><Loading tall /></div>;
  if (dispute.isError || !d) {
    return (
      <div className={page}>
        <Link href="/admin/disputes" className={back}><ArrowLeft size={14} /> Disputes</Link>
        <Panel><ErrorState title="Dispute not found" body="It may have been removed, or the link is wrong." onRetry={() => dispute.refetch()} /></Panel>
      </div>
    );
  }

  const amount = Number(d.order.price);
  const partialNum = Number(partial) || 0;
  const canResolve = !!outcome && !!note.trim() && (outcome !== "partial" || (partialNum > 0 && partialNum < amount));
  const isCustom = !!d.order.custom_order;
  const co = d.order.custom_order;
  const earlier = [...(d.earlier_disputes ?? [])].sort((a, b) => b.sequence - a.sequence);

  const refresh = async () => {
    await qc.invalidateQueries({ queryKey: qk.disputes.all() });
    qc.invalidateQueries({ queryKey: qk.orders.all() });
    qc.invalidateQueries({ queryKey: qk.admin.all() });
  };
  const resolve = async () => {
    if (!outcome || !canResolve) return;
    setResolving(true);
    try {
      await api.resolveDispute(d.id, { outcome, admin_note: note.trim(), ...(outcome === "partial" ? { partial_freelancer_amount: partialNum } : {}) });
      await refresh();
      toast(outcome === "continue" ? `Dispute #${d.sequence} continued. Order #${d.order.id} is active again.` : `Dispute #${d.sequence} resolved.`);
    } catch (err) {
      toast(errorMessage(err, "Failed to resolve. Please try again."), "error");
    } finally {
      setResolving(false);
    }
  };
  return (
    <div className={page}>
      <Link href="/admin/disputes" className={back}><ArrowLeft size={14} /> Disputes</Link>
      <header className={cx(row({ between: true, top: true, gap: 4 }), css({ mb: "22px" }))}>
        <div className={stack({ gap: 1 })}>
          <Eyebrow>Order #{d.order.id} · {isCustom ? "Custom offer" : "Service order"} · {money(amount)}</Eyebrow>
          <div className={row({ gap: 3 })}>
            <h1 className={text({ size: "heading", weight: 600 })}>Dispute #{d.sequence}</h1>
            <DisputeStatus status={d.status} outcome={d.outcome} />
          </div>
          <p className={cx(text({ tone: 2 }), css({ maxW: "720px", mt: "2px" }))}>
            Raised by the <b className={text({ weight: 600 })}>{d.opened_by}</b> {ago(d.opened_at)}: “{d.reason}”
          </p>
        </div>
      </header>

      {d.newer_dispute ? (
        <div className={banner} data-kind={d.newer_dispute.status === "open" ? "warn" : "info"}>
          <div className={css({ flex: 1 })}>
            <p className={text({ weight: 600, size: "meta" })}>
              {d.newer_dispute.status === "open"
                ? `Dispute #${d.newer_dispute.sequence} was opened on this order ${ago(d.newer_dispute.opened_at)} and is waiting for a decision.`
                : `This order has a later dispute (#${d.newer_dispute.sequence}, opened ${ago(d.newer_dispute.opened_at)}), already resolved.`}
            </p>
          </div>
          <Link href={`/admin/disputes/${d.newer_dispute.id}`}><Btn size="sm">View dispute #{d.newer_dispute.sequence}</Btn></Link>
        </div>
      ) : null}

      <div className={cx(grid({ cols: "main" }), css({ gap: "20px", alignItems: "start" }))}>
        <div className={stack({ gap: 4 })}>
          <Panel>
            <PanelHead title="Evidence" meta="what each side submitted" />
            <div className={css({ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", p: "16px" })}>
              <Evidence title="Client" name={d.client.name} statement={d.client_statement} files={d.client_evidence} />
              <Evidence title="Freelancer" name={d.freelancer.name} statement={d.freelancer_statement} files={d.freelancer_evidence} />
            </div>
          </Panel>

          {/* Only when the order has a conversation: without one the panel was a dead end
              ("No conversation exists", a disabled box), so it is hidden. */}
          {conversationId && <ConversationPanel conversationId={conversationId} client={d.client} freelancer={d.freelancer} />}

          <Panel>
            <PanelHead title="Order record" meta="deliveries, revisions and disputes in order" />
            <div className={recordWrap}>
              <OrderRecord
                embedded
                orderId={d.order.id}
                createdAt={d.order.created_at}
                deliveryHistory={d.order.delivery_history}
                revisionHistory={d.order.revision_history}
                preEvents={co ? [
                  ...(co.requested_at ? [{ id: -101, event_type: "request_sent", description: "The client opened a custom request.", actor_role: "client" as const, created_at: co.requested_at, request: requestDetailsOf(co) }] : []),
                  ...(!(co.offers?.length) && co.offered_at ? [{ id: -102, event_type: "offer_sent", description: "The freelancer sent a custom offer.", actor_role: "freelancer" as const, created_at: co.offered_at }] : []),
                ] : undefined}
                rounds={co?.offers}
                roundsViewer="admin"
              />
            </div>
          </Panel>

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
                  <dt>Price</dt><dd className={text({ mono: true })}>{money(co.total ?? amount)}</dd>
                  <dt>Delivery</dt><dd>{co.delivery_days ? `${co.delivery_days} days` : "—"}</dd>
                  <dt>Revisions</dt><dd>{co.revisions != null ? `${co.revisions} included` : "—"}</dd>
                  {co.offer_note ? <><dt>Note</dt><dd>“{co.offer_note}”</dd></> : null}
                </dl>
              </div>
            </Panel>
          ) : null}
        </div>

        <div className={stack({ gap: 4 })}>
          {d.status === "open" ? (
            <Panel>
              <PanelHead title="Resolve" />
              <div className={cx(stack({ gap: 3 }), css({ p: "16px" }))}>
                {OPTIONS.map((o) => (
                  <div key={o.value} className={optionCard} data-on={outcome === o.value} onClick={() => setOutcome(o.value)} role="radio" aria-checked={outcome === o.value}>
                    <span className="radio">{outcome === o.value ? <Check size={10} strokeWidth={3} /> : null}</span>
                    <div>
                      <p className={text({ weight: 600, size: "meta" })}>{o.label}</p>
                      <p className={text({ size: "micro", tone: 2 })}>{o.help}</p>
                    </div>
                  </div>
                ))}
                {outcome === "partial" ? (
                  <div className={cx(stack({ gap: 2 }), css({ p: "12px", borderRadius: "10px", bg: "var(--td-surface-2)", border: "1px solid var(--td-line)" }))}>
                    <label className={text({ size: "meta", weight: 600, tone: 2 })}>Freelancer receives</label>
                    <div className={row({ gap: 2 })}>
                      <span className={text({ tone: 3 })}>$</span>
                      <Input type="number" min={1} max={Math.max(1, amount - 1)} step="0.01" value={partial} onChange={(e) => setPartial(e.target.value)} placeholder="0.00" />
                    </div>
                    <p className={text({ size: "micro", tone: 3 })}>Client is refunded {money(Math.max(0, amount - partialNum))} of {money(amount)}.</p>
                  </div>
                ) : null}
                <div className={stack({ gap: 1 })}>
                  <label className={text({ size: "meta", weight: 600, tone: 2 })}>Note to both parties</label>
                  <Textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={2000} placeholder={outcome === "continue" ? "What needs to happen next, and by when." : "Explain the decision in one or two sentences."} />
                </div>
                <Btn variant="primary" size="lg" full disabled={!canResolve || resolving} onClick={resolve}>
                  {resolving ? "Saving…" : outcome === "continue" ? "Send feedback and continue" : `Resolve dispute #${d.sequence}`}
                </Btn>
              </div>
            </Panel>
          ) : (
            <Panel>
              <PanelHead title="Decision" />
              <div className={cx(stack({ gap: 2 }), css({ p: "16px" }))}>
                <p className={text({ weight: 600 })}>{d.outcome ? outcomeLabel[d.outcome].long : "Resolved"}</p>
                {d.outcome === "partial" && d.partial_freelancer_amount ? <p className={text({ size: "meta", tone: 2 })}>Freelancer&apos;s share {money(d.partial_freelancer_amount)}{d.settlement ? ` (${money(d.settlement.freelancer_receives)} after the platform fee)` : ""}, client refunded {money(amount - Number(d.partial_freelancer_amount))}.</p> : null}
                {d.outcome === "continue" ? <p className={text({ size: "meta", tone: 2 })}>No funds moved. The order went back to in progress so the freelancer can deliver again.</p> : null}
                {d.admin_note ? <div className={cx(text({ size: "meta", tone: 2 }), css({ p: "10px 12px", bg: "var(--td-surface-2)", borderRadius: "8px", borderLeft: "3px solid var(--td-line-2)", whiteSpace: "pre-wrap" }))}>{d.admin_note}</div> : null}
                <p className={text({ size: "micro", tone: 3 })}>{d.resolved_at ? dateTime(d.resolved_at) : ""}</p>
              </div>
            </Panel>
          )}

          <Panel>
            <PanelHead title="Parties" />
            {[{ p: d.client, role: "Client" }, { p: d.freelancer, role: "Freelancer" }].map(({ p, role }) => (
              <Link key={role} href={p.id ? `/admin/people/${p.id}` : "#"} className={cx(row({ gap: 3 }), css({ px: "16px", py: "12px", borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "var(--td-line)", _hover: { bg: "var(--td-surface-2)" }, "&:last-child": { borderBottom: "none" } }))}>
                <Avatar name={p.name} seed={p.id} src={p.avatar_url} />
                <div className={css({ minW: 0, flex: 1 })}>
                  <p className={text({ weight: 600, truncate: true })}>{p.name}</p>
                  <p className={text({ size: "meta", tone: 3, truncate: true })}>{role}{p.email ? ` · ${p.email}` : ""}</p>
                </div>
              </Link>
            ))}
          </Panel>

          <Panel>
            <PanelHead title="Earlier disputes on this order" meta={earlier.length ? undefined : "none"} />
            {earlier.length ? earlier.map((x) => (
              <Link key={x.id} href={`/admin/disputes/${x.id}`} className={cx(stack({ gap: 1 }), css({ px: "16px", py: "12px", borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "var(--td-line)", _hover: { bg: "var(--td-surface-2)" }, "&:last-child": { borderBottom: "none" } }))}>
                <div className={row({ gap: 3, between: true })}>
                  <p className={text({ weight: 600, size: "meta" })}>Dispute #{x.sequence}</p>
                  <DisputeStatus status={x.status} outcome={x.outcome} />
                </div>
                <p className={text({ size: "micro", tone: 3 })}>{x.resolved_at ? `resolved ${shortDate(x.resolved_at)}` : `opened ${shortDate(x.opened_at)}`}</p>
                {x.admin_note ? <p className={text({ size: "meta", tone: 2 })}>Admin: {x.admin_note}</p> : null}
              </Link>
            )) : <div className={cx(text({ size: "meta", tone: 3 }), css({ p: "16px" }))}>This is the first dispute on order #{d.order.id}.</div>}
          </Panel>

          <Panel>
            <PanelHead title="Order" actions={<Link href={`/admin/orders/${d.order.id}`} className={text({ size: "meta", tone: "accent", weight: 500 })}>Open order</Link>} />
            <div className={css({ p: "16px" })}>
              <dl className={kvList}>
                <dt>Title</dt><dd>{d.order.title}</dd>
                <dt>Amount</dt><dd className={text({ mono: true })}>{money(amount)}</dd>
                <dt>Origin</dt><dd>{isCustom ? "Custom offer" : "Service package"}</dd>
                <dt>Placed</dt><dd>{d.order.created_at ? shortDate(d.order.created_at) : "—"}</dd>
                <dt>Deliveries</dt><dd>{d.order.delivery_history?.length ?? 0}</dd>
                {d.status === "open" ? <><dt>Open for</dt><dd>{ago(d.opened_at).replace(" ago", "")}</dd></> : null}
              </dl>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
