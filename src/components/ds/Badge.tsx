import { css, cva, cx, type RecipeVariantProps } from "styled-system/css";
import type { HTMLAttributes } from "react";

export const badge = cva({
  base: {
    display: "inline-flex",
    alignItems: "center",
    gap: "1.5",
    borderRadius: "pill",
    fontWeight: 600,
    textStyle: "meta",
    paddingX: "2.5",
    paddingY: "1.5",
    whiteSpace: "nowrap",
  },
  variants: {
    tone: {
      neutral: { bg: "fill", color: "body" },
      accent: { bg: "accentFill", color: "accent" },
      success: { bg: "successTint", color: "successText" },
      warning: { bg: "pendingTint", color: "pendingText" },
      error: { bg: "errorTint", color: "errorText" },
      outline: { bg: "surface", color: "body", borderWidth: "1px", borderStyle: "solid", borderColor: "border" },
    },
  },
  defaultVariants: { tone: "neutral" },
});

export type BadgeVariants = RecipeVariantProps<typeof badge>;

type BadgeProps = HTMLAttributes<HTMLSpanElement> & BadgeVariants;

export function Badge({ tone, className, ...props }: BadgeProps) {
  return <span className={cx(badge({ tone }), className)} {...props} />;
}

/**
 * Small count/dot bubble anchored to a wrapped icon.
 * `count` 0/undefined hides it; `dot` renders a plain dot.
 * `offset` (px) places the count bubble from the top-right corner: negative hangs it
 * outside the wrapped control, positive tucks it in — for a button larger than its icon.
 */
export function Indicator({ count, dot, max = 99, children, className, tone = "error", offset = -3 }: { count?: number; dot?: boolean; max?: number; children: React.ReactNode; className?: string; tone?: "error" | "accent" | "success"; offset?: number }) {
  const show = dot || (count != null && count > 0);
  const bg = { error: "var(--colors-error)", accent: "var(--colors-accent)", success: "var(--colors-success)" }[tone];
  return (
    <span className={cx(css({ position: "relative", display: "inline-flex", verticalAlign: "middle" }), className)}>
      {children}
      {show ? (
        <span
          aria-hidden="true"
          className={dot
            ? css({ position: "absolute", top: "2px", right: "2px", w: "8px", h: "8px", borderRadius: "pill", boxShadow: "0 0 0 2px white" })
            // border-box: preflight is off, so without it the padding adds to minW and "1" renders as a 28px pill.
            : css({ position: "absolute", boxSizing: "border-box", display: "inline-flex", alignItems: "center", justifyContent: "center", minW: "16px", h: "16px", px: "4px", borderRadius: "pill", color: "white", textStyle: "micro", fontWeight: 700, boxShadow: "0 0 0 1.5px white" })}
          style={dot ? { background: bg } : { background: bg, top: offset, right: offset }}>
          {dot ? null : count! > max ? `${max}+` : count}
        </span>
      ) : null}
    </span>
  );
}
