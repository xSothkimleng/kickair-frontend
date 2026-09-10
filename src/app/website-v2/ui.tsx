"use client";

/**
 * website-v2 — shared primitives.
 *
 * Marketing pages and both workspaces build from these, so a button, a status
 * and an amount look and behave identically everywhere (§16 Familiarity: things
 * that look the same must behave the same).
 */
import { motion, useReducedMotion, type HTMLMotionProps } from "motion/react";
import { forwardRef, type ReactNode } from "react";
import { css, cx } from "styled-system/css";
import { spring, text } from "./design";

/* ── Button ──────────────────────────────────────────────────────────────── */

type Variant = "primary" | "secondary" | "ghost" | "onDark" | "accent";
type Size = "sm" | "md" | "lg";

const base = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.5rem",
  flexShrink: 0,
  border: "none",
  fontFamily: "inherit",
  fontWeight: 500,
  letterSpacing: "-0.004em",
  borderRadius: "var(--v2-r-pill)",
  cursor: "pointer",
  whiteSpace: "nowrap",
  WebkitTapHighlightColor: "transparent",
  _disabled: { opacity: 0.4, cursor: "not-allowed" },
});

const sizes: Record<Size, string> = {
  sm: css({ height: "2rem", px: "0.875rem", fontSize: "0.8125rem" }),
  md: css({ height: "2.5rem", px: "1.125rem", fontSize: "0.875rem" }),
  lg: css({ height: "3rem", px: "1.625rem", fontSize: "0.9375rem" }),
};

const variants: Record<Variant, string> = {
  primary: css({ bg: "var(--v2-primary)", color: "var(--v2-white)", boxShadow: "var(--v2-sh-chip)" }),
  accent: css({ bg: "var(--v2-accent)", color: "var(--v2-white)", boxShadow: "var(--v2-sh-chip)" }),
  secondary: css({
    bg: "var(--v2-white)",
    color: "var(--v2-primary)",
    boxShadow: `inset 0 0 0 1px ${"var(--v2-hairlineStrong)"}, ${"var(--v2-sh-chip)"}`,
  }),
  ghost: css({ bg: "transparent", color: "var(--v2-secondary)", _hover: { color: "var(--v2-primary)" } }),
  onDark: css({ bg: "var(--v2-white)", color: "var(--v2-primary)" }),
};

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: Variant;
  size?: Size;
  children?: ReactNode;
}

/**
 * §1 — feedback lands on pointer-down, not on release. Motion's whileTap fires
 * on pointerdown and cancels if the pointer leaves, which is exactly the tap
 * behaviour §10 asks for.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", className, children, ...rest },
  ref
) {
  const reduced = useReducedMotion();
  return (
    <motion.button
      ref={ref}
      type="button"
      className={cx(base, sizes[size], variants[variant], className)}
      whileTap={reduced ? undefined : { scale: 0.97 }}
      transition={spring.quick}
      {...rest}
    >
      {children}
    </motion.button>
  );
});

/* ── Card ────────────────────────────────────────────────────────────────── */

export const card = css({
  bg: "var(--v2-white)",
  borderRadius: "var(--v2-r-card)",
  boxShadow: `inset 0 0 0 1px ${"var(--v2-hairline)"}, ${"var(--v2-sh-card)"}`,
});

export const panel = css({
  bg: "var(--v2-white)",
  borderRadius: "var(--v2-r-panel)",
  boxShadow: `inset 0 0 0 1px ${"var(--v2-hairline)"}, ${"var(--v2-sh-card)"}`,
});

/* ── Status ──────────────────────────────────────────────────────────────── */

export type OrderStatus =
  | "pending" | "active" | "delivered" | "revision_requested"
  | "disputed" | "completed" | "cancelled";

/**
 * Colour carries meaning here, so the map is the single source of it.
 * "Waiting on you" is amber wherever it appears, on either side of the market.
 */
const STATUS: Record<OrderStatus, { label: string; fg: string; bg: string }> = {
  pending:            { label: "Awaiting acceptance", fg: "var(--v2-attention)", bg: "var(--v2-attentionTint)" },
  active:             { label: "In progress",         fg: "var(--v2-accent)",    bg: "var(--v2-accentTint)" },
  delivered:          { label: "Ready for review",    fg: "var(--v2-attention)", bg: "var(--v2-attentionTint)" },
  revision_requested: { label: "Revision requested",  fg: "var(--v2-attention)", bg: "var(--v2-attentionTint)" },
  disputed:           { label: "In dispute",          fg: "var(--v2-danger)",    bg: "var(--v2-dangerTint)" },
  completed:          { label: "Completed",           fg: "var(--v2-success)",   bg: "var(--v2-successTint)" },
  cancelled:          { label: "Cancelled",           fg: "var(--v2-tertiary)",  bg: "rgba(10,10,11,0.05)" },
};

const badge = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "0.375rem",
  px: "0.5rem",
  height: "1.5rem",
  borderRadius: "var(--v2-r-chip)",
  fontSize: "0.75rem",
  fontWeight: 550,
  letterSpacing: "0.008em",
  whiteSpace: "nowrap",
});

export function StatusBadge({ status }: { status: OrderStatus }) {
  const s = STATUS[status];
  return (
    <span className={badge} style={{ color: s.fg, background: s.bg }}>
      <span
        aria-hidden
        className={css({ w: "0.375rem", h: "0.375rem", borderRadius: "999px" })}
        style={{ background: s.fg }}
      />
      {s.label}
    </span>
  );
}

/** Escrow gets its own mark — teal, never the success green (see design.ts). */
export function EscrowBadge({ children }: { children: ReactNode }) {
  return (
    <span className={badge} style={{ color: "var(--v2-secure)", background: "var(--v2-secureTint)" }}>
      {children}
    </span>
  );
}

/* ── Money ───────────────────────────────────────────────────────────────── */

export function Money({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cx(text.money, className)}>
      ${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </span>
  );
}

/* ── Avatar ──────────────────────────────────────────────────────────────────
 * No photography exists, so identity is initials on a deterministic tint —
 * stable per person, which is what makes it read as an identity rather than
 * decoration.
 */
const TINTS = ["#0071E3", "#0D9488", "#D97706", "#7C3AED", "#DB2777", "#16A34A"];

export function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  const initials = name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  const tint = TINTS[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % TINTS.length];
  return (
    <span
      aria-hidden
      className={css({
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        borderRadius: "999px",
        fontWeight: 600,
        letterSpacing: "0.01em",
        color: "var(--v2-white)",
      })}
      style={{ width: size, height: size, background: tint, fontSize: size * 0.36 }}
    >
      {initials}
    </span>
  );
}
