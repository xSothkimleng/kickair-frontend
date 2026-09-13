// components/services/SortBar.tsx
"use client";

import { css } from "styled-system/css";
import { SelectInput } from "@/components/ui/inputs";

interface SortBarProps {
  filteredCount: number;
  sortBy: string;
  setSortBy: (sort: string) => void;
}

const SORT_OPTIONS = [
  { value: "relevant", label: "Most Relevant" },
  { value: "popular", label: "Most Popular" },
  { value: "rating", label: "Highest Rated" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
];

const barCss = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  pb: "16px",
  mb: "24px",
  borderBottomWidth: "1px",
  borderBottomStyle: "solid",
  borderBottomColor: "hairline",
});
const countCss = css({ textStyle: "ui", color: "ink2" });
const selectCss = css({ minW: "180px" });

export default function SortBar({ filteredCount, sortBy, setSortBy }: SortBarProps) {
  return (
    <div className={barCss}>
      <p className={countCss}>
        Showing {filteredCount} service{filteredCount !== 1 ? "s" : ""}
      </p>

      <SelectInput
        value={sortBy}
        onChange={v => setSortBy(String(v))}
        options={SORT_OPTIONS}
        fullWidth={false}
        size="sm"
        className={selectCss}
      />
    </div>
  );
}
