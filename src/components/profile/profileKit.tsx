"use client";

import { type ReactNode } from "react";
import { Box, Typography, IconButton } from "@mui/material";
import { PhotoCameraOutlined, CheckRounded, WorkspacePremiumOutlined, CloseRounded, EditOutlined, DeleteOutline } from "@mui/icons-material";
import { tokens } from "@/theme";

/* ── Level / hue helpers ── */
export const LEVEL_HUE: Record<string, number> = { Bronze: 45, Silver: 255, Gold: 85, Platinum: 210, Diamond: 190 };
export function hueFromName(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
  return h;
}
export function initialsOf(name: string): string {
  return name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join("").toUpperCase() || "?";
}

/* ── Verified tick (accent badge) ── */
export function VerifiedTick({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block", flex: "none" }} aria-label="Verified">
      <path fill={tokens.accent} d="M12 1.6l2.5 1.8 3.05-.2 1 2.9 2.5 1.75-1 2.9 1 2.9-2.5 1.75-1 2.9-3.05-.2L12 22.4l-2.5-1.8-3.05.2-1-2.9L2.95 16.15l1-2.9-1-2.9 2.5-1.75 1-2.9 3.05.2z" />
      <path fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" d="M8.4 12.2l2.4 2.3 4.6-4.8" />
    </svg>
  );
}

/* ── Avatar: photo or tinted initials, optional verified tick / editable camera ── */
export function ProfileAvatar({ name, src, size = 72, hue, verified, editable, onEdit }: { name: string; src?: string | null; size?: number; hue?: number; verified?: boolean; editable?: boolean; onEdit?: () => void }) {
  const h = hue ?? hueFromName(name);
  return (
    <Box sx={{ position: "relative", width: size, height: size, flex: "none" }}>
      <Box sx={{ width: size, height: size, borderRadius: "50%", bgcolor: `oklch(0.93 0.03 ${h})`, color: `oklch(0.45 0.07 ${h})`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: size * 0.36, letterSpacing: "-0.01em", border: "1px solid rgba(0,0,0,0.05)", overflow: "hidden" }}>
        {src ? <Box component="img" src={src} alt={name} sx={{ width: "100%", height: "100%", objectFit: "cover" }} /> : initialsOf(name)}
      </Box>
      {editable && (
        <IconButton onClick={onEdit} title="Change photo" sx={{ position: "absolute", right: -2, bottom: -2, width: Math.round(size * 0.34), height: Math.round(size * 0.34), bgcolor: "#000", color: "#fff", border: "2px solid #fff", p: 0, "&:hover": { bgcolor: "rgba(0,0,0,0.8)" } }}>
          <PhotoCameraOutlined sx={{ fontSize: Math.round(size * 0.18) }} />
        </IconButton>
      )}
      {verified && !editable && (
        <Box sx={{ position: "absolute", right: -1, bottom: -1, lineHeight: 0, bgcolor: tokens.surface, borderRadius: "50%" }}>
          <VerifiedTick size={Math.round(size * 0.3)} />
        </Box>
      )}
    </Box>
  );
}

/* ── Stars ── */
const AMBER = "#d97706";
export function StarGlyph({ size = 14, color = AMBER }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{ display: "block" }}>
      <path d="M12 2.6l2.7 5.9 6.4.6-4.8 4.3 1.4 6.3L12 16.9 6.3 19.7l1.4-6.3-4.8-4.3 6.4-.6z" />
    </svg>
  );
}
export function Stars5({ rating, size = 15, gap = 2 }: { rating: number; size?: number; gap?: number }) {
  const pct = (Math.max(0, Math.min(5, rating)) / 5) * 100;
  const Row = ({ color, clip }: { color: string; clip?: boolean }) => (
    <Box sx={{ display: "flex", gap: `${gap}px`, position: clip ? "absolute" : "static", inset: 0, width: clip ? `${pct}%` : "auto", overflow: "hidden" }}>
      {[0, 1, 2, 3, 4].map(i => <StarGlyph key={i} size={size} color={color} />)}
    </Box>
  );
  return (
    <Box sx={{ position: "relative", display: "inline-flex", flex: "none" }} aria-label={`${rating} out of 5`}>
      <Row color="rgba(0,0,0,0.12)" />
      <Row color={AMBER} clip />
    </Box>
  );
}

/* ── Level badge ── */
export function LevelBadge({ level, small }: { level: string; small?: boolean }) {
  const hue = LEVEL_HUE[level] ?? 210;
  return (
    <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.75, height: small ? 22 : 26, px: 1.375, borderRadius: "999px", fontSize: small ? 10.5 : 11.5, fontWeight: 700, letterSpacing: "0.03em", bgcolor: `oklch(0.95 0.04 ${hue})`, color: `oklch(0.42 0.09 ${hue})` }}>
      <WorkspacePremiumOutlined sx={{ fontSize: small ? 13 : 15 }} />{level}
    </Box>
  );
}

/* ── Section card ── */
export function SectionCard({ icon, title, hint, action, children, sx }: { icon?: ReactNode; title: string; hint?: string; action?: ReactNode; children: ReactNode; sx?: object }) {
  return (
    <Box component="section" sx={{ bgcolor: tokens.surface, border: `1px solid ${tokens.border}`, borderRadius: `${tokens.radius.card}px`, ...sx }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1.5, p: "18px 22px" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.375, minWidth: 0 }}>
          {icon && <Box sx={{ color: tokens.text3, display: "flex", flex: "none" }}>{icon}</Box>}
          <Typography component="h3" sx={{ m: 0, fontSize: 16, fontWeight: 600, letterSpacing: "-0.015em", whiteSpace: "nowrap" }}>{title}</Typography>
        </Box>
        {action}
      </Box>
      {hint && <Box sx={{ px: "22px" }}><Typography sx={{ fontSize: 12.5, color: tokens.text3, mt: "-4px" }}>{hint}</Typography></Box>}
      <Box sx={{ p: "0 22px 22px", pt: hint ? "14px" : 0 }}>{children}</Box>
    </Box>
  );
}

/* ── Labeled field ── */
export function Field({ label, hint, optional, children }: { label: string; hint?: string; optional?: boolean; children: ReactNode }) {
  return (
    <Box>
      <Box component="label" sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", fontSize: 12.5, fontWeight: 600, color: tokens.text2, mb: 1, letterSpacing: "-0.005em" }}>
        <Box component="span" sx={{ whiteSpace: "nowrap" }}>{label}</Box>
        {optional && <Box component="span" sx={{ fontSize: 11, color: tokens.text3, fontWeight: 400 }}>Optional</Box>}
      </Box>
      {children}
      {hint && <Typography sx={{ fontSize: 12, color: tokens.text3, mt: 0.75 }}>{hint}</Typography>}
    </Box>
  );
}

/* ── Locked (read-only) field ── */
export function LockedField({ label, value, icon, note }: { label: string; value: string; icon?: ReactNode; note?: string }) {
  return (
    <Box>
      <Typography component="label" sx={{ display: "block", fontSize: 12.5, fontWeight: 600, color: tokens.text2, mb: 1 }}>{label}</Typography>
      <Box sx={{ height: 44, px: 1.75, display: "flex", alignItems: "center", gap: 1.125, border: `1px solid ${tokens.border}`, borderRadius: `${tokens.radius.input}px`, bgcolor: tokens.surface2, color: tokens.text2, fontSize: 15 }}>
        {icon && <Box sx={{ color: tokens.text3, display: "flex" }}>{icon}</Box>}
        <Box sx={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</Box>
      </Box>
      {note && <Typography sx={{ fontSize: 12, color: tokens.text3, mt: 0.75 }}>{note}</Typography>}
    </Box>
  );
}

/* ── Language chip ── */
const PROFICIENCY: Record<string, { label: string; bg: string; color: string }> = {
  basic: { label: "Basic", bg: "rgba(0,0,0,0.04)", color: tokens.text3 },
  conversational: { label: "Conversational", bg: "rgba(0,0,0,0.06)", color: tokens.text2 },
  fluent: { label: "Fluent", bg: tokens.accentFill, color: tokens.accent },
  native: { label: "Native", bg: tokens.successTint, color: tokens.successText },
};
export function LangChip({ name, proficiency, onRemove }: { name: string; proficiency: string; onRemove?: () => void }) {
  const cfg = PROFICIENCY[proficiency] ?? PROFICIENCY.basic;
  return (
    <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 1, height: 34, pl: 1.625, pr: onRemove ? 0.75 : 1.625, borderRadius: "999px", bgcolor: "rgba(0,0,0,0.04)", fontSize: 13, fontWeight: 500, whiteSpace: "nowrap" }}>
      {name}
      <Box component="span" sx={{ display: "inline-flex", alignItems: "center", height: 22, px: 1.125, borderRadius: "999px", fontSize: 11, fontWeight: 600, bgcolor: cfg.bg, color: cfg.color }}>{cfg.label}</Box>
      {onRemove && (
        <IconButton onClick={onRemove} title="Remove" sx={{ width: 22, height: 22, color: tokens.text3, p: 0, "&:hover": { bgcolor: "rgba(0,0,0,0.08)", color: tokens.text } }}>
          <CloseRounded sx={{ fontSize: 13 }} />
        </IconButton>
      )}
    </Box>
  );
}

/* ── Entry row (education / certification) ── */
export function EntryRow({ icon, title, sub, onEdit, onDelete, deleting }: { icon: ReactNode; title: string; sub: string; onEdit?: () => void; onDelete?: () => void; deleting?: boolean }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.75, py: 1.75, "&:not(:first-of-type)": { borderTop: `1px solid ${tokens.border}` }, "&:hover .entry-acts": { opacity: 1 } }}>
      <Box sx={{ width: 38, height: 38, borderRadius: "10px", flex: "none", bgcolor: "rgba(0,0,0,0.04)", color: tokens.text2, display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography sx={{ fontSize: 14.5, fontWeight: 600, letterSpacing: "-0.01em", lineHeight: 1.3 }}>{title}</Typography>
        <Typography sx={{ fontSize: 13, color: tokens.text2, mt: "2px" }}>{sub}</Typography>
      </Box>
      {(onEdit || onDelete) && (
        <Box className="entry-acts" sx={{ display: "flex", gap: 0.5, flex: "none", opacity: 0.55, transition: "opacity .15s" }}>
          {onEdit && <IconButton onClick={onEdit} sx={{ width: 28, height: 28, borderRadius: "7px", color: tokens.text2, "&:hover": { bgcolor: "rgba(0,0,0,0.05)", color: tokens.text } }}><EditOutlined sx={{ fontSize: 15 }} /></IconButton>}
          {onDelete && <IconButton onClick={onDelete} disabled={deleting} sx={{ width: 28, height: 28, borderRadius: "7px", color: tokens.text2, "&:hover": { bgcolor: tokens.errorTint, color: tokens.errorText } }}><DeleteOutline sx={{ fontSize: 15 }} /></IconButton>}
        </Box>
      )}
    </Box>
  );
}

/* ── Verification row ── */
export function VerifyRow({ icon, title, sub, verified, onVerify }: { icon: ReactNode; title: string; sub: string; verified: boolean; onVerify?: () => void }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.75, py: 1.875, "&:not(:first-of-type)": { borderTop: `1px solid ${tokens.border}` } }}>
      <Box sx={{ width: 40, height: 40, borderRadius: "11px", flex: "none", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: verified ? tokens.successTint : "rgba(0,0,0,0.04)", color: verified ? tokens.success : tokens.text3 }}>{icon}</Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: 14.5, fontWeight: 600, letterSpacing: "-0.01em" }}>{title}</Typography>
        <Typography sx={{ fontSize: 12.5, color: tokens.text2, mt: "1px" }}>{sub}</Typography>
      </Box>
      {verified ? (
        <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, height: 26, px: 1.25, borderRadius: "999px", bgcolor: tokens.successTint, color: tokens.successText, fontSize: 12, fontWeight: 600, flex: "none" }}>
          <CheckRounded sx={{ fontSize: 14 }} />Verified
        </Box>
      ) : (
        <Box component="button" onClick={onVerify} sx={{ flex: "none", height: 34, px: 1.75, borderRadius: "999px", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600, border: `1px solid ${tokens.borderStrong}`, bgcolor: tokens.surface, color: tokens.text, "&:hover": { bgcolor: tokens.surface2 } }}>Verify now</Box>
      )}
    </Box>
  );
}

/* ── Empty state ── */
export function Empty({ icon, title, sub, action }: { icon: ReactNode; title: string; sub?: string; action?: ReactNode }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 1.5, py: "30px", px: 2.5 }}>
      <Box sx={{ width: 52, height: 52, borderRadius: "14px", bgcolor: "rgba(0,0,0,0.04)", color: tokens.text3, display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</Box>
      <Box>
        <Typography sx={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.01em" }}>{title}</Typography>
        {sub && <Typography sx={{ fontSize: 12.5, color: tokens.text2, mt: 0.375, maxWidth: 300, mx: "auto" }}>{sub}</Typography>}
      </Box>
      {action}
    </Box>
  );
}

/* ── Add pill (dashed) + small round icon button (used in section headers) ── */
export function AddPill({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <Box component="button" onClick={onClick} sx={{ display: "inline-flex", alignItems: "center", gap: 0.875, height: 38, px: 2, borderRadius: "999px", border: `1px dashed ${tokens.borderStrong}`, bgcolor: "transparent", fontFamily: "inherit", fontSize: 13.5, fontWeight: 500, color: tokens.text2, cursor: "pointer", whiteSpace: "nowrap", transition: "border-color .15s, color .15s, background .15s", "&:hover": { borderColor: tokens.accent, color: tokens.accent, bgcolor: tokens.accentFill } }}>{children}</Box>
  );
}
export function RoundIconBtn({ children, onClick, title }: { children: ReactNode; onClick?: () => void; title?: string }) {
  return (
    <IconButton onClick={onClick} title={title} sx={{ width: 34, height: 34, border: `1px solid ${tokens.borderStrong}`, bgcolor: tokens.surface, color: tokens.text2, "&:hover": { borderColor: tokens.accent, color: tokens.accent } }}>{children}</IconButton>
  );
}
