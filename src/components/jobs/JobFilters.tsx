"use client";

import {
  Box,
  Typography,
  Button,
  Stack,
  Divider,
} from "@mui/material";
import { ServiceCategory } from "@/types/service";
import { Expertise } from "@/types/user";
import { JobPostFilters } from "@/types/job";
import { SelectInput, NumberInput, MultiSelectInput } from "@/components/ui/inputs";

interface JobFiltersProps {
  categories: ServiceCategory[];
  expertises: Expertise[];
  filters: JobPostFilters;
  onChange: (filters: JobPostFilters) => void;
}

export default function JobFilters({ categories, expertises, filters, onChange }: JobFiltersProps) {
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
        <SelectInput
          label="Category"
          size="sm"
          value={filters.category_id ?? ""}
          onChange={v => update({ category_id: v ? Number(v) : undefined })}
          options={categories.map(c => ({ value: c.id, label: c.name ?? "" }))}
          placeholder="All categories"
        />

        <Divider />

        {/* Budget Range */}
        <Box>
          <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 1.5, color: "rgba(0,0,0,0.7)" }}>
            Budget (USD)
          </Typography>
          <Stack spacing={1.5}>
            <NumberInput
              label="Min"
              size="sm"
              value={filters.budget_min ?? null}
              onChange={v => update({ budget_min: v ?? undefined })}
              placeholder="0"
            />
            <NumberInput
              label="Max"
              size="sm"
              value={filters.budget_max ?? null}
              onChange={v => update({ budget_max: v ?? undefined })}
              placeholder="10,000"
            />
          </Stack>
        </Box>

        <Divider />

        {/* Skills */}
        <Box>
          <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 1.5, color: "rgba(0,0,0,0.7)" }}>
            Required Skills
          </Typography>
          <MultiSelectInput
            size="sm"
            value={filters.skill_ids ?? []}
            onChange={ids => update({ skill_ids: ids.length ? ids.map(Number) : undefined })}
            options={expertises.map(e => ({ value: e.id, label: e.expertise_name }))}
            placeholder="Any skill"
          />
        </Box>
      </Stack>
    </Box>
  );
}
