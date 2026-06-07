"use client";

import { Select, MenuItem, Box } from "@mui/material";
import { FieldShell } from "./FieldShell";
import { fieldSx, FieldBaseProps, tokens } from "./tokens";

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectInputProps extends FieldBaseProps {
  value?: string | number | "";
  onChange?: (value: string | number) => void;
  options: SelectOption[];
  placeholder?: string;
  id?: string;
  name?: string;
}

export default function SelectInput({
  label, helper, error, required, size = "md", fullWidth = true, disabled,
  value = "", onChange, options, placeholder = "Select…", id, name,
}: SelectInputProps) {
  return (
    <FieldShell label={label} required={required} helper={helper} error={error} htmlFor={id} fullWidth={fullWidth}>
      <Select
        id={id}
        name={name}
        value={value}
        displayEmpty
        fullWidth
        disabled={disabled}
        error={!!error}
        onChange={(e) => onChange?.(e.target.value as string | number)}
        sx={fieldSx(size)}
        renderValue={(v) => {
          if (v === "" || v == null) return <Box component="span" sx={{ color: tokens.placeholder }}>{placeholder}</Box>;
          return options.find((o) => o.value === v)?.label ?? String(v);
        }}
        MenuProps={{ PaperProps: { sx: { borderRadius: "11px", mt: 0.5, boxShadow: "0 12px 32px rgba(15,23,42,0.14)" } } }}>
        {options.map((o) => (
          <MenuItem key={String(o.value)} value={o.value} sx={{ fontSize: 14.5 }}>
            {o.label}
          </MenuItem>
        ))}
      </Select>
    </FieldShell>
  );
}
