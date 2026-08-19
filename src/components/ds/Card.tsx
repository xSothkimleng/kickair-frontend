import { cva, cx, type RecipeVariantProps } from "styled-system/css";
import type { HTMLAttributes } from "react";

export const card = cva({
  base: {
    bg: "surface",
    borderRadius: "card",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "border",
  },
  variants: {
    padding: { none: {}, sm: { p: "4" }, md: { p: "5" }, lg: { p: "7" } },
    interactive: {
      true: {
        transition: "box-shadow .15s, border-color .15s, transform .15s",
        cursor: "pointer",
        _hover: { borderColor: "borderStrong", boxShadow: "0 6px 20px rgba(0,0,0,0.06)" },
      },
    },
    elevated: {
      true: {
        borderColor: "transparent",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 6px 16px rgba(0,0,0,0.05)",
      },
    },
  },
  defaultVariants: { padding: "md" },
});

export type CardVariants = RecipeVariantProps<typeof card>;

type CardProps = HTMLAttributes<HTMLDivElement> & CardVariants;

export function Card({ padding, interactive, elevated, className, ...props }: CardProps) {
  return <div className={cx(card({ padding, interactive, elevated }), className)} {...props} />;
}
