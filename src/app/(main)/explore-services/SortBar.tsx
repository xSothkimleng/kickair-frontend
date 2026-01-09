// components/services/SortBar.tsx
"use client";

import { Box, Typography, Select, MenuItem, SelectChangeEvent } from "@mui/material";
import { KeyboardArrowDown } from "@mui/icons-material";

interface SortBarProps {
  filteredCount: number;
  sortBy: string;
  setSortBy: (sort: string) => void;
}

export default function SortBar({ filteredCount, sortBy, setSortBy }: SortBarProps) {
  const handleChange = (event: SelectChangeEvent) => {
    setSortBy(event.target.value);
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        pb: 2,
        mb: 3,
        borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
      }}>
      <Typography sx={{ fontSize: 13, color: "rgba(0, 0, 0, 0.6)" }}>
        Showing {filteredCount} service{filteredCount !== 1 ? "s" : ""}
      </Typography>

      <Select
        value={sortBy}
        onChange={handleChange}
        IconComponent={KeyboardArrowDown}
        sx={{
          fontSize: 13,
          bgcolor: "white",
          border: "1px solid rgba(0, 0, 0, 0.1)",
          borderRadius: 1,
          height: 36,
          "& .MuiOutlinedInput-notchedOutline": { border: "none" },
          "&:hover": {
            border: "1px solid rgba(0, 0, 0, 0.2)",
          },
          "&.Mui-focused": {
            border: "1px solid #0071e3",
          },
        }}>
        <MenuItem value='relevant' sx={{ fontSize: 13 }}>
          Most Relevant
        </MenuItem>
        <MenuItem value='popular' sx={{ fontSize: 13 }}>
          Most Popular
        </MenuItem>
        <MenuItem value='rating' sx={{ fontSize: 13 }}>
          Highest Rated
        </MenuItem>
        <MenuItem value='price-low' sx={{ fontSize: 13 }}>
          Price: Low to High
        </MenuItem>
        <MenuItem value='price-high' sx={{ fontSize: 13 }}>
          Price: High to Low
        </MenuItem>
      </Select>
    </Box>
  );
}
