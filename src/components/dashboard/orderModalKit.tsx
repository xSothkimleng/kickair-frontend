"use client";

import { useState } from "react";
import { cva, css } from "styled-system/css";

/**
 * Classes shared by `dashboard/OrderDetailModal` and
 * `dashboard/FreelancerOrderDetailModal` (the client/freelancer twins).
 * Each one reproduces the geometry those dialogs had, measured against the old build
 * old build: `Dialog` header, `DialogContent`, `Stack spacing={2.5}`,
 * `Chip size="small"`, standard `Alert`s, `Card elevation={0}` and the
 * contained / outlined / text `Button` sizes. Added for the orders slice.
 */

/* ── Dialog chrome ────────────────────────────────────────────────────────── */

export const dlgHeaderCss = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  p: "16px 24px",
  borderBottomWidth: "1px",
  borderBottomStyle: "solid",
  borderBottomColor: "rgba(0, 0, 0, 0.08)",
});
export const dlgEyebrowCss = css({ textStyle: "eyebrow", color: "ink2" });
export const dlgTitleCss = css({ textStyle: "lead", fontWeight: 600 });
/** Small icon button. */
export const dlgCloseCss = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flex: "0 0 auto",
  boxSizing: "border-box",
  m: 0,
  p: "5px",
  border: "none",
  borderRadius: "50%",
  bg: "transparent",
  color: "ink2",
  cursor: "pointer",
  appearance: "none",
  textStyle: "title",
  textAlign: "center",
  transition: "background-color .15s",
  _hover: { bg: "rgba(0, 0, 0, 0.04)" },
  _focusVisible: { outline: "none", boxShadow: "focusRing" },
  "& svg": { display: "block" },
});
/** `DialogContent sx={{ p: 3 }}`. */
export const dlgBodyCss = css({ p: "24px", flex: "1 1 auto", overflowY: "auto" });
/** `Stack spacing={2.5}` — the 20px sits on each sibling's margin-top. */
export const dlgStackCss = css({ display: "flex", flexDirection: "column", "& > :not(style) ~ :not(style)": { marginTop: "20px" } });
/** `Stack spacing={1.5}`. */
export const stack15Css = css({ display: "flex", flexDirection: "column", "& > :not(style) ~ :not(style)": { marginTop: "12px" } });
/** `Stack direction="row" spacing={1}`. */
export const row1Css = css({ display: "flex", "& > :not(style) ~ :not(style)": { marginLeft: "8px" } });
/** `Stack direction="row" spacing={1.5}`. */
export const row15Css = css({ display: "flex", "& > :not(style) ~ :not(style)": { marginLeft: "12px" } });

/* ── Status chip ──────────────────────────────────────────────────────────── */

export const statusChipCss = css({
  alignSelf: "flex-start",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  boxSizing: "border-box",
  height: "24px",
  px: "8px",
  borderRadius: "16px",
  textStyle: "micro",
  fontWeight: 500,
  whiteSpace: "nowrap",
  maxWidth: "100%",
});
/** Chip icon at `size="small"`. */
export const chipIconCss = css({ display: "inline-flex", ml: "4px", mr: "-4px", "& svg": { display: "block" } });

/* ── Alerts (standard variants, with the dialogs' 8px radius) ─────────── */

export const alertCss = cva({
  base: {
    display: "flex",
    p: "6px 16px",
    borderRadius: "8px",
    textStyle: "body",
  },
  variants: {
    tone: {
      success: { bg: "rgb(237, 247, 237)", color: "rgb(30, 70, 32)" },
      warning: { bg: "rgb(255, 244, 229)", color: "rgb(102, 60, 0)" },
      error: { bg: "rgb(253, 237, 237)", color: "rgb(95, 33, 32)" },
      info: { bg: "rgb(229, 246, 253)", color: "rgb(1, 67, 97)" },
    },
  },
  defaultVariants: { tone: "info" },
});
export const alertIconCss = cva({
  base: { display: "flex", mr: "12px", py: "7px", textStyle: "title", opacity: 0.9, "& svg": { display: "block" } },
  variants: {
    tone: {
      success: { color: "#2e7d32" },
      warning: { color: "#ed6c02" },
      error: { color: "#d32f2f" },
      info: { color: "#0288d1" },
    },
  },
  defaultVariants: { tone: "info" },
});
export const alertMsgCss = css({ py: "8px", minWidth: 0, overflow: "auto" });
/** Alert action — the dismiss button on the error alerts. */
export const alertActionCss = css({ display: "flex", alignItems: "flex-start", p: "4px 0 0 16px", ml: "auto", mr: "-8px" });
export const alertCloseCss = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flex: "0 0 auto",
  boxSizing: "border-box",
  m: 0,
  p: "5px",
  border: "none",
  borderRadius: "50%",
  bg: "transparent",
  color: "inherit",
  cursor: "pointer",
  appearance: "none",
  _hover: { bg: "rgba(0, 0, 0, 0.04)" },
  _focusVisible: { outline: "none", boxShadow: "focusRing" },
  "& svg": { display: "block" },
});

/* ── Cards ────────────────────────────────────────────────────────────────── */

/** `Card elevation={0} sx={{ p: 2.5, bgcolor: "#F5F5F7", borderRadius: 3 }}`. */
export const tintCardCss = css({ p: "20px", bg: "#F5F5F7", borderRadius: "12px", overflow: "hidden" });
/** `Card elevation={0} sx={{ p: 2.5, border: "1px solid rgba(0,0,0,0.08)", borderRadius: 3 }}`. */
export const lineCardCss = css({
  p: "20px",
  bg: "#fff",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "rgba(0, 0, 0, 0.08)",
  borderRadius: "12px",
  overflow: "hidden",
});

/* ── Typography ───────────────────────────────────────────────────────────── */

export const eyebrowCss = css({ textStyle: "eyebrow", color: "ink2" });
export const t15b = css({ textStyle: "body", fontWeight: 600 });
export const t14b = css({ textStyle: "body", fontWeight: 600 });
export const t13b = css({ textStyle: "ui", fontWeight: 600 });
export const t13m = css({ textStyle: "ui", fontWeight: 500 });
export const t12 = css({ textStyle: "meta" });
export const t12muted = css({ textStyle: "meta", color: "ink2" });
export const t12body = css({ textStyle: "meta", color: "ink2" });
export const t11muted = css({ textStyle: "micro", color: "ink2" });
export const t11body = css({ textStyle: "micro", color: "ink2" });
export const truncate = css({ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" });

/* ── Buttons ──────────────────────────────────────────────────────────────── */

const btnBase = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  boxSizing: "border-box",
  position: "relative",
  m: 0,
  minW: "64px",
  bg: "transparent",
  fontWeight: 500,
  textTransform: "none",
  textAlign: "center",
  verticalAlign: "middle",
  textDecoration: "none",
  userSelect: "none",
  appearance: "none",
  cursor: "pointer",
  border: "none",
  transition: "background-color .25s cubic-bezier(.4,0,.2,1), box-shadow .25s cubic-bezier(.4,0,.2,1), border-color .25s cubic-bezier(.4,0,.2,1)",
  _focusVisible: { outline: "none", boxShadow: "focusRing" },
} as const;

/** Button in the shapes these dialogs used. */
export const dlgBtn = cva({
  base: { ...btnBase },
  variants: {
    look: {
      /** contained, h 44, pill — the primary CTAs. */
      cta: { h: "44px", p: "6px 16px", borderRadius: "112px", textStyle: "ui", color: "#fff", boxShadow: "none", _disabled: { pointerEvents: "none", bg: "rgba(0,0,0,0.12)", color: "rgba(0,0,0,0.26)", boxShadow: "none" } },
      /** outlined, h 44, pill — "Request Revision". */
      outline44: {
        h: "44px",
        p: "5px 15px",
        borderRadius: "112px",
        textStyle: "ui",
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: "rgba(0,0,0,0.2)",
        color: "ink2",
        _hover: { borderColor: "rgba(0,0,0,0.4)", bg: "rgba(0,0,0,0.02)" },
        _disabled: { pointerEvents: "none", color: "rgba(0,0,0,0.26)", borderColor: "rgba(0,0,0,0.12)" },
      },
      /** small outlined pill (form confirm). the primary-tinted border stays; the theme made the label inherit. */
      outlineSm: {
        p: "3px 9px",
        borderRadius: "112px",
        textStyle: "meta",
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: "rgba(25,118,210,0.5)",
        color: "inherit",
        _hover: { borderColor: "#1976d2", bg: "rgba(25,118,210,0.04)" },
        _disabled: { pointerEvents: "none", color: "rgba(0,0,0,0.26)", borderColor: "rgba(0,0,0,0.12)" },
      },
      /** small outlined pill, error tone. */
      outlineSmError: {
        p: "3px 9px",
        borderRadius: "112px",
        textStyle: "meta",
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: "rgba(211,47,47,0.5)",
        color: "inherit",
        _hover: { borderColor: "#d32f2f", bg: "rgba(211,47,47,0.04)" },
        _disabled: { pointerEvents: "none", color: "rgba(0,0,0,0.26)", borderColor: "rgba(0,0,0,0.12)" },
      },
      /** small text pill ("Cancel"). */
      textSm: { p: "4px 5px", borderRadius: "112px", textStyle: "meta", color: "inherit", _hover: { bg: "rgba(0,0,0,0.04)" }, _disabled: { pointerEvents: "none", color: "rgba(0,0,0,0.26)" } },
      /** the low-prominence "Open a dispute" text button. */
      quiet: { p: "4px 5px", borderRadius: "4px", textStyle: "meta", color: "ink3", _hover: { color: "#ef4444", bg: "transparent" }, _disabled: { pointerEvents: "none", color: "rgba(0,0,0,0.26)" } },
      /** small text button with a dashed attach frame. */
      attach: {
        p: "4px 12px",
        borderRadius: "8px",
        textStyle: "meta",
        color: "ink2",
        borderWidth: "1px",
        borderStyle: "dashed",
        borderColor: "rgba(0,0,0,0.2)",
        _hover: { borderColor: "rgba(0,0,0,0.4)", bg: "rgba(0,0,0,0.02)" },
        _disabled: { pointerEvents: "none", color: "rgba(0,0,0,0.26)" },
      },
      /** small outlined pill for "Attach files (n/5)". */
      attachOutline: {
        p: "3px 9px",
        borderRadius: "112px",
        textStyle: "meta",
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: "rgba(0,0,0,0.2)",
        color: "ink2",
        _hover: { borderColor: "rgba(0,0,0,0.4)", bg: "rgba(0,0,0,0.04)" },
        _disabled: { pointerEvents: "none", color: "rgba(0,0,0,0.26)", borderColor: "rgba(0,0,0,0.12)" },
      },
    },
    full: { true: { w: "100%" } },
  },
  defaultVariants: { look: "cta" },
});

/** The start-icon slot (medium: −4px/8px, icon 20px; small: −2px/8px, icon 18px). */
export const startIconCss = css({ display: "flex", alignItems: "center", ml: "-4px", mr: "8px", "& svg": { display: "block" } });
export const startIconSmCss = css({ display: "flex", alignItems: "center", ml: "-2px", mr: "8px", "& svg": { display: "block" } });

/* ── Avatar (48px) ────────────────────────────────────────────── */

export const avatar48Css = css({
  position: "relative",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flex: "0 0 auto",
  width: "48px",
  height: "48px",
  borderRadius: "50%",
  overflow: "hidden",
  userSelect: "none",
  bg: "#bdbdbd",
  color: "#fff",
  textStyle: "title",
});
export const avatarImgCss = css({ width: "100%", height: "100%", objectFit: "cover", color: "transparent", textAlign: "center" });

/** Avatar: the photo, falling back to `fallback` when there is none or it fails to load. */
export function ModalAvatar({ src, alt, fallback }: { src?: string | null; alt?: string; fallback: string }) {
  const [failed, setFailed] = useState<string | null>(null);
  return (
    <span className={avatar48Css}>
      {src && failed !== src
        // eslint-disable-next-line @next/next/no-img-element -- remote avatars from many hosts
        ? <img src={src} alt={alt ?? ""} className={avatarImgCss} onError={() => setFailed(src)} />
        : fallback}
    </span>
  );
}

/* ── Deletable evidence chip ──────────────────────────────────────────────── */

export const fileChipCss = css({
  display: "inline-flex",
  alignItems: "center",
  boxSizing: "border-box",
  height: "24px",
  borderRadius: "16px",
  bg: "rgba(0, 0, 0, 0.08)",
  color: "ink",
  textStyle: "micro",
  whiteSpace: "nowrap",
  maxWidth: "100%",
});
export const fileChipIconCss = css({ display: "inline-flex", ml: "4px", mr: "-4px", color: "rgba(0,0,0,0.26)", "& svg": { display: "block" } });
export const fileChipLabelCss = css({ px: "8px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" });
export const fileChipDeleteCss = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  m: "0 4px 0 -4px",
  p: 0,
  border: "none",
  bg: "transparent",
  cursor: "pointer",
  color: "rgba(0, 0, 0, 0.26)",
  _hover: { color: "ink3" },
  "& svg": { display: "block" },
});

/* ── Misc layout ──────────────────────────────────────────────────────────── */

export const iconTextRowCss = css({ display: "flex", alignItems: "center", gap: "4px" });
export const iconTextRow8Css = css({ display: "flex", alignItems: "center", gap: "8px" });
export const pillStatCss = css({ display: "flex", alignItems: "center", gap: "8px", px: "12px", py: "8px", bg: "rgba(0, 0, 0, 0.03)", borderRadius: "8px" });
export const descClampCss = css({
  textStyle: "ui",
  color: "ink2",
  lineClamp: 3,
  "& p": { margin: 0 },
  "& *": {},
});
/** The white-on-tint attachment row inside an Alert. */
export const alertFileRowCss = css({
  display: "flex",
  alignItems: "center",
  px: "10px",
  py: "6px",
  bg: "rgba(255,255,255,0.6)",
  borderRadius: "6px",
  textDecoration: "none",
  color: "inherit",
  cursor: "pointer",
  _hover: { bg: "rgba(255,255,255,0.9)" },
  "& > :not(style) ~ :not(style)": { marginLeft: "6px" },
});
/** `Stack spacing={0.5}` / `spacing={0.75}` columns. */
export const stack05Css = css({ display: "flex", flexDirection: "column", "& > :not(style) ~ :not(style)": { marginTop: "4px" } });
export const stack075Css = css({ display: "flex", flexDirection: "column", "& > :not(style) ~ :not(style)": { marginTop: "6px" } });
/** `Stack direction="row" flexWrap="wrap" gap={0.5}`. */
export const chipWrapCss = css({ display: "flex", flexWrap: "wrap", gap: "4px" });
export const starRowCss = css({ display: "flex", gap: "4px" });
export const starBtnCss = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  p: "2px",
  m: 0,
  border: "none",
  bg: "transparent",
  cursor: "pointer",
  appearance: "none",
  borderRadius: "50%",
  _focusVisible: { outline: "none", boxShadow: "focusRing" },
  "& svg": { display: "block" },
});
export const starRowTightCss = css({ display: "flex", gap: "2px" });
