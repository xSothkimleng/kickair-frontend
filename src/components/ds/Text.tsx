import { cva, cx, type RecipeVariantProps } from "styled-system/css";
import type { ElementType, HTMLAttributes } from "react";

/**
 * Typographic primitive. `size` is a typography role from panda.config.ts
 * (`textStyles`), so size, line-height and tracking always come from the one
 * scale; weight and tone are chosen here. `margin: 0` is baked in, so it
 * sidesteps the globals.css margin-reset gotcha — spacing is always explicit
 * (via layout patterns), never inherited.
 */
export const text = cva({
  base: { color: "body", margin: 0 },
  variants: {
    size: {
      micro: { textStyle: "micro" },
      eyebrow: { textStyle: "eyebrow" },
      meta: { textStyle: "meta" },
      ui: { textStyle: "ui" },
      body: { textStyle: "body" },
      lead: { textStyle: "lead" },
      title: { textStyle: "title" },
      heading: { textStyle: "heading" },
      stat: { textStyle: "stat" },
      display: { textStyle: "display" },
    },
    weight: {
      regular: { fontWeight: 400 },
      medium: { fontWeight: 500 },
      semibold: { fontWeight: 600 },
      bold: { fontWeight: 700 },
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
  defaultVariants: { size: "body", weight: "regular", tone: "body" },
});

export type TextVariants = RecipeVariantProps<typeof text>;

type TextProps = Omit<HTMLAttributes<HTMLElement>, "color"> & TextVariants & { as?: ElementType };

export function Text({ as: As = "p", size, weight, tone, align, truncate, className, ...props }: TextProps) {
  return <As className={cx(text({ size, weight, tone, align, truncate }), className)} {...props} />;
}

/** Heading = Text with heading-leaning defaults. Pass `as="h1"` etc. for semantics. */
export function Heading({ as = "h2", size = "heading", weight = "semibold", tone = "heading", ...props }: TextProps) {
  return <Text as={as} size={size} weight={weight} tone={tone} {...props} />;
}

/**
 * Money and other aligned figures: tabular digits on top of a role, so columns
 * of amounts line up and a changing balance never reflows. Weight defaults to
 * 600; pass `weight="regular"` for quiet figures like dates.
 */
export const money = cva({
  base: { fontVariantNumeric: "tabular-nums" },
  variants: {
    size: {
      micro: { textStyle: "micro" },
      meta: { textStyle: "meta" },
      ui: { textStyle: "ui" },
      body: { textStyle: "body" },
      lead: { textStyle: "lead" },
      title: { textStyle: "title" },
      heading: { textStyle: "heading" },
      stat: { textStyle: "stat" },
      display: { textStyle: "display" },
    },
    weight: {
      regular: { fontWeight: 400 },
      medium: { fontWeight: 500 },
      semibold: { fontWeight: 600 },
      bold: { fontWeight: 700 },
    },
  },
  defaultVariants: { size: "body", weight: "semibold" },
});

export type MoneyVariants = RecipeVariantProps<typeof money>;
