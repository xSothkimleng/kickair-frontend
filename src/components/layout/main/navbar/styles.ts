import { css } from "styled-system/css";
import { tapTargetIcon } from "@/components/ds/tap";
import { iconButton } from "@/components/ds";

/**
 * Shared Panda style fragments for the navbar. `css.raw(...)` fragments are merged
 * with per-use overrides via `css(fragment, {...})`, so a conflicting property is
 * resolved by object merge (one class set per element) instead of two atomic
 * classes competing in the stylesheet.
 */

// Button reset + the text-button defaults the old navbar relied on
// (14px/500, 6px 8px padding, 64px min-width, 4px radius).
export const navBtnRaw = css.raw({
  appearance: "none",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
  boxSizing: "border-box",
  m: 0,
  px: "8px",
  py: "6px",
  minW: "64px",
  border: "none",
  borderRadius: "4px",
  bg: "transparent",
  color: "inherit",
  textStyle: "body",
  fontWeight: 500,
  textTransform: "none",
  textDecoration: "none",
  textAlign: "center",
  verticalAlign: "middle",
  userSelect: "none",
  cursor: "pointer",
  transition: "background-color .25s cubic-bezier(.4,0,.2,1), color .25s cubic-bezier(.4,0,.2,1), border-color .25s cubic-bezier(.4,0,.2,1)",
  _disabled: { cursor: "default", pointerEvents: "none" },
});

// Floating panel shared by the hover mega-menus and the language/profile dropdowns.
export const dropdownPanelRaw = css.raw({
  position: "absolute",
  top: "100%",
  mt: 0,
  width: "max-content",
  bg: "white",
  borderRadius: "16px",
  boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
  overflow: "hidden",
  border: "1px solid rgba(0,0,0,0.08)",
  zIndex: 1000,
});

export const dropdownItemCss = css(navBtnRaw, {
  width: "100%",
  textAlign: "left",
  display: "flex",
  flexDirection: "row",
  alignItems: "flex-start",
  justifyContent: "flex-start",
  gap: "12px",
  p: "16px",
  borderRadius: "12px",
  color: "black",
  _hover: { bg: "rgba(0,0,0,0.04)" },
  "& svg": { transition: "color 0.2s" },
  "&:hover svg": { color: "black" },
});

export const navBtnCss = css(navBtnRaw, {
  textStyle: "body",
  color: "ink",
  _hover: { bg: "transparent", color: "black" },
});

// Mode-switcher pills (profile dropdown + mobile drawer).
const modeBtnRaw = css.raw({ flex: 1, px: "12px", py: "8px", textStyle: "meta", borderRadius: "8px" });
export const modeBtnOnCss = css(navBtnRaw, modeBtnRaw, { bg: "black", color: "white", _hover: { bg: "black" } });
export const modeBtnOffCss = css(navBtnRaw, modeBtnRaw, { bg: "rgba(0,0,0,0.05)", color: "ink2", _hover: { bg: "rgba(0,0,0,0.1)" } });

// 30px round icon button used by both bells (the small icon button look).
export const bellBtnCss = css(iconButton.raw({ size: "sm" }), tapTargetIcon, {
  color: "ink2",
  _hover: { bg: "rgba(0,0,0,0.04)", color: "ink2" },
});
