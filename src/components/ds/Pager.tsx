"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { css, cva, cx } from "styled-system/css";

const nav = css({ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", flexWrap: "wrap" });
const pageBtn = cva({
  base: {
    display: "inline-flex", alignItems: "center", justifyContent: "center", minW: "34px", h: "34px", px: "6px",
    border: "none", borderRadius: "8px", bg: "transparent", color: "body", fontFamily: "inherit", fontSize: "14px", fontWeight: 500,
    cursor: "pointer", transition: "background-color .12s, color .12s",
    _hover: { bg: "fill", color: "heading" },
    _focusVisible: { outline: "none", boxShadow: "focusRing" },
    _disabled: { opacity: 0.4, cursor: "not-allowed", pointerEvents: "none" },
    "& svg": { display: "block" },
  },
  variants: { active: { true: { bg: "accent", color: "white", _hover: { bg: "accentHover", color: "white" } } } },
});
const ellipsis = css({ minW: "24px", textAlign: "center", color: "muted", fontSize: "14px" });

function range(count: number, page: number, siblings: number): (number | "…")[] {
  const pages = new Set<number>([1, count, page]);
  for (let i = 1; i <= siblings; i++) { pages.add(page - i); pages.add(page + i); }
  const sorted = [...pages].filter((p) => p >= 1 && p <= count).sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  sorted.forEach((p, i) => { if (i > 0 && p - sorted[i - 1]! > 1) out.push("…"); out.push(p); });
  return out;
}

/** Replaces MUI <Pagination>. 1-based `page`. */
export function Pager({ count, page, onChange, siblings = 1, className }: { count: number; page: number; onChange: (page: number) => void; siblings?: number; className?: string }) {
  if (count <= 1) return null;
  return (
    <nav aria-label="Pagination" className={cx(nav, className)}>
      <button type="button" className={pageBtn()} disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Previous page"><ChevronLeft size={16} /></button>
      {range(count, page, siblings).map((p, i) =>
        p === "…" ? <span key={`e${i}`} className={ellipsis}>…</span> : (
          <button key={p} type="button" className={pageBtn({ active: p === page })} aria-current={p === page ? "page" : undefined} onClick={() => onChange(p)}>{p}</button>
        ),
      )}
      <button type="button" className={pageBtn()} disabled={page >= count} onClick={() => onChange(page + 1)} aria-label="Next page"><ChevronRight size={16} /></button>
    </nav>
  );
}
