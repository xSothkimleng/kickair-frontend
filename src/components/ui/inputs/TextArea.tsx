"use client";

import { TextField } from "@mui/material";
import { FieldShell } from "./FieldShell";
import { fieldSx, FieldBaseProps } from "./tokens";

export interface TextAreaProps extends FieldBaseProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  id?: string;
  name?: string;
  minRows?: number;
  maxRows?: number;
  maxLength?: number;
  showCounter?: boolean;
}

export default function TextArea({
  label, helper, error, required, size = "md", fullWidth = true, disabled,
  value = "", onChange, placeholder, id, name, minRows = 3, maxRows, maxLength, showCounter,
}: TextAreaProps) {
  const counter = showCounter || maxLength
    ? `${value.length}${maxLength ? ` / ${maxLength}` : ""} characters`
    : undefined;

  return (
    <FieldShell label={label} required={required} helper={counter ?? helper} error={error} htmlFor={id} fullWidth={fullWidth}>
      <TextField
        id={id}
        name={name}
        multiline
        minRows={minRows}
        maxRows={maxRows}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        placeholder={placeholder}
        disabled={disabled}
        error={!!error}
        fullWidth
        sx={fieldSx(size)}
        inputProps={{ maxLength }}
      />
    </FieldShell>
  );
}
