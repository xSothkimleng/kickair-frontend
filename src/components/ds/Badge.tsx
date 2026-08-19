import { cva, cx, type RecipeVariantProps } from "styled-system/css";
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
