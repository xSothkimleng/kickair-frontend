"use client";

import type { ReactNode } from "react";
import { css } from "styled-system/css";

/**
 * ABA step / state annotation tag (e.g. "STEP 6").
 *
 * Hidden in the live app. Set `NEXT_PUBLIC_SHOW_PAYMENT_ANNOTATIONS=true` to
 * render them — used to produce the annotated build that ABA requires for the
 * UI-payment-flow review submission.
 */
const SHOW = process.env.NEXT_PUBLIC_SHOW_PAYMENT_ANNOTATIONS === "true";

const wrapCss = css({ display: "flex", gap: "6px", flexWrap: "wrap" });

const tagCss = css({
  fontFamily: "mono",
  fontSize: "10.5px",
  fontWeight: 600,
  letterSpacing: "0.02em",
  color: "accent",
  bg: "accentFill",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "rgba(0, 113, 227, 0.25)",
  borderRadius: "6px",
  px: "8px",
  py: "3px",
  whiteSpace: "nowrap",
});

export default function Annot({ children }: { children: ReactNode | ReactNode[] }) {
  if (!SHOW) return null;
  const items = Array.isArray(children) ? children : [children];
  return (
    <div className={wrapCss}>
      {items.map((c, i) => (
        <span key={i} className={tagCss}>
          {c}
        </span>
      ))}
    </div>
  );
}
