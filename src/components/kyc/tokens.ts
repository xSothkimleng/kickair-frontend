"use client";

import { useEffect, useMemo } from "react";

// Shared design tokens for the KYC flow — matches the KickAir auth / input system.
export const C = {
  accent: "#0071e3",
  accentH: "#0077ED",
  accentBg: "#EFF6FF",
  accentBd: "#BFDBFE",
  heading: "#0F172A",
  body: "#334155",
  muted: "#64748B",
  ph: "#94A3B8",
  border: "#E2E8F0",
  borderH: "#CBD5E1",
  page: "#F5F5F7",
  fill: "#F1F5F9",
  green: "#047857",
  amber: "#B45309",
  red: "#DC2626",
  greenBg: "#ECFDF5",
  amberBg: "#FFFBEB",
  redBg: "#FEF2F2",
  greenBd: "#A7F3D0",
  amberBd: "#FCD9A6",
  redBd: "#FBD2D2",
};

// Object URL for a File preview, revoked automatically on change / unmount.
export function useObjectUrl(file: File | null): string | null {
  const url = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);
  return url;
}
