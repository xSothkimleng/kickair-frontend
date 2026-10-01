import NextLink from "next/link";
import { cva, cx, type RecipeVariantProps } from "styled-system/css";
import type { ComponentProps } from "react";

// Every colour and underline here carries `!` (important): globals.css has a bare
// `a { color: inherit; text-decoration: none }` that beats any layered Panda class,
// so without it a ds Link rendered as plain text.
export const link = cva({
  base: {
    color: "accent!",
    cursor: "pointer",
    transition: "color .15s",
    _hover: { color: "accentHover!", textDecoration: "underline!" },
  },
  variants: {
    tone: {
      accent: { color: "accent!", _hover: { color: "accentHover!" } },
      heading: { color: "heading!", _hover: { color: "accent!" } },
      body: { color: "body!", _hover: { color: "accent!" } },
      muted: { color: "muted!", _hover: { color: "body!" } },
      inherit: { color: "inherit!", _hover: { color: "inherit!" } },
    },
    underline: { none: { _hover: { textDecoration: "none!" } }, hover: {}, always: { textDecoration: "underline!" } },
  },
  defaultVariants: { tone: "accent", underline: "hover" },
});

export type LinkVariants = RecipeVariantProps<typeof link>;

type LinkProps = ComponentProps<typeof NextLink> & LinkVariants;

export function Link({ tone, underline, className, ...props }: LinkProps) {
  return <NextLink className={cx(link({ tone, underline }), className)} {...props} />;
}
