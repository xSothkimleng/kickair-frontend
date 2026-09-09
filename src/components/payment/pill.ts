import { cva, type RecipeVariantProps } from "styled-system/css";

/**
 * Pill-shaped action button used across the payment surfaces (checkout, wallet
 * dialogs, result cards, the simulated ABA popup). Reproduces the MUI `Button`
 * base the old `sx` overrides sat on (500 weight, 1.75 line-height, 0.02857em
 * tracking, 6px 8px padding, 64px min-width) plus each surface's tone.
 */
export const pillButton = cva({
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    boxSizing: "border-box",
    m: 0,
    p: "6px 8px",
    minW: "64px",
    border: "none",
    borderRadius: "pill",
    bg: "transparent",
    fontFamily: "inherit",
    fontWeight: 500,
    lineHeight: 1.75,
    letterSpacing: "0.02857em",
    textDecoration: "none",
    whiteSpace: "nowrap",
    verticalAlign: "middle",
    userSelect: "none",
    appearance: "none",
    cursor: "pointer",
    transition: "background-color .25s, box-shadow .25s, border-color .25s, color .25s",
    _focusVisible: { outline: "none", boxShadow: "focusRing" },
    _disabled: { pointerEvents: "none", cursor: "default" },
    "& svg": { flexShrink: 0 },
  },
  variants: {
    tone: {
      /** Black primary — `bgcolor #000`, hover 80 %, disabled 18 % black. */
      black: { bg: "ink", color: "white", _hover: { bg: "rgba(0,0,0,0.8)" }, _disabled: { bg: "rgba(0,0,0,0.18)", color: "white" } },
      /** Accent primary (ABA popup CTAs, purchase gate). */
      accent: { bg: "accent", color: "white", _hover: { bg: "accentHover" }, _disabled: { bg: "accent", color: "white", opacity: 0.65 } },
      /** Quiet secondary — 5 % black fill. */
      grey: { bg: "rgba(0,0,0,0.05)", color: "ink", _hover: { bg: "rgba(0,0,0,0.1)" } },
      /** Text-only secondary in the ink2 colour. */
      ghost: { bg: "transparent", color: "ink2", _hover: { bg: "rgba(0,0,0,0.04)" } },
      /** On the black balance card. */
      white: { bg: "white", color: "ink", _hover: { bg: "rgba(255,255,255,0.88)" } },
      outlineWhite: {
        bg: "transparent",
        color: "white",
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: "rgba(255,255,255,0.28)",
        _hover: { bg: "rgba(255,255,255,0.1)", borderColor: "rgba(255,255,255,0.4)" },
      },
    },
    size: {
      sm: { h: "36px", fontSize: "13px", fontWeight: 600 },
      md: { h: "44px", fontSize: "15px" },
      lg: { h: "52px", fontSize: "16px" },
    },
    full: { true: { w: "100%" } },
  },
  defaultVariants: { tone: "black", size: "lg" },
});

export type PillButtonVariants = RecipeVariantProps<typeof pillButton>;
