import { css, cx } from "styled-system/css";
import type { CSSProperties } from "react";

const spinner = css({
  display: "inline-block",
  flexShrink: 0,
  borderRadius: "pill",
  borderWidth: "2px",
  borderStyle: "solid",
  borderColor: "border",
  borderTopColor: "currentcolor",
  animation: "spin .7s linear infinite",
});

/** Replaces MUI <CircularProgress>. `size` in px; colour follows `color` (currentcolor). */
export function Spinner({ size = 20, thickness, className, style }: { size?: number; thickness?: number; className?: string; style?: CSSProperties }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cx(spinner, className)}
      style={{ width: size, height: size, borderWidth: thickness ?? Math.max(2, Math.round(size / 10)), ...style }}
    />
  );
}
