"use client";

import { Star } from "lucide-react";
import { css, cx } from "styled-system/css";

const row = css({ display: "inline-flex", alignItems: "center", gap: "2px", "& svg": { display: "block" } });
const starBtn = css({ p: 0, border: "none", bg: "transparent", cursor: "pointer", color: "inherit", fontFamily: "inherit", _focusVisible: { outline: "none", boxShadow: "focusRing", borderRadius: "4px" } });

/** Star rating (display or input). Replaces MUI <Rating>. */
export function Rating({ value, max = 5, size = 16, onChange, className, readOnly }: { value: number; max?: number; size?: number; onChange?: (v: number) => void; className?: string; readOnly?: boolean }) {
  const interactive = !!onChange && !readOnly;
  return (
    <span className={cx(row, className)} role={interactive ? "radiogroup" : "img"} aria-label={`${value} out of ${max} stars`}>
      {Array.from({ length: max }, (_, i) => {
        const n = i + 1;
        const fill = Math.max(0, Math.min(1, value - i));
        const star = (
          <span className={css({ position: "relative", display: "inline-block" })} style={{ width: size, height: size }}>
            <Star size={size} className={css({ color: "borderStrong" })} fill="currentColor" strokeWidth={0} />
            {fill > 0 && (
              <span className={css({ position: "absolute", inset: 0, overflow: "hidden" })} style={{ width: `${fill * 100}%` }}>
                <Star size={size} className={css({ color: "warning" })} fill="currentColor" strokeWidth={0} />
              </span>
            )}
          </span>
        );
        return interactive ? (
          <button key={n} type="button" className={starBtn} role="radio" aria-checked={n === Math.round(value)} aria-label={`${n} star${n > 1 ? "s" : ""}`} onClick={() => onChange?.(n)}>{star}</button>
        ) : <span key={n}>{star}</span>;
      })}
    </span>
  );
}
