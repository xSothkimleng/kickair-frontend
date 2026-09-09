"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { FieldShell } from "./FieldShell";
import { fieldControl, fieldIconButton, fieldRoot } from "./field";
import { FieldBaseProps } from "./tokens";

export interface PasswordInputProps extends FieldBaseProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  id?: string;
  name?: string;
  autoComplete?: string;
}

export default function PasswordInput({
  label, helper, error, required, size = "md", fullWidth = true, disabled,
  value, onChange, placeholder, id, name, autoComplete = "current-password",
}: PasswordInputProps) {
  const [show, setShow] = useState(false);

  return (
    <FieldShell label={label} required={required} helper={helper} error={error} htmlFor={id} fullWidth={fullWidth}>
      <div className={fieldRoot({ size })} data-invalid={error ? "" : undefined} data-disabled={disabled ? "" : undefined}>
        <input
          id={id}
          name={name}
          type={show ? "text" : "password"}
          value={value ?? ""}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          readOnly={!onChange}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          autoComplete={autoComplete}
          className={fieldControl}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          disabled={disabled}
          aria-label={show ? "Hide password" : "Show password"}
          className={fieldIconButton}>
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </FieldShell>
  );
}
