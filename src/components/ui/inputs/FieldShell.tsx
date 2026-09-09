"use client";

import { ReactNode } from "react";
import { css, cx } from "styled-system/css";
import { fieldHelper, fieldLabel } from "./field";

export function FieldLabel({ children, required, htmlFor, className }: { children: ReactNode; required?: boolean; htmlFor?: string; className?: string }) {
  return (
    <label htmlFor={htmlFor} className={cx(fieldLabel, className)}>
      {children}
      {required && <span className={css({ color: "error", ml: "4px" })}>*</span>}
    </label>
  );
}

export function FieldHelper({ children, error }: { children?: ReactNode; error?: boolean }) {
  if (!children) return null;
  return (
    <div className={fieldHelper({ error: !!error })}>
      {error && (
        <svg className={css({ w: "13px", h: "13px", flexShrink: 0 })} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
          <path d="M12 7v6M12 16.4v.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )}
      <span>{children}</span>
    </div>
  );
}

/**
 * Wraps a control with a label above and helper/error text below — the consistent
 * KickAir field layout. Pass `error` as a string to show an error message.
 */
export function FieldShell({
  label,
  required,
  helper,
  error,
  htmlFor,
  fullWidth,
  children,
  className,
}: {
  label?: string;
  required?: boolean;
  helper?: ReactNode;
  error?: string | boolean;
  htmlFor?: string;
  fullWidth?: boolean;
  children: ReactNode;
  className?: string;
}) {
  const errorText = typeof error === "string" ? error : undefined;
  return (
    <div className={cx(fullWidth ? css({ w: "100%" }) : undefined, className)}>
      {label && (
        <FieldLabel htmlFor={htmlFor} required={required}>
          {label}
        </FieldLabel>
      )}
      {children}
      <FieldHelper error={!!error}>{errorText ?? helper}</FieldHelper>
    </div>
  );
}
