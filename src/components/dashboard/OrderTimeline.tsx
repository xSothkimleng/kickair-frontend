"use client";

import { useEffect, useState } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import {
  AddShoppingCart, CheckCircle, Replay, LocalShipping, Gavel,
  AttachFile, Cancel, RadioButtonChecked,
} from "@mui/icons-material";
import { api } from "@/lib/api";
import { OrderTimelineEvent } from "@/types/order";

// event_type → icon + accent colour
const EVENT_STYLE: Record<string, { icon: React.ReactNode; color: string }> = {
  order_placed:       { icon: <AddShoppingCart sx={{ fontSize: 13 }} />, color: "#0F172A" },
  order_accepted:     { icon: <CheckCircle sx={{ fontSize: 13 }} />,     color: "#2563EB" },
  work_delivered:     { icon: <LocalShipping sx={{ fontSize: 13 }} />,   color: "#2563EB" },
  work_resubmitted:   { icon: <LocalShipping sx={{ fontSize: 13 }} />,   color: "#2563EB" },
  revision_requested: { icon: <Replay sx={{ fontSize: 13 }} />,         color: "#C2410C" },
  order_completed:    { icon: <CheckCircle sx={{ fontSize: 13 }} />,     color: "#16A34A" },
  order_cancelled:    { icon: <Cancel sx={{ fontSize: 13 }} />,          color: "#94A3B8" },
  dispute_opened:     { icon: <Gavel sx={{ fontSize: 13 }} />,           color: "#DC2626" },
  dispute_resolved:   { icon: <Gavel sx={{ fontSize: 13 }} />,           color: "#16A34A" },
  evidence_submitted: { icon: <AttachFile sx={{ fontSize: 13 }} />,      color: "#64748B" },
};

const FALLBACK_STYLE = { icon: <RadioButtonChecked sx={{ fontSize: 13 }} />, color: "#64748B" };

function titleFor(eventType: string) {
  return eventType
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function formatDateTime(d: string) {
  return new Date(d).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

const SEC_LABEL = {
  fontSize: 11,
  fontWeight: 600,
  color: "#94A3B8",
  letterSpacing: "0.06em",
  textTransform: "uppercase" as const,
  mb: 1.75,
};

interface OrderTimelineProps {
  orderId: number;
  /** Used as a fallback "Order placed" entry if the timeline endpoint returns nothing. */
  createdAt?: string;
}

export default function OrderTimeline({ orderId, createdAt }: OrderTimelineProps) {
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

  // If no events were logged (e.g. legacy orders), show a minimal fallback.
  const display: OrderTimelineEvent[] = events.length
    ? events
    : createdAt
      ? [{ id: -1, event_type: "order_placed", description: "Order was placed.", actor_role: "client", created_at: createdAt }]
      : [];

  return (
    <Box>
      <Typography sx={SEC_LABEL}>Activity Timeline</Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
          <CircularProgress size={20} sx={{ color: "#94A3B8" }} />
        </Box>
      ) : display.length === 0 ? (
        <Typography sx={{ fontSize: 13, color: "#94A3B8" }}>No activity recorded yet.</Typography>
      ) : (
        <Box sx={{ position: "relative", pl: "26px" }}>
          <Box sx={{ position: "absolute", left: "8px", top: "9px", bottom: "9px", width: "1.5px", bgcolor: "#E2E8F0" }} />
          {display.map((e, i) => {
            const style = EVENT_STYLE[e.event_type] ?? FALLBACK_STYLE;
            return (
              <Box key={e.id} sx={{ position: "relative", pb: i === display.length - 1 ? 0 : 2.5 }}>
                <Box sx={{
                  position: "absolute", left: "-26px", top: "1px", width: 18, height: 18, borderRadius: "50%",
                  bgcolor: "#FFF", border: `2px solid ${style.color}`, color: style.color,
                  display: "grid", placeItems: "center",
                }}>
                  {style.icon}
                </Box>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>{titleFor(e.event_type)}</Typography>
                <Typography sx={{ fontSize: 13, color: "#475569", mt: "1px", lineHeight: 1.5 }}>{e.description}</Typography>
                <Typography sx={{ fontSize: 12, color: "#94A3B8", mt: "2px" }}>
                  {formatDateTime(e.created_at)}
                  {e.actor_role ? ` · ${e.actor_role.charAt(0).toUpperCase() + e.actor_role.slice(1)}` : ""}
                </Typography>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
