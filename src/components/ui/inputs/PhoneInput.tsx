"use client";

import { css } from "styled-system/css";
import { FieldShell } from "./FieldShell";
import { fieldControl, fieldRoot } from "./field";
import { FieldBaseProps } from "./tokens";

export interface PhoneInputProps extends FieldBaseProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  id?: string;
  name?: string;
  countryCode?: string;
}

const prefix = css({
  flexShrink: 0,
  pr: "10px",
  py: "4px",
  borderRightWidth: "1px",
  borderRightStyle: "solid",
  borderRightColor: "border",
  color: "body",
  fontWeight: 500,
  fontSize: "15px",
  lineHeight: 1.4,
});

export default function PhoneInput({
  label, helper, error, required, size = "md", fullWidth = true, disabled,
  value, onChange, placeholder = "12 345 678", id, name, countryCode = "+855",
}: PhoneInputProps) {
  return (
    <FieldShell label={label} required={required} helper={helper} error={error} htmlFor={id} fullWidth={fullWidth}>
      <div className={fieldRoot({ size })} data-invalid={error ? "" : undefined} data-disabled={disabled ? "" : undefined}>
        <span className={prefix}>{countryCode}</span>
        <input
          id={id}
          name={name}
          type="tel"
          value={value ?? ""}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          readOnly={!onChange}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          autoComplete="tel"
          className={fieldControl}
        />
      </div>
    </FieldShell>
  );
}
