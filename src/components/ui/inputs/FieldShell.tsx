"use client";

import { Box, Typography, SxProps, Theme } from "@mui/material";
import { ReactNode } from "react";
import { tokens } from "./tokens";

export function FieldLabel({ children, required, htmlFor }: { children: ReactNode; required?: boolean; htmlFor?: string }) {
  return (
    <Typography
      component="label"
      htmlFor={htmlFor}
      sx={{ display: "block", fontSize: 13, fontWeight: 500, color: tokens.body, mb: 0.875 }}>
      {children}
      {required && <Box component="span" sx={{ color: tokens.error, ml: 0.5 }}>*</Box>}
    </Typography>
  );
}

export function FieldHelper({ children, error }: { children?: ReactNode; error?: boolean }) {
  if (!children) return null;
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.625, mt: 0.875, fontSize: 12.5, lineHeight: 1.45, color: error ? tokens.error : tokens.muted }}>
      {error && (
        <Box component="svg" sx={{ width: 13, height: 13, flexShrink: 0, color: tokens.error }} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
          <path d="M12 7v6M12 16.4v.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </Box>
      )}
      <span>{children}</span>
    </Box>
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
  sx,
}: {
  label?: string;
  required?: boolean;
  helper?: ReactNode;
  error?: string | boolean;
  htmlFor?: string;
  fullWidth?: boolean;
  children: ReactNode;
  sx?: SxProps<Theme>;
}) {
  const errorText = typeof error === "string" ? error : undefined;
  return (
    <Box sx={{ width: fullWidth ? "100%" : undefined, ...sx }}>
      {label && (
        <FieldLabel htmlFor={htmlFor} required={required}>
          {label}
        </FieldLabel>
      )}
      {children}
      <FieldHelper error={!!error}>{errorText ?? helper}</FieldHelper>
    </Box>
  );
}
