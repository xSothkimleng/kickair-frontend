"use client";

import { ReactNode } from "react";
import { Checkbox as MuiCheckbox, Box, Typography } from "@mui/material";
import { tokens } from "./tokens";

export interface CheckboxProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: ReactNode;
  description?: string;
  indeterminate?: boolean;
  disabled?: boolean;
}

export default function Checkbox({ checked, onChange, label, description, indeterminate, disabled }: CheckboxProps) {
  return (
    <Box component="label" sx={{ display: "flex", alignItems: description ? "flex-start" : "center", gap: 1.25, cursor: disabled ? "not-allowed" : "pointer" }}>
      <MuiCheckbox
        checked={!!checked}
        indeterminate={indeterminate}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
        sx={{ p: 0, color: tokens.borderStrong, "&.Mui-checked": { color: tokens.accent }, "&.MuiCheckbox-indeterminate": { color: tokens.accent } }}
      />
      {(label || description) && (
        <Box sx={{ mt: description ? "-2px" : 0 }}>
          {label && <Typography sx={{ fontSize: 14.5, color: disabled ? tokens.placeholder : tokens.heading }}>{label}</Typography>}
          {description && <Typography sx={{ fontSize: 13, color: tokens.muted }}>{description}</Typography>}
        </Box>
      )}
    </Box>
  );
}
