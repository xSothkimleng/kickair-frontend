"use client";

import * as React from "react";
import {
  Box,
  Stack,
  Typography,
  Button,
  Chip,
  Collapse,
  TextField,
  InputAdornment,
  Checkbox,
  FormControlLabel,
  Radio,
  RadioGroup,
  Slider,
  Divider,
  Badge,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

export type FilterCategory = { id: string; label: string; count?: number };

export type Filters = {
  query: string;
  categories: string[];
  budget: [number, number];
  delivery: "any" | "3" | "7" | "14" | "30";
  rating: "any" | "4.5" | "4.0";
};

interface FiltersSidebarProps {
  filters: Filters;
  onChange: (next: Filters) => void;
  categories: FilterCategory[];
  budgetMax?: number;
}

function FilterSection({
  title,
  meta,
  defaultOpen = true,
  children,
}: {
  title: string;
  meta?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <Box sx={{ py: 0.5 }}>
      <Box
        role="button"
        onClick={() => setOpen(v => !v)}
        sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", py: 0.75, userSelect: "none" }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: "text.primary", letterSpacing: "-0.005em" }}>{title}</Typography>
          {meta && <Typography sx={{ fontSize: 12, color: "text.disabled" }}>{meta}</Typography>}
        </Stack>
        <KeyboardArrowDownIcon
          sx={{ fontSize: 18, color: "text.disabled", transform: open ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform 0.2s ease" }}
        />
      </Box>
      <Collapse in={open} unmountOnExit={false}>
        <Box sx={{ pt: 1 }}>{children}</Box>
      </Collapse>
    </Box>
  );
}

const inputSx = {
  "& .MuiOutlinedInput-root": {
    height: 36,
    fontSize: 13,
    borderRadius: "8px",
    backgroundColor: "#FFFFFF",
    "& fieldset": { borderColor: "#E2E8F0" },
    "&:hover fieldset": { borderColor: "#CBD5E1" },
    "&.Mui-focused fieldset": { borderColor: "#0F172A", borderWidth: "1px" },
    "&.Mui-focused": { boxShadow: "0 0 0 3px rgba(15, 23, 42, 0.06)" },
  },
  "& .MuiOutlinedInput-input": {
    p: "0 12px",
    color: "#0F172A",
    "&::placeholder": { color: "#94A3B8", opacity: 1 },
  },
};

const chipSx = {
  height: 26,
  borderRadius: "999px",
  backgroundColor: "#F1F5F9",
  color: "#0F172A",
  fontSize: 12,
  fontWeight: 500,
  "& .MuiChip-label": { px: 1.25 },
  "& .MuiChip-deleteIcon": { fontSize: 14, color: "#94A3B8", mr: 0.5, "&:hover": { color: "#0F172A" } },
};

function BudgetField({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <Box sx={{ flex: 1 }}>
      <Typography sx={{ fontSize: 11, color: "text.secondary", fontWeight: 500, mb: 0.5, textTransform: "uppercase", letterSpacing: "0.04em" }}>
        {label}
      </Typography>
      <TextField
        value={value.toLocaleString()}
        onChange={e => {
          const n = Number(e.target.value.replace(/[^0-9]/g, ""));
          onChange(Number.isFinite(n) ? n : 0);
        }}
        size="small"
        fullWidth
        sx={{ ...inputSx, "& .MuiOutlinedInput-root": { ...inputSx["& .MuiOutlinedInput-root"], height: 34 } }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Typography sx={{ fontSize: 13, color: "text.disabled" }}>$</Typography>
              </InputAdornment>
            ),
          },
        }}
      />
    </Box>
  );
}

export default function FiltersSidebar({ filters, onChange, categories, budgetMax = 10000 }: FiltersSidebarProps) {
  const [catQuery, setCatQuery] = React.useState("");

  const set = <K extends keyof Filters>(key: K, value: Filters[K]) => onChange({ ...filters, [key]: value });

  const toggleCategory = (id: string) => {
    const next = filters.categories.includes(id) ? filters.categories.filter(c => c !== id) : [...filters.categories, id];
    set("categories", next);
  };

  const reset = () =>
    onChange({ query: filters.query, categories: [], budget: [0, budgetMax], delivery: "any", rating: "any" });

  const activeCount =
    filters.categories.length +
    (filters.budget[0] !== 0 || filters.budget[1] !== budgetMax ? 1 : 0) +
    (filters.delivery !== "any" ? 1 : 0) +
    (filters.rating !== "any" ? 1 : 0);

  const filteredCats = categories.filter(c => c.label.toLowerCase().includes(catQuery.toLowerCase()));
  const fmt = (n: number) => (n >= 1000 ? `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k` : `$${n}`);

  return (
    <Box
      component="aside"
      sx={{
        position: { md: "sticky" },
        top: { md: 96 },
        backgroundColor: "#FFFFFF",
        border: "1px solid",
        borderColor: "#E2E8F0",
        borderRadius: "14px",
        boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
        overflow: "hidden",
      }}>
      <Box
        sx={{ p: "20px 20px 24px" }}>
        {/* Header */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography sx={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em" }}>Filters</Typography>
            {activeCount > 0 && (
              <Badge
                badgeContent={activeCount}
                sx={{
                  "& .MuiBadge-badge": {
                    position: "static",
                    transform: "none",
                    backgroundColor: "#0F172A",
                    color: "#FFF",
                    fontSize: 11,
                    fontWeight: 600,
                    height: 18,
                    minWidth: 18,
                    borderRadius: "999px",
                    px: 0.75,
                  },
                }}
              />
            )}
          </Stack>
          {activeCount > 0 && (
            <Button
              onClick={reset}
              variant="text"
              size="small"
              sx={{
                textTransform: "none",
                fontSize: 13,
                fontWeight: 500,
                color: "text.secondary",
                minWidth: 0,
                p: "2px 4px",
                "&:hover": { color: "text.primary", backgroundColor: "transparent" },
              }}>
              Reset
            </Button>
          )}
        </Stack>

        {/* Active filter chips */}
        {activeCount > 0 && (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mb: 2.5 }}>
            {filters.categories.map(id => {
              const cat = categories.find(c => c.id === id);
              if (!cat) return null;
              return <Chip key={id} label={cat.label} onDelete={() => toggleCategory(id)} deleteIcon={<CloseIcon />} sx={chipSx} />;
            })}
            {(filters.budget[0] !== 0 || filters.budget[1] !== budgetMax) && (
              <Chip
                label={`${fmt(filters.budget[0])} – ${fmt(filters.budget[1])}`}
                onDelete={() => set("budget", [0, budgetMax])}
                deleteIcon={<CloseIcon />}
                sx={chipSx}
              />
            )}
            {filters.delivery !== "any" && (
              <Chip label={`≤ ${filters.delivery} days`} onDelete={() => set("delivery", "any")} deleteIcon={<CloseIcon />} sx={chipSx} />
            )}
            {filters.rating !== "any" && (
              <Chip label={`${filters.rating}★ & up`} onDelete={() => set("rating", "any")} deleteIcon={<CloseIcon />} sx={chipSx} />
            )}
          </Box>
        )}

        {/* Category */}
        <FilterSection title="Category" meta={filters.categories.length > 0 ? `${filters.categories.length} selected` : undefined}>
          <TextField
            placeholder="Search categories"
            value={catQuery}
            onChange={e => setCatQuery(e.target.value)}
            fullWidth
            size="small"
            sx={{ ...inputSx, mb: 1 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 16, color: "text.disabled" }} />
                  </InputAdornment>
                ),
              },
            }}
          />
          <Box sx={{ maxHeight: 240, overflowY: "auto", mx: -1, px: 1, "&::-webkit-scrollbar": { width: 6 }, "&::-webkit-scrollbar-thumb": { backgroundColor: "#E2E8F0", borderRadius: 4 } }}>
            {filteredCats.map(cat => {
              const checked = filters.categories.includes(cat.id);
              return (
                <FormControlLabel
                  key={cat.id}
                  onClick={e => { e.preventDefault(); toggleCategory(cat.id); }}
                  control={
                    <Checkbox
                      checked={checked}
                      disableRipple
                      sx={{ p: 0, mr: 1.25, color: "#CBD5E1", "&.Mui-checked": { color: "#0F172A" }, "& .MuiSvgIcon-root": { fontSize: 18 } }}
                    />
                  }
                  label={
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ flex: 1, width: "100%" }}>
                      <Typography sx={{ fontSize: 13, color: checked ? "text.primary" : "text.secondary", fontWeight: checked ? 500 : 400 }}>
                        {cat.label}
                      </Typography>
                      {cat.count != null && (
                        <Typography sx={{ fontSize: 12, color: "text.disabled", fontVariantNumeric: "tabular-nums" }}>{cat.count}</Typography>
                      )}
                    </Stack>
                  }
                  sx={{
                    display: "flex",
                    m: 0,
                    py: 0.875,
                    px: 1,
                    borderRadius: "6px",
                    cursor: "pointer",
                    "&:hover": { backgroundColor: "#F1F5F9" },
                    "& .MuiFormControlLabel-label": { flex: 1, width: "100%" },
                  }}
                />
              );
            })}
          </Box>
        </FilterSection>

        <Divider sx={{ my: 1.5, borderColor: "#F1F5F9" }} />

        {/* Budget */}
        <FilterSection title="Budget" meta={`${fmt(filters.budget[0])} – ${fmt(filters.budget[1])}`}>
          <Box sx={{ px: 0.75 }}>
            <Slider
              value={filters.budget}
              onChange={(_, v) => set("budget", v as [number, number])}
              min={0}
              max={budgetMax}
              step={50}
              valueLabelDisplay="auto"
              valueLabelFormat={fmt}
              sx={{
                color: "#0F172A",
                height: 4,
                mt: 1,
                mb: 2.5,
                "& .MuiSlider-rail": { backgroundColor: "#E2E8F0", opacity: 1 },
                "& .MuiSlider-thumb": {
                  width: 16, height: 16, backgroundColor: "#FFF", border: "2px solid #0F172A",
                  "&:hover, &.Mui-focusVisible, &.Mui-active": { boxShadow: "0 0 0 6px rgba(15, 23, 42, 0.08)" },
                },
                "& .MuiSlider-valueLabel": { fontSize: 11, backgroundColor: "#0F172A", borderRadius: "6px", px: 1, py: 0.25 },
              }}
            />
            <Stack direction="row" alignItems="end" spacing={1}>
              <BudgetField label="Min" value={filters.budget[0]} onChange={v => set("budget", [v, filters.budget[1]])} />
              <Box sx={{ pb: 1, color: "#CBD5E1" }}>–</Box>
              <BudgetField label="Max" value={filters.budget[1]} onChange={v => set("budget", [filters.budget[0], v])} />
            </Stack>
          </Box>
        </FilterSection>

        <Divider sx={{ my: 1.5, borderColor: "#F1F5F9" }} />

        {/* Delivery */}
        <FilterSection title="Delivery time" meta={filters.delivery === "any" ? undefined : `≤ ${filters.delivery} days`}>
          <RadioGroup value={filters.delivery} onChange={e => set("delivery", e.target.value as Filters["delivery"])} sx={{ gap: 0.25 }}>
            {(["any", "3", "7", "14", "30"] as const).map((v, i) => {
              const label = v === "any" ? "Any time" : `Up to ${v} days`;
              return (
                <FormControlLabel
                  key={v}
                  value={v}
                  control={<Radio disableRipple sx={{ p: 0, mr: 1.25, color: "#CBD5E1", "&.Mui-checked": { color: "#0F172A" }, "& .MuiSvgIcon-root": { fontSize: 18 } }} />}
                  label={<Typography sx={{ fontSize: 13, color: filters.delivery === v ? "text.primary" : "text.secondary", fontWeight: filters.delivery === v ? 500 : 400 }}>{label}</Typography>}
                  sx={{ m: 0, mx: -1, py: 0.875, px: 1, borderRadius: "6px", "&:hover": { backgroundColor: "#F1F5F9" } }}
                />
              );
            })}
          </RadioGroup>
        </FilterSection>

        <Divider sx={{ my: 1.5, borderColor: "#F1F5F9" }} />

        {/* Rating */}
        <FilterSection title="Seller rating" defaultOpen={false} meta={filters.rating === "any" ? undefined : `${filters.rating}★ & up`}>
          <RadioGroup value={filters.rating} onChange={e => set("rating", e.target.value as Filters["rating"])} sx={{ gap: 0.25 }}>
            {([{ v: "any", label: "Any rating" }, { v: "4.5", label: "4.5 & up" }, { v: "4.0", label: "4.0 & up" }] as const).map(opt => (
              <FormControlLabel
                key={opt.v}
                value={opt.v}
                control={<Radio disableRipple sx={{ p: 0, mr: 1.25, color: "#CBD5E1", "&.Mui-checked": { color: "#0F172A" }, "& .MuiSvgIcon-root": { fontSize: 18 } }} />}
                label={<Typography sx={{ fontSize: 13, color: filters.rating === opt.v ? "text.primary" : "text.secondary", fontWeight: filters.rating === opt.v ? 500 : 400 }}>{opt.label}</Typography>}
                sx={{ m: 0, mx: -1, py: 0.875, px: 1, borderRadius: "6px", "&:hover": { backgroundColor: "#F1F5F9" } }}
              />
            ))}
          </RadioGroup>
        </FilterSection>
      </Box>
    </Box>
  );
}
