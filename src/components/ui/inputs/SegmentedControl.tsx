"use client";

import { cva } from "styled-system/css";

export interface SegmentedOption {
  value: string;
  label: string;
  sub?: string;
}

export interface SegmentedControlProps {
  value: string;
  onChange: (value: string) => void;
  options: SegmentedOption[];
  fullWidth?: boolean;
  ariaLabel?: string;
}

const track = cva({
  base: {
    gap: "4px",
    p: "4px",
    borderRadius: "input",
    bg: "fill",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "border",
  },
  variants: {
    fullWidth: {
      true: { display: "grid", gridAutoColumns: "1fr", gridAutoFlow: "column" },
      false: { display: "inline-flex" },
    },
  },
  defaultVariants: { fullWidth: false },
});

const segment = cva({
  base: {
    cursor: "pointer",
    textAlign: "center",
    py: "8px",
    px: "3px",
    borderRadius: "7px",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "transparent",
    bg: "transparent",
    transition: "background-color .15s, box-shadow .15s",
    _focusVisible: { outline: "none", boxShadow: "0 0 0 3px rgba(0,113,227,0.2)" },
  },
  variants: {
    active: {
      true: { bg: "field", borderColor: "border", boxShadow: "0 1px 3px rgba(15,23,42,0.10)" },
    },
  },
});

const labelCss = cva({
  base: { fontSize: "14px", fontWeight: 500, color: "body" },
  variants: { active: { true: { color: "heading" } } },
});

const subCss = cva({
  base: { fontSize: "12px", fontWeight: 400, color: "muted" },
  variants: { active: { true: { color: "accent", fontWeight: 500 } } },
});

export default function SegmentedControl({ value, onChange, options, fullWidth, ariaLabel }: SegmentedControlProps) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} className={track({ fullWidth: !!fullWidth })}>
      {options.map((o) => {
        const active = value === o.value;
        return (
          <div
            key={o.value}
            role="radio"
            aria-checked={active}
            tabIndex={0}
            onClick={() => onChange(o.value)}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onChange(o.value); } }}
            className={segment({ active })}>
            <div className={labelCss({ active })}>{o.label}</div>
            {o.sub && <div className={subCss({ active })}>{o.sub}</div>}
          </div>
        );
      })}
    </div>
  );
}
