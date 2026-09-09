"use client";

import { useState } from "react";
import { css } from "styled-system/css";
import { Stack } from "styled-system/jsx";
import { SelectInput, TextInput } from "@/components/ui/inputs";
import { ServiceCategory } from "@/types/service";

export interface CategoryValue {
  categoryId: number | null;
  requestedCategory: string | null;
  requestedParentId: number | null;
}

const NEW = "__new__";

// Owner-facing review hint under a "new category" field.
const hintCss = css({ fontSize: "12px", lineHeight: 1.5, color: "pendingText" });

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
  showNewCategoryHint = true,
}: {
  tree: ServiceCategory[];
  value: CategoryValue;
  onChange: (v: CategoryValue) => void;
  loading?: boolean;
  error?: string;
  required?: boolean;
  // Owner-facing hint under a new-category field ("an admin will review…"). Hidden in the
  // admin dialog, where the admin is the reviewer and this copy would be wrong.
  showNewCategoryHint?: boolean;
}) {
  const isNew = value.requestedCategory != null;
  const isNewAisle = isNew && value.requestedParentId == null; // brand-new top-level (main) category
  const isNewShelf = isNew && value.requestedParentId != null; // new subcategory under an existing aisle

  const [aisleId, setAisleId] = useState<number | null>(value.requestedParentId ?? findAisleId(tree, value.categoryId));

  const resolvedAisle = isNewAisle ? null : (aisleId ?? value.requestedParentId ?? findAisleId(tree, value.categoryId));
  const aisle = tree.find(a => a.id === resolvedAisle) ?? null;
  const shelves = aisle?.children ?? [];
  const aisleValue: number | string = isNewAisle ? NEW : (resolvedAisle ?? "");
  const shelfValue: number | string = isNewShelf ? NEW : (value.categoryId ?? "");

  const handleAisle = (v: string | number) => {
    if (String(v) === NEW) {
      setAisleId(null);
      onChange({ categoryId: null, requestedCategory: "", requestedParentId: null });
      return;
    }
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
    <Stack gap="16px">
      <SelectInput
        label='Category'
        required={required}
        value={aisleValue}
        onChange={handleAisle}
        options={[
          ...tree.map(a => ({ value: a.id, label: a.name ?? a.category_name })),
          { value: NEW, label: "➕ Suggest a new category" },
        ]}
        placeholder={loading ? "Loading categories…" : "Select a category"}
        disabled={loading}
        error={!isNew && resolvedAisle == null ? error : undefined}
      />

      {isNewAisle && (
        <div>
          <TextInput
            label='New category name'
            required
            value={value.requestedCategory ?? ""}
            onChange={v => onChange({ categoryId: null, requestedCategory: v, requestedParentId: null })}
            placeholder='e.g., Renewable Energy'
            error={error}
          />
          {showNewCategoryHint && (
            <p className={hintCss}>
              New top-level category — an admin will review and approve it. Your listing still goes live in the meantime.
            </p>
          )}
        </div>
      )}

      {!isNewAisle && resolvedAisle != null && (
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
          error={!isNewShelf ? error : undefined}
        />
      )}

      {isNewShelf && (
        <div>
          <TextInput
            label='New subcategory name'
            required
            value={value.requestedCategory ?? ""}
            onChange={v => onChange({ categoryId: null, requestedCategory: v, requestedParentId: resolvedAisle })}
            placeholder='e.g., Drone Photography'
            error={error}
          />
          {showNewCategoryHint && (
            <p className={hintCss}>
              New subcategory — an admin will review and approve it. Your listing still goes live in the meantime.
            </p>
          )}
        </div>
      )}
    </Stack>
  );
}
