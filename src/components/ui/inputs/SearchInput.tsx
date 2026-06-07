"use client";

import { TextField, InputAdornment, IconButton } from "@mui/material";
import { Search, Close } from "@mui/icons-material";
import { FieldShell } from "./FieldShell";
import { fieldSx, FieldBaseProps, tokens } from "./tokens";

export interface SearchInputProps extends FieldBaseProps {
  value?: string;
  onChange?: (value: string) => void;
  onClear?: () => void;
  onEnter?: () => void;
  placeholder?: string;
  id?: string;
}

export default function SearchInput({
  label, helper, error, size = "md", fullWidth = true, disabled,
  value, onChange, onClear, onEnter, placeholder = "Search…", id,
}: SearchInputProps) {
  const body = (
    <TextField
      id={id}
      type="search"
      value={value ?? ""}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      onKeyDown={(e) => { if (e.key === "Enter") onEnter?.(); }}
      placeholder={placeholder}
      disabled={disabled}
      error={!!error}
      fullWidth
      sx={fieldSx(size)}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start" sx={{ color: tokens.muted }}>
            <Search fontSize="small" />
          </InputAdornment>
        ),
        endAdornment: value
          ? (
            <InputAdornment position="end">
              <IconButton size="small" onClick={() => { onChange?.(""); onClear?.(); }} aria-label="Clear search" sx={{ color: tokens.muted }}>
                <Close fontSize="small" />
              </IconButton>
            </InputAdornment>
          )
          : undefined,
      }}
    />
  );

  // When unlabelled (e.g. a toolbar search), render the bare field without the shell.
  if (!label && !helper && !error) return body;
  return (
    <FieldShell label={label} helper={helper} error={error} htmlFor={id} fullWidth={fullWidth}>
      {body}
    </FieldShell>
  );
}
