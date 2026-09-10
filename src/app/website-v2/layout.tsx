import type { ReactNode } from "react";
import { css } from "styled-system/css";

/**
 * Shared shell for every website-v2 route.
 *
 * It exists to publish the palette as CSS custom properties. Panda extracts
 * styles statically at build time, so `css({ color: palette.primary })` — an
 * imported object read — generates nothing at all: the rule silently vanishes
 * and the element renders unstyled. Custom properties sidestep that, because
 * `css({ color: "var(--v2-primary)" })` is a literal string Panda can see, while
 * the value itself stays runtime.
 *
 * Two rules follow, and they are the whole reason this file exists:
 *   1. Inside css(), every colour is a `var(--v2-*)` string. Never `palette.x`.
 *   2. Every declaration below is written out literally. Generating them with
 *      Object.entries would reintroduce exactly the bug it is here to avoid.
 *
 * The raw `palette` export in design.ts is for the few places that cannot take a
 * custom property — SVG presentation attributes, mostly. Keep the two in sync.
 */
const theme = css({
  "--v2-white": "#FFFFFF",
  "--v2-paper": "#FBFBFD",
  "--v2-canvas": "#F4F4F6",
  "--v2-ink": "#0A0A0B",
  "--v2-inkRaised": "#161618",
  "--v2-inkHairline": "rgba(255,255,255,0.10)",

  "--v2-primary": "#0A0A0B",
  "--v2-secondary": "rgba(10,10,11,0.62)",
  "--v2-tertiary": "rgba(10,10,11,0.42)",
  "--v2-hairline": "rgba(10,10,11,0.08)",
  "--v2-hairlineStrong": "rgba(10,10,11,0.14)",

  "--v2-onDark": "#FFFFFF",
  "--v2-onDark2": "rgba(255,255,255,0.68)",
  "--v2-onDark3": "rgba(255,255,255,0.44)",

  "--v2-accent": "#0071E3",
  "--v2-accentHover": "#0077ED",
  "--v2-accentTint": "rgba(0,113,227,0.08)",
  "--v2-secure": "#0D9488",
  "--v2-secureTint": "rgba(13,148,136,0.10)",
  "--v2-success": "#16A34A",
  "--v2-successTint": "rgba(22,163,74,0.10)",
  "--v2-attention": "#D97706",
  "--v2-attentionTint": "rgba(217,119,6,0.10)",
  "--v2-danger": "#DC2626",
  "--v2-dangerTint": "rgba(220,38,38,0.10)",

  "--v2-r-chip": "0.5rem",
  "--v2-r-tile": "0.75rem",
  "--v2-r-card": "1rem",
  "--v2-r-panel": "1.25rem",
  "--v2-r-pill": "999px",

  "--v2-sh-chip": "0 1px 2px rgba(10,10,11,0.05), 0 1px 1px rgba(10,10,11,0.03)",
  "--v2-sh-card": "0 1px 2px rgba(10,10,11,0.04), 0 8px 24px -6px rgba(10,10,11,0.07)",
  "--v2-sh-raised": "0 2px 4px rgba(10,10,11,0.05), 0 18px 44px -10px rgba(10,10,11,0.12)",
  "--v2-sh-float": "0 4px 8px rgba(10,10,11,0.06), 0 32px 68px -16px rgba(10,10,11,0.18)",
  "--v2-sh-chrome": "0 1px 0 rgba(10,10,11,0.04), 0 8px 32px -8px rgba(10,10,11,0.06)",
  "--v2-sh-onDark": "inset 0 1px 0 rgba(255,255,255,0.07), 0 20px 50px -12px rgba(0,0,0,0.6)",
});

export default function WebsiteV2Layout({ children }: { children: ReactNode }) {
  return <div className={theme}>{children}</div>;
}
