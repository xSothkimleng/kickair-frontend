"use client";

import { useState } from "react";
import { css, cva, cx } from "styled-system/css";

/**
 * Shared primitives for the two dashboard "Orders" tabs
 * (`dashboard/client/OrdersContent` and `dashboard/freelancer/OrdersContent`).
 *
 * Added by the 2026-09-12 wave-3 orders slice. Every class reproduces the
 * geometry those two lists had: `Button`
 * (6px/16px, 64px min-width), `Card`+`CardContent`,
 * `Chip size="small"`, `Alert`, `Grid spacing={1}` and the elevation-2/4
 * shadows. Imported by path — not re-exported from `ds/index.ts` yet.
 */

/* ── Elevation shadows (contained Button rest / hover) ────────────────── */
const SHADOW_2 = "0px 3px 1px -2px rgba(0,0,0,0.2),0px 2px 2px 0px rgba(0,0,0,0.14),0px 1px 5px 0px rgba(0,0,0,0.12)";
const SHADOW_4 = "0px 2px 4px -1px rgba(0,0,0,0.2),0px 4px 5px 0px rgba(0,0,0,0.14),0px 1px 10px 0px rgba(0,0,0,0.12)";

/* ── Page header ──────────────────────────────────────────────────────────── */

export const headWrapCss = css({ mb: "24px" });
/** Card title — 24px. */
export const h5Css = css({ textStyle: "heading", fontWeight: 600 });
/** Secondary text. */
export const subCss = css({ textStyle: "body", color: "ink2" });

/** The freelancer tab's header row (title block + "Propose custom order"). */
export const pageHeadRowCss = css({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-end",
  flexWrap: "wrap",
  gap: "12px",
  mb: "24px",
});

/* ── Filter pills ─────────────────────────────────────────────────────────── */

export const filterRowCss = css({ display: "flex", flexWrap: "wrap", gap: "8px", mb: "24px" });

/** Button base with `sx={{ fontSize: 12, textTransform: "capitalize", borderRadius: 10, px: 2 }}`. */
export const filterBtn = cva({
  base: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "border-box",
    m: 0,
    p: "6px 16px",
    minW: "64px",
    border: "none",
    borderRadius: "40px",
    textStyle: "meta",
    fontWeight: 500,
    textTransform: "capitalize",
    verticalAlign: "middle",
    textDecoration: "none",
    userSelect: "none",
    appearance: "none",
    cursor: "pointer",
    transition: "background-color .25s cubic-bezier(.4,0,.2,1), box-shadow .25s cubic-bezier(.4,0,.2,1), border-color .25s cubic-bezier(.4,0,.2,1)",
    _focusVisible: { outline: "none", boxShadow: "focusRing" },
  },
  variants: {
    on: {
      true: { bg: "#000", color: "#fff", _hover: { bg: "#000" } },
      false: { bg: "rgba(0,0,0,0.05)", color: "ink2", _hover: { bg: "rgba(0,0,0,0.1)" } },
    },
  },
  defaultVariants: { on: false },
});

/** The "N new" counter inside the `requests` pill. */
export const filterNew = cva({
  base: {
    ml: "6px",
    px: "6px",
    py: "0.8px",
    borderRadius: "32px",
    textStyle: "micro",
    fontWeight: 700,
  },
  variants: {
    look: {
      blueOff: { bg: "rgba(37, 99, 235, 0.12)", color: "#1e40af" },
      blueOn: { bg: "rgba(255,255,255,0.25)", color: "#fff" },
      orangeOff: { bg: "rgba(234, 88, 12, 0.12)", color: "#b45309" },
      orangeOn: { bg: "rgba(255,255,255,0.25)", color: "#fff" },
    },
  },
  defaultVariants: { look: "blueOff" },
});

/* ── Date range row ───────────────────────────────────────────────────────── */

export const dateRowCss = css({ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "flex-end", mb: "24px" });
export const dateFieldCss = css({ width: "190px" });
/** Text button (`fontSize: 12, textTransform: "none", color: text.secondary, mb: 0.5`). */
export const clearBtnCss = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  boxSizing: "border-box",
  m: 0,
  mb: "4px",
  p: "6px 8px",
  minW: "64px",
  border: "none",
  borderRadius: "4px",
  bg: "transparent",
  textStyle: "meta",
  fontWeight: 500,
  textTransform: "none",
  cursor: "pointer",
  appearance: "none",
  color: "ink2",
  transition: "background-color .25s cubic-bezier(.4,0,.2,1)",
  _hover: { bg: "rgba(0,0,0,0.04)" },
  _focusVisible: { outline: "none", boxShadow: "focusRing" },
});

/* ── Empty / loading / error ──────────────────────────────────────────────── */

export const centerBox = css({ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "300px" });
export const errorTextCss = css({ textStyle: "lead", color: "#d32f2f" });
export const emptyTextCss = css({
  textAlign: "center",
  py: "48px",
  "& p": { textStyle: "lead", color: "ink2" },
});

/* ── Row cards ────────────────────────────────────────────────────────────── */

/** `Stack spacing={2}` — the 16px sits on the sibling's margin-top. */
export const listCss = css({ display: "flex", flexDirection: "column", gap: "16px" });

/** Flat card with the list's hairline + hover border. */
export const cardCss = css({
  bg: "#fff",
  color: "ink",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "rgba(0,0,0,0.08)",
  borderRadius: "12px",
  overflow: "hidden",
  transition: "all 0.2s",
  _hover: { borderColor: "rgba(0,0,0,0.2)" },
});
/** `CardContent sx={{ p: 3 }}`. */
export const cardBody = css({ p: "24px" });

export const headRowCss = css({ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: "16px" });
/** `Stack direction="row" spacing={2} flex={1}` (margin-based spacing). */
export const avatarStackCss = css({ display: "flex", flex: 1, "& > :not(style) ~ :not(style)": { marginLeft: "16px" } });
export const colCss = css({ flex: 1 });
export const titleRowCss = css({
  display: "flex",
  alignItems: "center",
  mb: "4px",
  "& > :not(style) ~ :not(style)": { marginLeft: "8px" },
});
export const metaRowCss = css({
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  "& > :not(style) ~ :not(style)": { marginLeft: "12px" },
});

export const titleCss = css({ textStyle: "lead", fontWeight: 600 });
export const byline = css({ textStyle: "body", color: "ink2" });
export const metaMonoCss = css({ fontVariantNumeric: "tabular-nums", textStyle: "meta", fontWeight: 700, color: "ink2" });
export const metaMutedCss = css({ textStyle: "meta", color: "ink2" });

export const rightColCss = css({ textAlign: "right" });
/** Row title. */
export const priceCss = css({ textStyle: "title", fontWeight: 600 });

/** `Chip size="small"` shell — the tinted colours come from `style` (they're data-driven). */
export const statusChipCss = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  boxSizing: "border-box",
  height: "24px",
  px: "8px",
  borderRadius: "16px",
  textStyle: "micro",
  fontWeight: 400,
  whiteSpace: "nowrap",
  maxWidth: "100%",
  verticalAlign: "middle",
});
/** The static "Request" / "Custom" chip. */
export const chipNeutral = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  boxSizing: "border-box",
  height: "20px",
  px: "8px",
  borderRadius: "16px",
  bg: "rgba(0,0,0,0.06)",
  color: "ink",
  textStyle: "micro",
  fontWeight: 600,
  whiteSpace: "nowrap",
  maxWidth: "100%",
  verticalAlign: "middle",
  flexShrink: 0,
});

/* ── Avatars (Avatar behaviour: image → alt initial → children) ─────── */

const avatarBase = css({
  position: "relative",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  width: "50px",
  height: "50px",
  borderRadius: "50%",
  overflow: "hidden",
  userSelect: "none",
  lineHeight: 1,
  color: "#fff",
});
const avatarImgCss = css({ width: "100%", height: "100%", objectFit: "cover", textAlign: "center", color: "transparent" });
const avatarInitials = css({ textStyle: "body", fontWeight: 600 });
const avatarLetter = css({ textStyle: "title" });

/** The "new offer / new request" dot pinned to the avatar. */
export const blueDotCss = css({
  position: "absolute",
  top: 0,
  right: 0,
  width: "10px",
  height: "10px",
  borderRadius: "50%",
  bg: "#0071e3",
  boxShadow: "0 0 0 2px #fff",
});

/**
 * 50px list avatar. With `initials` it is the black circle the request rows
 * used; with `src` it is a photo avatar, falling back to the first letter
 * of `alt` on the default grey when the image is missing or fails.
 */
export function ListAvatar({ src, alt, initials }: { src?: string; alt?: string; initials?: string }) {
  const [failed, setFailed] = useState<string | null>(null);
  if (initials != null) {
    return (
      <span className={cx(avatarBase, avatarInitials)} style={{ backgroundColor: "#000" }}>
        {initials}
      </span>
    );
  }
  if (src && failed !== src) {
    return (
      <span className={cx(avatarBase, avatarLetter)} style={{ backgroundColor: "#bdbdbd" }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- remote avatars from many hosts */}
        <img src={src} alt={alt ?? ""} className={avatarImgCss} onError={() => setFailed(src)} />
      </span>
    );
  }
  return (
    <span className={cx(avatarBase, avatarLetter)} style={{ backgroundColor: "#bdbdbd" }}>
      {alt ? alt.charAt(0) : null}
    </span>
  );
}

/* ── Alerts ───────────────────────────────────────────────────────────────── */

const alertBase = {
  display: "flex",
  mb: "16px",
  p: "4px 16px",
  borderRadius: "8px",
  borderWidth: "1px",
  borderStyle: "solid",
  textStyle: "meta",
} as const;

/** `Alert severity="info"` in the list's accent tint. */
export const alertInfoCss = css({ ...alertBase, bg: "rgba(0, 113, 227, 0.06)", color: "#1e40af", borderColor: "rgba(0, 113, 227, 0.2)" });
/** `Alert severity="warning"` in the freelancer list's amber tint. */
export const alertWarnCss = css({ ...alertBase, bg: "rgba(234, 179, 8, 0.08)", color: "#92400e", borderColor: "rgba(234, 179, 8, 0.2)" });
/** Alert icon — the tone colour is set per call site (it was an `sx` override). */
export const alertIconCss = css({ display: "flex", mr: "12px", py: "7px", textStyle: "title", opacity: 0.9, "& svg": { display: "block" } });
/** Alert message. */
export const alertMsgCss = css({ py: "8px", minWidth: 0, overflow: "auto" });

/* ── Action grid ──────────────────────────────────────────────────────────── */

/** `Grid container spacing={1}` with the card's top hairline. 12 columns + 8px gutters match the old widths exactly. */
export const gridCss = css({
  display: "grid",
  gridTemplateColumns: "repeat(12, 1fr)",
  gap: "8px",
  pt: "16px",
  borderTopWidth: "1px",
  borderTopStyle: "solid",
  borderTopColor: "rgba(0,0,0,0.08)",
});
/** `Grid size={n}` — the span itself is set inline (it is status-driven). */
export const gridCellCss = css({ minWidth: 0 });

/** `Button variant="contained" fullWidth` with the list's tones. */
export const listBtn = cva({
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "border-box",
    position: "relative",
    m: 0,
    p: "6px 16px",
    minW: "64px",
    w: "100%",
    border: "none",
    borderRadius: "40px",
    textStyle: "meta",
    fontWeight: 500,
    textTransform: "none",
    verticalAlign: "middle",
    textDecoration: "none",
    userSelect: "none",
    appearance: "none",
    cursor: "pointer",
    transition: "background-color .25s cubic-bezier(.4,0,.2,1), box-shadow .25s cubic-bezier(.4,0,.2,1), border-color .25s cubic-bezier(.4,0,.2,1)",
    _focusVisible: { outline: "none", boxShadow: "focusRing" },
    // The disabled state outranked every `sx` background on these buttons.
    _disabled: { pointerEvents: "none", bg: "rgba(0,0,0,0.12)", color: "rgba(0,0,0,0.26)", boxShadow: "none" },
  },
  variants: {
    tone: {
      grey: { bg: "rgba(0,0,0,0.05)", color: "#000", boxShadow: "none", _hover: { bg: "rgba(0,0,0,0.1)", boxShadow: "none" } },
      blue: { bg: "#0071e3", color: "#fff", boxShadow: SHADOW_2, _hover: { bg: "#0077ED", boxShadow: SHADOW_4 } },
      green: { bg: "#16a34a", color: "#fff", boxShadow: SHADOW_2, _hover: { bg: "#15803d", boxShadow: SHADOW_4 } },
      red: { bg: "#ef4444", color: "#fff", boxShadow: SHADOW_2, _hover: { bg: "#dc2626", boxShadow: SHADOW_4 } },
    },
  },
  defaultVariants: { tone: "grey" },
});

/** The start-icon slot (the icon itself is 20px at the default button size). */
export const startIconCss = css({ display: "flex", alignItems: "center", ml: "-4px", mr: "8px", "& svg": { display: "block" } });

/** The freelancer tab's black "Propose custom order" pill. */
export const proposeBtnCss = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  boxSizing: "border-box",
  m: 0,
  p: "6px 18px",
  height: "40px",
  minW: "64px",
  border: "none",
  borderRadius: "999px",
  bg: "#000",
  color: "#fff",
  textStyle: "ui",
  fontWeight: 600,
  textTransform: "none",
  cursor: "pointer",
  appearance: "none",
  boxShadow: "none",
  transition: "background-color .25s cubic-bezier(.4,0,.2,1), box-shadow .25s cubic-bezier(.4,0,.2,1), border-color .25s cubic-bezier(.4,0,.2,1)",
  _hover: { bg: "rgba(0,0,0,0.82)", boxShadow: "none" },
  _focusVisible: { outline: "none", boxShadow: "focusRing" },
});
