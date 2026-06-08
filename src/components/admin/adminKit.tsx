"use client";

import { Box, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { tokens } from "@/theme";

/* Card shell wrapping admin tables / queues. */
export const adminCardSx = {
  bgcolor: tokens.surface,
  border: `1px solid ${tokens.border}`,
  borderRadius: `${tokens.radius.card}px`,
  overflow: "hidden",
};

/* Token-styled table sx — apply to <Table>. Header row → surface2, rows → 1px dividers + hover. */
export const adminTableSx = {
  "& .MuiTableCell-root": { borderBottom: `1px solid ${tokens.border}`, fontSize: 13.5, color: tokens.text, py: 1.75 },
  "& .MuiTableHead-root .MuiTableCell-root": {
    bgcolor: tokens.surface2, fontSize: 11, fontWeight: 600, color: tokens.text3,
    textTransform: "uppercase", letterSpacing: "0.06em", py: 1.25,
  },
  "& .MuiTableBody-root .MuiTableRow-root:last-of-type .MuiTableCell-root": { borderBottom: 0 },
  "& .MuiTableBody-root .MuiTableRow-root:hover": { bgcolor: tokens.surface2 },
};

export interface PillOption {
  id: string;
  label: string;
  count?: number;
}

export function FilterPills({ options, value, onChange }: { options: PillOption[]; value: string; onChange: (id: string) => void }) {
  return (
    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
      {options.map(o => {
        const on = value === o.id;
        return (
          <Box
            key={o.id}
            component="button"
            onClick={() => onChange(o.id)}
            sx={{
              display: "inline-flex", alignItems: "center", gap: 0.75, height: 34, px: 1.5, borderRadius: "999px",
              cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600,
              border: `1px solid ${on ? "transparent" : tokens.border}`,
              bgcolor: on ? "#000" : tokens.surface, color: on ? "#fff" : tokens.text2,
              transition: "background .12s, border-color .12s, color .12s",
              "&:hover": on ? {} : { borderColor: tokens.borderStrong, color: tokens.text },
            }}>
            {o.label}
            {o.count != null && <Box component="span" sx={{ fontSize: 11.5, fontWeight: 700, color: on ? "rgba(255,255,255,0.7)" : tokens.text3 }}>{o.count}</Box>}
          </Box>
        );
      })}
    </Box>
  );
}

export interface TabOption {
  id: string;
  label: string;
  count?: number;
}

export function SectionTabs({ tabs, value, onChange }: { tabs: TabOption[]; value: string; onChange: (id: string) => void }) {
  return (
    <Box sx={{ display: "flex", gap: 0.5, borderBottom: `1px solid ${tokens.border}`, overflowX: "auto" }}>
      {tabs.map(t => {
        const on = value === t.id;
        return (
          <Box
            key={t.id}
            component="button"
            onClick={() => onChange(t.id)}
            sx={{
              position: "relative", border: 0, bgcolor: "transparent", cursor: "pointer", fontFamily: "inherit",
              px: 1.75, py: 1.625, fontSize: 14, fontWeight: 600, whiteSpace: "nowrap",
              color: on ? tokens.text : tokens.text2, display: "inline-flex", alignItems: "center", gap: 0.875,
              transition: "color .12s", "&:hover": { color: tokens.text },
              "&::after": on ? { content: '""', position: "absolute", left: 8, right: 8, bottom: -1, height: 2, bgcolor: "#000", borderRadius: "2px" } : {},
            }}>
            {t.label}
            {t.count != null && t.count > 0 && (
              <Box component="span" sx={{ minWidth: 18, height: 18, px: 0.625, borderRadius: "999px", bgcolor: on ? "rgba(0,0,0,0.08)" : tokens.surface2, color: tokens.text2, fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{t.count}</Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
}

export function AdminEmpty({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 1.5, py: 7, px: 3 }}>
      <Box sx={{ width: 64, height: 64, borderRadius: "50%", bgcolor: tokens.canvas, border: `1px solid ${tokens.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: tokens.text3 }}>{icon}</Box>
      <Box sx={{ maxWidth: 360 }}>
        <Typography sx={{ fontSize: 17, fontWeight: 600, letterSpacing: "-0.015em" }}>{title}</Typography>
        <Typography sx={{ fontSize: 13.5, color: tokens.text2, mt: 0.5, lineHeight: 1.5 }}>{body}</Typography>
      </Box>
    </Box>
  );
}

/* Section header: icon tile + title + optional count badge + description. */
export function SectionHead({ icon, title, count, desc }: { icon: ReactNode; title: string; count?: number | null; desc: string }) {
  return (
    <Box sx={{ display: "flex", gap: 1.625, alignItems: "flex-start" }}>
      <Box sx={{ width: 40, height: 40, borderRadius: "11px", bgcolor: tokens.surface, border: `1px solid ${tokens.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: tokens.text, flexShrink: 0 }}>{icon}</Box>
      <Box sx={{ minWidth: 0 }}>
        <Box sx={{ display: "flex", gap: 1.25, alignItems: "center" }}>
          <Typography sx={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.02em" }}>{title}</Typography>
          {count != null && (
            <Box component="span" sx={{ minWidth: 24, height: 22, px: 1, borderRadius: "999px", bgcolor: tokens.pendingTint, color: tokens.pendingText, fontSize: 12, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center", fontVariantNumeric: "tabular-nums" }}>{count}</Box>
          )}
        </Box>
        <Typography sx={{ fontSize: 13.5, color: tokens.text2, mt: 0.375, maxWidth: 620, lineHeight: 1.5 }}>{desc}</Typography>
      </Box>
    </Box>
  );
}
