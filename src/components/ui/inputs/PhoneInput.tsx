"use client";

import { TextField, InputAdornment, Box } from "@mui/material";
import { FieldShell } from "./FieldShell";
import { fieldSx, FieldBaseProps, tokens } from "./tokens";

export interface PhoneInputProps extends FieldBaseProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  id?: string;
  name?: string;
  countryCode?: string;
}

export default function PhoneInput({
  label, helper, error, required, size = "md", fullWidth = true, disabled,
  value, onChange, placeholder = "12 345 678", id, name, countryCode = "+855",
}: PhoneInputProps) {
  return (
    <FieldShell label={label} required={required} helper={helper} error={error} htmlFor={id} fullWidth={fullWidth}>
      <TextField
        id={id}
        name={name}
        type="tel"
        value={value ?? ""}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        placeholder={placeholder}
        disabled={disabled}
        error={!!error}
        fullWidth
        autoComplete="tel"
        sx={fieldSx(size)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start" sx={{ mr: 0 }}>
              <Box sx={{ pr: 1.25, mr: 1, borderRight: `1px solid ${tokens.border}`, color: tokens.body, fontWeight: 500, fontSize: 15, py: 0.5 }}>
                {countryCode}
              </Box>
            </InputAdornment>
          ),
        }}
      />
    </FieldShell>
  );
}
