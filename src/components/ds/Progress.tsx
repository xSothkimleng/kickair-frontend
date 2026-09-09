import { css, cx } from "styled-system/css";

const track = css({ position: "relative", w: "100%", h: "6px", borderRadius: "pill", bg: "fill", overflow: "hidden" });
const bar = css({ position: "absolute", insetY: 0, left: 0, borderRadius: "pill", bg: "accent", transition: "width .3s ease" });
const indeterminate = css({ w: "40%", animation: "slideInRight 1.2s ease-in-out infinite alternate" });

/** Replaces MUI <LinearProgress>. `value` 0–100; omit for indeterminate. */
export function Progress({ value, className, tone = "accent" }: { value?: number; className?: string; tone?: "accent" | "success" | "error" | "pending" }) {
  const toneCss = { accent: undefined, success: css({ bg: "success" }), error: css({ bg: "error" }), pending: css({ bg: "pending" }) }[tone];
  return (
    <div role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={value} className={cx(track, className)}>
      <div className={cx(bar, toneCss, value == null && indeterminate)} style={value == null ? undefined : { width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}
