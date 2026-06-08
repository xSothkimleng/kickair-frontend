"use client";
import { createTheme } from "@mui/material/styles";

/**
 * KickAir payment-surface design tokens.
 * Lifted from the approved ABA PayWay design prototype so the values live in
 * one place and stay consistent across every payment screen. Use in `sx` via
 * `import { tokens } from "@/theme"`.
 */
export const tokens = {
  // Surfaces
  canvas: "#F5F5F7",
  surface: "#FFFFFF",
  surface2: "#FBFBFD",

  // Text
  text: "#000000",
  text2: "rgba(0, 0, 0, 0.6)",
  text3: "rgba(0, 0, 0, 0.4)",

  // Lines
  border: "rgba(0, 0, 0, 0.08)",
  borderStrong: "rgba(0, 0, 0, 0.14)",

  // Interactive accent
  accent: "#0071e3",
  accentHover: "#0077ED",
  accentFill: "rgba(0, 113, 227, 0.05)",
  accentRgb: "0, 113, 227",

  // Status
  success: "#16a34a",
  successText: "#15803d",
  successTint: "rgba(22, 163, 74, 0.10)",
  pending: "#ea580c",
  pendingText: "#b45309",
  pendingTint: "rgba(234, 88, 12, 0.10)",
  error: "#dc2626",
  errorText: "#b91c1c",
  errorTint: "rgba(220, 38, 38, 0.10)",

  // Brand (KickAir merchant mark) — monochrome
  brand: "#000000",

  // ABA hosted-page palette (deliberately NOT ours — used only inside the
  // simulated ABA PayWay popup so it reads as a third-party screen)
  abaNavy: "#0a1f44",
  abaNavy2: "#0c2a5a",
  abaBlue: "#1556c0",
  abaBg: "#eef1f6",

  // Radii (px)
  radius: { card: 16, cardSm: 12, tile: 10, input: 10, pill: 999 },

  // Payment-logo slot shape — "50%" round, "22%" square
  logoRadius: "50%",

  // Monospace (refs, QR caption, tabular numerals)
  mono: "'Roboto Mono', ui-monospace, 'SF Mono', Menlo, monospace",
} as const;

const theme = createTheme({
  typography: {
    fontFamily: "var(--font-roboto)",
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableRipple: false,
      },
      styleOverrides: {
        root: {
          textTransform: "none",
        },
        text: {
          color: "inherit",
        },
        outlined: {
          color: "inherit",
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
        },
      },
    },
  },
});

export default theme;
