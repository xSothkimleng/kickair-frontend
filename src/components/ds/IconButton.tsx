import { cva, cx, type RecipeVariantProps } from "styled-system/css";
import type { ButtonHTMLAttributes, Ref } from "react";

/** Square/round icon-only button. Replaces MUI <IconButton>. Always pass aria-label. */
export const iconButton = cva({
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    p: 0,
    border: "none",
    bg: "transparent",
    color: "muted",
    cursor: "pointer",
    appearance: "none",
    fontFamily: "inherit",
    transition: "background-color .15s, color .15s, border-color .15s",
    _hover: { bg: "fill", color: "heading" },
    _focusVisible: { outline: "none", boxShadow: "focusRing" },
    _disabled: { opacity: 0.4, cursor: "not-allowed", pointerEvents: "none" },
    "& svg": { display: "block" },
  },
  variants: {
    size: {
      xs: { w: "24px", h: "24px" },
      sm: { w: "30px", h: "30px" },
      md: { w: "36px", h: "36px" },
      lg: { w: "44px", h: "44px" },
    },
    shape: { round: { borderRadius: "pill" }, square: { borderRadius: "8px" } },
    variant: {
      ghost: {},
      outline: { borderWidth: "1px", borderStyle: "solid", borderColor: "border", bg: "surface", _hover: { bg: "fill", borderColor: "borderStrong", color: "heading" } },
      solid: { bg: "accent", color: "white", _hover: { bg: "accentHover", color: "white" } },
    },
    tone: { default: {}, danger: { color: "error", _hover: { bg: "errorTint", color: "errorText" } } },
  },
  defaultVariants: { size: "md", shape: "round", variant: "ghost", tone: "default" },
});

export type IconButtonVariants = RecipeVariantProps<typeof iconButton>;
type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & IconButtonVariants & { ref?: Ref<HTMLButtonElement> };

export function IconButton({ size, shape, variant, tone, className, type = "button", ref, ...props }: IconButtonProps) {
  return <button ref={ref} type={type} className={cx(iconButton({ size, shape, variant, tone }), className)} {...props} />;
}
