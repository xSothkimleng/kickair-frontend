import { css, cva, cx, type RecipeVariantProps } from "styled-system/css";
import type { HTMLAttributes } from "react";

export const badge = cva({
  base: {
    display: "inline-flex",
    alignItems: "center",
    gap: "1.5",
    borderRadius: "pill",
    fontWeight: 600,
    fontSize: "12px",
    lineHeight: 1,
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
 * Small count/dot bubble anchored to a wrapped icon. Replaces MUI <Badge badgeContent>.
 * `count` 0/undefined hides it; `dot` renders a plain dot.
 */
export function Indicator({ count, dot, max = 99, children, className, tone = "error" }: { count?: number; dot?: boolean; max?: number; children: React.ReactNode; className?: string; tone?: "error" | "accent" | "success" }) {
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
            : css({ position: "absolute", top: "-4px", right: "-4px", minW: "18px", h: "18px", px: "5px", borderRadius: "pill", color: "white", fontSize: "11px", fontWeight: 700, lineHeight: "18px", textAlign: "center", boxShadow: "0 0 0 2px white" })}
          style={{ background: bg }}>
          {dot ? null : count! > max ? `${max}+` : count}
        </span>
      ) : null}
    </span>
  );
}
