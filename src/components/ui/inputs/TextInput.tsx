"use client";

import { ReactNode } from "react";
import { FieldShell } from "./FieldShell";
import { fieldAdornment, fieldControl, fieldRoot } from "./field";
import { FieldBaseProps } from "./tokens";

export interface TextInputProps extends FieldBaseProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  type?: string;
  name?: string;
  id?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  inputMode?: "text" | "numeric" | "tel" | "email" | "search" | "url" | "decimal" | "none";
  maxLength?: number;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
}

export default function TextInput({
  label, helper, error, required, size = "md", fullWidth = true, disabled,
  value, onChange, placeholder, type = "text", name, id, autoComplete, autoFocus,
  startIcon, endIcon, inputMode, maxLength, onBlur, onKeyDown,
}: TextInputProps) {
  return (
    <FieldShell label={label} required={required} helper={helper} error={error} htmlFor={id} fullWidth={fullWidth}>
      <div className={fieldRoot({ size })} data-invalid={error ? "" : undefined} data-disabled={disabled ? "" : undefined}>
        {startIcon && <span className={fieldAdornment}>{startIcon}</span>}
        <input
          id={id}
          name={name}
          type={type}
          value={value ?? ""}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          readOnly={!onChange}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          inputMode={inputMode}
          maxLength={maxLength}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          className={fieldControl}
        />
        {endIcon && <span className={fieldAdornment}>{endIcon}</span>}
      </div>
    </FieldShell>
  );
}
