"use client";

import { Autocomplete, TextField } from "@mui/material";
import { FieldShell } from "./FieldShell";
import { fieldSx, FieldBaseProps } from "./tokens";

export interface AutocompleteInputProps extends FieldBaseProps {
  value?: string | null;
  onChange?: (value: string | null) => void;
  options: string[];
  placeholder?: string;
  id?: string;
  freeSolo?: boolean;
}

export default function AutocompleteInput({
  label, helper, error, required, size = "md", fullWidth = true, disabled,
  value = null, onChange, options, placeholder, id, freeSolo,
}: AutocompleteInputProps) {
  return (
    <FieldShell label={label} required={required} helper={helper} error={error} htmlFor={id} fullWidth={fullWidth}>
      <Autocomplete
        id={id}
        options={options}
        value={value}
        freeSolo={freeSolo}
        disabled={disabled}
        fullWidth
        onChange={(_, v) => onChange?.((v as string) ?? null)}
        onInputChange={freeSolo ? (_, v) => onChange?.(v || null) : undefined}
        renderInput={(params) => (
          <TextField {...params} placeholder={placeholder} error={!!error} sx={fieldSx(size)} />
        )}
      />
    </FieldShell>
  );
}
