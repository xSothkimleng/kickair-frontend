"use client";

import { useState } from "react";
import { css, cva } from "styled-system/css";

/**
 * Shared primitives for the two dashboard "Orders" tabs
 * (`dashboard/client/OrdersContent` and `dashboard/freelancer/OrdersContent`).
 *
 * Added by the 2026-09-12 wave-3 orders slice. Every class reproduces the MUI
 * geometry those two lists had (measured against the MUI build): `Button`
 * (6px/16px, 1.75 line-height, 64px min-width), `Card`+`CardContent`,
 * `Chip size="small"`, `Alert`, `Grid spacing={1}` and MUI's elevation-2/4
 * shadows. Imported by path — not re-exported from `ds/index.ts` yet.
 */

/* ── MUI elevation shadows (contained Button rest / hover) ────────────────── */
const SHADOW_2 = "0px 3px 1px -2px rgba(0,0,0,0.2),0px 2px 2px 0px rgba(0,0,0,0.14),0px 1px 5px 0px rgba(0,0,0,0.12)";
const SHADOW_4 = "0px 2px 4px -1px rgba(0,0,0,0.2),0px 4px 5px 0px rgba(0,0,0,0.14),0px 1px 10px 0px rgba(0,0,0,0.12)";

/* ── Page header ──────────────────────────────────────────────────────────── */

export const headWrapCss = css({ mb: "24px" });
/** MUI `Typography variant="h5" fontWeight={600}` — 24px / 1.334. */
export const h5Css = css({ fontSize: "24px", fontWeight: 600, lineHeight: 1.334 });
/** MUI `body2` + `text.secondary`. */
export const subCss = css({ fontSize: "14px", lineHeight: 1.43, color: "rgba(0,0,0,0.6)" });

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

/** MUI `Button` base with `sx={{ fontSize: 12, textTransform: "capitalize", borderRadius: 10, px: 2 }}`. */
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
    fontFamily: "inherit",
    fontSize: "12px",
    fontWeight: 500,
    lineHeight: 1.75,
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
      false: { bg: "rgba(0,0,0,0.05)", color: "rgba(0,0,0,0.6)", _hover: { bg: "rgba(0,0,0,0.1)" } },
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
    fontSize: "10.5px",
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
/** MUI text `Button` (`fontSize: 12, textTransform: "none", color: text.secondary, mb: 0.5`). */
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
  fontFamily: "inherit",
  fontSize: "12px",
  fontWeight: 500,
  lineHeight: 1.75,
  textTransform: "none",
  cursor: "pointer",
  appearance: "none",
  color: "rgba(0,0,0,0.6)",
  transition: "background-color .25s cubic-bezier(.4,0,.2,1)",
  _hover: { bg: "rgba(0,0,0,0.04)" },
  _focusVisible: { outline: "none", boxShadow: "focusRing" },
});

/* ── Empty / loading / error ──────────────────────────────────────────────── */

export const centerBox = css({ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "300px" });
export const errorTextCss = css({ fontSize: "16px", lineHeight: 1.5, color: "#d32f2f" });
export const emptyTextCss = css({
  textAlign: "center",
  py: "48px",
  "& p": { fontSize: "16px", lineHeight: 1.5, color: "rgba(0,0,0,0.6)" },
});

/* ── Row cards ────────────────────────────────────────────────────────────── */

/** `Stack spacing={2}` — MUI put the 16px on the sibling's margin-top. */
export const listCss = css({ display: "flex", flexDirection: "column", gap: "16px" });

/** MUI `Card elevation={0}` with the list's hairline + hover border. */
export const cardCss = css({
  bg: "#fff",
  color: "rgba(0,0,0,0.87)",
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
/** `Stack direction="row" spacing={2} flex={1}` (margin-based spacing, like MUI). */
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

export const titleCss = css({ fontSize: "16px", fontWeight: 600, lineHeight: 1.5 });
export const byline = css({ fontSize: "14px", lineHeight: 1.43, color: "rgba(0,0,0,0.6)" });
export const metaMonoCss = css({ fontFamily: "monospace", fontSize: "12px", fontWeight: 700, lineHeight: 1.66, color: "rgba(0,0,0,0.55)" });
export const metaMutedCss = css({ fontSize: "12px", lineHeight: 1.66, color: "rgba(0,0,0,0.6)" });

export const rightColCss = css({ textAlign: "right" });
/** MUI `Typography variant="h6" fontWeight={600}`. */
export const priceCss = css({ fontSize: "20px", fontWeight: 600, lineHeight: 1.6 });

/** `Chip size="small"` shell — the tinted colours come from `style` (they're data-driven). */
export const statusChipCss = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  boxSizing: "border-box",
  height: "24px",
  px: "8px",
  borderRadius: "16px",
  fontSize: "11px",
  fontWeight: 400,
  lineHeight: 1.5,
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
  color: "rgba(0,0,0,0.87)",
  fontSize: "11px",
  fontWeight: 600,
  lineHeight: 1.5,
  whiteSpace: "nowrap",
  maxWidth: "100%",
  verticalAlign: "middle",
  flexShrink: 0,
});

/* ── Avatars (MUI `Avatar` behaviour: image → alt initial → children) ─────── */

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
 * used; with `src` it is MUI's photo avatar, falling back to the first letter
 * of `alt` on MUI's default grey when the image is missing or fails.
 */
export function ListAvatar({ src, alt, initials }: { src?: string; alt?: string; initials?: string }) {
  const [failed, setFailed] = useState<string | null>(null);
  if (initials != null) {
    return (
      <span className={avatarBase} style={{ backgroundColor: "#000", fontSize: 15, fontWeight: 600 }}>
        {initials}
      </span>
    );
  }
  if (src && failed !== src) {
    return (
      <span className={avatarBase} style={{ backgroundColor: "#bdbdbd", fontSize: 20 }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- remote avatars from many hosts */}
        <img src={src} alt={alt ?? ""} className={avatarImgCss} onError={() => setFailed(src)} />
      </span>
    );
  }
  return (
    <span className={avatarBase} style={{ backgroundColor: "#bdbdbd", fontSize: 20 }}>
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
  fontSize: "12px",
  lineHeight: 1.43,
} as const;

/** `Alert severity="info"` in the list's accent tint. */
export const alertInfoCss = css({ ...alertBase, bg: "rgba(0, 113, 227, 0.06)", color: "#1e40af", borderColor: "rgba(0, 113, 227, 0.2)" });
/** `Alert severity="warning"` in the freelancer list's amber tint. */
export const alertWarnCss = css({ ...alertBase, bg: "rgba(234, 179, 8, 0.08)", color: "#92400e", borderColor: "rgba(234, 179, 8, 0.2)" });
/** `.MuiAlert-icon` — the tone colour is set per call site (it was an `sx` override). */
export const alertIconCss = css({ display: "flex", mr: "12px", py: "7px", fontSize: "22px", opacity: 0.9, "& svg": { display: "block" } });
/** `.MuiAlert-message`. */
export const alertMsgCss = css({ py: "8px", minWidth: 0, overflow: "auto" });

/* ── Action grid ──────────────────────────────────────────────────────────── */

/** `Grid container spacing={1}` with the card's top hairline. 12 columns + 8px gutters match MUI's widths exactly. */
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
    fontFamily: "inherit",
    fontSize: "12px",
    fontWeight: 500,
    lineHeight: 1.75,
    textTransform: "none",
    verticalAlign: "middle",
    textDecoration: "none",
    userSelect: "none",
    appearance: "none",
    cursor: "pointer",
    transition: "background-color .25s cubic-bezier(.4,0,.2,1), box-shadow .25s cubic-bezier(.4,0,.2,1), border-color .25s cubic-bezier(.4,0,.2,1)",
    _focusVisible: { outline: "none", boxShadow: "focusRing" },
    // MUI's `.Mui-disabled` outranked every `sx` background on these buttons.
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

/** `.MuiButton-startIcon` (the icon itself is 20px at the default button size). */
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
  fontFamily: "inherit",
  fontSize: "13.5px",
  fontWeight: 600,
  lineHeight: 1.75,
  textTransform: "none",
  cursor: "pointer",
  appearance: "none",
  boxShadow: "none",
  transition: "background-color .25s cubic-bezier(.4,0,.2,1), box-shadow .25s cubic-bezier(.4,0,.2,1), border-color .25s cubic-bezier(.4,0,.2,1)",
  _hover: { bg: "rgba(0,0,0,0.82)", boxShadow: "none" },
  _focusVisible: { outline: "none", boxShadow: "focusRing" },
});
