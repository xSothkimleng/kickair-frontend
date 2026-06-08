"use client";

import type { ReactNode } from "react";
import { Box } from "@mui/material";
import { tokens } from "@/theme";

/**
 * ABA step / state annotation tag (e.g. "STEP 6").
 *
 * Hidden in the live app. Set `NEXT_PUBLIC_SHOW_PAYMENT_ANNOTATIONS=true` to
 * render them — used to produce the annotated build that ABA requires for the
 * UI-payment-flow review submission.
 */
const SHOW = process.env.NEXT_PUBLIC_SHOW_PAYMENT_ANNOTATIONS === "true";

export default function Annot({ children }: { children: ReactNode | ReactNode[] }) {
  if (!SHOW) return null;
  const items = Array.isArray(children) ? children : [children];
  return (
    <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
      {items.map((c, i) => (
        <Box
          key={i}
          component='span'
          sx={{
            fontFamily: tokens.mono,
            fontSize: 10.5,
            fontWeight: 600,
            letterSpacing: "0.02em",
            color: tokens.accent,
            bgcolor: tokens.accentFill,
            border: `1px solid rgba(${tokens.accentRgb}, 0.25)`,
            borderRadius: "6px",
            px: 1,
            py: "3px",
            whiteSpace: "nowrap",
          }}>
          {c}
        </Box>
      ))}
    </Box>
  );
}
