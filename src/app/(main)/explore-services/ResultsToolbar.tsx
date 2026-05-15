"use client";

import * as React from "react";
import { Box, Stack, TextField, InputAdornment, Typography, Select, MenuItem, ToggleButtonGroup, ToggleButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import GridViewIcon from "@mui/icons-material/GridView";
import ViewListIcon from "@mui/icons-material/ViewList";
import CloseIcon from "@mui/icons-material/Close";

export type SortValue = "relevant" | "price_asc" | "price_desc" | "rating" | "newest";

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
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <Box>
      <Stack direction="row" spacing={1.5} sx={{ mb: 2 }}>
        <TextField
          inputRef={inputRef}
          fullWidth
          value={query}
          onChange={e => onQueryChange(e.target.value)}
          placeholder="Search services, skills, or sellers…"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18, color: "text.disabled" }} />
                </InputAdornment>
              ),
              endAdornment: query ? (
                <InputAdornment position="end">
                  <CloseIcon
                    sx={{ fontSize: 16, color: "text.disabled", cursor: "pointer", "&:hover": { color: "text.primary" } }}
                    onClick={() => onQueryChange("")}
                  />
                </InputAdornment>
              ) : undefined,
            },
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              height: 44, fontSize: 14, borderRadius: "10px",
              backgroundColor: "#FFFFFF", boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
              "& fieldset": { borderColor: "#E2E8F0" },
              "&:hover fieldset": { borderColor: "#CBD5E1" },
              "&.Mui-focused fieldset": { borderColor: "#0F172A", borderWidth: "1px" },
              "&.Mui-focused": { boxShadow: "0 0 0 3px rgba(15, 23, 42, 0.06)" },
            },
            "& .MuiOutlinedInput-input": { color: "#0F172A", "&::placeholder": { color: "#94A3B8", opacity: 1 } },
          }}
        />
        <Select
          value={sort}
          onChange={e => onSortChange(e.target.value as SortValue)}
          sx={{
            height: 44, minWidth: 180, borderRadius: "10px",
            backgroundColor: "#FFFFFF", fontSize: 13, fontWeight: 500, color: "#0F172A",
            boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
            "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E2E8F0" },
            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#CBD5E1" },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#0F172A", borderWidth: "1px" },
          }}>
          <MenuItem value="relevant">Most Relevant</MenuItem>
          <MenuItem value="price_asc">Price: Low to High</MenuItem>
          <MenuItem value="price_desc">Price: High to Low</MenuItem>
          <MenuItem value="rating">Highest Rated</MenuItem>
          <MenuItem value="newest">Newest</MenuItem>
        </Select>
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
