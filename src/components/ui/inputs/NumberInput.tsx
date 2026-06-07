"use client";

import { TextField, InputAdornment, IconButton } from "@mui/material";
import { Add, Remove } from "@mui/icons-material";
import { FieldShell } from "./FieldShell";
import { fieldSx, FieldBaseProps, tokens } from "./tokens";

export interface NumberInputProps extends FieldBaseProps {
  value?: number | null;
  onChange?: (value: number | null) => void;
  placeholder?: string;
  id?: string;
  name?: string;
  min?: number;
  max?: number;
  step?: number;
  showStepper?: boolean;
}

export default function NumberInput({
  label, helper, error, required, size = "md", fullWidth = true, disabled,
  value = null, onChange, placeholder, id, name, min, max, step = 1, showStepper,
}: NumberInputProps) {
  const clamp = (n: number) => {
    if (min != null && n < min) return min;
    if (max != null && n > max) return max;
    return n;
  };
  const set = (n: number | null) => onChange?.(n);
  const bump = (dir: 1 | -1) => set(clamp((value ?? 0) + dir * step));

  return (
    <FieldShell label={label} required={required} helper={helper} error={error} htmlFor={id} fullWidth={fullWidth}>
      <TextField
        id={id}
        name={name}
        value={value ?? ""}
        onChange={(e) => {
          const raw = e.target.value;
          if (raw === "") return set(null);
          const n = Number(raw);
          if (!Number.isNaN(n)) set(clamp(n));
        }}
        placeholder={placeholder}
        disabled={disabled}
        error={!!error}
        fullWidth
        sx={fieldSx(size)}
        inputProps={{ inputMode: "numeric" }}
        InputProps={showStepper ? {
          startAdornment: (
            <InputAdornment position="start">
              <IconButton size="small" onClick={() => bump(-1)} disabled={disabled} aria-label="Decrease" sx={{ color: tokens.body }}>
                <Remove fontSize="small" />
              </IconButton>
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton size="small" onClick={() => bump(1)} disabled={disabled} aria-label="Increase" sx={{ color: tokens.body }}>
                <Add fontSize="small" />
              </IconButton>
            </InputAdornment>
          ),
        } : undefined}
      />
    </FieldShell>
  );
}
