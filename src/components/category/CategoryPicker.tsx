"use client";

import { useMemo } from "react";
import { css } from "styled-system/css";
import { Stack } from "styled-system/jsx";
import { AutocompleteInput } from "@/components/ui/inputs";
import { ServiceCategory } from "@/types/service";

export interface CategoryValue {
  /** A subcategory, or the top-level group the owner filed under with their own label. */
  categoryId: number | null;
  /** The owner's own words when no subcategory fits. Only meaningful with a top-level group. */
  categoryLabel: string | null;
}

const hintCss = css({ textStyle: "meta", color: "ink3", mt: "6px" });

const nameOf = (c: ServiceCategory) => c.name ?? c.category_name;

/** The top-level group a value sits in, whether it points at the group or at one of its subcategories. */
export function groupIdFor(tree: ServiceCategory[], categoryId: number | null): number | null {
  if (!categoryId) return null;
  for (const group of tree) {
    if (group.id === categoryId) return group.id;
    if ((group.children ?? []).some(c => c.id === categoryId)) return group.id;
  }
  return null;
}

/**
 * Category picker: pick a category or type your own, then either pick one of its
 * subcategories or type your own words. Typed text that isn't a listed subcategory is kept
 * as a label on the group; a typed category is kept as a label on "Something else" (the
 * catch-all group, never listed here). Nothing is blocked and an admin can sort it later.
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
  const groupId = groupIdFor(tree, value.categoryId);
  const group = tree.find(g => g.id === groupId) ?? null;
  const shelves = group?.children ?? [];
  const shelf = shelves.find(s => s.id === value.categoryId) ?? null;
  const listed = useMemo(() => tree.filter(g => !g.is_catch_all), [tree]);
  const catchAll = tree.find(g => g.is_catch_all) ?? null;
  const ownCategory = group?.is_catch_all ? (value.categoryLabel ?? "") : "";

  // Text that names a listed category picks it; anything else is the owner's own category, filed on the catch-all.
  const handleGroupText = (text: string | null) => {
    // The field also reports its value before the tree has loaded; that is not an edit.
    if (loading || tree.length === 0) return;
    const typed = (text ?? "").trim();
    const match = listed.find(g => nameOf(g).toLowerCase() === typed.toLowerCase());
    if (match) {
      if (match.id !== groupId) onChange({ categoryId: match.id, categoryLabel: null });
    } else if (typed && catchAll) {
      onChange({ categoryId: catchAll.id, categoryLabel: text });
    } else {
      onChange({ categoryId: null, categoryLabel: null });
    }
  };

  // Typing filters the list; text that names a subcategory picks it, anything else stays as the owner's label.
  const handleText = (text: string | null) => {
    const typed = (text ?? "").trim();
    const match = shelves.find(s => nameOf(s).toLowerCase() === typed.toLowerCase());
    if (match) onChange({ categoryId: match.id, categoryLabel: null });
    else onChange({ categoryId: groupId, categoryLabel: text || null });
  };

  const textValue = shelf ? nameOf(shelf) : (value.categoryLabel ?? "");
  const typedOwn = !shelf && !!value.categoryLabel?.trim();

  return (
    <Stack gap="16px">
      <div>
        <AutocompleteInput
          freeSolo={!!catchAll}
          label="Category"
          required={required}
          value={(group?.is_catch_all ? ownCategory : group ? nameOf(group) : "") || null}
          onChange={handleGroupText}
          options={listed.map(nameOf)}
          placeholder={loading ? "Loading categories…" : "Search, or type your own if it's not listed"}
          disabled={loading}
          error={!group || group.is_catch_all ? error : undefined}
        />
        {ownCategory.trim() && (
          <p className={hintCss}>Not in our list yet. A few words is enough. We sort it into the right place.</p>
        )}
      </div>

      {group && !group.is_catch_all && (
        <div>
          <AutocompleteInput
            freeSolo
            label="Subcategory"
            required={required}
            value={textValue || null}
            onChange={handleText}
            options={shelves.map(nameOf)}
            placeholder={shelves.length ? "Search, or type your own if it's not listed" : "Type what you offer"}
            error={error}
          />
          {typedOwn && (
            <p className={hintCss}>
              Not in our list yet. It shows under {nameOf(group)} as “{value.categoryLabel?.trim()}”.
            </p>
          )}
        </div>
      )}
    </Stack>
  );
}
