"use client";

import type { ReactNode } from "react";
import { css, cva } from "styled-system/css";

export type ChipStatus = "completed" | "success" | "pending" | "failed" | "error" | "escrow" | "neutral";

const STATUSES: ChipStatus[] = ["completed", "success", "pending", "failed", "error", "escrow", "neutral"];

const chipCss = cva({
  base: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    h: "24px",
    px: "10px",
    borderRadius: "pill",
    fontSize: "12px",
    fontWeight: 600,
  },
  variants: {
    status: {
      completed: { bg: "successTint", color: "successText" },
      success: { bg: "successTint", color: "successText" },
      pending: { bg: "pendingTint", color: "pendingText" },
      escrow: { bg: "pendingTint", color: "pendingText" },
      failed: { bg: "errorTint", color: "errorText" },
      error: { bg: "errorTint", color: "errorText" },
      neutral: { bg: "rgba(0,0,0,0.05)", color: "ink2" },
    },
  },
  defaultVariants: { status: "neutral" },
});

const dotCss = css({ width: "6px", height: "6px", borderRadius: "50%", bg: "currentColor" });

/** Small tinted status pill with a leading dot. */
export default function StatusChip({
  status = "neutral",
  children,
  dot = true,
}: {
  status?: ChipStatus;
  children: ReactNode;
  dot?: boolean;
}) {
  const tone = STATUSES.includes(status) ? status : "neutral";
  return (
    <span className={chipCss({ status: tone })}>
      {dot && <span className={dotCss} />}
      {children}
    </span>
  );
}
