"use client";

import { useRef } from "react";
import { Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import { FieldShell } from "./FieldShell";
import { tokens, FOCUS_RING, FOCUS_RING_ERROR } from "./tokens";

const OtpBox = styled("input", { shouldForwardProp: (p) => p !== "$error" })<{ $error?: boolean }>(
  ({ $error }) => ({
    width: 46,
    height: 52,
    textAlign: "center",
    fontSize: 20,
    fontWeight: 500,
    fontFamily: "inherit",
    color: tokens.heading,
    background: "#fff",
    border: `1px solid ${$error ? tokens.error : tokens.border}`,
    borderRadius: 10,
    outline: "none",
    transition: "border-color .15s, box-shadow .15s",
    "&:focus": {
      borderColor: $error ? tokens.error : tokens.accent,
      boxShadow: $error ? FOCUS_RING_ERROR : FOCUS_RING,
    },
    "&:disabled": { background: tokens.fill, cursor: "not-allowed" },
  }),
);

export interface OtpInputProps {
  label?: string;
  helper?: string;
  error?: string | boolean;
  value: string;
  onChange: (value: string) => void;
  length?: number;
  autoFocus?: boolean;
  disabled?: boolean;
}

export default function OtpInput({ label, helper, error, value, onChange, length = 6, autoFocus, disabled }: OtpInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const chars = Array.from({ length }, (_, i) => value[i] ?? "");

  const setChar = (i: number, ch: string) => {
    if (!/^\d?$/.test(ch)) return;
    const next = chars.slice();
    next[i] = ch;
    onChange(next.join("").slice(0, length));
    if (ch && i < length - 1) refs.current[i + 1]?.focus();
  };

  const onKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !chars[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const onPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (digits) {
      e.preventDefault();
      onChange(digits);
      refs.current[Math.min(digits.length, length - 1)]?.focus();
    }
  };

  return (
    <FieldShell label={label} helper={helper} error={error}>
      <Box sx={{ display: "flex", gap: 1.25 }}>
        {chars.map((c, i) => (
          <OtpBox
            key={i}
            ref={(el) => { refs.current[i] = el; }}
            value={c}
            inputMode="numeric"
            maxLength={1}
            disabled={disabled}
            autoFocus={autoFocus && i === 0}
            $error={!!error}
            onChange={(e) => setChar(i, e.target.value)}
            onKeyDown={(e) => onKey(i, e)}
            onPaste={onPaste}
          />
        ))}
      </Box>
    </FieldShell>
  );
}
