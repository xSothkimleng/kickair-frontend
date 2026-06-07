"use client";

import { Switch as MuiSwitch, Box, Typography } from "@mui/material";
import { tokens } from "./tokens";

export interface SwitchProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}

export default function Switch({ checked, onChange, label, description, disabled }: SwitchProps) {
  const control = (
    <MuiSwitch
      checked={!!checked}
      disabled={disabled}
      onChange={(e) => onChange?.(e.target.checked)}
      sx={{
        "& .MuiSwitch-switchBase.Mui-checked": { color: "#fff" },
        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: tokens.accent, opacity: 1 },
        "& .MuiSwitch-track": { backgroundColor: tokens.borderStrong, opacity: 1 },
      }}
    />
  );

  if (!label && !description) return control;

  return (
    <Box component="label" sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, cursor: disabled ? "not-allowed" : "pointer" }}>
      <Box>
        {label && <Typography sx={{ fontSize: 14.5, color: tokens.heading }}>{label}</Typography>}
        {description && <Typography sx={{ fontSize: 13, color: tokens.muted }}>{description}</Typography>}
      </Box>
      {control}
    </Box>
  );
}
