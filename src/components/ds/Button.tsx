import { cva, cx, type RecipeVariantProps } from "styled-system/css";
import type { ButtonHTMLAttributes, Ref } from "react";

/**
 * Branded button recipe. Exported separately so it can be applied to a Next
 * <Link> (via `className={button({ variant })}`) as well as a real <button>.
 *
 * RSC-safe: no hooks, no "use client". Interactivity (onClick) is the caller's
 * concern — passing a handler is what forces the *caller* to be a client component.
 */
export const button = cva({
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "2",
    fontFamily: "inherit",
    fontWeight: 600,
    lineHeight: 1,
    borderRadius: "input",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "transparent",
    cursor: "pointer",
    whiteSpace: "nowrap",
    userSelect: "none",
    textDecoration: "none",
    transition: "background-color .15s, border-color .15s, color .15s, box-shadow .15s",
    _focusVisible: { outline: "none", boxShadow: "focusRing" },
    _disabled: { opacity: 0.5, cursor: "not-allowed", pointerEvents: "none" },
  },
  variants: {
    variant: {
      solid: { bg: "accent", color: "white", _hover: { bg: "accentHover" } },
      outline: {
        bg: "surface",
        color: "heading",
        borderColor: "border",
        _hover: { bg: "fill", borderColor: "borderStrong" },
      },
      ghost: { bg: "transparent", color: "body", _hover: { bg: "fill" } },
      text: {
        bg: "transparent",
        color: "accent",
        paddingX: "0",
        borderColor: "transparent",
        _hover: { color: "accentHover", textDecoration: "underline" },
      },
      danger: { bg: "error", color: "white", _hover: { bg: "errorText" } },
    },
    size: {
      sm: { h: "36px", paddingX: "3.5", fontSize: "13px" },
      md: { h: "44px", paddingX: "5", fontSize: "15px" },
      lg: { h: "52px", paddingX: "7", fontSize: "16px" },
    },
    full: { true: { width: "full" } },
  },
  defaultVariants: { variant: "solid", size: "md" },
});

export type ButtonVariants = RecipeVariantProps<typeof button>;

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & ButtonVariants & { ref?: Ref<HTMLButtonElement> };

export function Button({ variant, size, full, className, type = "button", ref, ...props }: ButtonProps) {
  return <button ref={ref} type={type} className={cx(button({ variant, size, full }), className)} {...props} />;
}
