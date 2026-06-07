"use client";

import { TextField, InputAdornment } from "@mui/material";
import { FieldShell } from "./FieldShell";
import { fieldSx, FieldBaseProps, tokens } from "./tokens";

export interface CurrencyInputProps extends FieldBaseProps {
  value?: number | null;
  onChange?: (value: number | null) => void;
  placeholder?: string;
  id?: string;
  name?: string;
  symbol?: string;
  unit?: string;
}

export default function CurrencyInput({
  label, helper, error, required, size = "md", fullWidth = true, disabled,
  value = null, onChange, placeholder = "0.00", id, name, symbol = "$", unit = "USD",
}: CurrencyInputProps) {
  return (
    <FieldShell label={label} required={required} helper={helper} error={error} htmlFor={id} fullWidth={fullWidth}>
      <TextField
        id={id}
        name={name}
        value={value ?? ""}
        onChange={(e) => {
          const raw = e.target.value;
          if (raw === "") return onChange?.(null);
          const n = Number(raw);
          if (!Number.isNaN(n)) onChange?.(n);
        }}
        placeholder={placeholder}
        disabled={disabled}
        error={!!error}
        fullWidth
        sx={fieldSx(size)}
        inputProps={{ inputMode: "decimal" }}
        InputProps={{
          startAdornment: <InputAdornment position="start" sx={{ color: tokens.muted }}>{symbol}</InputAdornment>,
          endAdornment: unit ? <InputAdornment position="end" sx={{ color: tokens.muted }}>{unit}</InputAdornment> : undefined,
        }}
      />
    </FieldShell>
  );
}
