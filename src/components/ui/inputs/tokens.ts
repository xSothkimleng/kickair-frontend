// Shared design tokens + base field styling for the KickAir input system.
// Single source of truth — every input component pulls from here.

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

export const FOCUS_RING = "0 0 0 3px rgba(0,113,227,0.18)";
export const FOCUS_RING_ERROR = "0 0 0 3px rgba(220,38,38,0.16)";

export type FieldSize = "md" | "sm";

/**
 * sx for any MUI outlined input/select root — clean white field, slate border,
 * accent focus ring, error + disabled states, and an autofill override so saved
 * credentials don't grey the field out.
 */
export const fieldSx = (size: FieldSize = "md") => ({
  // Matches both TextField (OutlinedInput is a descendant) and a standalone Select
  // (its root *is* the OutlinedInput), so the radius/focus-ring apply in both cases.
  "&.MuiOutlinedInput-root, & .MuiOutlinedInput-root": {
    borderRadius: "10px",
    backgroundColor: tokens.field,
    fontSize: size === "sm" ? 14 : 15,
    color: tokens.heading,
    minHeight: size === "sm" ? 38 : 46,
    transition: "box-shadow .15s",
    "& fieldset": { borderColor: tokens.border, transition: "border-color .15s" },
    "&:hover fieldset": { borderColor: tokens.borderStrong },
    "&.Mui-focused fieldset": { borderColor: tokens.accent, borderWidth: "1px" },
    "&.Mui-focused": { boxShadow: FOCUS_RING },
    "&.Mui-error fieldset": { borderColor: tokens.error },
    "&.Mui-error.Mui-focused": { boxShadow: FOCUS_RING_ERROR },
    "&.Mui-disabled": { backgroundColor: tokens.fill },
  },
  "& .MuiOutlinedInput-input": {
    padding: size === "sm" ? "8px 12px" : "11.5px 14px",
    "&::placeholder": { color: tokens.placeholder, opacity: 1 },
  },
  "& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus": {
    WebkitBoxShadow: `0 0 0 1000px ${tokens.field} inset`,
    WebkitTextFillColor: tokens.heading,
    caretColor: tokens.heading,
    borderRadius: "10px",
  },
});

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
