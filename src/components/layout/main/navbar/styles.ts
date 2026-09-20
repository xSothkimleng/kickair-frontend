import { css } from "styled-system/css";
import { tapTargetIcon } from "@/components/ds/tap";

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

// ── Right-hand cluster: messages · notifications · account pill (name + balance) ──
// ONE spec for every control in the cluster — 36px tall, pill, the same grey
// hover fill, `ui` text. To change the cluster's height / radius / hover, edit
// clusterCtlRaw; the four controls below only add their own padding and colour.
export const clusterCtlRaw = css.raw({
  appearance: "none",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
  boxSizing: "border-box",
  flexShrink: 0,
  m: 0,
  py: 0,
  h: "36px",
  border: "none",
  borderRadius: "pill",
  bg: "transparent",
  color: "ink",
  textStyle: "ui",
  fontWeight: 500,
  whiteSpace: "nowrap",
  userSelect: "none",
  cursor: "pointer",
  transition: "background-color .15s, border-color .15s, box-shadow .15s",
  _hover: { bg: "rgba(0,0,0,0.05)" },
  _focusVisible: { outline: "none", boxShadow: "focusRing" },
});

// Wallet balance as a standalone chip (mobile drawer). On the desktop bar the balance lives
// inside the account pill instead — see pillBalanceCss.
export const walletChipCss = css(clusterCtlRaw, {
  gap: "7px",
  pl: "11px",
  pr: "13px",
  bg: "canvas",
  fontWeight: 600,
  fontVariantNumeric: "tabular-nums",
  _hover: { bg: "#EAEAEE" },
  "& svg": { color: "ink3", flexShrink: 0 },
});

// Both bells: 36px round ghost buttons around a 20px icon.
export const bellBtnCss = css(clusterCtlRaw, tapTargetIcon, {
  w: "36px",
  px: 0,
  color: "ink2",
});
// The two bells sit closer to each other than to their neighbours, so they read as one alerts group.
export const bellGroupCss = css({ display: "flex", alignItems: "center", gap: "2px" });
// Badge inset for a 36px bell: tucks the count onto the 20px icon instead of the button's corner.
export const BELL_BADGE_OFFSET = 3;

// Account pill (Steam-style): avatar · first name ⌄ | balance, in the cluster's only outlined pill —
// it anchors the end of the bar. One outline, two hit zones: the name half opens the profile menu,
// the balance half goes to Finance. The pill clips its zones (overflow hidden), so their hover fill
// follows the rounded ends and their focus ring is drawn inset.
export const accountPillCss = css({
  display: "flex",
  alignItems: "center",
  boxSizing: "border-box",
  flexShrink: 0,
  h: "36px",
  border: "1px solid rgba(0,0,0,0.1)",
  borderRadius: "pill",
  overflow: "hidden",
  transition: "border-color .15s",
  _hover: { borderColor: "rgba(0,0,0,0.22)" },
  "&:has([aria-expanded=true])": { borderColor: "rgba(0,0,0,0.22)" },
});
const pillZoneRaw = css.raw(clusterCtlRaw, {
  h: "100%",
  borderRadius: 0,
  _focusVisible: { outline: "none", boxShadow: "inset 0 0 0 2px var(--colors-accent)" },
});
// The full name lives in the menu header; the first name here is capped and ellipsised
// (profileNameCss), so a long name can't push the bar around.
export const profileBtnCss = css(pillZoneRaw, {
  gap: "6px",
  pl: "3px",
  pr: "8px",
  _expanded: { bg: "rgba(0,0,0,0.05)" },
});
export const pillDividerCss = css({ w: "1px", h: "16px", bg: "rgba(0,0,0,0.1)", flexShrink: 0 });
export const pillBalanceCss = css(pillZoneRaw, {
  pl: "10px",
  pr: "13px",
  color: "ink2",
  fontWeight: 600,
  fontVariantNumeric: "tabular-nums",
  _hover: { bg: "rgba(0,0,0,0.05)", color: "ink" },
});
export const profileNameCss = css({ ml: "2px", maxW: "96px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" });
export const profileChevronCss = css({ color: "ink3", flexShrink: 0, transition: "transform 0.2s" });
