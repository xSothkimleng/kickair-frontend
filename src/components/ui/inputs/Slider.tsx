"use client";

import { Slider as MuiSlider, Box } from "@mui/material";
import { FieldShell } from "./FieldShell";
import { FieldBaseProps, tokens } from "./tokens";

export interface SliderProps extends Omit<FieldBaseProps, "size"> {
  value: number | number[];
  onChange: (value: number | number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  valueLabel?: (value: number | number[]) => string;
}

export default function Slider({
  label, helper, error, required, fullWidth = true, disabled, value, onChange, min = 0, max = 100, step = 1, valueLabel,
}: SliderProps) {
  const display = valueLabel ? valueLabel(value) : undefined;

  return (
    <FieldShell label={label} required={required} helper={display ?? helper} error={error} fullWidth={fullWidth}>
      <Box sx={{ px: 0.5 }}>
        <MuiSlider
          value={value}
          onChange={(_, v) => onChange(v)}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          sx={{
            color: tokens.accent,
            "& .MuiSlider-rail": { backgroundColor: tokens.border, opacity: 1 },
            "& .MuiSlider-thumb": {
              backgroundColor: "#fff",
              border: `1px solid ${tokens.borderStrong}`,
              boxShadow: "0 1px 3px rgba(15,23,42,0.22)",
              "&:hover, &.Mui-focusVisible": { boxShadow: "0 0 0 4px rgba(0,113,227,0.22)" },
            },
          }}
        />
      </Box>
    </FieldShell>
  );
}
