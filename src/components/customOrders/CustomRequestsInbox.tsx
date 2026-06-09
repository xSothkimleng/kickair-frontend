"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Container,
  Typography,
  Avatar,
  Button,
  Skeleton,
  CircularProgress,
} from "@mui/material";
import {
  ChevronRight,
  ChevronLeft,
  ArrowForward,
  AccessTime,
  OpenInNew,
  MoveToInboxOutlined,
} from "@mui/icons-material";
import { tokens } from "@/theme";
import { api } from "@/lib/api";
import { CustomOrder } from "@/types/customOrder";
import { notifTimeAgo } from "@/components/notifications/shared";
import { Money, coCard, coLabel, Chip, AttachChip, initials } from "./kit";
import { useIncomingCustomOrders, useCoInvalidate } from "./hooks";
import OfferComposer from "./OfferComposer";

type Filter = "all" | "new" | "offered" | "declined";

const isNew = (r: CustomOrder) => r.status === "pending" && !r.freelancer_read_at;

export default function CustomRequestsInbox() {
  const router = useRouter();
  const invalidate = useCoInvalidate();
  const { data: requests = [], isLoading } = useIncomingCustomOrders();
  const [filter, setFilter] = useState<Filter>("all");
  const [selId, setSelId] = useState<number | null>(null);
  const [composing, setComposing] = useState(false);
  const [declining, setDeclining] = useState(false);

  const rows = requests.filter((r) =>
    filter === "all" ? true : filter === "new" ? isNew(r) : r.status === filter
  );
  const selected = requests.find((r) => r.id === selId) ?? null;

  const FILTERS: { id: Filter; label: string; n: number }[] = [
    { id: "all", label: "All", n: requests.length },
    { id: "new", label: "New", n: requests.filter(isNew).length },
    { id: "offered", label: "Offered", n: requests.filter((r) => r.status === "offered").length },
    { id: "declined", label: "Declined", n: requests.filter((r) => r.status === "declined").length },
  ];

  const select = (r: CustomOrder) => { setSelId(r.id); setComposing(false); };

  const handleDecline = async () => {
    if (!selected) return;
    setDeclining(true);
    try { await api.declineCustomOrder(selected.id); await invalidate(); } finally { setDeclining(false); }
  };

  const newCount = requests.filter(isNew).length;

  /* ── list column ── */
  const list = (
    <Box sx={{ width: { xs: "100%", md: 384 }, flex: { xs: 1, md: "none" }, minWidth: 0 }}>
      <Box sx={{ display: "flex", gap: 1, pb: 2, flexWrap: "wrap" }}>
        {FILTERS.map((f) => (
          <PillBtn key={f.id} active={filter === f.id} onClick={() => setFilter(f.id)}>
            {f.label} <Box component="span" sx={{ ml: 0.75, opacity: 0.6 }}>{f.n}</Box>
          </PillBtn>
        ))}
      </Box>
      <Box sx={{ ...coCard, overflow: "hidden" }}>
        {isLoading ? (
          [0, 1, 2].map((i) => <SkRow key={i} />)
        ) : rows.length === 0 ? (
          <Box sx={{ p: 4, textAlign: "center", color: tokens.text3, fontSize: 13 }}>No requests here.</Box>
        ) : (
          rows.map((r) => (
            <Box key={r.id} onClick={() => select(r)}
              sx={{ display: "flex", gap: 1.75, p: 2.25, cursor: "pointer", borderBottom: `1px solid ${tokens.border}`, "&:last-of-type": { borderBottom: "none" }, bgcolor: selId === r.id ? tokens.accentFill : "transparent", transition: "background .12s", "&:hover": { bgcolor: selId === r.id ? tokens.accentFill : tokens.surface2 } }}>
              <Box sx={{ position: "relative" }}>
                <Avatar sx={{ width: 42, height: 42, bgcolor: tokens.text, fontSize: 14, fontWeight: 600 }}>{initials(r.client.name)}</Avatar>
                {isNew(r) && <Box sx={{ position: "absolute", top: -1, right: -1, width: 9, height: 9, borderRadius: "50%", bgcolor: tokens.accent, boxShadow: `0 0 0 2px ${tokens.surface}` }} />}
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
                  <Typography sx={{ fontWeight: 600, fontSize: 14.5 }}>{r.client.name}</Typography>
                  <Typography sx={{ fontSize: 11.5, color: tokens.text3, flex: "none" }}>{notifTimeAgo(r.created_at)}</Typography>
                </Box>
                <Typography sx={{ fontSize: 13, lineHeight: 1.45, color: tokens.text2, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", my: 0.25 }}>{r.description}</Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                  <Box component="span" sx={{ fontFamily: tokens.mono, fontSize: 13, fontWeight: 600 }}>${r.budget.toLocaleString()}</Box>
                  {r.desired_timeline_days && <Typography sx={{ fontSize: 11.5, color: tokens.text3 }}>· {r.desired_timeline_days} days</Typography>}
                  {r.status === "offered" && <Chip tone="pending">Offered</Chip>}
                  {r.status === "accepted" && <Chip tone="success">Active</Chip>}
                  {r.status === "declined" && <Chip tone="neutral">Declined</Chip>}
                </Box>
              </Box>
              <ChevronRight sx={{ fontSize: 18, color: tokens.text3, alignSelf: "center", display: { xs: "none", md: "block" } }} />
            </Box>
          ))
        )}
      </Box>
    </Box>
  );

  /* ── detail column ── */
  const detail = selected && (
    composing ? (
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <OfferComposer order={selected} onSent={() => { setComposing(false); }} onCancel={() => setComposing(false)} />
      </Box>
    ) : (
      <Box sx={{ ...coCard, flex: 1, minWidth: 0, p: { xs: 2.5, md: 3.5 }, alignSelf: "flex-start" }}>
        <Button onClick={() => setSelId(null)} startIcon={<ChevronLeft />} sx={{ display: { md: "none" }, textTransform: "none", color: tokens.text2, mb: 1, pl: 1 }}>All requests</Button>
        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1.5, mb: 2.25 }}>
          <Box sx={{ display: "flex", gap: 1.5 }}>
            <Avatar sx={{ width: 48, height: 48, bgcolor: tokens.text, fontSize: 15, fontWeight: 600 }}>{initials(selected.client.name)}</Avatar>
            <Box>
              <Typography sx={{ fontWeight: 600, fontSize: 16 }}>{selected.client.name}</Typography>
              <Typography sx={{ fontSize: 12, color: tokens.text2 }}>Requested {notifTimeAgo(selected.created_at)} · {selected.service.title}</Typography>
            </Box>
          </Box>
          {isNew(selected) && <Chip tone="pending" dot>New</Chip>}
        </Box>

        <Box sx={{ display: "flex", border: `1px solid ${tokens.border}`, borderRadius: "12px", overflow: "hidden", mb: 2.5 }}>
          <Box sx={{ flex: 1, p: "14px 18px" }}>
            <Typography sx={coLabel}>Budget</Typography>
            <Money value={selected.budget} size={20} weight={600} />
          </Box>
          <Box sx={{ width: "1px", bgcolor: tokens.border }} />
          <Box sx={{ flex: 1, p: "14px 18px" }}>
            <Typography sx={coLabel}>Timeline</Typography>
            <Box component="span" sx={{ fontFamily: tokens.mono, fontSize: 20, fontWeight: 600 }}>{selected.desired_timeline_days ?? "—"} days</Box>
          </Box>
        </Box>

        <Typography sx={coLabel}>The brief</Typography>
        <Typography sx={{ fontSize: 14, lineHeight: 1.55, my: 1, mb: 2.5 }}>{selected.description}</Typography>

        {selected.attachments.length > 0 && (
          <Box sx={{ mb: 2.5 }}>
            <Typography sx={{ ...coLabel, mb: 1 }}>Attachments</Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {selected.attachments.map((a) => <AttachChip key={a} name={a} />)}
            </Box>
          </Box>
        )}

        {/* status-aware actions */}
        {selected.status === "pending" && (
          <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1.5 }}>
            <Button onClick={handleDecline} disabled={declining} sx={{ textTransform: "none", fontWeight: 600, color: tokens.text2, borderRadius: "999px" }}>
              {declining ? <CircularProgress size={16} /> : "Decline"}
            </Button>
            <Button onClick={() => setComposing(true)} endIcon={<ArrowForward />}
              sx={{ textTransform: "none", fontWeight: 600, fontSize: 14, borderRadius: "999px", bgcolor: tokens.text, color: "#fff", px: 2.5, height: 42, "&:hover": { bgcolor: "rgba(0,0,0,0.82)" } }}>
              Make an offer
            </Button>
          </Box>
        )}
        {selected.status === "offered" && (
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1.5, p: "14px 16px", bgcolor: tokens.pendingTint, borderRadius: "12px" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: tokens.pendingText }}>
              <AccessTime sx={{ fontSize: 16 }} />
              <Typography sx={{ fontSize: 13.5, fontWeight: 500 }}>Offer sent — awaiting client</Typography>
            </Box>
            <Button onClick={() => router.push(`/dashboard/custom-orders/${selected.id}`)} sx={{ textTransform: "none", fontWeight: 600, fontSize: 13, borderRadius: "999px", color: tokens.text, bgcolor: "rgba(0,0,0,0.05)", px: 1.75, "&:hover": { bgcolor: "rgba(0,0,0,0.09)" } }}>View offer</Button>
          </Box>
        )}
        {selected.status === "accepted" && (
          <Button fullWidth onClick={() => router.push(`/dashboard/custom-orders/${selected.id}`)} startIcon={<OpenInNew />}
            sx={{ textTransform: "none", fontWeight: 600, fontSize: 14, borderRadius: "999px", bgcolor: tokens.text, color: "#fff", height: 44, "&:hover": { bgcolor: "rgba(0,0,0,0.82)" } }}>
            Open milestone workspace
          </Button>
        )}
        {selected.status === "declined" && (
          <Box sx={{ display: "flex", gap: 1, p: "14px 16px", bgcolor: tokens.surface2, border: `1px solid ${tokens.border}`, borderRadius: "12px" }}>
            <Typography sx={{ fontSize: 13.5, color: tokens.text2 }}>You declined this request. The client has been notified.</Typography>
          </Box>
        )}
        {selected.status === "withdrawn" && (
          <Box sx={{ display: "flex", gap: 1, p: "14px 16px", bgcolor: tokens.surface2, border: `1px solid ${tokens.border}`, borderRadius: "12px" }}>
            <Typography sx={{ fontSize: 13.5, color: tokens.text2 }}>The client withdrew this request.</Typography>
          </Box>
        )}
      </Box>
    )
  );

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: tokens.canvas }}>
      <Container disableGutters sx={{ maxWidth: "1120px !important", px: { xs: 2, sm: 4 }, py: { xs: 3, sm: 5 } }}>
        <Box sx={{ mb: { xs: 2.5, sm: 3.5 } }}>
          <Typography sx={{ ...coLabel, fontFamily: tokens.mono, color: tokens.accent }}>Freelancer inbox</Typography>
          <Box sx={{ display: "flex", alignItems: "flex-end", gap: 1.5, flexWrap: "wrap", mt: 0.5 }}>
            <Typography sx={{ fontSize: 30, fontWeight: 600, letterSpacing: "-0.02em" }}>Custom requests</Typography>
            <Typography sx={{ fontSize: 14, color: tokens.text2, mb: 0.5 }}>
              {isLoading ? "Loading…" : `${newCount} new · ${requests.length} total`}
            </Typography>
          </Box>
        </Box>

        {!isLoading && requests.length === 0 ? (
          <EmptyState onSettings={() => router.push("/dashboard/freelancer?tab=services")} />
        ) : (
          <Box sx={{ display: "flex", gap: 3, alignItems: "flex-start", flexDirection: { xs: "column", md: "row" } }}>
            {/* mobile: show detail when selected, else list */}
            <Box sx={{ display: { xs: selId ? "none" : "block", md: "block" }, width: { xs: "100%", md: "auto" } }}>{list}</Box>
            {selected && <Box sx={{ display: { xs: "block", md: "block" }, flex: 1, minWidth: 0, width: "100%" }}>{detail}</Box>}
          </Box>
        )}
      </Container>
    </Box>
  );
}

function PillBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <Button onClick={onClick} disableRipple
      sx={{ textTransform: "none", fontWeight: 600, fontSize: 13, height: 34, px: 1.75, borderRadius: "999px", border: `1px solid ${active ? tokens.text : tokens.border}`, bgcolor: active ? tokens.text : tokens.surface, color: active ? "#fff" : tokens.text2, "&:hover": { bgcolor: active ? tokens.text : tokens.surface2 } }}>
      {children}
    </Button>
  );
}

function SkRow() {
  return (
    <Box sx={{ display: "flex", gap: 1.75, p: 2.25, borderBottom: `1px solid ${tokens.border}` }}>
      <Skeleton variant="circular" width={42} height={42} />
      <Box sx={{ flex: 1 }}>
        <Skeleton width="40%" height={14} />
        <Skeleton width="92%" height={12} />
        <Skeleton width="30%" height={12} />
      </Box>
    </Box>
  );
}

function EmptyState({ onSettings }: { onSettings: () => void }) {
  return (
    <Box sx={{ ...coCard, p: { xs: 6, sm: 9 }, textAlign: "center" }}>
      <Box sx={{ maxWidth: 380, mx: "auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
        <Box sx={{ width: 60, height: 60, borderRadius: "50%", bgcolor: tokens.surface2, border: `1px solid ${tokens.border}`, display: "grid", placeItems: "center" }}>
          <MoveToInboxOutlined sx={{ fontSize: 26, color: tokens.text3 }} />
        </Box>
        <Typography sx={{ fontSize: 18, fontWeight: 600 }}>No custom requests yet</Typography>
        <Typography sx={{ fontSize: 14, color: tokens.text2 }}>
          When a client asks for off-menu work, it lands here. Turn on custom orders in a service so clients can reach you.
        </Typography>
        <Button onClick={onSettings} sx={{ textTransform: "none", fontWeight: 600, fontSize: 13.5, borderRadius: "999px", border: `1px solid ${tokens.border}`, color: tokens.text, px: 2, height: 40 }}>
          Go to my services
        </Button>
      </Box>
    </Box>
  );
}
