"use client";

import { Search, X } from "lucide-react";
import { FieldShell } from "./FieldShell";
import { fieldAdornment, fieldControl, fieldIconButton, fieldRoot } from "./field";
import { FieldBaseProps } from "./tokens";

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
    <div className={fieldRoot({ size })} data-invalid={error ? "" : undefined} data-disabled={disabled ? "" : undefined}>
      <span className={fieldAdornment}>
        <Search size={18} />
      </span>
      <input
        id={id}
        type="search"
        value={value ?? ""}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        readOnly={!onChange}
        onKeyDown={(e) => { if (e.key === "Enter") onEnter?.(); }}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        className={fieldControl}
      />
      {value ? (
        <button
          type="button"
          onClick={() => { onChange?.(""); onClear?.(); }}
          disabled={disabled}
          aria-label="Clear search"
          className={fieldIconButton}>
          <X size={16} />
        </button>
      ) : null}
    </div>
  );

  // When unlabelled (e.g. a toolbar search), render the bare field without the shell.
  if (!label && !helper && !error) return body;
  return (
    <FieldShell label={label} helper={helper} error={error} htmlFor={id} fullWidth={fullWidth}>
      {body}
    </FieldShell>
  );
}
