"use client";

import { useState } from "react";
import { Box, Typography } from "@mui/material";
import { SelectInput, TextInput } from "@/components/ui/inputs";
import { ServiceCategory } from "@/types/service";

export interface CategoryValue {
  categoryId: number | null;
  requestedCategory: string | null;
  requestedParentId: number | null;
}

const NEW = "__new__";

function findAisleId(tree: ServiceCategory[], categoryId: number | null): number | null {
  if (!categoryId) return null;
  for (const aisle of tree) {
    if (aisle.id === categoryId) return aisle.id;
    if ((aisle.children ?? []).some(c => c.id === categoryId)) return aisle.id;
  }
  return null;
}

/**
 * Cascading category picker: pick an aisle (category) → a shelf (subcategory), or
 * choose "Suggest a new subcategory" to request one (admin-reviewed). Emits a
 * {categoryId | requestedCategory + requestedParentId} value.
 */
export default function CategoryPicker({
  tree,
  value,
  onChange,
  loading,
  error,
  required,
}: {
  tree: ServiceCategory[];
  value: CategoryValue;
  onChange: (v: CategoryValue) => void;
  loading?: boolean;
  error?: string;
  required?: boolean;
}) {
  const [aisleId, setAisleId] = useState<number | null>(value.requestedParentId ?? findAisleId(tree, value.categoryId));

  const resolvedAisle = aisleId ?? value.requestedParentId ?? findAisleId(tree, value.categoryId);
  const aisle = tree.find(a => a.id === resolvedAisle) ?? null;
  const shelves = aisle?.children ?? [];
  const isNew = value.requestedCategory != null;
  const shelfValue: number | string = isNew ? NEW : (value.categoryId ?? "");

  const handleAisle = (v: string | number) => {
    const id = v ? Number(v) : null;
    setAisleId(id);
    onChange({ categoryId: null, requestedCategory: null, requestedParentId: null });
  };

  const handleShelf = (v: string | number) => {
    if (String(v) === NEW) {
      onChange({ categoryId: null, requestedCategory: "", requestedParentId: resolvedAisle });
    } else if (v === "" || v == null) {
      onChange({ categoryId: null, requestedCategory: null, requestedParentId: null });
    } else {
      onChange({ categoryId: Number(v), requestedCategory: null, requestedParentId: null });
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <SelectInput
        label='Category'
        required={required}
        value={resolvedAisle ?? ""}
        onChange={handleAisle}
        options={tree.map(a => ({ value: a.id, label: a.name ?? a.category_name }))}
        placeholder={loading ? "Loading categories…" : "Select a category"}
        disabled={loading}
      />

      {resolvedAisle != null && (
        <SelectInput
          label='Subcategory'
          required={required}
          value={shelfValue}
          onChange={handleShelf}
          options={[
            ...shelves.map(s => ({ value: s.id, label: s.name ?? s.category_name })),
            { value: NEW, label: "➕ Suggest a new subcategory" },
          ]}
          placeholder='Select a subcategory'
          error={!isNew ? error : undefined}
        />
      )}

      {isNew && (
        <Box>
          <TextInput
            label='New subcategory name'
            required
            value={value.requestedCategory ?? ""}
            onChange={v => onChange({ categoryId: null, requestedCategory: v, requestedParentId: resolvedAisle })}
            placeholder='e.g., Drone Photography'
            error={error}
          />
          <Typography sx={{ fontSize: 12, color: "#b45309", mt: 0.75 }}>
            New category — an admin will review and approve it. Your listing still goes live in the meantime.
          </Typography>
        </Box>
      )}
    </Box>
  );
}
