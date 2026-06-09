"use client";

import { useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  Button,
  CircularProgress,
} from "@mui/material";
import {
  AccessTime,
  ReplayOutlined,
  ShieldOutlined,
  LockOutlined,
  StarRounded,
} from "@mui/icons-material";
import { tokens } from "@/theme";
import { api } from "@/lib/api";
import { CustomOrder } from "@/types/customOrder";
import { Money, coCard, coLabel, Chip, initials } from "./kit";
import { useCoInvalidate } from "./hooks";
import FundMilestoneDialog from "./FundMilestoneDialog";

export default function ReviewOffer({ order, onChanged }: { order: CustomOrder; onChanged: () => void }) {
  const invalidate = useCoInvalidate();
  const offer = order.offer;
  const ms = order.milestones;
  const m1 = ms[0];
  const freelancerName = order.freelancer.name ?? "the freelancer";
  const expired = !!offer?.expires_at && new Date(offer.expires_at).getTime() < Date.now();

  const [fundOpen, setFundOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [declining, setDeclining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!offer || !m1) return null;

  const handleAccept = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await api.acceptCustomOrder(order.id);
      await invalidate();
      setFundOpen(false);
      onChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to accept the offer.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDecline = async () => {
    setDeclining(true);
    try { await api.withdrawCustomOrder(order.id); await invalidate(); onChanged(); } finally { setDeclining(false); }
  };

  const main = (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* freelancer + scope */}
      <Box sx={{ ...coCard, p: { xs: 2.5, md: 3 } }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1.5, mb: 2.25 }}>
          <Box sx={{ display: "flex", gap: 1.5 }}>
            <Avatar sx={{ width: 46, height: 46, bgcolor: tokens.text, fontSize: 15, fontWeight: 600 }}>{initials(freelancerName)}</Avatar>
            <Box>
              <Typography sx={{ fontWeight: 600, fontSize: 15.5 }}>{freelancerName}</Typography>
              <Typography sx={{ display: "flex", alignItems: "center", gap: 0.5, fontSize: 12, color: tokens.text2 }}>
                <StarRounded sx={{ fontSize: 14, color: tokens.pending }} /> Custom offer
              </Typography>
            </Box>
          </Box>
          {expired ? <Chip tone="neutral">Expired</Chip> : <Chip tone="pending" dot>New offer</Chip>}
        </Box>
        <Typography sx={coLabel}>Scope</Typography>
        <Typography sx={{ fontSize: 14, lineHeight: 1.55, my: 1, mb: 2 }}>{offer.scope}</Typography>
        <Box sx={{ display: "flex", gap: 2.25, flexWrap: "wrap", color: tokens.text2, fontSize: 12.5 }}>
          {offer.delivery_days != null && <Span icon={<AccessTime sx={{ fontSize: 14 }} />}>{offer.delivery_days}-day delivery</Span>}
          {offer.revisions != null && <Span icon={<ReplayOutlined sx={{ fontSize: 14 }} />}>{offer.revisions} revisions / phase</Span>}
          {offer.expires_at && !expired && <Span icon={<AccessTime sx={{ fontSize: 14 }} />}>Expires {new Date(offer.expires_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</Span>}
        </Box>
      </Box>

      {/* milestone plan */}
      <Box sx={{ ...coCard, p: { xs: 2.5, md: 3 } }}>
        <Typography sx={{ ...coLabel, mb: 2 }}>Milestone plan · {ms.length} {ms.length === 1 ? "phase" : "phases"}</Typography>
        {ms.map((m, i) => (
          <Box key={m.id} sx={{ display: "flex", gap: 1.75, py: 1.875, borderBottom: i < ms.length - 1 ? `1px solid ${tokens.border}` : "none", alignItems: "flex-start" }}>
            <Box sx={{ width: 22, height: 22, mt: 0.25, borderRadius: "50%", bgcolor: "rgba(0,0,0,0.05)", display: "grid", placeItems: "center", fontFamily: tokens.mono, fontSize: 11, fontWeight: 600, color: tokens.text2, flex: "none" }}>{m.seq}</Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
                <Typography sx={{ fontWeight: 600, fontSize: 14.5 }}>{m.title}</Typography>
                {i === 0 && <Chip tone="pending">Funded now</Chip>}
              </Box>
              {m.description && <Typography sx={{ fontSize: 13, color: tokens.text2, mt: 0.25 }}>{m.description}</Typography>}
              {m.due_days && <Typography sx={{ fontSize: 11.5, color: tokens.text3, mt: 0.25 }}>Due ~{m.due_days} days after funding</Typography>}
            </Box>
            <Box sx={{ textAlign: "right" }}>
              <Money value={m.amount} size={15} weight={600} />
              {i !== 0 && <Typography sx={{ fontSize: 10.5, color: tokens.text3 }}>later</Typography>}
            </Box>
          </Box>
        ))}
      </Box>

      {/* escrow explainer */}
      <Box sx={{ ...coCard, p: { xs: 2.25, md: 2.75 }, bgcolor: tokens.surface2 }}>
        <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
          <Box sx={{ width: 38, height: 38, borderRadius: "10px", bgcolor: tokens.pendingTint, display: "grid", placeItems: "center", flex: "none" }}>
            <ShieldOutlined sx={{ fontSize: 19, color: tokens.pendingText }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 600, fontSize: 14.5 }}>You fund one milestone at a time</Typography>
            <Typography sx={{ fontSize: 13.5, color: tokens.text2, lineHeight: 1.5, mt: 0.5 }}>
              Milestone 1 is funded into escrow now. Later milestones cost nothing until you choose to fund them — and escrow only releases to {freelancerName.split(" ")[0]} after you approve each delivery.
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  const aside = (
    <Box sx={{ ...coCard, p: { xs: 2.5, md: 3 }, position: { md: "sticky" }, top: 24 }}>
      <Typography sx={coLabel}>To start the project</Typography>
      <Box sx={{ p: 2, my: 1.5, borderRadius: "12px", bgcolor: tokens.pendingTint, border: "1px solid rgba(234,88,12,0.18)" }}>
        <Typography sx={{ ...coLabel, color: tokens.pendingText }}>You pay now · Milestone 1</Typography>
        <Box sx={{ mt: 0.75 }}><Money value={m1.amount} size={32} weight={600} color={tokens.pendingText} cents /></Box>
        <Typography sx={{ fontSize: 11.5, color: tokens.pendingText, opacity: 0.85 }}>&ldquo;{m1.title}&rdquo; → held in escrow</Typography>
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25, mb: 2 }}>
        <Between label="Total project value"><Money value={offer.total} size={14} weight={500} /></Between>
        <Between label={`Funded later (${ms.length - 1} ${ms.length - 1 === 1 ? "phase" : "phases"})`}><Money value={offer.total - m1.amount} size={14} weight={500} color={tokens.text3} /></Between>
      </Box>

      {error && <Typography sx={{ fontSize: 12.5, color: tokens.errorText, mb: 1.5 }}>{error}</Typography>}

      {expired ? (
        <Box sx={{ display: "flex", gap: 1, p: "12px 14px", bgcolor: "rgba(0,0,0,0.04)", borderRadius: "10px" }}>
          <AccessTime sx={{ fontSize: 15, color: tokens.text3 }} />
          <Typography sx={{ fontSize: 12.5, color: tokens.text2 }}>This offer expired. Ask {freelancerName.split(" ")[0]} to resend it.</Typography>
        </Box>
      ) : (
        <>
          <Button fullWidth startIcon={<LockOutlined />} onClick={() => setFundOpen(true)}
            sx={{ textTransform: "none", fontWeight: 600, fontSize: 15, borderRadius: "999px", bgcolor: tokens.text, color: "#fff", height: 48, boxShadow: "none", "&:hover": { bgcolor: "rgba(0,0,0,0.82)", boxShadow: "none" } }}>
            Accept &amp; Fund Milestone 1
          </Button>
          <Button fullWidth onClick={handleDecline} disabled={declining} sx={{ mt: 1.25, textTransform: "none", fontWeight: 600, fontSize: 13.5, color: tokens.text2, borderRadius: "999px" }}>
            {declining ? <CircularProgress size={16} /> : "Decline"}
          </Button>
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 0.75, mt: 1.5, color: tokens.text3, fontSize: 11.5 }}>
            <LockOutlined sx={{ fontSize: 12 }} /> Funds held in escrow · refundable until delivery
          </Box>
        </>
      )}
    </Box>
  );

  return (
    <>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "minmax(0,1fr) 348px" }, gap: 3, alignItems: "start" }}>
        {main}
        {aside}
      </Box>
      <FundMilestoneDialog
        open={fundOpen}
        onClose={() => setFundOpen(false)}
        milestoneTitle={m1.title}
        amount={m1.amount}
        onConfirm={handleAccept}
        submitting={submitting}
        title="Fund Milestone 1"
        annotation="Accept & fund into escrow"
        ctaLabel={`Confirm & fund $${m1.amount.toLocaleString()}`}
        error={error}
      />
    </>
  );
}

function Span({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>{icon}{children}</Box>;
}

function Between({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <Typography sx={{ fontSize: 13.5, color: tokens.text2 }}>{label}</Typography>
      {children}
    </Box>
  );
}
