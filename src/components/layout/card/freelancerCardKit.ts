// Shared Panda styles for FreelancerCard (grid) and FreelancerListCard (list).
import { css } from "styled-system/css";

/** Card shell: white, slate border, lifts on hover and fills the "View profile" button. */
export const shell = css({
  display: "flex",
  bg: "field",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "border",
  borderRadius: "10px",
  cursor: "pointer",
  transition: "border-color 0.15s, box-shadow 0.15s",
  _hover: {
    borderColor: "borderStrong",
    boxShadow: "0 1px 3px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)",
    "& .view-btn": { bg: "heading", color: "white", borderColor: "heading" },
    "& .view-btn svg": { transform: "translateX(2px)" },
  },
});

export const avatarImg = css({ w: "52px", h: "52px", borderRadius: "pill", objectFit: "cover", display: "block", flexShrink: 0 });
export const avatarFallback = css({
  w: "52px", h: "52px", borderRadius: "pill", flexShrink: 0,
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  background: "linear-gradient(135deg, #1E293B, #0F172A)",
  color: "white", textStyle: "lead", fontWeight: 600,
});

export const name = css({ textStyle: "body", fontWeight: 600, color: "ink" });
export const muted = css({ textStyle: "meta", color: "ink3" });
export const secondary = css({ textStyle: "meta", color: "ink2" });
export const row = css({ display: "flex", alignItems: "center" });
export const dot = css({ w: "3px", h: "3px", borderRadius: "pill", bg: "borderStrong", flexShrink: 0 });
export const starRow = css({ display: "flex", alignItems: "center", gap: "4px", "& svg": { color: "#F59E0B", display: "block" } });
export const ratingValue = css({ textStyle: "meta", fontWeight: 600, color: "ink" });
export const newPill = css({ display: "inline-flex", alignItems: "center", h: "18px", px: "7px", bg: "fill", color: "ink2", borderRadius: "pill", textStyle: "micro", fontWeight: 600 });
export const skill = css({ display: "inline-flex", alignItems: "center", px: "10px", bg: "fill", color: "body", borderRadius: "6px", fontWeight: 500, whiteSpace: "nowrap" });

export const viewBtn = css({
  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px",
  h: "38px", px: "16px", borderRadius: "8px",
  borderWidth: "1px", borderStyle: "solid", borderColor: "border",
  bg: "field", color: "heading",
  textStyle: "ui", fontWeight: 600, whiteSpace: "nowrap",
  cursor: "pointer",
  transition: "background-color 0.12s, border-color 0.12s, color 0.12s",
  "& svg": { transition: "transform 0.15s", display: "block" },
});

export function initials(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}
