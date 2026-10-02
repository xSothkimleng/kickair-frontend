"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { css, cva } from "styled-system/css";
import {
  ShoppingCart, CheckCircle2, RotateCcw, Truck, Gavel,
  Paperclip, XCircle, CircleDot, FileText, Image as ImageIcon,
  Download as DownloadIcon, Receipt, Tag,
} from "lucide-react";
import { Spinner } from "@/components/ds";
import { qk } from "@/lib/queryKeys";
import { api } from "@/lib/api";
import { OrderTimelineEvent } from "@/types/order";
import type { CustomOrderOfferRound } from "@/types/customOrder";
import { downloadOrderAttachment } from "@/lib/downloadFile";
import { diffTerms, fmtDays, fmtRevisions, fmtUsdShort, roundTitle, senderLabel, termsOf, type RoundViewer } from "@/components/customOrders/offerRounds";

type Attachment = { url: string; file_name: string; file_type: string };
type DeliveryEntry = { note: string | null; attachments: Attachment[]; submitted_at: string };
type RevisionEntry = { note: string | null; requested_at: string };

const EVENT_STYLE: Record<string, { icon: React.ReactNode; color: string }> = {
  request_sent:       { icon: <Receipt size={13} />,      color: "#64748B" },
  offer_sent:         { icon: <Tag size={13} />,          color: "#7C3AED" },
  offer_round:        { icon: <Tag size={13} />,          color: "#7C3AED" },
  order_placed:       { icon: <ShoppingCart size={13} />, color: "#0F172A" },
  order_accepted:     { icon: <CheckCircle2 size={13} />, color: "#2563EB" },
  work_delivered:     { icon: <Truck size={13} />,        color: "#16A34A" },
  work_resubmitted:   { icon: <Truck size={13} />,        color: "#16A34A" },
  revision_requested: { icon: <RotateCcw size={13} />,    color: "#C2410C" },
  order_completed:    { icon: <CheckCircle2 size={13} />, color: "#16A34A" },
  order_cancelled:    { icon: <XCircle size={13} />,      color: "#94A3B8" },
  dispute_opened:     { icon: <Gavel size={13} />,        color: "#DC2626" },
  dispute_feedback:   { icon: <Gavel size={13} />,        color: "#2563EB" },
  dispute_resolved:   { icon: <Gavel size={13} />,        color: "#16A34A" },
  evidence_submitted: { icon: <Paperclip size={13} />,    color: "#64748B" },
};
const FALLBACK_STYLE = { icon: <CircleDot size={13} />, color: "#64748B" };
/** Event types that open an order's story; a log without one gets a synthetic first row. */
const START_EVENTS = new Set(["order_placed", "order_accepted", "custom_order_accepted"]);

const titleFor = (t: string) => t.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

/* ── Styles (card, text and chip metrics) ── */

/** `Paper variant="outlined"`: white, 1px divider hairline, 8px radius, 16/20px pad. */
const cardCss = css({
  bg: "#FFFFFF",
  color: "ink",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "rgba(0,0,0,0.12)",
  borderRadius: "8px",
  p: { base: "16px", md: "20px" },
});

const eyebrowCss = css({
  textStyle: "eyebrow",
  fontWeight: 600,
  color: "#94A3B8",
});
/** Caption: 12px. */
const captionCss = css({ textStyle: "meta", color: "ink2" });

const loadingWrapCss = css({ display: "flex", justifyContent: "center", py: "24px" });
const emptyCss = css({ textStyle: "ui", color: "#94A3B8" });

const rowsCss = css({ mt: "20px" });
const rowCss = css({ display: "flex", gap: "14px", position: "relative" });
const whenCss = css({ width: "92px", flexShrink: 0, textAlign: "right", pt: "1px" });
const whenDateCss = css({ textStyle: "meta", fontWeight: 600, color: "#334155" });
const whenTimeCss = css({ textStyle: "micro", color: "#94A3B8" });

const railColCss = css({ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 });
/** 20px content box + 2px border = the 24px dot (preflight off → content-box). */
const dotCss = css({
  width: "20px",
  height: "20px",
  borderRadius: "50%",
  bg: "#FFF",
  borderWidth: "2px",
  borderStyle: "solid",
  display: "grid",
  placeItems: "center",
  zIndex: 1,
});
const railCss = css({ width: "1.5px", flex: 1, bg: "#E2E8F0", minHeight: "14px" });

const bodyCss = cva({
  base: { minWidth: 0, flex: 1 },
  variants: { last: { true: { pb: 0 }, false: { pb: "20px" } } },
});
const headRowCss = css({ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" });
const titleCss = css({ textStyle: "ui", fontWeight: 600, color: "#0F172A" });
const actorCss = css({ textStyle: "micro", color: "#94A3B8" });
const descCss = css({ textStyle: "ui", color: "#475569" });
/** The note is a `<p>`; `globals.css` zeroes its padding/margin, so nothing drew either. */
const noteCss = css({
  textStyle: "ui",
  color: "#334155",
  whiteSpace: "pre-wrap",
  bg: "#F8FAFC",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "#F1F5F9",
  borderRadius: "8px",
});
const attachListCss = css({ display: "flex", flexDirection: "column", gap: "6px", mt: "8px" });

/** `Chip size="small" variant="outlined"` in the success / warning palette. */
const badgeCss = cva({
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "border-box",
    height: "18px",
    px: "7px",
    borderWidth: "1px",
    borderStyle: "solid",
    borderRadius: "16px",
    bg: "transparent",
    textStyle: "micro",
    fontWeight: 700,
    whiteSpace: "nowrap",
    maxWidth: "100%",
    verticalAlign: "middle",
  },
  variants: {
    tone: {
      success: { color: "#2e7d32", borderColor: "rgba(46,125,50,0.7)" },
      warning: { color: "#ed6c02", borderColor: "rgba(237,108,2,0.7)" },
      purple: { color: "#6D28D9", borderColor: "rgba(124,58,237,0.5)" },
    },
  },
  defaultVariants: { tone: "success" },
});

const fileRowCss = css({
  display: "flex",
  alignItems: "center",
  gap: "8px",
  p: "6px 10px",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "rgba(0,0,0,0.1)",
  borderRadius: "6px",
  maxWidth: "420px",
});
const fileIconCss = css({ color: "ink2", flexShrink: 0, "& svg": { display: "block" } });
const fileNameCss = css({ flex: 1, textStyle: "meta", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" });
const fileErrCss = css({ textStyle: "meta", color: "#d32f2f" });
const fileOpenCss = css({ textStyle: "meta", textDecoration: "none" });
const fileDlCss = css({
  display: "flex",
  alignItems: "center",
  gap: "3.2px",
  cursor: "pointer",
  color: "#1976d2",
  _hover: { textDecoration: "underline" },
});
const fileDlTextCss = css({ textStyle: "meta", color: "#1976d2" });

function AttachmentRow({ file, orderId }: { file: Attachment; orderId: number }) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(false);
  const handleDownload = async () => {
    setDownloading(true); setError(false);
    try { await downloadOrderAttachment(orderId, file.url, file.file_name); }
    catch { setError(true); }
    finally { setDownloading(false); }
  };
  return (
    <div className={fileRowCss}>
      <span className={fileIconCss}>
        {file.file_type === "image" ? <ImageIcon size={16} /> : <FileText size={16} />}
      </span>
      <span className={fileNameCss}>{file.file_name}</span>
      {error && <span className={fileErrCss}>Unavailable</span>}
      <a href={file.url} target="_blank" rel="noopener noreferrer" className={fileOpenCss}>
        Open
      </a>
      <div onClick={downloading ? undefined : handleDownload} className={fileDlCss}>
        {downloading ? <Spinner size={11} /> : <DownloadIcon size={13} />}
        <span className={fileDlTextCss}>Download</span>
      </div>
    </div>
  );
}

/** One negotiation round as a record row, with the round before it for the "was" values. */
interface RoundRowData {
  round: CustomOrderOfferRound;
  prev: CustomOrderOfferRound | null;
  onTable: boolean;
  agreed: boolean;
}

/** What the client asked for in a custom request, shown in full on its "Request Sent" row. */
export interface RequestDetails {
  budget: string | number | null;
  days: number | null;
  brief: string | null;
  attachments: string[];
}
/** A pre-order event. The custom request one carries the request itself. */
export type PreEvent = OrderTimelineEvent & { request?: RequestDetails };

/** The request part of a custom order, from any of the shapes the pages receive it in. */
export function requestDetailsOf(co: { budget?: string | number | null; desired_timeline_days?: number | null; description?: string | null; attachments?: string[] }): RequestDetails {
  return { budget: co.budget ?? null, days: co.desired_timeline_days ?? null, brief: co.description ?? null, attachments: co.attachments ?? [] };
}

const termsLineCss = css({ display: "flex", gap: "6px 14px", flexWrap: "wrap", alignItems: "baseline", textStyle: "ui", color: "#334155", fontVariantNumeric: "tabular-nums", mt: "2px" });
const termStrong = css({ fontWeight: 600 });
const termWas = css({ textDecoration: "line-through", color: "#94A3B8", textStyle: "meta", ml: "4px" });
const roundBoxCss = css({ display: "flex", flexDirection: "column", gap: "10px", p: "12px 14px", bg: "#F8FAFC", borderWidth: "1px", borderStyle: "solid", borderColor: "#E2E8F0", borderRadius: "8px", maxW: "760px" });
const roundBoxLabel = css({ textStyle: "eyebrow", fontWeight: 600, color: "#64748B" });
const roundBoxText = css({ textStyle: "ui", color: "#334155", whiteSpace: "pre-wrap" });
const roundBodyCss = css({ display: "flex", flexDirection: "column", gap: "8px" });
const requestFilesCss = css({ display: "flex", flexWrap: "wrap", gap: "6px 14px" });
const requestFileCss = css({ display: "inline-flex", alignItems: "center", gap: "6px", textStyle: "meta", color: "#334155", "& svg": { flexShrink: 0, color: "#64748B" } });

/** The client's request in full: budget and timeline, then the brief and any attachments. */
function RequestBox({ data }: { data: RequestDetails }) {
  const budget = Number(data.budget) || 0;
  const brief = data.brief?.trim();
  return (
    <div className={roundBodyCss}>
      <div className={termsLineCss}>
        {budget > 0 && <span className={termStrong}>Budget {fmtUsdShort(budget)}</span>}
        {data.days != null && <span>{data.days} {data.days === 1 ? "day" : "days"}</span>}
      </div>
      {(brief || data.attachments.length > 0) && (
        <div className={roundBoxCss}>
          {brief && <div><p className={roundBoxLabel}>Brief</p><p className={roundBoxText}>{brief}</p></div>}
          {data.attachments.length > 0 && (
            <div>
              <p className={roundBoxLabel}>Attachments</p>
              <div className={requestFilesCss}>
                {data.attachments.map((name) => <span key={name} className={requestFileCss}><FileText size={14} />{name}</span>)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** Terms line with struck "was" values, then the full scope and note. Nothing is folded away. */
function RoundTerms({ data }: { data: RoundRowData }) {
  const { round: r, prev } = data;
  const changed = new Set(diffTerms(prev ? termsOf(prev) : null, termsOf(r)).map((c) => c.key));
  // A plain render helper, not a component: React's compiler forbids components created during render.
  const term = (k: "delivery" | "revisions", value: string, was: string) => (
    <span>
      <span className={changed.has(k) ? termStrong : undefined}>{value}</span>
      {changed.has(k) && prev ? <span className={termWas}>{was}</span> : null}
    </span>
  );
  return (
    <div className={roundBodyCss}>
      <div className={termsLineCss}>
        <span className={termStrong}>{fmtUsdShort(r.total)}{changed.has("price") && prev ? <span className={termWas}>{fmtUsdShort(prev.total)}</span> : null}</span>
        {term("delivery", fmtDays(r.delivery_days), prev ? String(prev.delivery_days ?? "none") : "")}
        {term("revisions", fmtRevisions(r.revisions), prev ? String(prev.revisions ?? "none") : "")}
        {changed.has("scope") && <span className={badgeCss({ tone: "purple" })}>Scope edited</span>}
      </div>
      <div className={roundBoxCss}>
        <div><p className={roundBoxLabel}>Scope</p><p className={roundBoxText}>{r.scope || "No scope written."}</p></div>
        {r.note && <div><p className={roundBoxLabel}>Note</p><p className={roundBoxText}>{r.note}</p></div>}
      </div>
    </div>
  );
}

interface RecordRow {
  key: string;
  at: string;
  eventType: string;
  title: string;
  badge?: string; // "Delivery #2" / "Revision #1"
  description: string | null;
  note?: string | null;
  round?: RoundRowData;
  request?: RequestDetails;
  attachments?: Attachment[];
  actor?: string | null;
}

/**
 * One combined, chronological record of everything that happened on an order —
 * lifecycle events, deliveries (numbered, with files), and revision requests.
 * Replaces the separate Activity Timeline and Deliverables & revisions cards.
 */
export default function OrderRecord({
  orderId,
  createdAt,
  deliveryHistory,
  revisionHistory,
  preEvents,
  rounds,
  roundsViewer = "client",
  negotiating = false,
  title = "Order Record",
  caption = "Everything that happened on this order in one timeline: activity, deliveries and revisions.",
  embedded = false,
}: {
  /** Absent on the negotiation page, where no order exists yet: only the rounds and pre-events show. */
  orderId?: number;
  createdAt?: string;
  deliveryHistory?: DeliveryEntry[];
  revisionHistory?: RevisionEntry[];
  /** Events that predate the order itself (e.g. a custom request/offer), merged into the timeline. */
  preEvents?: PreEvent[];
  /** Every negotiation round, oldest first; each becomes a row with its terms and what changed. */
  rounds?: CustomOrderOfferRound[];
  roundsViewer?: RoundViewer;
  /** While the negotiation is open the last round is "On the table"; afterwards it is the agreed one. */
  negotiating?: boolean;
  title?: string;
  caption?: string;
  /**
   * The host already frames and titles the record (the admin dispute page's "Order record"
   * panel): render just the timeline — no card, no "Order Record" heading or caption —
   * so there is never a card inside a card with the same title twice.
   */
  embedded?: boolean;
}) {
  // The event log lives in React Query under the orders prefix, so every
  // `invalidateQueries({ queryKey: qk.orders.all() })` — after a party acts on the
  // page, or when a realtime notification lands — refetches it without a reload.
  const hasOrder = orderId != null && Number.isFinite(orderId);
  const { data: events = [], isLoading: loading } = useQuery({
    queryKey: qk.orders.timeline(orderId ?? 0),
    queryFn: async () => (await api.getOrderTimeline(orderId ?? 0)).data ?? [],
    enabled: hasOrder,
  });

  const deliveries = deliveryHistory ?? [];
  const revisions = revisionHistory ?? [];

  // Orders created before their flow logged a first event (older job orders) have
  // a log that starts at the first delivery; give them a starting row from the
  // order's own creation date so the record never opens mid-story.
  const hasStart = events.some((e) => START_EVENTS.has(e.event_type));
  const startRow: OrderTimelineEvent[] = !hasStart && createdAt
    ? [{ id: -1, event_type: "order_placed", description: "Order was placed.", actor_role: "client" as const, created_at: createdAt }]
    : [];

  // The event log is the spine; deliveries/revisions attach to their k-th
  // matching event (both lists are append-only, so positional matching holds).
  const baseEvents: PreEvent[] = [...(preEvents ?? []), ...startRow, ...events];

  let dIdx = 0;
  let rIdx = 0;
  let disputeNo = 0; // disputes are numbered per order in the order they were opened
  const rows: RecordRow[] = baseEvents.map((e) => {
    const row: RecordRow = {
      key: `ev-${e.id}`,
      at: e.created_at,
      eventType: e.event_type,
      title: titleFor(e.event_type),
      description: e.description,
      actor: e.actor_role,
      request: e.request,
    };
    if (e.event_type === "dispute_opened") disputeNo += 1;
    // An admin "continue" decision: titled by the dispute it answers, with the
    // feedback shown as a note. Only a true ending produces a "Dispute Resolved" row.
    if (e.event_type === "dispute_feedback") {
      row.title = `Dispute #${Math.max(disputeNo, 1)}`;
      row.description = "Admin feedback";
      row.note = e.description.replace(/^Admin feedback:\s*/i, "");
    }
    if (e.event_type === "work_delivered" || e.event_type === "work_resubmitted") {
      const d = deliveries[dIdx];
      dIdx += 1;
      row.badge = `Delivery #${dIdx}`;
      if (d) { row.note = d.note; row.attachments = d.attachments ?? []; }
    }
    if (e.event_type === "revision_requested") {
      const r = revisions[rIdx];
      rIdx += 1;
      row.badge = `Revision #${rIdx}`;
      if (r) row.note = r.note;
    }
    return row;
  });

  // Deliveries/revisions with no matching event (legacy orders) still show.
  deliveries.slice(dIdx).forEach((d, i) => rows.push({
    key: `d-extra-${i}`, at: d.submitted_at, eventType: "work_delivered",
    title: "Work Delivered", badge: `Delivery #${dIdx + i + 1}`,
    description: null, note: d.note, attachments: d.attachments ?? [],
    actor: "freelancer",
  }));
  revisions.slice(rIdx).forEach((r, i) => rows.push({
    key: `r-extra-${i}`, at: r.requested_at, eventType: "revision_requested",
    title: "Revision Requested", badge: `Revision #${rIdx + i + 1}`,
    description: null, note: r.note, actor: "client",
  }));

  // Negotiation rounds: one row each, titled by round, with the previous round for "was" values.
  (rounds ?? []).forEach((r, i, all) => {
    const last = i === all.length - 1;
    const prev = i > 0 ? all[i - 1] : null;
    rows.push({
      key: `round-${r.id}`, at: r.created_at, eventType: "offer_round",
      title: roundTitle(r),
      badge: last ? (negotiating ? "On the table" : "Agreed") : undefined,
      description: r.accepts_previous && prev ? `Agreed to ${roundTitle(prev).toLowerCase()} as it stood.` : null,
      actor: senderLabel(r, roundsViewer),
      round: { round: r, prev, onTable: last && negotiating, agreed: last && !negotiating },
    });
  });

  rows.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());

  return (
    <div className={embedded ? undefined : cardCss}>
      {!embedded && (
        <>
          <p className={eyebrowCss}>
            {title}
          </p>
          <span className={captionCss}>
            {caption}
          </span>
        </>
      )}

      {hasOrder && loading ? (
        <div className={loadingWrapCss}>
          <Spinner size={20} style={{ color: "#94A3B8" }} />
        </div>
      ) : rows.length === 0 ? (
        <p className={emptyCss}>No activity recorded yet.</p>
      ) : (
        <div className={rowsCss}>
          {rows.map((row, i) => {
            const style = EVENT_STYLE[row.eventType] ?? FALLBACK_STYLE;
            const d = new Date(row.at);
            return (
              <div key={row.key} className={rowCss}>
                {/* Date & time on the left */}
                <div className={whenCss}>
                  <p className={whenDateCss}>
                    {d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                  <p className={whenTimeCss}>
                    {d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                  </p>
                </div>

                {/* Icon + connecting rail */}
                <div className={railColCss}>
                  <div className={dotCss} style={{ borderColor: style.color, color: style.color }}>
                    {style.icon}
                  </div>
                  {i < rows.length - 1 && <div className={railCss} />}
                </div>

                {/* Content */}
                <div className={bodyCss({ last: i === rows.length - 1 })}>
                  <div className={headRowCss}>
                    <p className={titleCss}>{row.title}</p>
                    {row.badge && (
                      <span className={badgeCss({ tone: row.eventType === "revision_requested" ? "warning" : "success" })}>
                        {row.badge}
                      </span>
                    )}
                    {row.actor && (
                      <p className={actorCss}>
                        {row.actor.charAt(0).toUpperCase() + row.actor.slice(1)}
                      </p>
                    )}
                  </div>
                  {row.description && (
                    <p className={descCss}>{row.description}</p>
                  )}
                  {row.request && <RequestBox data={row.request} />}
                  {row.round && <RoundTerms data={row.round} />}
                  {row.note && (
                    <p className={noteCss}>
                      {row.note}
                    </p>
                  )}
                  {!!row.attachments?.length && (
                    <div className={attachListCss}>
                      {row.attachments.map((f, fi) => <AttachmentRow key={fi} file={f} orderId={orderId ?? 0} />)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
