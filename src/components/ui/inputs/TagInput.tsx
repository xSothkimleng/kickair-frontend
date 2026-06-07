"use client";

import { Autocomplete, TextField, Chip } from "@mui/material";
import { FieldShell } from "./FieldShell";
import { fieldSx, FieldBaseProps, tokens } from "./tokens";

export interface TagInputProps extends FieldBaseProps {
  value?: string[];
  onChange?: (value: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
  id?: string;
}

export default function TagInput({
  label, helper, error, required, size = "md", fullWidth = true, disabled,
  value = [], onChange, suggestions = [], placeholder = "Add a tag…", id,
}: TagInputProps) {
  return (
    <FieldShell label={label} required={required} helper={helper} error={error} htmlFor={id} fullWidth={fullWidth}>
      <Autocomplete
        id={id}
        multiple
        freeSolo
        options={suggestions}
        value={value}
        disabled={disabled}
        fullWidth
        onChange={(_, v) => onChange?.(v as string[])}
        renderTags={(vals, getTagProps) =>
          vals.map((opt, index) => {
            const { key, ...tagProps } = getTagProps({ index });
            return (
              <Chip
                key={key}
                label={opt}
                size="small"
                {...tagProps}
                sx={{ backgroundColor: tokens.fill, border: `1px solid ${tokens.border}`, borderRadius: "7px", color: tokens.heading }}
              />
            );
          })
        }
        renderInput={(params) => (
          <TextField {...params} placeholder={value.length ? "" : placeholder} error={!!error} sx={fieldSx(size)} />
        )}
      />
    </FieldShell>
  );
}
