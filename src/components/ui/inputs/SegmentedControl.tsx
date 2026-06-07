"use client";

import { Box, Typography } from "@mui/material";
import { tokens } from "./tokens";

export interface SegmentedOption {
  value: string;
  label: string;
  sub?: string;
}

export interface SegmentedControlProps {
  value: string;
  onChange: (value: string) => void;
  options: SegmentedOption[];
  fullWidth?: boolean;
  ariaLabel?: string;
}

export default function SegmentedControl({ value, onChange, options, fullWidth, ariaLabel }: SegmentedControlProps) {
  return (
    <Box
      role="radiogroup"
      aria-label={ariaLabel}
      sx={{
        display: fullWidth ? "grid" : "inline-flex",
        gridTemplateColumns: fullWidth ? `repeat(${options.length}, 1fr)` : undefined,
        gap: 0.5,
        p: 0.5,
        borderRadius: "10px",
        backgroundColor: tokens.fill,
        border: `1px solid ${tokens.border}`,
      }}>
      {options.map((o) => {
        const active = value === o.value;
        return (
          <Box
            key={o.value}
            role="radio"
            aria-checked={active}
            tabIndex={0}
            onClick={() => onChange(o.value)}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onChange(o.value); } }}
            sx={{
              cursor: "pointer",
              textAlign: "center",
              py: 1,
              px: 2,
              borderRadius: "7px",
              backgroundColor: active ? "#fff" : "transparent",
              border: active ? `1px solid ${tokens.border}` : "1px solid transparent",
              boxShadow: active ? "0 1px 3px rgba(15,23,42,0.10)" : "none",
              transition: "background .15s, box-shadow .15s",
              "&:focus-visible": { outline: "none", boxShadow: "0 0 0 3px rgba(0,113,227,0.2)" },
            }}>
            <Typography sx={{ fontSize: 14, fontWeight: 500, color: active ? tokens.heading : tokens.body }}>{o.label}</Typography>
            {o.sub && <Typography sx={{ fontSize: 12, color: active ? tokens.accent : tokens.muted, fontWeight: active ? 500 : 400 }}>{o.sub}</Typography>}
          </Box>
        );
      })}
    </Box>
  );
}
