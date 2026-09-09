import { defineConfig } from "@pandacss/dev";

/**
 * KickAir Panda CSS configuration.
 *
 * Single source of truth for design tokens — consolidates the two legacy MUI
 * token objects (`src/theme.ts` → payment/Apple-ish surfaces, and
 * `src/components/ui/inputs/tokens.ts` → slate form-field palette) into one
 * typed system.
 *
 * MIGRATION NOTE: `preflight` is OFF on purpose. While MUI/Emotion still render
 * ~170 pages, a global Panda reset would fight MUI's baseline. Panda-migrated
 * pages are fully hand-styled, so they don't need the preflight. Flip this to
 * `true` in the final phase once `@mui/*` + `@emotion/*` are removed.
 */
export default defineConfig({
  preflight: false,

  // Scan only the live app source. The `.claude/worktrees/**` duplicate lives
  // outside ./src, so it's excluded automatically.
  include: ["./src/**/*.{js,jsx,ts,tsx}"],
  exclude: [],

  // Enables the `styled` factory + JSX style props for hand-rolled primitives.
  jsxFramework: "react",

  theme: {
    extend: {
      tokens: {
        colors: {
          // ── Slate UI palette (primary app surface — from inputs/tokens.ts) ──
          heading: { value: "#0F172A" },
          body: { value: "#334155" },
          muted: { value: "#64748B" },
          placeholder: { value: "#94A3B8" },
          border: { value: "#E2E8F0" },
          borderStrong: { value: "#CBD5E1" },
          field: { value: "#FFFFFF" },
          fill: { value: "#F1F5F9" },
          page: { value: "#F5F5F7" },

          // ── Interactive accent ──
          accent: { value: "#0071e3" },
          accentHover: { value: "#0077ED" },
          accentFill: { value: "rgba(0, 113, 227, 0.05)" },

          // ── Status ──
          success: { value: "#16a34a" },
          successText: { value: "#15803d" },
          successTint: { value: "rgba(22, 163, 74, 0.10)" },
          warning: { value: "#f59e0b" },
          pending: { value: "#ea580c" },
          pendingText: { value: "#b45309" },
          pendingTint: { value: "rgba(234, 88, 12, 0.10)" },
          error: { value: "#DC2626" },
          errorText: { value: "#b91c1c" },
          errorTint: { value: "rgba(220, 38, 38, 0.10)" },

          // ── Apple-ish payment surfaces (from theme.ts) ──
          surface: { value: "#FFFFFF" },
          surface2: { value: "#FBFBFD" },
          canvas: { value: "#F5F5F7" },
          ink: { value: "#000000" },
          ink2: { value: "rgba(0, 0, 0, 0.6)" },
          ink3: { value: "rgba(0, 0, 0, 0.4)" },
          hairline: { value: "rgba(0, 0, 0, 0.08)" },
          hairlineStrong: { value: "rgba(0, 0, 0, 0.14)" },
          brand: { value: "#000000" },

          // ── ABA hosted-page palette (third-party look, payment popup only) ──
          aba: {
            navy: { value: "#0a1f44" },
            navy2: { value: "#0c2a5a" },
            blue: { value: "#1556c0" },
            bg: { value: "#eef1f6" },
          },
        },
        radii: {
          card: { value: "16px" },
          cardSm: { value: "12px" },
          tile: { value: "10px" },
          input: { value: "10px" },
          pill: { value: "999px" },
        },
        fonts: {
          mono: { value: "'Roboto Mono', ui-monospace, 'SF Mono', Menlo, monospace" },
        },
        shadows: {
          focusRing: { value: "0 0 0 3px rgba(0,113,227,0.18)" },
          focusRingError: { value: "0 0 0 3px rgba(220,38,38,0.16)" },
        },
      },
      keyframes: {
        spin: { to: { transform: "rotate(360deg)" } },
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideInRight: { from: { opacity: 0, transform: "translateX(24px)" }, to: { opacity: 1, transform: "none" } },
        slideInLeft: { from: { opacity: 0, transform: "translateX(-24px)" }, to: { opacity: 1, transform: "none" } },
        slideUp: { from: { opacity: 0, transform: "translateY(12px)" }, to: { opacity: 1, transform: "none" } },
        pop: { from: { opacity: 0, transform: "translateY(8px) scale(.98)" }, to: { opacity: 1, transform: "none" } },
        pulse: { "0%, 100%": { opacity: 1 }, "50%": { opacity: 0.45 } },
      },
    },
  },

  outdir: "styled-system",
});
