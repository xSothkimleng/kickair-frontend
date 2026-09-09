"use client";

import { useLayoutEffect, useRef } from "react";
import { cx } from "styled-system/css";
import { FieldShell } from "./FieldShell";
import { fieldControl, fieldRoot, fieldTextarea } from "./field";
import { FieldBaseProps } from "./tokens";

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

/** Grows the textarea with its content between minRows and maxRows (MUI TextareaAutosize parity). */
function useAutosize(ref: React.RefObject<HTMLTextAreaElement | null>, value: string, minRows: number, maxRows?: number) {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const cs = getComputedStyle(el);
    const lineHeight = parseFloat(cs.lineHeight) || 22;
    const pad = (parseFloat(cs.paddingTop) || 0) + (parseFloat(cs.paddingBottom) || 0);
    const min = minRows * lineHeight + pad;
    const max = maxRows ? maxRows * lineHeight + pad : Infinity;
    el.style.height = "auto";
    const content = el.scrollHeight;
    el.style.height = `${Math.min(Math.max(content, min), max)}px`;
    el.style.overflowY = content > max ? "auto" : "hidden";
  }, [ref, value, minRows, maxRows]);
}

export default function TextArea({
  label, helper, error, required, size = "md", fullWidth = true, disabled,
  value = "", onChange, placeholder, id, name, minRows = 3, maxRows, maxLength, showCounter,
}: TextAreaProps) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useAutosize(ref, value, minRows, maxRows);

  const counter = showCounter || maxLength
    ? `${value.length}${maxLength ? ` / ${maxLength}` : ""} characters`
    : undefined;

  return (
    <FieldShell label={label} required={required} helper={counter ?? helper} error={error} htmlFor={id} fullWidth={fullWidth}>
      <div className={fieldRoot({ size, multiline: true })} data-invalid={error ? "" : undefined} data-disabled={disabled ? "" : undefined}>
        <textarea
          ref={ref}
          id={id}
          name={name}
          rows={minRows}
          value={value}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          readOnly={!onChange}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          maxLength={maxLength}
          className={cx(fieldControl, fieldTextarea)}
        />
      </div>
    </FieldShell>
  );
}
