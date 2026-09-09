"use client";

import { type ReactNode } from "react";
import { css, cva, cx } from "styled-system/css";
import { Camera, Check, Award, X, Pencil, Trash2 } from "lucide-react";
import { badge, button, card, iconButton } from "@/components/ds";

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
const tickSvg = css({ display: "block", flex: "none" });
export function VerifiedTick({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={tickSvg} aria-label="Verified">
      <path fill="var(--colors-accent)" d="M12 1.6l2.5 1.8 3.05-.2 1 2.9 2.5 1.75-1 2.9 1 2.9-2.5 1.75-1 2.9-3.05-.2L12 22.4l-2.5-1.8-3.05.2-1-2.9L2.95 16.15l1-2.9-1-2.9 2.5-1.75 1-2.9 3.05.2z" />
      <path fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" d="M8.4 12.2l2.4 2.3 4.6-4.8" />
    </svg>
  );
}

/* ── Avatar: photo or tinted initials, optional verified tick / editable camera ── */
const avatarWrap = css({ position: "relative", flex: "none" });
const avatarFace = css({ borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, letterSpacing: "-0.01em", borderWidth: "1px", borderStyle: "solid", borderColor: "rgba(0,0,0,0.05)", overflow: "hidden" });
const avatarImg = css({ w: "100%", h: "100%", objectFit: "cover" });
// Sizes are derived from the `size` prop at runtime, so they stay inline; everything static lives in the recipe.
const cameraBtn = css(iconButton.raw({ shape: "round" }), { position: "absolute", right: "-2px", bottom: "-2px", bg: "#000", color: "#fff", border: "2px solid #fff", _hover: { bg: "rgba(0,0,0,0.8)", color: "#fff" } });
const tickWrap = css({ position: "absolute", right: "-1px", bottom: "-1px", lineHeight: 0, bg: "surface", borderRadius: "50%" });

export function ProfileAvatar({ name, src, size = 72, hue, verified, editable, onEdit }: { name: string; src?: string | null; size?: number; hue?: number; verified?: boolean; editable?: boolean; onEdit?: () => void }) {
  const h = hue ?? hueFromName(name);
  const btn = Math.round(size * 0.34);
  return (
    <div className={avatarWrap} style={{ width: size, height: size }}>
      <div className={avatarFace} style={{ width: size, height: size, background: `oklch(0.93 0.03 ${h})`, color: `oklch(0.45 0.07 ${h})`, fontSize: size * 0.36 }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- remote avatars from many hosts */}
        {src ? <img src={src} alt={name} className={avatarImg} /> : initialsOf(name)}
      </div>
      {editable && (
        <button type="button" onClick={onEdit} title="Change photo" aria-label="Change photo" className={cameraBtn} style={{ width: btn, height: btn }}>
          <Camera size={Math.round(size * 0.18)} />
        </button>
      )}
      {verified && !editable && (
        <div className={tickWrap}>
          <VerifiedTick size={Math.round(size * 0.3)} />
        </div>
      )}
    </div>
  );
}

/* ── Stars ── */
const AMBER = "#d97706";
const glyphSvg = css({ display: "block" });
export function StarGlyph({ size = 14, color = AMBER }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={glyphSvg}>
      <path d="M12 2.6l2.7 5.9 6.4.6-4.8 4.3 1.4 6.3L12 16.9 6.3 19.7l1.4-6.3-4.8-4.3 6.4-.6z" />
    </svg>
  );
}
const starsWrap = css({ position: "relative", display: "inline-flex", flex: "none" });
const starsRow = css({ display: "flex", position: "static" });
const starsRowClip = css({ display: "flex", position: "absolute", inset: 0, overflow: "hidden" });
// gap / clip width come from props at runtime, so they stay inline.
function StarsRow({ color, clip, gap, pct, size }: { color: string; clip?: boolean; gap: number; pct: number; size: number }) {
  return (
    <div className={clip ? starsRowClip : starsRow} style={{ gap: `${gap}px`, width: clip ? `${pct}%` : undefined }}>
      {[0, 1, 2, 3, 4].map(i => <StarGlyph key={i} size={size} color={color} />)}
    </div>
  );
}
export function Stars5({ rating, size = 15, gap = 2 }: { rating: number; size?: number; gap?: number }) {
  const pct = (Math.max(0, Math.min(5, rating)) / 5) * 100;
  return (
    <div className={starsWrap} aria-label={`${rating} out of 5`}>
      <StarsRow color="rgba(0,0,0,0.12)" gap={gap} pct={pct} size={size} />
      <StarsRow color={AMBER} clip gap={gap} pct={pct} size={size} />
    </div>
  );
}

/* ── Level badge ── */
// Hue-tinted colours are computed per level at runtime (inline); the shape comes from the ds badge recipe.
const levelBadge = css(badge.raw(), { gap: "6px", px: "11px", py: 0, fontWeight: 700, letterSpacing: "0.03em", h: "26px", fontSize: "11.5px" });
const levelBadgeSmall = css(badge.raw(), { gap: "6px", px: "11px", py: 0, fontWeight: 700, letterSpacing: "0.03em", h: "22px", fontSize: "10.5px" });
export function LevelBadge({ level, small }: { level: string; small?: boolean }) {
  const hue = LEVEL_HUE[level] ?? 210;
  return (
    <span className={small ? levelBadgeSmall : levelBadge} style={{ background: `oklch(0.95 0.04 ${hue})`, color: `oklch(0.42 0.09 ${hue})` }}>
      <Award size={small ? 13 : 15} />{level}
    </span>
  );
}

/* ── Section card ── */
const sectionCard = css(card.raw({ padding: "none" }), { borderColor: "hairline" });
const sectionHead = css({ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", p: "18px 22px" });
const sectionTitleWrap = css({ display: "flex", alignItems: "center", gap: "11px", minW: 0 });
const sectionIcon = css({ color: "ink3", display: "flex", flex: "none" });
const sectionTitle = css({ m: 0, fontSize: "16px", fontWeight: 600, letterSpacing: "-0.015em", whiteSpace: "nowrap" });
const sectionHintWrap = css({ px: "22px" });
const sectionHint = css({ fontSize: "12.5px", color: "ink3", mt: "-4px" });
const sectionBody = css({ p: "0 22px 22px" });
const sectionBodyHinted = css({ p: "14px 22px 22px" });
export function SectionCard({ icon, title, hint, action, children, className }: { icon?: ReactNode; title: string; hint?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cx(sectionCard, className)}>
      <div className={sectionHead}>
        <div className={sectionTitleWrap}>
          {icon && <div className={sectionIcon}>{icon}</div>}
          <h3 className={sectionTitle}>{title}</h3>
        </div>
        {action}
      </div>
      {hint && <div className={sectionHintWrap}><p className={sectionHint}>{hint}</p></div>}
      <div className={hint ? sectionBodyHinted : sectionBody}>{children}</div>
    </section>
  );
}

/* ── Labeled field ── */
const fieldLabel = css({ display: "flex", alignItems: "baseline", justifyContent: "space-between", fontSize: "12.5px", fontWeight: 600, color: "ink2", mb: "8px", letterSpacing: "-0.005em" });
const fieldLabelText = css({ whiteSpace: "nowrap" });
const fieldOptional = css({ fontSize: "11px", color: "ink3", fontWeight: 400 });
const fieldHint = css({ fontSize: "12px", color: "ink3", mt: "6px" });
export function Field({ label, hint, optional, children }: { label: string; hint?: string; optional?: boolean; children: ReactNode }) {
  return (
    <div>
      <label className={fieldLabel}>
        <span className={fieldLabelText}>{label}</span>
        {optional && <span className={fieldOptional}>Optional</span>}
      </label>
      {children}
      {hint && <p className={fieldHint}>{hint}</p>}
    </div>
  );
}

/* ── Locked (read-only) field ── */
const lockedLabel = css({ display: "block", fontSize: "12.5px", fontWeight: 600, color: "ink2", mb: "8px" });
const lockedBox = css({ h: "44px", px: "14px", display: "flex", alignItems: "center", gap: "9px", borderWidth: "1px", borderStyle: "solid", borderColor: "hairline", borderRadius: "input", bg: "surface2", color: "ink2", fontSize: "15px" });
const lockedIcon = css({ color: "ink3", display: "flex" });
const lockedValue = css({ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" });
export function LockedField({ label, value, icon, note }: { label: string; value: string; icon?: ReactNode; note?: string }) {
  return (
    <div>
      <label className={lockedLabel}>{label}</label>
      <div className={lockedBox}>
        {icon && <div className={lockedIcon}>{icon}</div>}
        <div className={lockedValue}>{value}</div>
      </div>
      {note && <p className={fieldHint}>{note}</p>}
    </div>
  );
}

/* ── Language chip ── */
const PROFICIENCY: Record<string, { label: string; className: string }> = {
  basic: { label: "Basic", className: css({ bg: "rgba(0,0,0,0.04)", color: "ink3" }) },
  conversational: { label: "Conversational", className: css({ bg: "rgba(0,0,0,0.06)", color: "ink2" }) },
  fluent: { label: "Fluent", className: css({ bg: "accentFill", color: "accent" }) },
  native: { label: "Native", className: css({ bg: "successTint", color: "successText" }) },
};
const langChip = cva({
  base: { display: "inline-flex", alignItems: "center", gap: "8px", h: "34px", pl: "13px", borderRadius: "pill", bg: "rgba(0,0,0,0.04)", fontSize: "13px", fontWeight: 500, whiteSpace: "nowrap" },
  variants: { removable: { true: { pr: "6px" }, false: { pr: "13px" } } },
});
const langLevel = css({ display: "inline-flex", alignItems: "center", h: "22px", px: "9px", borderRadius: "pill", fontSize: "11px", fontWeight: 600 });
const langRemove = css(iconButton.raw({ size: "xs" }), { w: "22px", h: "22px", color: "ink3", _hover: { bg: "rgba(0,0,0,0.08)", color: "ink" } });
export function LangChip({ name, proficiency, onRemove }: { name: string; proficiency: string; onRemove?: () => void }) {
  const cfg = PROFICIENCY[proficiency] ?? PROFICIENCY.basic;
  return (
    <span className={langChip({ removable: !!onRemove })}>
      {name}
      <span className={cx(langLevel, cfg.className)}>{cfg.label}</span>
      {onRemove && (
        <button type="button" onClick={onRemove} title="Remove" aria-label={`Remove ${name}`} className={langRemove}>
          <X size={13} />
        </button>
      )}
    </span>
  );
}

/* ── Entry row (education / certification) ── */
const entryRow = css({ display: "flex", alignItems: "center", gap: "14px", py: "14px", "&:not(:first-of-type)": { borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "hairline" }, "&:hover .entry-acts": { opacity: 1 } });
const entryIcon = css({ w: "38px", h: "38px", borderRadius: "10px", flex: "none", bg: "rgba(0,0,0,0.04)", color: "ink2", display: "flex", alignItems: "center", justifyContent: "center" });
const entryText = css({ minW: 0, flex: 1 });
const entryTitle = css({ fontSize: "14.5px", fontWeight: 600, letterSpacing: "-0.01em", lineHeight: 1.3 });
const entrySub = css({ fontSize: "13px", color: "ink2", mt: "2px" });
const entryActs = css({ display: "flex", gap: "4px", flex: "none", opacity: 0.55, transition: "opacity .15s" });
const entryEdit = css(iconButton.raw({ shape: "square" }), { w: "28px", h: "28px", borderRadius: "7px", color: "ink2", _hover: { bg: "rgba(0,0,0,0.05)", color: "ink" } });
const entryDelete = css(iconButton.raw({ shape: "square" }), { w: "28px", h: "28px", borderRadius: "7px", color: "ink2", _hover: { bg: "errorTint", color: "errorText" } });
export function EntryRow({ icon, title, sub, onEdit, onDelete, deleting }: { icon: ReactNode; title: string; sub: string; onEdit?: () => void; onDelete?: () => void; deleting?: boolean }) {
  return (
    <div className={entryRow}>
      <div className={entryIcon}>{icon}</div>
      <div className={entryText}>
        <p className={entryTitle}>{title}</p>
        <p className={entrySub}>{sub}</p>
      </div>
      {(onEdit || onDelete) && (
        <div className={cx("entry-acts", entryActs)}>
          {onEdit && <button type="button" onClick={onEdit} aria-label="Edit" className={entryEdit}><Pencil size={15} /></button>}
          {onDelete && <button type="button" onClick={onDelete} disabled={deleting} aria-label="Delete" className={entryDelete}><Trash2 size={15} /></button>}
        </div>
      )}
    </div>
  );
}

/* ── Verification row ── */
const verifyRow = css({ display: "flex", alignItems: "center", gap: "14px", py: "15px", "&:not(:first-of-type)": { borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "hairline" } });
const verifyIcon = cva({
  base: { w: "40px", h: "40px", borderRadius: "11px", flex: "none", display: "flex", alignItems: "center", justifyContent: "center" },
  variants: { verified: { true: { bg: "successTint", color: "success" }, false: { bg: "rgba(0,0,0,0.04)", color: "ink3" } } },
});
const verifyText = css({ flex: 1, minW: 0 });
const verifyTitle = css({ fontSize: "14.5px", fontWeight: 600, letterSpacing: "-0.01em" });
const verifySub = css({ fontSize: "12.5px", color: "ink2", mt: "1px" });
const verifiedPill = css({ display: "inline-flex", alignItems: "center", gap: "4px", h: "26px", px: "10px", borderRadius: "pill", bg: "successTint", color: "successText", fontSize: "12px", fontWeight: 600, flex: "none" });
const verifyBtn = css(button.raw({ variant: "outline", size: "sm" }), { flex: "none", h: "34px", px: "14px", borderRadius: "pill", fontSize: "13px", borderColor: "hairlineStrong", bg: "surface", color: "ink", _hover: { bg: "surface2", borderColor: "hairlineStrong" } });
export function VerifyRow({ icon, title, sub, verified, onVerify }: { icon: ReactNode; title: string; sub: string; verified: boolean; onVerify?: () => void }) {
  return (
    <div className={verifyRow}>
      <div className={verifyIcon({ verified })}>{icon}</div>
      <div className={verifyText}>
        <p className={verifyTitle}>{title}</p>
        <p className={verifySub}>{sub}</p>
      </div>
      {verified ? (
        <span className={verifiedPill}><Check size={14} />Verified</span>
      ) : (
        <button type="button" onClick={onVerify} className={verifyBtn}>Verify now</button>
      )}
    </div>
  );
}

/* ── Empty state ── */
const emptyWrap = css({ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "12px", py: "30px", px: "20px" });
const emptyIcon = css({ w: "52px", h: "52px", borderRadius: "14px", bg: "rgba(0,0,0,0.04)", color: "ink3", display: "flex", alignItems: "center", justifyContent: "center" });
const emptyTitle = css({ fontSize: "14px", fontWeight: 600, letterSpacing: "-0.01em" });
const emptySub = css({ fontSize: "12.5px", color: "ink2", mt: "3px", maxW: "300px", mx: "auto" });
export function Empty({ icon, title, sub, action }: { icon: ReactNode; title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className={emptyWrap}>
      <div className={emptyIcon}>{icon}</div>
      <div>
        <p className={emptyTitle}>{title}</p>
        {sub && <p className={emptySub}>{sub}</p>}
      </div>
      {action}
    </div>
  );
}

/* ── Add pill (dashed) + small round icon button (used in section headers) ── */
const addPill = css(button.raw({ variant: "ghost", size: "sm" }), { gap: "7px", h: "38px", px: "16px", borderRadius: "pill", borderStyle: "dashed", borderColor: "hairlineStrong", bg: "transparent", fontSize: "13.5px", fontWeight: 500, color: "ink2", whiteSpace: "nowrap", transition: "border-color .15s, color .15s, background .15s", _hover: { borderColor: "accent", color: "accent", bg: "accentFill" } });
export function AddPill({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return <button type="button" onClick={onClick} className={addPill}>{children}</button>;
}
const roundIconBtn = css(iconButton.raw({ variant: "outline" }), { w: "34px", h: "34px", borderColor: "hairlineStrong", bg: "surface", color: "ink2", _hover: { borderColor: "accent", color: "accent", bg: "surface" } });
export function RoundIconBtn({ children, onClick, title }: { children: ReactNode; onClick?: () => void; title?: string }) {
  return <button type="button" onClick={onClick} title={title} aria-label={title} className={roundIconBtn}>{children}</button>;
}
