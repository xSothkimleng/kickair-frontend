"use client";

import { Switch as Ark } from "@ark-ui/react";
import { css } from "styled-system/css";

export interface SwitchProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}

const root = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "16px",
  cursor: "pointer",
  "&[data-disabled]": { cursor: "not-allowed" },
});

const bare = css({ display: "inline-flex", cursor: "pointer", "&[data-disabled]": { cursor: "not-allowed" } });

const control = css({
  position: "relative",
  display: "inline-flex",
  alignItems: "center",
  flexShrink: 0,
  w: "40px",
  h: "22px",
  p: "2px",
  borderRadius: "pill",
  bg: "borderStrong",
  transition: "background-color .15s, box-shadow .15s",
  "&[data-state=checked]": { bg: "accent" },
  "&[data-focus-visible]": { boxShadow: "focusRing" },
  "&[data-disabled]": { opacity: 0.5 },
});

const thumb = css({
  w: "18px",
  h: "18px",
  borderRadius: "pill",
  bg: "white",
  boxShadow: "0 1px 3px rgba(15,23,42,0.3)",
  transition: "transform .15s",
  "&[data-state=checked]": { transform: "translateX(18px)" },
});

const labelCss = css({ fontSize: "14.5px", color: "heading" });
const descCss = css({ fontSize: "13px", color: "muted" });

export default function Switch({ checked, onChange, label, description, disabled }: SwitchProps) {
  const hasText = !!(label || description);
  return (
    <Ark.Root checked={!!checked} disabled={disabled} onCheckedChange={(d) => onChange?.(d.checked)} className={hasText ? root : bare}>
      {hasText && (
        <span>
          {label && <Ark.Label className={labelCss}>{label}</Ark.Label>}
          {description && <span className={css({ display: "block" })}><span className={descCss}>{description}</span></span>}
        </span>
      )}
      <Ark.Control className={control}>
        <Ark.Thumb className={thumb} />
      </Ark.Control>
      <Ark.HiddenInput />
    </Ark.Root>
  );
}
