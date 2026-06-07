"use client";

import { useState } from "react";
import { TextField, InputAdornment, IconButton } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { FieldShell } from "./FieldShell";
import { fieldSx, FieldBaseProps, tokens } from "./tokens";

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
      <TextField
        id={id}
        name={name}
        type={show ? "text" : "password"}
        value={value ?? ""}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        placeholder={placeholder}
        disabled={disabled}
        error={!!error}
        fullWidth
        autoComplete={autoComplete}
        sx={fieldSx(size)}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={() => setShow((s) => !s)} edge="end" size="small" aria-label={show ? "Hide password" : "Show password"} sx={{ color: tokens.muted }}>
                {show ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    </FieldShell>
  );
}
