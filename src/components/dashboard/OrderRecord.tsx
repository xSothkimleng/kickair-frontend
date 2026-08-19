"use client";

import { useEffect, useState } from "react";
import { Box, Paper, Typography, Stack, Chip, CircularProgress } from "@mui/material";
import {
  AddShoppingCart, CheckCircle, Replay, LocalShipping, Gavel,
  AttachFile, Cancel, RadioButtonChecked, InsertDriveFile as FileIcon,
  Image as ImageIcon, Download as DownloadIcon,
} from "@mui/icons-material";
import { api } from "@/lib/api";
import { OrderTimelineEvent } from "@/types/order";
import { downloadOrderAttachment } from "@/lib/downloadFile";

type Attachment = { url: string; file_name: string; file_type: string };
type DeliveryEntry = { note: string | null; attachments: Attachment[]; submitted_at: string };
type RevisionEntry = { note: string | null; requested_at: string };

const EVENT_STYLE: Record<string, { icon: React.ReactNode; color: string }> = {
  order_placed:       { icon: <AddShoppingCart sx={{ fontSize: 13 }} />, color: "#0F172A" },
  order_accepted:     { icon: <CheckCircle sx={{ fontSize: 13 }} />,     color: "#2563EB" },
  work_delivered:     { icon: <LocalShipping sx={{ fontSize: 13 }} />,   color: "#16A34A" },
  work_resubmitted:   { icon: <LocalShipping sx={{ fontSize: 13 }} />,   color: "#16A34A" },
  revision_requested: { icon: <Replay sx={{ fontSize: 13 }} />,          color: "#C2410C" },
  order_completed:    { icon: <CheckCircle sx={{ fontSize: 13 }} />,     color: "#16A34A" },
  order_cancelled:    { icon: <Cancel sx={{ fontSize: 13 }} />,          color: "#94A3B8" },
  dispute_opened:     { icon: <Gavel sx={{ fontSize: 13 }} />,           color: "#DC2626" },
  dispute_resolved:   { icon: <Gavel sx={{ fontSize: 13 }} />,           color: "#16A34A" },
  evidence_submitted: { icon: <AttachFile sx={{ fontSize: 13 }} />,      color: "#64748B" },
};
const FALLBACK_STYLE = { icon: <RadioButtonChecked sx={{ fontSize: 13 }} />, color: "#64748B" };

const titleFor = (t: string) => t.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

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
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, p: "6px 10px", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 1.5, maxWidth: 420 }}>
      {file.file_type === "image" ? <ImageIcon sx={{ fontSize: 16 }} color="action" /> : <FileIcon sx={{ fontSize: 16 }} color="action" />}
      <Typography variant="caption" sx={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.file_name}</Typography>
      {error && <Typography variant="caption" color="error">Unavailable</Typography>}
      <Typography component="a" href={file.url} target="_blank" rel="noopener noreferrer" variant="caption" color="primary" sx={{ textDecoration: "none" }}>
        Open
      </Typography>
      <Box onClick={downloading ? undefined : handleDownload}
        sx={{ display: "flex", alignItems: "center", gap: 0.4, cursor: "pointer", color: "primary.main", "&:hover": { textDecoration: "underline" } }}>
        {downloading ? <CircularProgress size={11} /> : <DownloadIcon sx={{ fontSize: 13 }} />}
        <Typography variant="caption" color="primary">Download</Typography>
      </Box>
    </Box>
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
}: {
  orderId: number;
  createdAt?: string;
  deliveryHistory?: DeliveryEntry[];
  revisionHistory?: RevisionEntry[];
}) {
  const [events, setEvents] = useState<OrderTimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api.getOrderTimeline(orderId)
      .then((res) => { if (active) setEvents(res.data ?? []); })
      .catch(() => { if (active) setEvents([]); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [orderId]);

  const deliveries = deliveryHistory ?? [];
  const revisions = revisionHistory ?? [];

  // The event log is the spine; deliveries/revisions attach to their k-th
  // matching event (both lists are append-only, so positional matching holds).
  const baseEvents: OrderTimelineEvent[] = events.length
    ? events
    : createdAt
      ? [{ id: -1, event_type: "order_placed", description: "Order was placed.", actor_role: "client", created_at: createdAt }]
      : [];

  let dIdx = 0;
  let rIdx = 0;
  const rows: RecordRow[] = baseEvents.map((e) => {
    const row: RecordRow = {
      key: `ev-${e.id}`,
      at: e.created_at,
      eventType: e.event_type,
      title: titleFor(e.event_type),
      description: e.description,
      actor: e.actor_role,
    };
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
    <Paper variant="outlined" sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 2 }}>
      <Typography sx={{ fontSize: 11, fontWeight: 600, color: "#94A3B8", letterSpacing: "0.06em", textTransform: "uppercase", mb: 0.5 }}>
        Order Record
      </Typography>
      <Typography variant="caption" color="text.secondary">
        Everything that happened on this order — activity, deliveries, and revisions — in one timeline.
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
          <CircularProgress size={20} sx={{ color: "#94A3B8" }} />
        </Box>
      ) : rows.length === 0 ? (
        <Typography sx={{ fontSize: 13, color: "#94A3B8", mt: 2 }}>No activity recorded yet.</Typography>
      ) : (
        <Box sx={{ mt: 2.5 }}>
          {rows.map((row, i) => {
            const style = EVENT_STYLE[row.eventType] ?? FALLBACK_STYLE;
            const d = new Date(row.at);
            return (
              <Box key={row.key} sx={{ display: "flex", gap: 1.75, position: "relative" }}>
                {/* Date & time on the left */}
                <Box sx={{ width: 92, flexShrink: 0, textAlign: "right", pt: "1px" }}>
                  <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#334155", lineHeight: 1.35 }}>
                    {d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </Typography>
                  <Typography sx={{ fontSize: 11.5, color: "#94A3B8" }}>
                    {d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                  </Typography>
                </Box>

                {/* Icon + connecting rail */}
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                  <Box sx={{ width: 20, height: 20, borderRadius: "50%", bgcolor: "#FFF", border: `2px solid ${style.color}`, color: style.color, display: "grid", placeItems: "center", zIndex: 1 }}>
                    {style.icon}
                  </Box>
                  {i < rows.length - 1 && <Box sx={{ width: "1.5px", flex: 1, bgcolor: "#E2E8F0", minHeight: 14 }} />}
                </Box>

                {/* Content */}
                <Box sx={{ pb: i === rows.length - 1 ? 0 : 2.5, minWidth: 0, flex: 1 }}>
                  <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
                    <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>{row.title}</Typography>
                    {row.badge && (
                      <Chip label={row.badge} size="small" variant="outlined"
                        color={row.eventType === "revision_requested" ? "warning" : "success"}
                        sx={{ height: 18, fontSize: 10.5, fontWeight: 700 }} />
                    )}
                    {row.actor && (
                      <Typography sx={{ fontSize: 11.5, color: "#94A3B8" }}>
                        {row.actor.charAt(0).toUpperCase() + row.actor.slice(1)}
                      </Typography>
                    )}
                  </Stack>
                  {row.description && (
                    <Typography sx={{ fontSize: 13, color: "#475569", mt: "2px", lineHeight: 1.5 }}>{row.description}</Typography>
                  )}
                  {row.note && (
                    <Typography sx={{ fontSize: 13, color: "#334155", mt: 0.75, lineHeight: 1.6, whiteSpace: "pre-wrap", bgcolor: "#F8FAFC", border: "1px solid #F1F5F9", borderRadius: "8px", p: "8px 12px" }}>
                      {row.note}
                    </Typography>
                  )}
                  {!!row.attachments?.length && (
                    <Stack spacing={0.75} mt={1}>
                      {row.attachments.map((f, fi) => <AttachmentRow key={fi} file={f} orderId={orderId} />)}
                    </Stack>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      )}
    </Paper>
  );
}
