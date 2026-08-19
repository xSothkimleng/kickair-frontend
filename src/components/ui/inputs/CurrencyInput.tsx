"use client";

import { TextField, InputAdornment } from "@mui/material";
import { FieldShell } from "./FieldShell";
import { fieldSx, FieldBaseProps, tokens } from "./tokens";

/**
 * Masks free text into a valid money string: digits + at most one dot +
 * at most 2 decimal places. Returns the clamped string ("" stays "").
 * Use everywhere a money amount is typed so 3+ decimals can never enter state.
 */
export function sanitizeMoneyInput(raw: string): string {
  // Keep only digits and dots, collapse to a single (first) dot.
  const cleaned = raw.replace(/[^0-9.]/g, "");
  const firstDot = cleaned.indexOf(".");
  if (firstDot === -1) return cleaned;
  const intPart = cleaned.slice(0, firstDot);
  const decPart = cleaned.slice(firstDot + 1).replace(/\./g, "").slice(0, 2);
  return `${intPart}.${decPart}`;
}

/**
 * Parses a masked money string to a number rounded to 2 decimals,
 * or null when empty/unparseable. Safe to send to the API.
 */
export function parseMoney(value: string): number | null {
  const s = sanitizeMoneyInput(value);
  if (s === "" || s === ".") return null;
  const n = Number(s);
  if (Number.isNaN(n)) return null;
  return Math.round(n * 100) / 100;
}

export interface CurrencyInputProps extends FieldBaseProps {
  /** Masked money string, e.g. "12.50". Always already clamped to 2 decimals. */
  value?: string;
  /** Receives the masked (2-decimal-max) string on every keystroke. */
  onChange?: (value: string) => void;
  placeholder?: string;
  id?: string;
  name?: string;
  symbol?: string;
  unit?: string;
  autoFocus?: boolean;
  onBlur?: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
}

export default function CurrencyInput({
  label, helper, error, required, size = "md", fullWidth = true, disabled,
  value = "", onChange, placeholder = "0.00", id, name, symbol = "$", unit, autoFocus, onBlur,
}: CurrencyInputProps) {
  return (
    <FieldShell label={label} required={required} helper={helper} error={error} htmlFor={id} fullWidth={fullWidth}>
      <TextField
        id={id}
        name={name}
        value={value}
        onChange={(e) => onChange?.(sanitizeMoneyInput(e.target.value))}
        placeholder={placeholder}
        disabled={disabled}
        error={!!error}
        fullWidth
        autoFocus={autoFocus}
        onBlur={onBlur}
        sx={fieldSx(size)}
        inputProps={{ inputMode: "decimal" }}
        InputProps={{
          startAdornment: <InputAdornment position="start" sx={{ color: tokens.muted }}>{symbol}</InputAdornment>,
          endAdornment: unit ? <InputAdornment position="end" sx={{ color: tokens.muted }}>{unit}</InputAdornment> : undefined,
        }}
      />
    </FieldShell>
  );
}
