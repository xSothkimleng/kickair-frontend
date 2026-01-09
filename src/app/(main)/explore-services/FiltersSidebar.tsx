// components/services/FiltersSidebar.tsx
"use client";

import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Checkbox,
  FormControlLabel,
  Slider,
  TextField,
  Radio,
  RadioGroup,
  InputAdornment,
} from "@mui/material";
import { Search } from "@mui/icons-material";

interface FiltersSidebarProps {
  selectedCategories: string[];
  toggleCategory: (categoryId: string) => void;
  budgetRange: number[];
  setBudgetRange: (range: number[]) => void;
  maxPrice: number;
  deliveryTime: string;
  setDeliveryTime: (time: string) => void;
  activeFiltersCount: number;
  clearAllFilters: () => void;
  serviceCategories: any[];
}

export default function FiltersSidebar({
  selectedCategories,
  toggleCategory,
  budgetRange,
  setBudgetRange,
  maxPrice,
  deliveryTime,
  setDeliveryTime,
  activeFiltersCount,
  clearAllFilters,
  serviceCategories,
}: FiltersSidebarProps) {
  const [categorySearch, setCategorySearch] = useState("");

  const deliveryOptions = [
    { value: "any", label: "Any time" },
    { value: "3", label: "Up to 3 days" },
    { value: "7", label: "Up to 7 days" },
    { value: "14", label: "Up to 14 days" },
    { value: "30", label: "Up to 30 days" },
  ];

  return (
    <Box
      sx={{
        bgcolor: "white",
        border: "1px solid rgba(0, 0, 0, 0.08)",
        borderRadius: 2,
        position: { lg: "sticky" },
        top: { lg: 96 },
        maxHeight: { lg: "calc(100vh - 7rem)" },
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: 3,
          pb: 2,
        }}>
        <Typography sx={{ fontSize: 17, fontWeight: 600 }}>Filters</Typography>
        {activeFiltersCount > 0 && (
          <Button
            onClick={clearAllFilters}
            sx={{
              fontSize: 12,
              color: "#0071e3",
              textTransform: "none",
              minWidth: "auto",
              p: 0,
              "&:hover": {
                bgcolor: "transparent",
                textDecoration: "underline",
              },
            }}>
            Clear all
          </Button>
        )}
      </Box>

      {/* Scrollable Content */}
      <Box sx={{ overflow: "auto", px: 3, pb: 3 }}>
        {/* Category Filter */}
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 1.5 }}>Category</Typography>

          <TextField
            fullWidth
            placeholder='Search categories...'
            value={categorySearch}
            onChange={e => setCategorySearch(e.target.value)}
            size='small'
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <Search sx={{ fontSize: 14, color: "rgba(0, 0, 0, 0.4)" }} />
                </InputAdornment>
              ),
              sx: {
                fontSize: 12,
                bgcolor: "rgba(0, 0, 0, 0.05)",
                "& fieldset": { border: "none" },
                "&:hover": { bgcolor: "white" },
                "&.Mui-focused": {
                  bgcolor: "white",
                  "& fieldset": { borderColor: "#0071e3" },
                },
              },
            }}
            sx={{ mb: 1 }}
          />

          <Box sx={{ maxHeight: 192, overflow: "auto" }}>
            {serviceCategories
              .filter(category => category.name.toLowerCase().includes(categorySearch.toLowerCase()))
              .map(category => (
                <FormControlLabel
                  key={category.id}
                  control={
                    <Checkbox
                      checked={selectedCategories.includes(category.id)}
                      onChange={() => toggleCategory(category.id)}
                      size='small'
                      sx={{
                        "&.Mui-checked": { color: "#0071e3" },
                      }}
                    />
                  }
                  label={<Typography sx={{ fontSize: 13 }}>{category.name}</Typography>}
                  sx={{
                    display: "flex",
                    m: 0,
                    px: 1.5,
                    py: 1,
                    borderRadius: 1,
                    "&:hover": { bgcolor: "rgba(0, 0, 0, 0.04)" },
                  }}
                />
              ))}
          </Box>
        </Box>

        {/* Budget Filter */}
        <Box sx={{ pt: 3, borderTop: "1px solid rgba(0, 0, 0, 0.08)", mb: 3 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 2 }}>Budget Range</Typography>

          <Slider
            value={budgetRange}
            onChange={(_, newValue) => setBudgetRange(newValue as number[])}
            min={0}
            max={maxPrice}
            step={10}
            valueLabelDisplay='auto'
            valueLabelFormat={value => `$${value}`}
            sx={{
              color: "#0071e3",
              "& .MuiSlider-thumb": {
                width: 16,
                height: 16,
              },
            }}
          />

          <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", mt: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)", mb: 0.5 }}>Min</Typography>
              <TextField
                type='number'
                value={budgetRange[0]}
                onChange={e => {
                  const value = Math.max(0, Math.min(parseInt(e.target.value) || 0, budgetRange[1]));
                  setBudgetRange([value, budgetRange[1]]);
                }}
                size='small'
                InputProps={{
                  startAdornment: <InputAdornment position='start'>$</InputAdornment>,
                  sx: { fontSize: 12 },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "rgba(0, 0, 0, 0.05)",
                    "& fieldset": { border: "none" },
                    "&:hover": { bgcolor: "white" },
                    "&.Mui-focused": {
                      bgcolor: "white",
                      "& fieldset": { borderColor: "#0071e3" },
                    },
                  },
                }}
              />
            </Box>

            <Typography sx={{ color: "rgba(0, 0, 0, 0.6)", mt: 2.5 }}>-</Typography>

            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)", mb: 0.5 }}>Max</Typography>
              <TextField
                type='number'
                value={budgetRange[1]}
                onChange={e => {
                  const value = Math.max(budgetRange[0], parseInt(e.target.value) || 0);
                  setBudgetRange([budgetRange[0], value]);
                }}
                size='small'
                InputProps={{
                  startAdornment: <InputAdornment position='start'>$</InputAdornment>,
                  sx: { fontSize: 12 },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "rgba(0, 0, 0, 0.05)",
                    "& fieldset": { border: "none" },
                    "&:hover": { bgcolor: "white" },
                    "&.Mui-focused": {
                      bgcolor: "white",
                      "& fieldset": { borderColor: "#0071e3" },
                    },
                  },
                }}
              />
            </Box>
          </Box>
        </Box>

        {/* Delivery Time Filter */}
        <Box sx={{ pt: 3, borderTop: "1px solid rgba(0, 0, 0, 0.08)" }}>
          <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 1.5 }}>Delivery Time</Typography>

          <RadioGroup value={deliveryTime} onChange={e => setDeliveryTime(e.target.value)}>
            {deliveryOptions.map(option => (
              <FormControlLabel
                key={option.value}
                value={option.value}
                control={<Radio size='small' sx={{ "&.Mui-checked": { color: "#0071e3" } }} />}
                label={<Typography sx={{ fontSize: 13 }}>{option.label}</Typography>}
                sx={{
                  m: 0,
                  px: 1.5,
                  py: 1,
                  borderRadius: 1,
                  "&:hover": { bgcolor: "rgba(0, 0, 0, 0.04)" },
                }}
              />
            ))}
          </RadioGroup>
        </Box>
      </Box>
    </Box>
  );
}
