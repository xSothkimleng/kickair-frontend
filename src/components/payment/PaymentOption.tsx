"use client";

import type { ReactNode } from "react";
import { Box } from "@mui/material";
import { tokens } from "@/theme";

/**
 * Selectable radio-card. Generic container — pass the inner content as children.
 * Used for the wallet-vs-ABA choice, the ABA method list, and withdraw
 * destinations.
 */
export default function PaymentOption({
  selected,
  onClick,
  disabled,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <Box
      component='button'
      type='button'
      onClick={onClick}
      disabled={disabled}
      sx={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 1.75,
        p: "16px 18px",
        borderRadius: `${tokens.radius.tile}px`,
        border: "1px solid",
        borderColor: selected ? tokens.accent : tokens.borderStrong,
        bgcolor: selected ? tokens.accentFill : tokens.surface,
        font: "inherit",
        textAlign: "left",
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.55 : 1,
        transition: "border-color .15s ease, background .15s ease",
        "&:hover": { bgcolor: selected ? tokens.accentFill : tokens.surface2 },
      }}>
      <Box
        aria-hidden
        sx={{
          width: 20,
          height: 20,
          borderRadius: "50%",
          flex: "none",
          border: "1.5px solid",
          borderColor: selected ? tokens.accent : tokens.borderStrong,
          position: "relative",
          transition: "border-color .15s ease",
          "&::after": selected
            ? { content: '""', position: "absolute", inset: "3px", borderRadius: "50%", bgcolor: tokens.accent }
            : undefined,
        }}
      />
      <Box sx={{ flex: 1, minWidth: 0 }}>{children}</Box>
    </Box>
  );
}
