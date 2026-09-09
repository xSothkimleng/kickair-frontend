// Shared colour tokens + base prop types for the KickAir input system.
// The visual recipes live in ./field.ts (Panda). This colour object mirrors the
// Panda tokens in panda.config.ts and is still read by a few MUI-styled pages
// (auth) — delete it once those pages are on Panda.

export const tokens = {
  accent: "#0071e3",
  accentHover: "#0077ED",
  heading: "#0F172A",
  body: "#334155",
  muted: "#64748B",
  placeholder: "#94A3B8",
  border: "#E2E8F0",
  borderStrong: "#CBD5E1",
  field: "#FFFFFF",
  fill: "#F1F5F9",
  page: "#F5F5F7",
  success: "#16a34a",
  error: "#DC2626",
  warning: "#f59e0b",
} as const;

export type FieldSize = "md" | "sm";

/** Shared props every labelled field accepts. */
export interface FieldBaseProps {
  label?: string;
  helper?: string;
  error?: string | boolean;
  required?: boolean;
  size?: FieldSize;
  fullWidth?: boolean;
  disabled?: boolean;
}
