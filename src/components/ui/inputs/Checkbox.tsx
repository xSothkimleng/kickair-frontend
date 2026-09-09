"use client";

import { ReactNode } from "react";
import { Checkbox as Ark } from "@ark-ui/react";
import { Check, Minus } from "lucide-react";
import { css } from "styled-system/css";

export interface CheckboxProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: ReactNode;
  description?: string;
  indeterminate?: boolean;
  disabled?: boolean;
}

const root = css({
  display: "flex",
  alignItems: "center",
  gap: "10px",
  cursor: "pointer",
  "&[data-disabled]": { cursor: "not-allowed" },
});

const rootWithDesc = css({ alignItems: "flex-start" });

const box = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  w: "18px",
  h: "18px",
  mt: "1px",
  borderRadius: "5px",
  borderWidth: "1.5px",
  borderStyle: "solid",
  borderColor: "borderStrong",
  bg: "field",
  color: "white",
  transition: "background-color .12s, border-color .12s, box-shadow .12s",
  "& svg": { display: "block" },
  "&[data-state=checked], &[data-state=indeterminate]": { bg: "accent", borderColor: "accent" },
  "&[data-focus-visible]": { boxShadow: "focusRing" },
  "&[data-disabled]": { opacity: 0.5 },
});

const labelCss = css({ fontSize: "14.5px", color: "heading", "&[data-disabled]": { color: "placeholder" } });
const descCss = css({ display: "block", fontSize: "13px", color: "muted" });

export default function Checkbox({ checked, onChange, label, description, indeterminate, disabled }: CheckboxProps) {
  return (
    <Ark.Root
      checked={indeterminate ? "indeterminate" : !!checked}
      disabled={disabled}
      onCheckedChange={(d) => onChange?.(d.checked === true)}
      className={description ? `${root} ${rootWithDesc}` : root}>
      <Ark.Control className={box}>
        <Ark.Indicator><Check size={13} strokeWidth={3} /></Ark.Indicator>
        <Ark.Indicator indeterminate><Minus size={13} strokeWidth={3} /></Ark.Indicator>
      </Ark.Control>
      {(label || description) && (
        <span>
          {label && <Ark.Label className={labelCss}>{label}</Ark.Label>}
          {description && <span className={descCss}>{description}</span>}
        </span>
      )}
      <Ark.HiddenInput />
    </Ark.Root>
  );
}
