"use client";

import * as React from "react";
import { LayoutGrid, List } from "lucide-react";
import { css } from "styled-system/css";
import { SearchInput, SelectInput } from "@/components/ui/inputs";

export type SortValue = "relevant" | "price_asc" | "price_desc" | "rating" | "newest";

const SORT_OPTIONS: { value: SortValue; label: string }[] = [
  { value: "relevant", label: "Most Relevant" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
  { value: "newest", label: "Newest" },
];

interface ResultsToolbarProps {
  query: string;
  onQueryChange: (q: string) => void;
  sort: SortValue;
  onSortChange: (s: SortValue) => void;
  view: "grid" | "list";
  onViewChange: (v: "grid" | "list") => void;
  totalShown: number;
  totalAll: number;
}

const kbdCss = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  boxSizing: "border-box",
  minW: "20px",
  h: "20px",
  px: "6px",
  borderRadius: "4px",
  bg: "fill",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "border",
  color: "ink2",
  fontSize: "11px",
  fontWeight: 500,
  lineHeight: 1,
});

function Kbd({ children }: { children: React.ReactNode }) {
  return <span className={kbdCss}>{children}</span>;
}

const searchRowCss = css({ display: "flex", gap: "12px", mb: "16px" });
const sortWrapCss = css({ minW: "180px" });
const metaRowCss = css({ display: "flex", alignItems: "center", justifyContent: "space-between", mb: "16px" });
const metaTextCss = css({ fontSize: "13px", lineHeight: 1.5, color: "ink2" });
const metaStrongCss = css({ color: "rgba(0,0,0,0.87)", fontWeight: 600 });
const toggleGroupCss = css({
  display: "inline-flex",
  bg: "field",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "border",
  borderRadius: "8px",
  overflow: "hidden",
});
const toggleBtnCss = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  boxSizing: "border-box",
  w: "32px",
  h: "32px",
  p: 0,
  m: 0,
  border: "none",
  bg: "transparent",
  color: "placeholder",
  fontFamily: "inherit",
  cursor: "pointer",
  transition: "background-color .15s, color .15s",
  _hover: { bg: "rgba(0, 0, 0, 0.04)" },
  "& svg": { display: "block" },
  "&[data-selected]": { bg: "fill", color: "heading", _hover: { bg: "fill" } },
});

export default function ResultsToolbar({ query, onQueryChange, sort, onSortChange, view, onViewChange, totalShown, totalAll }: ResultsToolbarProps) {
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        document.getElementById("results-toolbar-search")?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div>
      <div className={searchRowCss}>
        <SearchInput
          id="results-toolbar-search"
          value={query}
          onChange={onQueryChange}
          placeholder="Search services, skills, or freelancers…"
        />
        <div className={sortWrapCss}>
          <SelectInput
            value={sort}
            onChange={v => onSortChange(v as SortValue)}
            options={SORT_OPTIONS}
          />
        </div>
      </div>

      <div className={metaRowCss}>
        <p className={metaTextCss}>
          Showing <span className={metaStrongCss}>{totalShown}</span> of {totalAll.toLocaleString()} services
        </p>
        <div className={toggleGroupCss}>
          <button
            type="button"
            aria-label="Grid view"
            aria-pressed={view === "grid"}
            data-selected={view === "grid" ? "" : undefined}
            onClick={() => onViewChange("grid")}
            className={toggleBtnCss}>
            <LayoutGrid size={16} />
          </button>
          <button
            type="button"
            aria-label="List view"
            aria-pressed={view === "list"}
            data-selected={view === "list" ? "" : undefined}
            onClick={() => onViewChange("list")}
            className={toggleBtnCss}>
            <List size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
