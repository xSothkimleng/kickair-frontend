"use client";

import { Slider as Ark } from "@ark-ui/react";
import { css, cx } from "styled-system/css";

/**
 * Ark UI `Slider` styled with
 * Panda on the slate palette — 4px rail, 16px white thumb with a 2px ink ring
 * and the "halo" on hover/focus/drag, plus the `valueLabelDisplay="auto"`
 * bubble above the active thumb.
 *
 * `value` is always an array (one entry per thumb), like Ark/Zag.
 */

const rootCss = css({ w: "100%", boxSizing: "border-box" });

const controlCss = css({
  display: "flex",
  alignItems: "center",
  position: "relative",
  // The old slider root is `height: 4px` + `padding: 13px 0` — same hit area.
  h: "30px",
  cursor: "pointer",
  "&[data-disabled]": { cursor: "not-allowed", opacity: 0.5 },
});

const trackCss = css({
  flex: 1,
  h: "4px",
  borderRadius: "pill",
  bg: "border",
});

const rangeCss = css({
  top: 0,
  h: "100%",
  borderRadius: "pill",
  bg: "heading",
});

const thumbCss = css({
  boxSizing: "border-box",
  w: "16px",
  h: "16px",
  borderRadius: "pill",
  bg: "white",
  borderWidth: "2px",
  borderStyle: "solid",
  borderColor: "heading",
  outline: "none",
  cursor: "grab",
  transition: "box-shadow .15s",
  _hover: { boxShadow: "0 0 0 6px rgba(15, 23, 42, 0.08)", "& .ds-slider-bubble": { opacity: 1 } },
  "&[data-focus], &[data-dragging]": { boxShadow: "0 0 0 6px rgba(15, 23, 42, 0.08)" },
  "&[data-dragging]": { cursor: "grabbing" },
  "&[data-dragging] .ds-slider-bubble, &:focus-visible .ds-slider-bubble": { opacity: 1 },
});

const bubbleCss = css({
  position: "absolute",
  bottom: "calc(100% + 8px)",
  left: "50%",
  transform: "translateX(-50%)",
  px: "8px",
  py: "2px",
  borderRadius: "6px",
  bg: "heading",
  color: "white",
  textStyle: "micro",
  whiteSpace: "nowrap",
  pointerEvents: "none",
  opacity: 0,
  transition: "opacity .15s",
});

export interface SliderProps {
  /** One entry per thumb. */
  value: number[];
  onValueChange: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  /** Formats the bubble above the active thumb. */
  formatValue?: (n: number) => string;
  /** Hide the bubble entirely. */
  hideValueLabel?: boolean;
  /** Accessible name per thumb. */
  ariaLabels?: string[];
  className?: string;
}

export function Slider({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  disabled,
  formatValue,
  hideValueLabel,
  ariaLabels,
  className,
}: SliderProps) {
  return (
    <Ark.Root
      className={cx(rootCss, className)}
      value={value}
      onValueChange={(d) => onValueChange(d.value)}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      aria-label={ariaLabels}
      thumbAlignment="center"
    >
      <Ark.Control className={controlCss}>
        <Ark.Track className={trackCss}>
          <Ark.Range className={rangeCss} />
        </Ark.Track>
        {value.map((v, i) => (
          <Ark.Thumb key={i} index={i} className={thumbCss}>
            <Ark.HiddenInput />
            {hideValueLabel ? null : (
              <span aria-hidden="true" className={cx("ds-slider-bubble", bubbleCss)}>
                {formatValue ? formatValue(v) : v}
              </span>
            )}
          </Ark.Thumb>
        ))}
      </Ark.Control>
    </Ark.Root>
  );
}
