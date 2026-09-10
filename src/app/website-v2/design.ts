/**
 * website-v2 — the design language.
 *
 * Throwaway spike. Everything is self-contained here with raw values rather than
 * Panda tokens, so `rm -rf src/app/website-v2` removes it completely and
 * `panda.config.ts` never has to change.
 *
 * Rule references (§n) point at the `apple-design` skill.
 *
 * ── The decisions, and why ─────────────────────────────────────────────────
 *
 * TYPEFACE — Geist, kept. §15 says default to the platform font before a custom
 * face and override only with a reason. Geist is already loaded, is drawn with
 * real optical care, and its figures are properly tabular — which matters on a
 * product that shows money on nearly every screen. Swapping it would cost a
 * network round-trip and buy nothing. The root layout now loads 400–700 so
 * hierarchy can come from weight, not size alone.
 *
 * COLOUR — the old palette put everything on one flat #F5F5F7, which is why the
 * page had no rhythm. This defines a *ramp* of grounds (white → paper → canvas →
 * ink) so sections can differ in shape AND in ground, and a near-black surface so
 * a full-bleed dark section is possible without inventing colours later.
 *
 * Semantic roles, because on a marketplace colour has to mean something:
 *   accent    — action and navigation. The only blue.
 *   secure    — money is held in escrow. Teal, deliberately NOT the success
 *               green: "safe" and "done" are different states and the whole
 *               product hinges on the difference.
 *   success   — released, completed.
 *   attention — waiting on you.
 *   danger    — dispute, error.
 *
 * SPACING — one rem-based scale, so a user's text-size setting scales the layout
 * with the text (§15) instead of breaking it.
 */
import { css } from "styled-system/css";

/* ── Palette ─────────────────────────────────────────────────────────────── */
export const palette = {
  // Grounds, lightest to darkest. A section picks one; neighbours should differ.
  white: "#FFFFFF",
  paper: "#FBFBFD",
  canvas: "#F4F4F6",
  ink: "#0A0A0B",
  inkRaised: "#161618",
  inkHairline: "rgba(255,255,255,0.10)",

  // Text on light grounds.
  primary: "#0A0A0B",
  secondary: "rgba(10,10,11,0.62)",
  tertiary: "rgba(10,10,11,0.42)",
  hairline: "rgba(10,10,11,0.08)",
  hairlineStrong: "rgba(10,10,11,0.14)",

  // Text on the dark ground.
  onDark: "#FFFFFF",
  onDark2: "rgba(255,255,255,0.68)",
  onDark3: "rgba(255,255,255,0.44)",

  // Semantic.
  accent: "#0071E3",
  accentHover: "#0077ED",
  accentTint: "rgba(0,113,227,0.08)",
  secure: "#0D9488",
  secureTint: "rgba(13,148,136,0.10)",
  success: "#16A34A",
  successTint: "rgba(22,163,74,0.10)",
  attention: "#D97706",
  attentionTint: "rgba(217,119,6,0.10)",
  danger: "#DC2626",
  dangerTint: "rgba(220,38,38,0.10)",
} as const;

/* ── Springs (§4) ────────────────────────────────────────────────────────────
 * Apple designs in (damping, response); Motion takes (bounce, duration).
 * damping 1.0 → bounce 0. Bounce is reserved for motion that follows a gesture
 * carrying momentum — the rail, and nothing else.
 */
export const spring = {
  ui: { type: "spring", bounce: 0, duration: 0.4 },
  quick: { type: "spring", bounce: 0, duration: 0.25 },
  momentum: { type: "spring", bounce: 0.2, duration: 0.45 },
} as const;

/** §14 — reduced motion is a gentler equivalent, not the absence of feedback. */
export const crossFade = { duration: 0.2, ease: "easeOut" } as const;

/* ── Type scale (§15) ────────────────────────────────────────────────────────
 * Tracking is size-specific: negative as type grows, ~0 at body, positive on the
 * smallest sizes. Leading runs inverse to size. Sizes in rem.
 */
export const text = {
  /** Reserved for one statement per page. */
  hero: css({
    fontSize: "clamp(3rem, 8vw, 6.5rem)",
    lineHeight: 0.98,
    letterSpacing: "-0.04em",
    fontWeight: 600,
    fontOpticalSizing: "auto",
    textWrap: "balance",
  }),
  display: css({
    fontSize: "clamp(2.25rem, 5vw, 4rem)",
    lineHeight: 1.04,
    letterSpacing: "-0.033em",
    fontWeight: 600,
    fontOpticalSizing: "auto",
    textWrap: "balance",
  }),
  title: css({
    fontSize: "clamp(1.5rem, 2.6vw, 2.25rem)",
    lineHeight: 1.1,
    letterSpacing: "-0.026em",
    fontWeight: 600,
    textWrap: "balance",
  }),
  /** Card and panel headings. */
  heading: css({
    fontSize: "1.0625rem",
    lineHeight: 1.3,
    letterSpacing: "-0.012em",
    fontWeight: 600,
  }),
  /** Standfirst under a hero or display. */
  lead: css({
    fontSize: "clamp(1.0625rem, 1.5vw, 1.375rem)",
    lineHeight: 1.45,
    letterSpacing: "-0.014em",
    fontWeight: 400,
    textWrap: "pretty",
  }),
  body: css({
    fontSize: "0.9375rem",
    lineHeight: 1.55,
    letterSpacing: "0",
    fontWeight: 400,
  }),
  /** Dense app UI — tighter leading than marketing body. */
  ui: css({
    fontSize: "0.875rem",
    lineHeight: 1.4,
    letterSpacing: "0.002em",
    fontWeight: 400,
  }),
  /** Small supporting text. Positive tracking to stay legible. */
  caption: css({
    fontSize: "0.8125rem",
    lineHeight: 1.4,
    letterSpacing: "0.01em",
    fontWeight: 400,
  }),
  /** Field labels and column headers. */
  label: css({
    fontSize: "0.75rem",
    lineHeight: 1.3,
    letterSpacing: "0.02em",
    fontWeight: 550,
    textTransform: "uppercase",
  }),
  /**
   * Money. Tabular figures so columns of amounts align and a changing balance
   * does not reflow — §16 Craft: nothing about a number should jitter.
   */
  money: css({
    fontVariantNumeric: "tabular-nums",
    letterSpacing: "-0.015em",
    fontWeight: 600,
  }),
  /**
   * §12 Vibrancy — for text on a translucent surface. Heavier and higher
   * contrast than body, with a small tracking bump, because flat grey dies over
   * a moving backdrop.
   */
  onMaterial: css({
    fontSize: "0.875rem",
    lineHeight: 1.3,
    letterSpacing: "0.004em",
    fontWeight: 500,
    color: "rgba(10,10,11,0.82)",
  }),
} as const;

/* ── Depth (§12) ─────────────────────────────────────────────────────────────
 * Bigger surfaces read as thicker. A chip and a modal must not share a shadow or
 * neither reads as a real object.
 */
export const shadow = {
  chip: "0 1px 2px rgba(10,10,11,0.05), 0 1px 1px rgba(10,10,11,0.03)",
  card: "0 1px 2px rgba(10,10,11,0.04), 0 8px 24px -6px rgba(10,10,11,0.07)",
  raised: "0 2px 4px rgba(10,10,11,0.05), 0 18px 44px -10px rgba(10,10,11,0.12)",
  float: "0 4px 8px rgba(10,10,11,0.06), 0 32px 68px -16px rgba(10,10,11,0.18)",
  chrome: "0 1px 0 rgba(10,10,11,0.04), 0 8px 32px -8px rgba(10,10,11,0.06)",
  /** On the dark ground, separation comes from a lit edge, not a darker shadow. */
  onDark: "inset 0 1px 0 rgba(255,255,255,0.07), 0 20px 50px -12px rgba(0,0,0,0.6)",
} as const;

export const radius = {
  chip: "0.5rem",
  tile: "0.75rem",
  card: "1rem",
  panel: "1.25rem",
  pill: "999px",
} as const;

/**
 * §12 Translucent material, with the two accessibility escapes it needs (§14).
 * Unprefixed backdrop-filter only: Panda's nested style type rejects the
 * -webkit- alias, and carrying both would leave the prefixed one uncleared by
 * the media queries. Safari has shipped unprefixed since 18.
 */
export const material = css({
  bg: "rgba(255,255,255,0.72)",
  backdropFilter: "blur(20px) saturate(180%)",
  borderTop: "1px solid rgba(255,255,255,0.5)",
  "@media (prefers-reduced-transparency: reduce)": {
    bg: "#FFFFFF",
    backdropFilter: "none",
  },
  "@media (prefers-contrast: more)": {
    bg: "#FFFFFF",
    backdropFilter: "none",
    borderBottom: "1px solid rgba(10,10,11,0.5)",
  },
});

/** The same material inverted, for chrome sitting on the dark ground. */
export const materialDark = css({
  bg: "rgba(10,10,11,0.62)",
  backdropFilter: "blur(20px) saturate(180%)",
  borderTop: "1px solid rgba(255,255,255,0.08)",
  "@media (prefers-reduced-transparency: reduce)": {
    bg: "#0A0A0B",
    backdropFilter: "none",
  },
});

/** Page gutter, shared by every surface so the whole product lines up. */
export const gutter = { base: "1.25rem", sm: "2rem", lg: "2.5rem" } as const;
