"use client";

import { useState, type CSSProperties } from "react";
import { css, cva, cx } from "styled-system/css";

const palette = ["#DCE4FB", "#E3F4E9", "#FCEBD6", "#EFE7FB", "#FBE3E1", "#E6F1F7"];
const ink = ["#2B4BC9", "#1E7A4E", "#A05A0A", "#5B3FC9", "#B2342F", "#1E6F93"];

export const avatar = cva({
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    borderRadius: "pill",
    fontWeight: 600,
    letterSpacing: "0.01em",
    overflow: "hidden",
    userSelect: "none",
  },
  variants: {
    size: {
      xs: { w: "24px", h: "24px", fontSize: "10px" },
      sm: { w: "32px", h: "32px", fontSize: "12px" },
      md: { w: "40px", h: "40px", fontSize: "14px" },
      lg: { w: "56px", h: "56px", fontSize: "18px" },
      xl: { w: "80px", h: "80px", fontSize: "26px" },
    },
    shape: { round: {}, square: { borderRadius: "cardSm" } },
  },
  defaultVariants: { size: "md", shape: "round" },
});

export interface AvatarProps {
  name?: string | null;
  src?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Exact pixel size — overrides `size`. */
  px?: number;
  shape?: "round" | "square";
  className?: string;
  style?: CSSProperties;
}

/** Replaces MUI <Avatar>. Photo with initials fallback (also when the image fails to load). */
export function Avatar({ name, src, size, px, shape, className, style }: AvatarProps) {
  const [failed, setFailed] = useState<string | null>(null);
  const label = (name ?? "").trim();
  const initials = label ? label.split(/\s+/).slice(0, 2).map((p) => p[0]!.toUpperCase()).join("") : "?";
  const seed = label.length % palette.length;
  const sizeStyle: CSSProperties | undefined = px ? { width: px, height: px, fontSize: Math.round(px * 0.36) } : undefined;
  if (src && failed !== src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- remote avatars from many hosts
      <img src={src} alt={label} className={cx(avatar({ size, shape }), css({ objectFit: "cover" }), className)} style={{ ...sizeStyle, ...style }} referrerPolicy="no-referrer" onError={() => setFailed(src)} />
    );
  }
  return (
    <span className={cx(avatar({ size, shape }), className)} style={{ background: palette[seed], color: ink[seed], ...sizeStyle, ...style }} aria-label={label || undefined} role={label ? "img" : undefined}>
      {initials}
    </span>
  );
}
