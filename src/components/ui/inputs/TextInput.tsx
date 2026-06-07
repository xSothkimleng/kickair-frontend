"use client";

import { TextField, InputAdornment } from "@mui/material";
import { ReactNode } from "react";
import { FieldShell } from "./FieldShell";
import { fieldSx, FieldBaseProps, tokens } from "./tokens";

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
  onBlur?: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  onKeyDown?: React.KeyboardEventHandler<HTMLDivElement>;
}

export default function TextInput({
  label, helper, error, required, size = "md", fullWidth = true, disabled,
  value, onChange, placeholder, type = "text", name, id, autoComplete, autoFocus,
  startIcon, endIcon, inputMode, maxLength, onBlur, onKeyDown,
}: TextInputProps) {
  return (
    <FieldShell label={label} required={required} helper={helper} error={error} htmlFor={id} fullWidth={fullWidth}>
      <TextField
        id={id}
        name={name}
        type={type}
        value={value ?? ""}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        placeholder={placeholder}
        disabled={disabled}
        error={!!error}
        fullWidth
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        sx={fieldSx(size)}
        inputProps={{ inputMode, maxLength }}
        InputProps={{
          startAdornment: startIcon ? <InputAdornment position="start" sx={{ color: tokens.muted }}>{startIcon}</InputAdornment> : undefined,
          endAdornment: endIcon ? <InputAdornment position="end" sx={{ color: tokens.muted }}>{endIcon}</InputAdornment> : undefined,
        }}
      />
    </FieldShell>
  );
}
