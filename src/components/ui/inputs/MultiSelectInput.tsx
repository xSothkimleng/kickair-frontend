"use client";

import { Select, MenuItem, Box, Chip, Checkbox as MuiCheckbox } from "@mui/material";
import { FieldShell } from "./FieldShell";
import { fieldSx, FieldBaseProps, tokens } from "./tokens";
import type { SelectOption } from "./SelectInput";

export interface MultiSelectInputProps extends FieldBaseProps {
  value?: (string | number)[];
  onChange?: (value: (string | number)[]) => void;
  options: SelectOption[];
  placeholder?: string;
  id?: string;
  name?: string;
}

export default function MultiSelectInput({
  label, helper, error, required, size = "md", fullWidth = true, disabled,
  value = [], onChange, options, placeholder = "Select…", id, name,
}: MultiSelectInputProps) {
  return (
    <FieldShell label={label} required={required} helper={helper} error={error} htmlFor={id} fullWidth={fullWidth}>
      <Select
        id={id}
        name={name}
        multiple
        value={value}
        displayEmpty
        fullWidth
        disabled={disabled}
        error={!!error}
        onChange={(e) => onChange?.(e.target.value as (string | number)[])}
        sx={fieldSx(size)}
        renderValue={(selected) => {
          const arr = selected as (string | number)[];
          if (!arr.length) return <Box component="span" sx={{ color: tokens.placeholder }}>{placeholder}</Box>;
          return (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {arr.map((v) => (
                <Chip
                  key={String(v)}
                  size="small"
                  label={options.find((o) => o.value === v)?.label ?? String(v)}
                  sx={{ backgroundColor: tokens.fill, border: `1px solid ${tokens.border}`, borderRadius: "7px", color: tokens.heading }}
                />
              ))}
            </Box>
          );
        }}
        MenuProps={{ PaperProps: { sx: { borderRadius: "11px", mt: 0.5, boxShadow: "0 12px 32px rgba(15,23,42,0.14)" } } }}>
        {options.map((o) => (
          <MenuItem key={String(o.value)} value={o.value} sx={{ fontSize: 14.5 }}>
            <MuiCheckbox checked={value.includes(o.value)} size="small" sx={{ p: 0.5, mr: 1, "&.Mui-checked": { color: tokens.accent } }} />
            {o.label}
          </MenuItem>
        ))}
      </Select>
    </FieldShell>
  );
}
