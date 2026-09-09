"use client";

import { useRef } from "react";
import { css } from "styled-system/css";
import { FieldShell } from "./FieldShell";

const otpBox = css({
  w: "46px",
  h: "52px",
  p: 0,
  m: 0,
  textAlign: "center",
  fontSize: "20px",
  fontWeight: 500,
  fontFamily: "inherit",
  color: "heading",
  bg: "field",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "border",
  borderRadius: "input",
  outline: "none",
  appearance: "none",
  transition: "border-color .15s, box-shadow .15s",
  _focus: { borderColor: "accent", boxShadow: "focusRing" },
  "&[aria-invalid=true], &[aria-invalid=true]:focus": { borderColor: "error" },
  "&[aria-invalid=true]:focus": { boxShadow: "focusRingError" },
  _disabled: { bg: "fill", cursor: "not-allowed" },
});

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
      <div className={css({ display: "flex", gap: "10px" })}>
        {chars.map((c, i) => (
          <input
            key={i}
            ref={(el) => { refs.current[i] = el; }}
            value={c}
            inputMode="numeric"
            maxLength={1}
            disabled={disabled}
            autoFocus={autoFocus && i === 0}
            aria-invalid={error ? true : undefined}
            aria-label={`Digit ${i + 1}`}
            onChange={(e) => setChar(i, e.target.value)}
            onKeyDown={(e) => onKey(i, e)}
            onPaste={onPaste}
            className={otpBox}
          />
        ))}
      </div>
    </FieldShell>
  );
}
