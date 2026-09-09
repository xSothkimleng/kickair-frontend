// Panda CSS recipes for the KickAir field system (the former MUI
// OutlinedInput/InputAdornment styling, now shared by every input in the kit).
//
// Anatomy:
//   <div class={fieldRoot({ size })} data-invalid data-disabled>   ← border, radius, focus ring
//     <span class={fieldAdornment}>…</span>                          ← optional start icon/text
//     <input class={fieldControl} />                                ← bare control
//     <button class={fieldIconButton}>…</button>                    ← optional end action
//   </div>
//
// Panda `preflight` is off while MUI is still mounted, so the recipes set
// box-sizing / font inheritance / appearance themselves.

import { css, cva } from "styled-system/css";

export const fieldRoot = cva({
  base: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    w: "100%",
    boxSizing: "border-box",
    bg: "field",
    color: "heading",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "border",
    borderRadius: "input",
    transition: "border-color .15s, box-shadow .15s",
    _hover: { borderColor: "borderStrong" },
    _focusWithin: { borderColor: "accent", boxShadow: "focusRing" },
    "&[data-invalid], &[data-invalid]:hover, &[data-invalid]:focus-within": { borderColor: "error" },
    "&[data-invalid]:focus-within": { boxShadow: "focusRingError" },
    "&[data-disabled], &[data-disabled]:hover": { bg: "fill", borderColor: "border", cursor: "not-allowed" },
  },
  variants: {
    size: {
      md: { minH: "46px", px: "14px", fontSize: "15px" },
      sm: { minH: "38px", px: "12px", fontSize: "14px" },
    },
    multiline: {
      true: { alignItems: "stretch" },
    },
  },
  defaultVariants: { size: "md" },
});

/** The bare <input>/<textarea> inside a fieldRoot. */
export const fieldControl = css({
  flex: 1,
  minW: 0,
  w: "100%",
  boxSizing: "border-box",
  m: 0,
  px: 0,
  py: "8px",
  bg: "transparent",
  border: "none",
  outline: "none",
  boxShadow: "none",
  appearance: "none",
  fontFamily: "inherit",
  fontSize: "inherit",
  lineHeight: 1.5,
  color: "inherit",
  _placeholder: { color: "placeholder", opacity: 1 },
  _disabled: { cursor: "not-allowed", color: "muted" },
  // Saved credentials must not grey the field out.
  _autofill: {
    boxShadow: "0 0 0 1000px token(colors.field) inset",
    WebkitTextFillColor: "token(colors.heading)",
    caretColor: "token(colors.heading)",
    borderRadius: "input",
  },
  "&::-webkit-search-cancel-button, &::-webkit-search-decoration": { WebkitAppearance: "none", appearance: "none" },
  "&::-webkit-outer-spin-button, &::-webkit-inner-spin-button": { WebkitAppearance: "none", margin: 0 },
});

/** Textarea flavour of fieldControl (auto-grows via TextArea's hook). */
export const fieldTextarea = css({
  display: "block",
  py: "11px",
  resize: "none",
  overflowY: "hidden",
});

/** Icon or short text sitting inside the field, before/after the control. */
export const fieldAdornment = css({
  display: "inline-flex",
  alignItems: "center",
  flexShrink: 0,
  color: "muted",
  lineHeight: 1,
  "& svg": { display: "block" },
});

/** Small round ghost button inside a field (password toggle, clear search). */
export const fieldIconButton = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  w: "28px",
  h: "28px",
  mr: "-6px",
  p: 0,
  border: "none",
  borderRadius: "pill",
  bg: "transparent",
  color: "muted",
  cursor: "pointer",
  fontFamily: "inherit",
  transition: "background-color .15s, color .15s",
  _hover: { bg: "fill", color: "body" },
  _focusVisible: { outline: "none", boxShadow: "focusRing" },
  _disabled: { opacity: 0.5, cursor: "default", pointerEvents: "none" },
  "& svg": { display: "block" },
  "&[hidden]": { display: "none" },
});

export const fieldLabel = css({
  display: "block",
  fontSize: "13px",
  fontWeight: 500,
  lineHeight: 1.5,
  color: "body",
  mb: "7px",
});

export const fieldHelper = cva({
  base: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    mt: "7px",
    fontSize: "12.5px",
    lineHeight: 1.45,
    color: "muted",
  },
  variants: {
    error: { true: { color: "error" } },
  },
});

// ── Popup parts (Select / MultiSelect / DatePicker) ────────────────────────
// NOTE: these popups render inline (no <Portal>) on purpose. Several callers
// mount the kit inside MUI <Dialog>, whose focus trap yanks focus back from
// anything portaled outside the dialog and closes an Ark popup on open.
// `positioning.strategy = "fixed"` still escapes overflow clipping. Switch to
// <Portal> once the last MUI Dialog is gone.

/** Select/Popover trigger: layered on top of `fieldRoot({ size })` for a <button>. */
export const fieldTrigger = css({
  cursor: "pointer",
  textAlign: "left",
  fontFamily: "inherit",
  fontWeight: 400,
  appearance: "none",
  m: 0,
  _focusVisible: { outline: "none" },
  "&[data-state=open]": { borderColor: "accent", boxShadow: "focusRing" },
  "&[data-invalid][data-state=open]": { borderColor: "error", boxShadow: "focusRingError" },
  "&[data-disabled]": { cursor: "not-allowed" },
});

/** Text inside a trigger; `data-placeholder` when nothing is selected. */
export const fieldTriggerText = css({
  flex: 1,
  minW: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  color: "heading",
  "&[data-placeholder]": { color: "placeholder" },
});

/** Chevron / calendar indicator inside a trigger; rotates when open. */
export const fieldIndicator = css({
  display: "inline-flex",
  alignItems: "center",
  flexShrink: 0,
  color: "muted",
  transition: "transform .15s",
  "& svg": { display: "block" },
  "&[data-state=open]": { transform: "rotate(180deg)" },
});

/** Ark positioner wrapper — carries the z-index above MUI dialogs (1300). */
export const fieldPositioner = css({
  "--z-index": "1400",
  zIndex: 1400,
});

/** The floating panel itself. */
export const fieldPopup = css({
  bg: "field",
  color: "heading",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "border",
  borderRadius: "cardSm",
  boxShadow: "0 12px 32px rgba(15,23,42,0.14)",
  outline: "none",
  zIndex: 1400,
});

/** Scrollable option list inside `fieldPopup`. */
export const fieldOptionList = css({
  p: "6px",
  maxH: "320px",
  overflowY: "auto",
});

export const fieldOption = css({
  display: "flex",
  alignItems: "center",
  gap: "10px",
  px: "10px",
  py: "8px",
  borderRadius: "7px",
  fontSize: "14.5px",
  lineHeight: 1.4,
  color: "body",
  cursor: "pointer",
  userSelect: "none",
  transition: "background-color .12s",
  "&[data-highlighted]": { bg: "fill" },
  "&[data-state=checked]": { color: "heading", fontWeight: 500 },
  "&[data-disabled]": { opacity: 0.45, cursor: "not-allowed" },
  "& > [data-part=item-text]": { flex: 1, minW: 0 },
});

/** Trailing check mark on a selected option. */
export const fieldOptionCheck = css({
  display: "inline-flex",
  color: "accent",
  flexShrink: 0,
  "& svg": { display: "block" },
  // Ark hides unselected indicators via the `hidden` attribute; with preflight off
  // our explicit display would win over the UA stylesheet, so restate it.
  "&[hidden]": { display: "none" },
});

/** Leading checkbox square on a multi-select option (parent Item carries data-state). */
export const fieldOptionBox = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  w: "18px",
  h: "18px",
  borderRadius: "5px",
  borderWidth: "1.5px",
  borderStyle: "solid",
  borderColor: "borderStrong",
  bg: "field",
  color: "white",
  transition: "background-color .12s, border-color .12s",
  "& svg": { display: "block", opacity: 0 },
  "[data-state=checked] > &": { bg: "accent", borderColor: "accent", "& svg": { opacity: 1 } },
});

/** Small value chip inside a multi-select trigger. */
export const fieldChip = css({
  display: "inline-flex",
  alignItems: "center",
  maxW: "100%",
  h: "24px",
  px: "8px",
  borderRadius: "7px",
  bg: "fill",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "border",
  fontSize: "12.5px",
  fontWeight: 500,
  color: "heading",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
});

// ── Combobox / tags parts ──────────────────────────────────────────────────

/** Wrapping area inside a fieldRoot that holds chips + the text input. */
export const fieldChipArea = css({
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: "4px",
  flex: 1,
  minW: 0,
  py: "5px",
  "& > input": { flex: "1 1 96px", w: "auto", minW: "96px", py: "3px" },
});

/** Remove (×) button inside a chip. */
export const fieldChipRemove = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  w: "16px",
  h: "16px",
  ml: "4px",
  mr: "-3px",
  p: 0,
  border: "none",
  borderRadius: "pill",
  bg: "transparent",
  color: "muted",
  cursor: "pointer",
  fontFamily: "inherit",
  _hover: { bg: "borderStrong", color: "heading" },
  _focusVisible: { outline: "none", boxShadow: "focusRing" },
  "& svg": { display: "block" },
});

/** "Add “xyz”" row in a creatable combobox list. */
export const fieldOptionCreate = css({
  color: "accent",
  fontWeight: 600,
  "&[data-highlighted]": { bg: "accentFill" },
  "& svg": { display: "block", flexShrink: 0 },
});

/** "No matches" row. */
export const fieldEmpty = css({
  px: "10px",
  py: "10px",
  fontSize: "13.5px",
  color: "muted",
});
