import type { CSSProperties } from "react";
import { cva, cx } from "styled-system/css";

export const skeleton = cva({
  base: { display: "block", bg: "fill", animation: "pulse 1.6s ease-in-out infinite", flexShrink: 0 },
  variants: {
    variant: {
      text: { h: "1em", borderRadius: "4px", transform: "scale(1, 0.7)", transformOrigin: "0 55%" },
      rect: { borderRadius: "8px" },
      circle: { borderRadius: "pill" },
    },
  },
  defaultVariants: { variant: "text" },
});

/** Replaces MUI <Skeleton>. `width`/`height` accept px numbers or CSS strings. */
export function Skeleton({ variant, width, height, className, style }: { variant?: "text" | "rect" | "circle"; width?: number | string; height?: number | string; className?: string; style?: CSSProperties }) {
  return <span aria-hidden="true" className={cx(skeleton({ variant }), className)} style={{ width: width ?? (variant === "circle" ? height : "100%"), height, ...style }} />;
}
