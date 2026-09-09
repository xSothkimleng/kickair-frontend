"use client";

import type { ReactNode } from "react";
import { css, cva } from "styled-system/css";

const optionCss = cva({
  base: {
    width: "100%",
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    p: "16px 18px",
    borderRadius: "tile",
    borderWidth: "1px",
    borderStyle: "solid",
    font: "inherit",
    textAlign: "left",
    transition: "border-color .15s ease, background .15s ease",
  },
  variants: {
    selected: {
      true: { borderColor: "accent", bg: "accentFill", _hover: { bg: "accentFill" } },
      false: { borderColor: "hairlineStrong", bg: "surface", _hover: { bg: "surface2" } },
    },
    disabled: {
      true: { cursor: "default", opacity: 0.55 },
      false: { cursor: "pointer", opacity: 1 },
    },
  },
});

const radioCss = cva({
  base: {
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    flex: "none",
    borderWidth: "1.5px",
    borderStyle: "solid",
    position: "relative",
    transition: "border-color .15s ease",
  },
  variants: {
    selected: {
      true: {
        borderColor: "accent",
        _after: { content: '""', position: "absolute", inset: "3px", borderRadius: "50%", bg: "accent" },
      },
      false: { borderColor: "hairlineStrong" },
    },
  },
});

const bodyCss = css({ flex: 1, minWidth: 0 });

/**
 * Selectable radio-card. Generic container — pass the inner content as children.
 * Used for the wallet-vs-ABA choice, the ABA method list, and withdraw
 * destinations.
 */
export default function PaymentOption({
  selected,
  onClick,
  disabled,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button type='button' onClick={onClick} disabled={disabled} className={optionCss({ selected, disabled: !!disabled })}>
      <div aria-hidden className={radioCss({ selected })} />
      <div className={bodyCss}>{children}</div>
    </button>
  );
}
