"use client";

import type { ReactNode } from "react";
import { Box } from "@mui/material";
import { tokens } from "@/theme";

export type ChipStatus = "completed" | "success" | "pending" | "failed" | "error" | "escrow" | "neutral";

const MAP: Record<ChipStatus, { bg: string; color: string }> = {
  completed: { bg: tokens.successTint, color: tokens.successText },
  success: { bg: tokens.successTint, color: tokens.successText },
  pending: { bg: tokens.pendingTint, color: tokens.pendingText },
  escrow: { bg: tokens.pendingTint, color: tokens.pendingText },
  failed: { bg: tokens.errorTint, color: tokens.errorText },
  error: { bg: tokens.errorTint, color: tokens.errorText },
  neutral: { bg: "rgba(0,0,0,0.05)", color: tokens.text2 },
};

/** Small tinted status pill with a leading dot. */
export default function StatusChip({
  status = "neutral",
  children,
  dot = true,
}: {
  status?: ChipStatus;
  children: ReactNode;
  dot?: boolean;
}) {
  const c = MAP[status] ?? MAP.neutral;
  return (
    <Box
      component='span'
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.75,
        height: 24,
        px: 1.25,
        borderRadius: "999px",
        fontSize: 12,
        fontWeight: 600,
        bgcolor: c.bg,
        color: c.color,
      }}>
      {dot && <Box component='span' sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "currentColor" }} />}
      {children}
    </Box>
  );
}
