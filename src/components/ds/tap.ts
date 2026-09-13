import { css } from "styled-system/css";

/**
 * Touch-friendly hit area for small controls. On touch screens (coarse
 * pointer) the control grows to at least 36px tall — 44px is the comfortable
 * standard, 36px is the floor for dense chips and icon buttons — while mouse
 * users keep the compact size. Spread into a recipe with `...tapTarget` or
 * compose with `css(tapTarget, {...})`.
 *
 * Applies to anything a finger presses: filter chips, icon buttons, small
 * pills that navigate. Not for static status chips.
 */
export const tapTarget = css.raw({
  "@media (pointer: coarse)": { minH: "36px" },
});

/** Same, for square icon-only controls. */
export const tapTargetIcon = css.raw({
  "@media (pointer: coarse)": { minH: "36px", minW: "36px" },
});
