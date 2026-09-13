import { defineConfig } from "@pandacss/dev";

/**
 * KickAir Panda CSS configuration.
 *
 * Single source of truth for design tokens: colours, radii, shadows, and the
 * whole typography system (see TYPOGRAPHY.md for the rules and the roles).
 *
 * To change the site font: edit `src/app/layout.tsx` (next/font) and, if the
 * fallback stack changes, `globals.css`. To change a text size, line-height, or
 * tracking: edit `textStyles` below. Components never set those directly (an
 * ESLint rule enforces it); they pick a role with `textStyle: "ui"`.
 *
 * `preflight` is still OFF after the MUI removal (2026-09-13), on purpose. The
 * site was built against the browser defaults + the bare rules in globals.css:
 * flipping it on was measured to move every page (border-box shrinks every
 * `maxW` + padding container, `html { line-height: 1.5 }` re-flows text, and
 * margins on `p`/`h*` that the bare globals.css rules used to cancel start to
 * apply — 52 % of the homepage pixels, +240–360 px on the marketing pages, the
 * admin console's phone layout collapsing). Turning it on is a separate restyle
 * pass over the pre-rulebook Panda files (homepage sections, university, why,
 * Footer, admin/ui.tsx, layout/dashboard); see HANDOFF.md.
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
          // ── Text tones ──
          // One set of text colours for the whole site. `ink*` are the real
          // values; `heading` / `body` / `muted` / `placeholder` are the older
          // form-kit names kept as aliases so both vocabularies resolve to the
          // same greys. Change the alpha here and every label follows.
          //
          // Contrast on white: ink 21:1 · ink2 8.3:1 · ink3 4.7:1 (the WCAG AA
          // floor for text is 4.5:1, so ink3 is the lightest tone text may use;
          // `placeholder` is for placeholder text only).
          heading: { value: "{colors.ink}" },
          body: { value: "{colors.ink2}" },
          muted: { value: "{colors.ink3}" },
          placeholder: { value: "rgba(0, 0, 0, 0.42)" },
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
          ink2: { value: "rgba(0, 0, 0, 0.7)" },
          ink3: { value: "rgba(0, 0, 0, 0.55)" },
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
          // The site font. `--font-sans` / `--font-khmer` are set on <html> by
          // next/font in src/app/layout.tsx; globals.css applies this same stack.
          sans: { value: "var(--font-sans), var(--font-khmer), ui-sans-serif, system-ui, sans-serif" },
        },
        shadows: {
          focusRing: { value: "0 0 0 3px rgba(0,113,227,0.18)" },
          focusRingError: { value: "0 0 0 3px rgba(220,38,38,0.16)" },
        },
      },
      // ── Typography roles ──
      // Nine sizes, one line-height and tracking each. Use `textStyle: "<role>"`
      // and add `fontWeight` / `color` beside it. Explicit utilities next to a
      // textStyle win over it (Panda emits text styles in a lower sub-layer),
      // so a one-off `letterSpacing` override still works.
      //
      // Sizes are rem so a reader's browser text-size setting scales the site;
      // the px in the comments are at the 16px default.
      //
      //   role      px   line  tracking   used for
      //   micro     11   1.4   0          tags, badge counts, tiny notes
      //   eyebrow   11   1.4   0.06em     UPPERCASE section labels (weight 600 baked in)
      //   meta      12   1.5   0          dates, refs, helper text, captions
      //   ui        13   1.5   0          table cells, list rows, chips, dense app UI
      //   body      14   1.5   0          paragraphs, buttons, form labels (default)
      //   lead      16   1.5   0          card titles, marketing body, checkout inputs
      //   title     20   1.3   -0.01em    section and dialog titles, summary totals
      //   heading   24   1.25  -0.015em   page titles
      //   stat      32   1.15  -0.02em    balance, big numbers
      //   display   40–60 fluid 1.05 -0.025em  marketing headlines only
      //   input     16 on phones / 15 from md up; inputSm 16 / 14 — iOS Safari
      //             zooms the page on focus when an input is under 16px.
      //
      // Money is not a role: add `fontVariantNumeric: "tabular-nums"` (and
      // usually fontWeight 600) to any role, or use the ds `money` recipe.
      textStyles: {
        micro: { value: { fontSize: "0.6875rem", lineHeight: 1.4, letterSpacing: "0" } },
        eyebrow: { value: { fontSize: "0.6875rem", lineHeight: 1.4, letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 600 } },
        meta: { value: { fontSize: "0.75rem", lineHeight: 1.5, letterSpacing: "0" } },
        ui: { value: { fontSize: "0.8125rem", lineHeight: 1.5, letterSpacing: "0" } },
        body: { value: { fontSize: "0.875rem", lineHeight: 1.5, letterSpacing: "0" } },
        lead: { value: { fontSize: "1rem", lineHeight: 1.5, letterSpacing: "0" } },
        title: { value: { fontSize: "1.25rem", lineHeight: 1.3, letterSpacing: "-0.01em" } },
        heading: { value: { fontSize: "1.5rem", lineHeight: 1.25, letterSpacing: "-0.015em" } },
        stat: { value: { fontSize: "2rem", lineHeight: 1.15, letterSpacing: "-0.02em" } },
        display: { value: { fontSize: "clamp(2.5rem, 5vw, 3.75rem)", lineHeight: 1.05, letterSpacing: "-0.025em" } },
        input: { value: { fontSize: { base: "1rem", md: "0.9375rem" }, lineHeight: 1.5, letterSpacing: "0" } },
        inputSm: { value: { fontSize: { base: "1rem", md: "0.875rem" }, lineHeight: 1.5, letterSpacing: "0" } },
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
