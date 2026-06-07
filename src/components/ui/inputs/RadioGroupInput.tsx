"use client";

import { RadioGroup, Radio, Box, Typography } from "@mui/material";
import { FieldShell } from "./FieldShell";
import { FieldBaseProps, tokens } from "./tokens";

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

export interface RadioGroupInputProps extends Omit<FieldBaseProps, "size"> {
  value?: string;
  onChange?: (value: string) => void;
  options: RadioOption[];
  name?: string;
}

export default function RadioGroupInput({
  label, helper, error, required, fullWidth = true, disabled, value = "", onChange, options, name,
}: RadioGroupInputProps) {
  return (
    <FieldShell label={label} required={required} helper={helper} error={error} fullWidth={fullWidth}>
      <RadioGroup name={name} value={value} onChange={(e) => onChange?.(e.target.value)} sx={{ gap: 1.5 }}>
        {options.map((o) => (
          <Box component="label" key={o.value} sx={{ display: "flex", gap: 1.25, cursor: disabled ? "not-allowed" : "pointer", alignItems: o.description ? "flex-start" : "center" }}>
            <Radio
              value={o.value}
              checked={value === o.value}
              disabled={disabled}
              sx={{ p: 0, mt: o.description ? "-1px" : 0, color: tokens.borderStrong, "&.Mui-checked": { color: tokens.accent } }}
            />
            <Box>
              <Typography sx={{ fontSize: 14.5, color: tokens.heading }}>{o.label}</Typography>
              {o.description && <Typography sx={{ fontSize: 13, color: tokens.muted }}>{o.description}</Typography>}
            </Box>
          </Box>
        ))}
      </RadioGroup>
    </FieldShell>
  );
}
