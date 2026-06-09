"use client";

import { Box, Typography, SxProps, Theme } from "@mui/material";
import { tokens } from "@/theme";
import { CustomOrderEscrow, MilestoneStatus } from "@/types/customOrder";

/* ── Shared sx ─────────────────────────────────────────────────────────────── */

export const coCard: SxProps<Theme> = {
  bgcolor: tokens.surface,
  border: `1px solid ${tokens.border}`,
  borderRadius: `${tokens.radius.card}px`,
};

export const coLabel: SxProps<Theme> = {
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  color: tokens.text3,
};

/* ── Money (Roboto Mono, tabular) ──────────────────────────────────────────── */

export function fmtMoney(value: number, cents = false): string {
  return (
    "$" +
    Number(value || 0).toLocaleString("en-US", {
      minimumFractionDigits: cents ? 2 : 0,
      maximumFractionDigits: cents ? 2 : 0,
    })
  );
}

export function Money({
  value,
  size = 15,
  weight = 500,
  color = tokens.text,
  cents = false,
}: {
  value: number;
  size?: number;
  weight?: number;
  color?: string;
  cents?: boolean;
}) {
  return (
    <Box
      component="span"
      sx={{ fontFamily: tokens.mono, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.01em", fontSize: size, fontWeight: weight, color }}
    >
      {fmtMoney(value, cents)}
    </Box>
  );
}

/* ── Milestone status presentation ─────────────────────────────────────────── */

type Tone = "neutral" | "pending" | "success";

export const MS_STATUS: Record<MilestoneStatus, { label: string; tone: Tone }> = {
  upcoming: { label: "Upcoming", tone: "neutral" },
  funded: { label: "In escrow", tone: "pending" },
  in_progress: { label: "In progress", tone: "pending" },
  submitted: { label: "Submitted", tone: "pending" },
  approved: { label: "Approved", tone: "success" },
  released: { label: "Released", tone: "success" },
  cancelled: { label: "Cancelled", tone: "neutral" },
};

const TONE_SX: Record<Tone, { bg: string; color: string }> = {
  neutral: { bg: "rgba(0,0,0,0.05)", color: tokens.text2 },
  pending: { bg: tokens.pendingTint, color: tokens.pendingText },
  success: { bg: tokens.successTint, color: tokens.successText },
};

export function Chip({ tone = "neutral", children, dot }: { tone?: Tone; children: React.ReactNode; dot?: boolean }) {
  const t = TONE_SX[tone];
  return (
    <Box
      component="span"
      sx={{ display: "inline-flex", alignItems: "center", gap: 0.625, height: 22, px: 1, borderRadius: "999px", bgcolor: t.bg, color: t.color, fontSize: 11.5, fontWeight: 600, whiteSpace: "nowrap", flex: "none" }}
    >
      {dot && <Box component="span" sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "currentColor" }} />}
      {children}
    </Box>
  );
}

export function MsChip({ status, suffix }: { status: MilestoneStatus; suffix?: string }) {
  const cfg = MS_STATUS[status] ?? MS_STATUS.upcoming;
  return (
    <Chip tone={cfg.tone}>
      {cfg.label}
      {suffix ? ` · ${suffix}` : ""}
    </Chip>
  );
}

/* ── Escrow summary bar (the hero stat strip) ──────────────────────────────── */

function Stat({ label, value, color = tokens.text, dot }: { label: string; value: number; color?: string; dot?: string }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, minWidth: 0 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
        {dot && <Box component="span" sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: dot, flex: "none" }} />}
        <Typography sx={{ ...coLabel, whiteSpace: "nowrap" }}>{label}</Typography>
      </Box>
      <Money value={value} size={20} weight={600} color={color} />
    </Box>
  );
}

export function EscrowSummary({ escrow, mobile = false }: { escrow: CustomOrderEscrow; mobile?: boolean }) {
  const { total_value, released_total, in_escrow_total, unfunded_remaining, percent_released } = escrow;
  const relPct = total_value ? (released_total / total_value) * 100 : 0;
  const escPct = total_value ? (in_escrow_total / total_value) * 100 : 0;

  return (
    <Box sx={{ ...coCard, p: mobile ? 2.25 : 2.75 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
        <Typography sx={coLabel}>Escrow summary</Typography>
        <Typography sx={{ fontSize: 11, color: tokens.text3 }}>{percent_released}% released</Typography>
      </Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: mobile ? "1fr 1fr" : "repeat(4, 1fr)",
          gap: mobile ? 2 : 1.5,
          rowGap: mobile ? 2.25 : 1.5,
          mb: 2.25,
        }}
      >
        <Stat label="Project value" value={total_value} />
        <Stat label="Released" value={released_total} color={tokens.successText} dot={tokens.success} />
        <Stat label="In escrow" value={in_escrow_total} color={tokens.pendingText} dot={tokens.pending} />
        <Stat label="Unfunded" value={unfunded_remaining} color={tokens.text3} dot="rgba(0,0,0,0.18)" />
      </Box>
      <Box sx={{ height: 8, borderRadius: "999px", bgcolor: "rgba(0,0,0,0.06)", display: "flex", overflow: "hidden", gap: "2px" }}>
        <Box sx={{ height: "100%", bgcolor: tokens.success, width: `${relPct}%`, transition: "width .5s cubic-bezier(.2,.8,.3,1)" }} />
        <Box sx={{ height: "100%", bgcolor: tokens.pending, width: `${escPct}%`, transition: "width .5s cubic-bezier(.2,.8,.3,1)" }} />
      </Box>
    </Box>
  );
}

/* ── Attachment chip ───────────────────────────────────────────────────────── */

export function AttachChip({ name, icon }: { name: string; icon?: React.ReactNode }) {
  return (
    <Box
      component="span"
      sx={{ display: "inline-flex", alignItems: "center", gap: 0.875, height: 32, px: 1.25, border: `1px solid ${tokens.border}`, borderRadius: "8px", bgcolor: tokens.surface, fontFamily: tokens.mono, fontSize: 11.5, color: tokens.text2, whiteSpace: "nowrap" }}
    >
      {icon}
      {name}
    </Box>
  );
}

/* ── Avatar initials helper ────────────────────────────────────────────────── */

export function initials(name?: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
}
