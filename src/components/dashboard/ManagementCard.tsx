"use client";

import { useState, type ReactNode } from "react";
import { Box, Typography, IconButton, Menu, MenuItem, Divider, ListItemIcon } from "@mui/material";
import { MoreVert as MoreVertIcon, ChevronRight as ChevronRightIcon, ImageOutlined } from "@mui/icons-material";
import { tokens } from "@/theme";

/* ── Status pill ── */
export type CardTone = "success" | "info" | "pending" | "error" | "neutral";
const TONES: Record<CardTone, { bg: string; color: string }> = {
  success: { bg: tokens.successTint, color: tokens.successText },
  info: { bg: "rgba(37,99,235,0.10)", color: "#1d4ed8" },
  pending: { bg: tokens.pendingTint, color: tokens.pendingText },
  error: { bg: tokens.errorTint, color: tokens.errorText },
  neutral: { bg: "rgba(0,0,0,0.05)", color: tokens.text2 },
};
export function StatusPill({ tone, label }: { tone: CardTone; label: string }) {
  const c = TONES[tone];
  return (
    <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.75, height: 24, px: 1.25, borderRadius: "999px", fontSize: 12, fontWeight: 600, bgcolor: c.bg, color: c.color, whiteSpace: "nowrap", flex: "none" }}>
      <Box component="span" sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "currentColor" }} />{label}
    </Box>
  );
}

/* ── Category pill ── */
export function CategoryPill({ children }: { children: ReactNode }) {
  return <Box component="span" sx={{ display: "inline-flex", alignItems: "center", height: 24, px: 1.375, borderRadius: "999px", fontSize: 11.5, fontWeight: 600, letterSpacing: "0.01em", bgcolor: "rgba(0,0,0,0.05)", color: tokens.text2, whiteSpace: "nowrap" }}>{children}</Box>;
}

/* ── Kebab overflow menu (actions never trigger the card's click) ── */
export interface MenuAction {
  icon?: ReactNode;
  label: string;
  danger?: boolean;
  onClick?: () => void;
  sep?: boolean;
}
export function KebabMenu({ items }: { items: MenuAction[] }) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  if (!items.length) return null;
  const stop = (e: React.MouseEvent) => e.stopPropagation();
  return (
    <Box onClick={stop} sx={{ flex: "none" }}>
      <IconButton size="small" aria-label="More actions"
        onClick={e => { e.stopPropagation(); setAnchorEl(e.currentTarget); }}
        sx={{ width: 34, height: 34, borderRadius: "9px", color: tokens.text3, "&:hover": { bgcolor: "rgba(0,0,0,0.05)", color: tokens.text } }}>
        <MoreVertIcon sx={{ fontSize: 20 }} />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={e => { (e as React.MouseEvent).stopPropagation?.(); setAnchorEl(null); }}
        onClick={stop}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{ paper: { sx: { mt: 0.75, minWidth: 188, borderRadius: "12px", boxShadow: "0 14px 38px rgba(0,0,0,0.14)", border: `1px solid ${tokens.border}`, p: 0.75 } } }}>
        {items.map((it, i) =>
          it.sep ? (
            <Divider key={i} sx={{ my: 0.625, mx: 0.75 }} />
          ) : (
            <MenuItem key={i}
              onClick={e => { e.stopPropagation(); setAnchorEl(null); it.onClick?.(); }}
              sx={{ borderRadius: "8px", px: 1.375, py: 1.125, fontSize: 13.5, fontWeight: 500, color: it.danger ? tokens.errorText : tokens.text, "&:hover": { bgcolor: it.danger ? tokens.errorTint : tokens.surface2 } }}>
              {it.icon && <ListItemIcon sx={{ minWidth: 0, mr: 1.375, color: "inherit" }}>{it.icon}</ListItemIcon>}
              {it.label}
            </MenuItem>
          ),
        )}
      </Menu>
    </Box>
  );
}

/* ── Fact strip: label over value, thin dividers ── */
export interface Fact {
  label: string;
  value: ReactNode;
  color?: string;
  mono?: boolean;
}
export function Facts({ items, mobile }: { items: Fact[]; mobile?: boolean }) {
  return (
    <Box sx={{ display: "flex", flexWrap: mobile ? "wrap" : "nowrap", rowGap: 1.5, alignItems: "stretch" }}>
      {items.map((f, i) => (
        <Box key={i} sx={{ display: "flex", alignItems: "stretch" }}>
          {i > 0 && <Box aria-hidden sx={{ width: "1px", bgcolor: tokens.border, alignSelf: "stretch", mx: mobile ? 1.75 : 2.25, flex: "none" }} />}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.375, minWidth: 0 }}>
            <Typography sx={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: tokens.text3 }}>{f.label}</Typography>
            <Typography sx={{ fontSize: 14.5, fontWeight: 600, letterSpacing: "-0.01em", lineHeight: 1.1, color: f.color || tokens.text, whiteSpace: "nowrap", fontFamily: f.mono ? tokens.mono : undefined }}>{f.value}</Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
}

/* ── Status banner ── */
export function Banner({ tone, icon, label, text }: { tone: "error" | "quiet"; icon: ReactNode; label: string; text?: string }) {
  const err = tone === "error";
  const fg = err ? tokens.errorText : tokens.text2;
  return (
    <Box sx={{ display: "flex", gap: 1.25, p: "11px 13px", borderRadius: `${tokens.radius.tile}px`, bgcolor: err ? tokens.errorTint : "rgba(0,0,0,0.035)", border: `1px solid ${err ? "rgba(220,38,38,0.16)" : tokens.border}` }}>
      <Box sx={{ color: err ? tokens.errorText : tokens.text3, flex: "none", mt: "1px", display: "flex" }}>{icon}</Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: fg }}>{label}</Typography>
        {text && <Typography sx={{ fontSize: 12.5, lineHeight: 1.5, color: fg, opacity: err ? 0.92 : 0.82, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{text}</Typography>}
      </Box>
    </Box>
  );
}

/* ── Cover thumbnail (real image or striped placeholder) ── */
export function CoverThumb({ src, size = 92, radius = 12 }: { src?: string | null; size?: number; radius?: number }) {
  if (src) {
    return (
      <Box sx={{ width: size, height: size, borderRadius: `${radius}px`, border: `1px solid ${tokens.border}`, overflow: "hidden", flex: "none" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      </Box>
    );
  }
  return (
    <Box sx={{ width: size, height: size, borderRadius: `${radius}px`, border: `1px solid ${tokens.border}`, bgcolor: tokens.surface2, display: "flex", alignItems: "center", justifyContent: "center", color: tokens.text3, flex: "none" }}>
      <ImageOutlined sx={{ fontSize: size * 0.34 }} />
    </Box>
  );
}

/* ── Disclosure chevron (whole card opens detail) ── */
export function Chevron({ size = 20 }: { size?: number }) {
  return (
    <Box className="mg-chev" sx={{ color: tokens.text3, flex: "none", display: "flex", transition: "color .15s, transform .15s" }}>
      <ChevronRightIcon sx={{ fontSize: size }} />
    </Box>
  );
}

/* Shared card shell sx — whole card clickable, lifts chevron on hover. */
export const mgCardSx = {
  position: "relative" as const,
  bgcolor: tokens.surface,
  border: `1px solid ${tokens.border}`,
  borderRadius: `${tokens.radius.card}px`,
  cursor: "pointer",
  transition: "border-color .15s ease, box-shadow .15s ease",
  "&:hover": { borderColor: tokens.borderStrong, boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.05)" },
  "&:hover .mg-chev": { color: tokens.text2, transform: "translateX(2px)" },
};
