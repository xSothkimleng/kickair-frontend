"use client";

import { useLayoutEffect, useRef } from "react";
import { css, cva } from "styled-system/css";

/**
 * Classes shared by the client and freelancer order pages
 * (`/dashboard/orders/[id]` and `/dashboard/freelancer/orders/[id]`), which are
 * near-twins. Each class reproduces the geometry those pages had (the
 * `CARD` / `SEC_LABEL` / `BTN_*` objects plus the `Container`, `Button`,
 * `Alert` and `TextField` defaults).
 * Added for the 2026-09-12 orders slice; imported by path.
 */

/* ── Page shell ───────────────────────────────────────────────────────────── */

export const pageCss = css({ minHeight: "100vh", bg: "#F8FAFC" });
/** Page container. */
export const containerCss = css({
  boxSizing: "border-box",
  width: "100%",
  maxWidth: "720px",
  mx: "auto",
  px: { base: "20px", sm: "28px" },
  py: "32px",
});
export const centerPageCss = css({
  minHeight: "100vh",
  bg: "#F8FAFC",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});
export const centerPageColCss = css({
  minHeight: "100vh",
  bg: "#F8FAFC",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "column",
  gap: "16px",
});
export const notFoundTextCss = css({ textStyle: "lead", color: "#64748B" });

/* ── Header ───────────────────────────────────────────────────────────────── */

/** Text button with `p: 0, minWidth: 0` — the "Back to Orders" link. */
export const backBtnCss = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  boxSizing: "border-box",
  m: 0,
  mb: "18px",
  p: 0,
  minW: 0,
  border: "none",
  borderRadius: "4px",
  bg: "transparent",
  textStyle: "ui",
  fontWeight: 500,
  textTransform: "none",
  textAlign: "center",
  cursor: "pointer",
  appearance: "none",
  color: "#64748B",
  transition: "background-color .25s cubic-bezier(.4,0,.2,1), color .25s cubic-bezier(.4,0,.2,1)",
  _hover: { color: "#0F172A", bg: "transparent" },
  _focusVisible: { outline: "none", boxShadow: "focusRing" },
});
/** The start-icon slot (icon renders at 20px inside a default-size button). */
export const startIconCss = css({ display: "flex", alignItems: "center", ml: "-4px", mr: "8px", "& svg": { display: "block" } });

export const headWrapCss = css({ mb: "28px" });
export const titleRowCss = css({ display: "flex", alignItems: "center", gap: "12px", mb: "6px", flexWrap: "wrap" });
export const pageTitleCss = css({ textStyle: "stat", fontWeight: 700, color: "#0F172A" });
export const placedCss = css({ textStyle: "ui", color: "#64748B" });

/** The order's status pill. Colours come from `STATUS_MAP` via `style`. */
export const statusBadgeCss = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "5px",
  boxSizing: "border-box",
  height: "23px",
  px: "10px",
  borderRadius: "999px",
  textStyle: "meta",
  fontWeight: 600,
  whiteSpace: "nowrap",
});
export const statusDotCss = css({ width: "6px", height: "6px", borderRadius: "50%", bg: "currentColor", flexShrink: 0 });

/* ── Top error alert (dismissible error alert) ──── */

export const topAlertCss = css({ display: "flex", mb: "20px", p: "6px 16px", borderRadius: "10px", bg: "rgb(253, 237, 237)", color: "rgb(95, 33, 32)", textStyle: "body" });
export const topAlertIconCss = css({ display: "flex", mr: "12px", py: "7px", textStyle: "title", opacity: 0.9, color: "#d32f2f", "& svg": { display: "block" } });
export const topAlertMsgCss = css({ py: "8px", minWidth: 0, overflow: "auto" });
export const topAlertActionCss = css({ display: "flex", alignItems: "flex-start", p: "4px 0 0 16px", ml: "auto", mr: "-8px" });
export const topAlertCloseCss = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flex: "0 0 auto",
  m: 0,
  p: "5px",
  border: "none",
  borderRadius: "50%",
  bg: "transparent",
  color: "inherit",
  cursor: "pointer",
  appearance: "none",
  textStyle: "title",
  _hover: { bg: "rgba(0,0,0,0.04)" },
  _focusVisible: { outline: "none", boxShadow: "focusRing" },
  "& svg": { display: "block" },
});

/* ── Cards ────────────────────────────────────────────────────────────────── */

/** `Stack spacing={2.5}` — the 20px sits on each sibling's margin-top. */
export const colStackCss = css({ display: "flex", flexDirection: "column", "& > :not(style) ~ :not(style)": { marginTop: "20px" } });
/** The page's `CARD` token object. */
export const cardCss = css({
  bg: "#FFFFFF",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "rgba(15,23,42,0.08)",
  borderRadius: "14px",
  p: "24px 28px",
  boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
});
/** The page's `SEC_LABEL` token object (its `mb` never applied — `globals.css` zeroes `p` margins). */
export const secLabelCss = css({ textStyle: "eyebrow", fontWeight: 600, color: "#94A3B8" });

export const infoGridCss = css({ display: "grid", gridTemplateColumns: { base: "1fr", sm: "1fr 1fr" }, gap: "20px" });
export const cardTitleCss = css({ textStyle: "lead", fontWeight: 700 });
export const catChipCss = css({
  display: "inline-flex",
  alignItems: "center",
  boxSizing: "border-box",
  height: "24px",
  px: "10px",
  bg: "#F1F5F9",
  color: "#334155",
  borderRadius: "6px",
  textStyle: "meta",
  fontWeight: 600,
  mb: "10px",
});
export const descClamp2Css = css({ textStyle: "ui", color: "#64748B", lineClamp: 2, "& *": {} });

/** `Stack direction="row" spacing={1.75} alignItems="center"`. */
export const partyRowCss = css({ display: "flex", alignItems: "center", "& > :not(style) ~ :not(style)": { marginLeft: "14px" } });
export const partyAvatarCss = css({
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
  background: "linear-gradient(135deg,#1E293B,#0F172A)",
  color: "#fff",
  textStyle: "lead",
  fontWeight: 600,
});
export const partyAvatarImgCss = css({ width: "100%", height: "100%", objectFit: "cover", color: "transparent", textAlign: "center" });
export const partyNameCss = css({ textStyle: "body", fontWeight: 700 });
export const partyMeta16Css = css({ textStyle: "meta", color: "#64748B" });
export const partyMetaCss = css({ textStyle: "meta", color: "#64748B" });

/* ── Package stats ────────────────────────────────────────────────────────── */

export const statGridCss = css({ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "12px", mb: "12px" });
export const statGrid2Css = css({ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "12px" });
export const tileCss = css({ bg: "#F1F5F9", borderRadius: "10px", p: "14px 16px" });
export const tileSmCss = css({ bg: "#F1F5F9", borderRadius: "10px", p: "12px 14px" });
export const tileLabelCss = css({ textStyle: "micro", fontWeight: 600, color: "#64748B" });
export const tileLabelPlainCss = css({ textStyle: "micro", fontWeight: 600, color: "#64748B" });
export const tileValCss = css({ textStyle: "title", fontWeight: 700 });
export const tileValSmCss = css({ textStyle: "body", fontWeight: 700 });
export const totalRowCss = css({ bg: "#F1F5F9", borderRadius: "10px", p: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" });

/* ── Status banners ───────────────────────────────────────────────────────── */

export const bannerCss = cva({
  base: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    p: "12px 14px",
    borderRadius: "8px",
    textStyle: "ui",
    fontWeight: 500,
    borderWidth: "1px",
    borderStyle: "solid",
  },
  variants: {
    tone: {
      success: { bg: "#F0FDF4", color: "#16A34A", borderColor: "rgba(22,163,74,0.18)" },
      danger: { bg: "#FEF2F2", color: "#DC2626", borderColor: "rgba(220,38,38,0.18)" },
      warning: { bg: "#FFF7ED", color: "#C2410C", borderColor: "rgba(194,65,12,0.18)" },
    },
  },
  defaultVariants: { tone: "success" },
});
export const bannerGlyphCss = css({ textStyle: "lead", mt: "1px", flexShrink: 0, "& svg": { display: "block" } });
export const mb225 = css({ mb: "18px" });
export const mt225 = css({ mt: "18px" });

export const fieldLabelCss = css({ textStyle: "meta", fontWeight: 600, color: "#334155" });
export const bodyTextCss = css({ textStyle: "ui", color: "#334155" });
export const bodyMutedCss = css({ textStyle: "ui", color: "#475569" });
export const mutedSmallCss = css({ textStyle: "meta", color: "#94A3B8" });
export const outcomeBoxCss = css({ mt: "14px", p: "12px 14px", bg: "#F1F5F9", borderRadius: "8px" });
export const evidenceRowCss = css({ display: "flex", gap: "20px", flexWrap: "wrap", mt: "18px" });
export const evidencePartyCss = css({ flex: 1, minWidth: "220px" });
/** `Stack spacing={1}` column. */
export const stack1Css = css({ display: "flex", flexDirection: "column", "& > :not(style) ~ :not(style)": { marginTop: "8px" } });
export const stack075Css = css({ display: "flex", flexDirection: "column", "& > :not(style) ~ :not(style)": { marginTop: "6px" } });

/* ── File rows ────────────────────────────────────────────────────────────── */

export const fileRowCss = css({
  display: "flex",
  alignItems: "center",
  gap: "12px",
  p: "10px 12px",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "rgba(15,23,42,0.08)",
  borderRadius: "8px",
  textDecoration: "none",
  color: "inherit",
  transition: "border-color 0.12s",
  _hover: { borderColor: "#CBD5E1" },
});
export const fileTileCss = css({ width: "34px", height: "34px", bg: "#F1F5F9", borderRadius: "7px", display: "grid", placeItems: "center", color: "#334155", flexShrink: 0 });
export const fileNameWrapCss = css({ flex: 1, minWidth: 0 });
export const fileNameCss = css({ textStyle: "ui", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" });
export const fileDownloadCss = css({
  display: "flex",
  alignItems: "center",
  gap: "4px",
  textStyle: "meta",
  fontWeight: 600,
  color: "#334155",
  px: "10px",
  py: "6px",
  borderRadius: "6px",
  cursor: "pointer",
  _hover: { bg: "#F1F5F9" },
});

/* ── Dropzone ─────────────────────────────────────────────────────────────── */

export const dropWrapCss = css({ mt: "12px" });
export const dropZoneCss = css({
  borderWidth: "1.5px",
  borderStyle: "dashed",
  borderColor: "#CBD5E1",
  borderRadius: "8px",
  p: "18px",
  textAlign: "center",
  cursor: "pointer",
  _hover: { borderColor: "#94A3B8" },
});
export const dropIconCss = css({ color: "#94A3B8", display: "block", mx: "auto", mb: "4px", "& svg": { display: "block", margin: "0 auto" } });
export const dropTextCss = css({ textStyle: "meta", color: "#64748B", fontWeight: 500 });
export const dropListCss = css({ display: "flex", flexDirection: "column", mt: "10px", "& > :not(style) ~ :not(style)": { marginTop: "6px" } });
export const dropItemCss = css({ display: "flex", alignItems: "center", gap: "8px", px: "10px", py: "6px", bg: "#F1F5F9", borderRadius: "6px" });
export const dropItemNameCss = css({ flex: 1, textStyle: "meta", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" });
export const dropRemoveCss = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flex: "0 0 auto",
  m: 0,
  p: "2px",
  border: "none",
  borderRadius: "50%",
  bg: "transparent",
  color: "#94A3B8",
  textStyle: "body",
  cursor: "pointer",
  appearance: "none",
  _hover: { bg: "rgba(0,0,0,0.04)" },
  _focusVisible: { outline: "none", boxShadow: "focusRing" },
});

/* ── Stars ────────────────────────────────────────────────────────────────── */

export const starRowCss = css({ display: "flex", gap: "2px" });
export const starBtnCss = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  m: 0,
  p: "2px",
  border: "none",
  borderRadius: "50%",
  bg: "transparent",
  cursor: "pointer",
  appearance: "none",
  _focusVisible: { outline: "none", boxShadow: "focusRing" },
  "& svg": { display: "block" },
});
export const reviewBoxCss = css({ bg: "#F1F5F9", borderRadius: "10px", p: "16px 18px" });
/** `Stack direction="row" alignItems="center" spacing={1.25}`. */
export const reviewHeadCss = css({ display: "flex", alignItems: "center", "& > :not(style) ~ :not(style)": { marginLeft: "10px" } });
export const reviewerCss = css({ textStyle: "ui", fontWeight: 700 });

/* ── Buttons (the page's BTN_PRIMARY / BTN_OUTLINE / BTN_DANGER) ──────────── */

const pageBtnBase = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  boxSizing: "border-box",
  m: 0,
  height: "40px",
  minW: "64px",
  borderRadius: "8px",
  textStyle: "ui",
  fontWeight: 600,
  textTransform: "none",
  textAlign: "center",
  cursor: "pointer",
  appearance: "none",
  boxShadow: "none",
  transition: "background-color .25s cubic-bezier(.4,0,.2,1), box-shadow .25s cubic-bezier(.4,0,.2,1), border-color .25s cubic-bezier(.4,0,.2,1), color .25s cubic-bezier(.4,0,.2,1)",
  _focusVisible: { outline: "none", boxShadow: "focusRing" },
} as const;

export const pageBtn = cva({
  base: { ...pageBtnBase },
  variants: {
    look: {
      primary: {
        p: "6px 20px",
        border: "none",
        bg: "#0F172A",
        color: "#FFF",
        _hover: { bg: "#1E293B", boxShadow: "none" },
        _disabled: { pointerEvents: "none", bg: "rgba(15,23,42,0.12)", color: "rgba(15,23,42,0.4)", boxShadow: "none" },
      },
      danger2: {
        p: "6px 20px",
        border: "none",
        bg: "#DC2626",
        color: "#FFF",
        _hover: { bg: "#B91C1C", boxShadow: "none" },
        _disabled: { pointerEvents: "none", bg: "rgba(15,23,42,0.12)", color: "rgba(15,23,42,0.4)", boxShadow: "none" },
      },
      outline: {
        p: "5px 20px",
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: "#E2E8F0",
        bg: "#FFF",
        color: "#0F172A",
        _hover: { bg: "#0F172A", color: "#FFF", borderColor: "#0F172A" },
        _disabled: { pointerEvents: "none", color: "rgba(0,0,0,0.26)", borderColor: "rgba(0,0,0,0.12)" },
      },
      danger: {
        p: "5px 20px",
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: "rgba(220,38,38,0.28)",
        bg: "#FFF",
        color: "#DC2626",
        _hover: { bg: "#DC2626", color: "#FFF", borderColor: "#DC2626" },
        _disabled: { pointerEvents: "none", color: "rgba(0,0,0,0.26)", borderColor: "rgba(0,0,0,0.12)" },
      },
    },
    /** The not-found page shrinks the outline button to 36px. */
    h36: { true: { height: "36px" } },
  },
  defaultVariants: { look: "primary" },
});

/* ── Dialogs ──────────────────────────────────────────────────────────────── */

export const dlgHeadCss = css({ p: "22px 24px 0" });
export const dlgTitleCss = css({ textStyle: "lead", fontWeight: 700 });
export const dlgSubCss = css({ textStyle: "ui", color: "#64748B" });
export const dlgBodyCss = css({ p: "18px 24px 4px", flex: "1 1 auto", overflowY: "auto" });
export const dlgFootCss = css({ display: "flex", justifyContent: "flex-end", p: "16px 24px 22px", "& > :not(style) ~ :not(style)": { marginLeft: "10px" } });
export const dlgFootTightCss = css({ display: "flex", justifyContent: "flex-end", p: "20px 24px 22px", "& > :not(style) ~ :not(style)": { marginLeft: "10px" } });
export const dlgInlineAlertCss = css({ display: "flex", p: "6px 16px", borderRadius: "8px", bg: "rgb(253, 237, 237)", color: "rgb(95, 33, 32)", textStyle: "ui" });

/* ── Multiline field (Multiline field with the pages' `sx`) ─────── */

const taRootCss = css({
  display: "flex",
  alignItems: "stretch",
  boxSizing: "border-box",
  width: "100%",
  bg: "transparent",
  color: "ink",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "#E2E8F0",
  borderRadius: "8px",
  py: "15.5px",
  px: "13px",
  textStyle: "ui",
  transition: "border-color .2s",
  _hover: { borderColor: "#CBD5E1" },
  "&:focus-within, &:hover:focus-within": { borderColor: "#0F172A" },
});
const taControlCss = css({
  display: "block",
  flex: 1,
  minWidth: 0,
  width: "100%",
  boxSizing: "content-box",
  height: "auto",
  resize: "none",
  overflowY: "hidden",
  m: 0,
  p: 0,
  bg: "transparent",
  border: "none",
  outline: "none",
  boxShadow: "none",
  appearance: "none",
  fontWeight: "inherit",
  color: "inherit",
  _placeholder: { color: "currentcolor", opacity: 0.42 },
});

/** Auto-growing textarea with auto-grow (no maxRows here). */
export function PageTextArea({
  value, onChange, placeholder, minRows = 3, id,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minRows?: number;
  id?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const cs = getComputedStyle(el);
    const lineHeight = parseFloat(cs.lineHeight) || 18.6875;
    const min = minRows * lineHeight;
    el.style.height = "auto";
    el.style.height = `${Math.max(el.scrollHeight, min)}px`;
  }, [value, minRows]);
  return (
    <div className={taRootCss}>
      <textarea
        ref={ref}
        id={id}
        rows={minRows}
        className={taControlCss}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}
