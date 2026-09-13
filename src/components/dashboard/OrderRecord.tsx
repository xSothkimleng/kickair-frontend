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
import { downloadOrderAttachment } from "@/lib/downloadFile";

type Attachment = { url: string; file_name: string; file_type: string };
type DeliveryEntry = { note: string | null; attachments: Attachment[]; submitted_at: string };
type RevisionEntry = { note: string | null; requested_at: string };

const EVENT_STYLE: Record<string, { icon: React.ReactNode; color: string }> = {
  request_sent:       { icon: <Receipt size={13} />,      color: "#64748B" },
  offer_sent:         { icon: <Tag size={13} />,          color: "#7C3AED" },
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

/* ── Styles (MUI Paper/Typography/Chip metrics, measured against the MUI build) ── */

/** `Paper variant="outlined"`: white, 1px divider hairline, 8px radius, 16/20px pad. */
const cardCss = css({
  bg: "#FFFFFF",
  color: "rgba(0,0,0,0.87)",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "rgba(0,0,0,0.12)",
  borderRadius: "8px",
  p: { base: "16px", md: "20px" },
});

const eyebrowCss = css({
  fontSize: "11px",
  fontWeight: 600,
  lineHeight: 1.5,
  color: "#94A3B8",
  letterSpacing: "0.06em",
  textTransform: "uppercase",
});
/** MUI `caption`: 12px / 1.66. */
const captionCss = css({ fontSize: "12px", lineHeight: 1.66, color: "rgba(0,0,0,0.6)" });

const loadingWrapCss = css({ display: "flex", justifyContent: "center", py: "24px" });
const emptyCss = css({ fontSize: "13px", lineHeight: 1.5, color: "#94A3B8" });

const rowsCss = css({ mt: "20px" });
const rowCss = css({ display: "flex", gap: "14px", position: "relative" });
const whenCss = css({ width: "92px", flexShrink: 0, textAlign: "right", pt: "1px" });
const whenDateCss = css({ fontSize: "12px", fontWeight: 600, color: "#334155", lineHeight: 1.35 });
const whenTimeCss = css({ fontSize: "11.5px", lineHeight: 1.5, color: "#94A3B8" });

const railColCss = css({ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 });
/** 20px content box + 2px border = the 24px dot MUI drew (preflight off → content-box). */
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
const titleCss = css({ fontSize: "13px", fontWeight: 600, lineHeight: 1.5, color: "#0F172A" });
const actorCss = css({ fontSize: "11.5px", lineHeight: 1.5, color: "#94A3B8" });
const descCss = css({ fontSize: "13px", color: "#475569", lineHeight: 1.5 });
/** The note is a `<p>`; `globals.css` zeroes its padding/margin, so MUI never drew either. */
const noteCss = css({
  fontSize: "13px",
  color: "#334155",
  lineHeight: 1.6,
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
    fontSize: "10.5px",
    fontWeight: 700,
    lineHeight: 1.5,
    whiteSpace: "nowrap",
    maxWidth: "100%",
    verticalAlign: "middle",
  },
  variants: {
    tone: {
      success: { color: "#2e7d32", borderColor: "rgba(46,125,50,0.7)" },
      warning: { color: "#ed6c02", borderColor: "rgba(237,108,2,0.7)" },
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
const fileIconCss = css({ color: "rgba(0,0,0,0.54)", flexShrink: 0, "& svg": { display: "block" } });
const fileNameCss = css({ flex: 1, fontSize: "12px", lineHeight: 1.66, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" });
const fileErrCss = css({ fontSize: "12px", lineHeight: 1.66, color: "#d32f2f" });
const fileOpenCss = css({ fontSize: "12px", lineHeight: 1.66, textDecoration: "none" });
const fileDlCss = css({
  display: "flex",
  alignItems: "center",
  gap: "3.2px",
  cursor: "pointer",
  color: "#1976d2",
  _hover: { textDecoration: "underline" },
});
const fileDlTextCss = css({ fontSize: "12px", lineHeight: 1.66, color: "#1976d2" });

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

interface RecordRow {
  key: string;
  at: string;
  eventType: string;
  title: string;
  badge?: string; // "Delivery #2" / "Revision #1"
  description: string | null;
  note?: string | null;
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
}: {
  orderId: number;
  createdAt?: string;
  deliveryHistory?: DeliveryEntry[];
  revisionHistory?: RevisionEntry[];
  /** Events that predate the order itself (e.g. a custom request/offer), merged into the timeline. */
  preEvents?: OrderTimelineEvent[];
}) {
  // The event log lives in React Query under the orders prefix, so every
  // `invalidateQueries({ queryKey: qk.orders.all() })` — after a party acts on the
  // page, or when a realtime notification lands — refetches it without a reload.
  const { data: events = [], isLoading: loading } = useQuery({
    queryKey: qk.orders.timeline(orderId),
    queryFn: async () => (await api.getOrderTimeline(orderId)).data ?? [],
    enabled: Number.isFinite(orderId),
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
  const baseEvents: OrderTimelineEvent[] = [...(preEvents ?? []), ...startRow, ...events];

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

  rows.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());

  return (
    <div className={cardCss}>
      <p className={eyebrowCss}>
        Order Record
      </p>
      <span className={captionCss}>
        Everything that happened on this order — activity, deliveries, and revisions — in one timeline.
      </span>

      {loading ? (
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
                  {row.note && (
                    <p className={noteCss}>
                      {row.note}
                    </p>
                  )}
                  {!!row.attachments?.length && (
                    <div className={attachListCss}>
                      {row.attachments.map((f, fi) => <AttachmentRow key={fi} file={f} orderId={orderId} />)}
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
