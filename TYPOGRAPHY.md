# Typography

One font, nine sizes, one line-height each. Everything below lives in two files, so a change is a one-line edit.

| To change… | Edit |
|---|---|
| The font itself | `src/app/layout.tsx` — the `next/font` constructor (`Inter` today). Keep the CSS variable name `--font-sans`. |
| The Khmer fallback | `src/app/layout.tsx` — `Kantumruy_Pro`, variable `--font-khmer`. |
| A size, line-height or tracking | `panda.config.ts` → `theme.extend.textStyles`. Every component using that role follows. |
| The text greys | `panda.config.ts` → `colors.ink`, `ink2`, `ink3`, `placeholder`. The form-kit names `heading` / `body` / `muted` are aliases of these. |

## The roles

Use `textStyle: "<role>"` in `css()` / `cva()`, or `<Text size="<role>">` from `components/ds`. Add `fontWeight` and `color` beside it; never `fontSize`, `lineHeight`, `letterSpacing` or `fontFamily` (ESLint blocks them).

| Role | px | Line | Tracking | Used for |
|---|---|---|---|---|
| `micro` | 11 | 1.4 | 0 | tags, badge counts, tiny notes |
| `eyebrow` | 11 | 1.4 | 0.06em | UPPERCASE section labels (uppercase + weight 600 baked in) |
| `meta` | 12 | 1.5 | 0 | dates, refs, helper text, captions |
| `ui` | 13 | 1.5 | 0 | table cells, list rows, chips, dense app UI |
| `body` | 14 | 1.5 | 0 | paragraphs, buttons, form labels — the default |
| `lead` | 16 | 1.5 | 0 | card titles, marketing body, checkout inputs |
| `title` | 20 | 1.3 | -0.01em | section and dialog titles, summary totals |
| `heading` | 24 | 1.25 | -0.015em | page titles |
| `stat` | 32 | 1.15 | -0.02em | balance, top-up amount, big numbers |
| `display` | 40–60 fluid | 1.05 | -0.025em | marketing headlines only |
| `input` / `inputSm` | 16 on phones, 15 / 14 from `md` | 1.5 | 0 | form fields (iOS Safari zooms when a focused input is under 16px) |

Sizes are stored in rem (px shown at the 16px browser default), so a reader's browser text-size setting scales the site. Responsive: `textStyle: { base: "heading", md: "display" }`.

Nothing renders under 11px.

## Weight

Hierarchy comes from weight, not from extra sizes.

| Weight | Use |
|---|---|
| 400 | body, meta |
| 500 | labels, buttons, chips |
| 600 | headings, amounts, anything that must lead |
| 700 | display headlines only |

No 800, no 550. Inter is loaded as a variable font, so any value works, but the scale stays at these four.

## Money and figures

There is no monospace font. Amounts, counts and ids use the site font with tabular digits so columns align and a changing balance does not reflow:

```ts
css({ textStyle: "stat", fontWeight: 600, fontVariantNumeric: "tabular-nums" })
// or
money({ size: "stat" })            // ds recipe: tabular + weight 600 by default
```

Tabular digits are for aligned figures only; running text keeps proportional digits.

## Colour of text

| Token | Value | Contrast on white | Use |
|---|---|---|---|
| `ink` (= `heading`) | #000 | 21:1 | titles, amounts, primary text |
| `ink2` (= `body`) | 70 % black | 8.3:1 | paragraphs, secondary text |
| `ink3` (= `muted`) | 55 % black | 4.7:1 | labels, meta — the lightest text may go |
| `placeholder` | 42 % black | 2.9:1 | placeholder text only, never labels |

Inside `css()`, write the token (`color: "ink3"`), not an rgba literal.

## Controls

`globals.css` makes `button`, `input`, `select`, `textarea` inherit font, size and line-height, so hand-rolled controls need no `fontFamily: "inherit"`. Buttons and chips have a fixed height with centred content and never depend on line-height.

Anything a finger presses that is shorter than 36px composes `tapTarget` (or `tapTargetIcon` for square icon buttons) from `components/ds/tap.ts`: on touch screens the control grows to a 36px minimum, mouse users keep the compact size. The ds `IconButton` already includes it.

```ts
const chip = css(tapTarget, { h: "28px", px: "12px", ... });
```

## The guard

`eslint.config.mjs` rejects `fontSize`, `lineHeight` (except `1`), `letterSpacing` and `fontFamily` inside `src/`. If a one-off is genuinely needed (a marketing headline with custom tracking), add `// eslint-disable-next-line no-restricted-syntax -- <why>` above the line so the exception is visible in review. The `website-v2` spike is exempt.

## History

Set up 2026-09-13. Before this the site loaded Geist, asked for an unloaded Roboto Mono for every number (which fell back to Menlo on Mac and a different font on every other platform), and set size in about 1,500 places with 70 distinct values, half of them copied from MUI defaults. See `HANDOFF.md` for the migration log.
