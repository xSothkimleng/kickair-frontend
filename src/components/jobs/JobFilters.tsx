"use client";

import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Autocomplete,
  Chip,
  Button,
  Stack,
  Divider,
} from "@mui/material";
import { ServiceCategory } from "@/types/service";
import { Expertise } from "@/types/user";
import { JobPostFilters } from "@/types/job";

interface JobFiltersProps {
  categories: ServiceCategory[];
  expertises: Expertise[];
  filters: JobPostFilters;
  onChange: (filters: JobPostFilters) => void;
}

export default function JobFilters({ categories, expertises, filters, onChange }: JobFiltersProps) {
  const selectedSkills = expertises.filter(e => filters.skill_ids?.includes(e.id));

  const update = (patch: Partial<JobPostFilters>) => {
    onChange({ ...filters, ...patch, page: 1 });
  };

  const hasActiveFilters =
    !!filters.category_id || !!filters.budget_min || !!filters.budget_max || (filters.skill_ids?.length ?? 0) > 0;

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography sx={{ fontSize: 15, fontWeight: 600 }}>Filters</Typography>
        {hasActiveFilters && (
          <Button
            size="small"
            onClick={() => onChange({ page: 1 })}
            sx={{ fontSize: 11, textTransform: "none", color: "#0071e3", p: 0 }}>
            Clear all
          </Button>
        )}
      </Stack>

      <Stack spacing={2.5}>
        {/* Category */}
        <FormControl fullWidth size="small">
          <InputLabel sx={{ fontSize: 13 }}>Category</InputLabel>
          <Select
            value={filters.category_id ?? ""}
            onChange={e => update({ category_id: e.target.value ? Number(e.target.value) : undefined })}
            label="Category"
            sx={{ borderRadius: 2, fontSize: 13 }}>
            <MenuItem value=""><em>All categories</em></MenuItem>
            {categories.map(c => (
              <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Divider />

        {/* Budget Range */}
        <Box>
          <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 1.5, color: "rgba(0,0,0,0.7)" }}>
            Budget (USD)
          </Typography>
          <Stack spacing={1.5}>
            <TextField
              label="Min"
              type="number"
              size="small"
              value={filters.budget_min ?? ""}
              onChange={e => update({ budget_min: e.target.value ? Number(e.target.value) : undefined })}
              placeholder="0"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: 13 } }}
            />
            <TextField
              label="Max"
              type="number"
              size="small"
              value={filters.budget_max ?? ""}
              onChange={e => update({ budget_max: e.target.value ? Number(e.target.value) : undefined })}
              placeholder="10,000"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: 13 } }}
            />
          </Stack>
        </Box>

        <Divider />

        {/* Skills */}
        <Box>
          <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 1.5, color: "rgba(0,0,0,0.7)" }}>
            Required Skills
          </Typography>
          <Autocomplete
            multiple
            size="small"
            options={expertises}
            getOptionLabel={o => o.expertise_name}
            value={selectedSkills}
            onChange={(_, v) => update({ skill_ids: v.length ? v.map(s => s.id) : undefined })}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  label={option.expertise_name}
                  size="small"
                  {...getTagProps({ index })}
                  key={option.id}
                  sx={{ fontSize: 11, height: 22 }}
                />
              ))
            }
            renderInput={params => (
              <TextField
                {...params}
                placeholder={selectedSkills.length ? "" : "Any skill"}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: 13 } }}
              />
            )}
          />
        </Box>
      </Stack>
    </Box>
  );
}
