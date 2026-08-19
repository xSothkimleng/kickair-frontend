import { cva, cx, type RecipeVariantProps } from "styled-system/css";
import type { ElementType, HTMLAttributes } from "react";

/**
 * Typographic primitive. `margin: 0` is baked in, so it sidesteps the
 * globals.css margin-reset gotcha that silently broke MUI Typography spacing —
 * spacing is always explicit (via layout patterns), never inherited.
 */
export const text = cva({
  base: { fontFamily: "inherit", color: "body", margin: 0 },
  variants: {
    size: {
      xs: { fontSize: "12px", lineHeight: 1.5 },
      sm: { fontSize: "13px", lineHeight: 1.55 },
      md: { fontSize: "15px", lineHeight: 1.6 },
      lg: { fontSize: "17px", lineHeight: 1.6 },
      xl: { fontSize: "20px", lineHeight: 1.4 },
      "2xl": { fontSize: "26px", lineHeight: 1.3 },
      "3xl": { fontSize: "32px", lineHeight: 1.2 },
      "4xl": { fontSize: "clamp(32px, 5vw, 44px)", lineHeight: 1.12 },
      "5xl": { fontSize: "clamp(40px, 6vw, 60px)", lineHeight: 1.08 },
    },
    weight: {
      regular: { fontWeight: 400 },
      medium: { fontWeight: 500 },
      semibold: { fontWeight: 600 },
      bold: { fontWeight: 700 },
      extrabold: { fontWeight: 800 },
    },
    tone: {
      heading: { color: "heading" },
      body: { color: "body" },
      muted: { color: "muted" },
      accent: { color: "accent" },
      error: { color: "error" },
      success: { color: "successText" },
      white: { color: "white" },
      inherit: { color: "inherit" },
    },
    align: { left: { textAlign: "left" }, center: { textAlign: "center" }, right: { textAlign: "right" } },
    truncate: { true: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } },
  },
  defaultVariants: { size: "md", weight: "regular", tone: "body" },
});

export type TextVariants = RecipeVariantProps<typeof text>;

type TextProps = Omit<HTMLAttributes<HTMLElement>, "color"> & TextVariants & { as?: ElementType };

export function Text({ as: As = "p", size, weight, tone, align, truncate, className, ...props }: TextProps) {
  return <As className={cx(text({ size, weight, tone, align, truncate }), className)} {...props} />;
}

/** Heading = Text with heading-leaning defaults. Pass `as="h1"` etc. for semantics. */
export function Heading({ as = "h2", size = "2xl", weight = "bold", tone = "heading", ...props }: TextProps) {
  return <Text as={as} size={size} weight={weight} tone={tone} {...props} />;
}
