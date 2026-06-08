"use client";

import { useState } from "react";
import { Box, Typography } from "@mui/material";
import { ChevronRight as ChevronRightIcon } from "@mui/icons-material";
import { ServiceCategory } from "@/types/service";
import { Expertise } from "@/types/user";
import { JobPostFilters } from "@/types/job";
import { tokens } from "@/theme";

interface JobFiltersProps {
  categories: ServiceCategory[]; // category tree (aisles with children)
  expertises: Expertise[];
  filters: JobPostFilters;
  onChange: (filters: JobPostFilters) => void;
}

function findAisleId(tree: ServiceCategory[], categoryId?: number): number | null {
  if (!categoryId) return null;
  for (const a of tree) {
    if (a.id === categoryId) return a.id;
    if ((a.children ?? []).some(c => c.id === categoryId)) return a.id;
  }
  return null;
}

export default function JobFilters({ categories, expertises, filters, onChange }: JobFiltersProps) {
  const [open, setOpen] = useState<number | null>(findAisleId(categories, filters.category_id) ?? categories[0]?.id ?? null);

  const update = (patch: Partial<JobPostFilters>) => onChange({ ...filters, ...patch, page: 1 });
  const active = !!filters.category_id || !!filters.budget_min || !!filters.budget_max || (filters.skill_ids?.length ?? 0) > 0;
  const skillIds = filters.skill_ids ?? [];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography sx={{ fontSize: 16, fontWeight: 600, letterSpacing: "-0.01em" }}>Filters</Typography>
        {active && (
          <Box component="button" onClick={() => onChange({ page: 1 })} sx={{ border: 0, bgcolor: "transparent", p: 0, cursor: "pointer", font: "inherit", fontSize: 13, fontWeight: 500, color: tokens.accent, "&:hover": { textDecoration: "underline" } }}>
            Clear all
          </Box>
        )}
      </Box>

      {/* Category tree */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        <Label>Category</Label>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
          {categories.map(aisle => {
            const expanded = open === aisle.id;
            return (
              <Box key={aisle.id} sx={{ display: "flex", flexDirection: "column" }}>
                <Box component="button" onClick={() => setOpen(expanded ? null : aisle.id)}
                  sx={{ display: "flex", alignItems: "center", gap: 1, border: 0, bgcolor: "transparent", p: "8px 4px", cursor: "pointer", font: "inherit", width: "100%", textAlign: "left" }}>
                  <ChevronRightIcon sx={{ fontSize: 16, color: tokens.text3, transform: expanded ? "rotate(90deg)" : "none", transition: "transform .15s" }} />
                  <Typography sx={{ fontSize: 14, fontWeight: 500, color: tokens.text }}>{aisle.name ?? aisle.category_name}</Typography>
                </Box>
                {expanded && (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25, pl: 2.75, pb: 0.5 }}>
                    {(aisle.children ?? []).map(shelf => {
                      const sel = filters.category_id === shelf.id;
                      return (
                        <Box key={shelf.id} component="button" onClick={() => update({ category_id: sel ? undefined : shelf.id })}
                          sx={{ display: "flex", alignItems: "center", border: 0, p: "7px 10px", borderRadius: "8px", cursor: "pointer", font: "inherit", textAlign: "left", bgcolor: sel ? "#000" : "transparent", color: sel ? "#fff" : tokens.text2, "&:hover": sel ? {} : { bgcolor: tokens.surface2, color: tokens.text } }}>
                          <Typography sx={{ fontSize: 13.5, fontWeight: sel ? 600 : 500 }}>{shelf.name ?? shelf.category_name}</Typography>
                        </Box>
                      );
                    })}
                    {(aisle.children ?? []).length === 0 && <Typography sx={{ fontSize: 12.5, color: tokens.text3, pl: 1.25, py: 0.5 }}>No subcategories yet</Typography>}
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>
      </Box>

      <Box sx={{ height: "1px", bgcolor: tokens.border }} />

      {/* Budget */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        <Label>Budget (USD)</Label>
        <Box sx={{ display: "flex", gap: 1.25 }}>
          {(["budget_min", "budget_max"] as const).map(k => (
            <Box key={k} sx={{ position: "relative", flex: 1 }}>
              <Box component="span" sx={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: tokens.text3, pointerEvents: "none" }}>$</Box>
              <Box component="input" inputMode="numeric" placeholder={k === "budget_min" ? "Min" : "Max"}
                value={filters[k] ?? ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const v = e.target.value.replace(/[^0-9]/g, "");
                  update({ [k]: v ? Number(v) : undefined });
                }}
                sx={{ width: "100%", boxSizing: "border-box", height: 42, pl: "24px", pr: "10px", border: `1px solid ${tokens.borderStrong}`, borderRadius: `${tokens.radius.input}px`, bgcolor: tokens.surface, font: "inherit", fontFamily: tokens.mono, fontSize: 14, outline: "none", "&::placeholder": { color: tokens.text3, opacity: 1 }, "&:focus": { borderColor: tokens.accent, boxShadow: `0 0 0 3px ${tokens.accentFill}` } }}
              />
            </Box>
          ))}
        </Box>
      </Box>

      <Box sx={{ height: "1px", bgcolor: tokens.border }} />

      {/* Skills */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        <Label>Required skills</Label>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          {expertises.map(e => {
            const on = skillIds.includes(e.id);
            return (
              <Box key={e.id} component="button"
                onClick={() => update({ skill_ids: on ? skillIds.filter(i => i !== e.id) : [...skillIds, e.id] })}
                sx={{ height: 32, px: 1.5, borderRadius: "999px", border: "none", cursor: "pointer", font: "inherit", fontSize: 12.5, fontWeight: 500, bgcolor: on ? "#000" : "rgba(0,0,0,0.05)", color: on ? "#fff" : tokens.text2, "&:hover": { bgcolor: on ? "#000" : "rgba(0,0,0,0.09)" } }}>
                {e.expertise_name}
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <Typography sx={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: tokens.text3 }}>{children}</Typography>;
}
