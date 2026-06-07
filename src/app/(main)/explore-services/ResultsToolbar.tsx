"use client";

import * as React from "react";
import { Box, Stack, Typography, ToggleButtonGroup, ToggleButton } from "@mui/material";
import GridViewIcon from "@mui/icons-material/GridView";
import ViewListIcon from "@mui/icons-material/ViewList";
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

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        minWidth: 20, height: 20, px: 0.75, borderRadius: "4px",
        backgroundColor: "#F1F5F9", border: "1px solid #E2E8F0",
        color: "text.secondary", fontSize: 11, fontWeight: 500, lineHeight: 1,
      }}>
      {children}
    </Box>
  );
}

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
    <Box>
      <Stack direction="row" spacing={1.5} sx={{ mb: 2 }}>
        <SearchInput
          id="results-toolbar-search"
          value={query}
          onChange={onQueryChange}
          placeholder="Search services, skills, or sellers…"
        />
        <Box sx={{ minWidth: 180 }}>
          <SelectInput
            value={sort}
            onChange={v => onSortChange(v as SortValue)}
            options={SORT_OPTIONS}
          />
        </Box>
      </Stack>

      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
          Showing{" "}
          <Box component="span" sx={{ color: "text.primary", fontWeight: 600 }}>{totalShown}</Box>
          {" "}of {totalAll.toLocaleString()} services
        </Typography>
        <ToggleButtonGroup
          value={view}
          exclusive
          onChange={(_, v) => v && onViewChange(v)}
          sx={{
            backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "8px",
            "& .MuiToggleButton-root": {
              border: "none", width: 32, height: 32, p: 0, color: "#94A3B8",
              "&.Mui-selected": { backgroundColor: "#F1F5F9", color: "#0F172A", "&:hover": { backgroundColor: "#F1F5F9" } },
            },
          }}>
          <ToggleButton value="grid"><GridViewIcon sx={{ fontSize: 16 }} /></ToggleButton>
          <ToggleButton value="list"><ViewListIcon sx={{ fontSize: 16 }} /></ToggleButton>
        </ToggleButtonGroup>
      </Stack>
    </Box>
  );
}
