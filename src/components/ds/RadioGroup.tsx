"use client";

import { RadioGroup as Ark } from "@ark-ui/react";
import type { ReactNode } from "react";
import { css, cx } from "styled-system/css";

/**
 * Replaces MUI <RadioGroup> + <Radio>/<FormControlLabel>. Ark UI `RadioGroup`
 * styled with Panda: an 18px ring that fills with an ink dot when checked,
 * matching the MUI `RadioButtonChecked` icon at `fontSize: 18`.
 *
 * `RadioGroupPrimitive` (the raw Ark namespace) plus `radioItem` / `radioControl`
 * are exported for bespoke rows (custom labels, hover backgrounds).
 */

/** The 18px ring + dot. Put it on `RadioGroup.ItemControl`. */
export const radioControl = css({
  boxSizing: "border-box",
  position: "relative",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  w: "18px",
  h: "18px",
  borderRadius: "pill",
  borderWidth: "1.6px",
  borderStyle: "solid",
  borderColor: "borderStrong",
  bg: "transparent",
  transition: "border-color .12s",
  _after: {
    content: '""',
    w: "8px",
    h: "8px",
    borderRadius: "pill",
    bg: "heading",
    transform: "scale(0)",
    transition: "transform .12s",
  },
  "&[data-state=checked]": { borderColor: "heading", _after: { transform: "scale(1)" } },
  "&[data-focus-visible]": { boxShadow: "focusRing" },
  "&[data-disabled]": { opacity: 0.5 },
});

/** Row wrapper (label element). */
export const radioItem = css({
  display: "flex",
  alignItems: "center",
  gap: "10px",
  m: 0,
  cursor: "pointer",
  "&[data-disabled]": { cursor: "not-allowed" },
});

const rootCss = css({ display: "flex", flexDirection: "column" });
const labelCss = css({ fontSize: "14px", color: "body", "&[data-state=checked]": { color: "heading" } });

export interface RadioOption {
  value: string;
  label: ReactNode;
  disabled?: boolean;
}

export interface RadioGroupProps {
  value: string;
  onChange: (value: string) => void;
  options: RadioOption[];
  name?: string;
  disabled?: boolean;
  ariaLabel?: string;
  className?: string;
  /** Extra classes on each row. */
  itemClassName?: string;
}

export function RadioGroup({ value, onChange, options, name, disabled, ariaLabel, className, itemClassName }: RadioGroupProps) {
  return (
    <Ark.Root
      value={value}
      onValueChange={(d) => { if (d.value != null) onChange(d.value); }}
      name={name}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cx(rootCss, className)}
    >
      {options.map((o) => (
        <Ark.Item key={o.value} value={o.value} disabled={o.disabled} className={cx(radioItem, itemClassName)}>
          <Ark.ItemControl className={radioControl} />
          <Ark.ItemText className={labelCss}>{o.label}</Ark.ItemText>
          <Ark.ItemHiddenInput />
        </Ark.Item>
      ))}
    </Ark.Root>
  );
}

export { Ark as RadioGroupPrimitive };
