"use client";

import { useMemo } from "react";
import { css } from "styled-system/css";
import { Stack } from "styled-system/jsx";
import { AutocompleteInput } from "@/components/ui/inputs";
import { ServiceCategory } from "@/types/service";

export interface CategoryValue {
  /** A subcategory, the group a typed subcategory goes under, or the catch-all group for a typed category. */
  categoryId: number | null;
  /** The owner's own words: a typed subcategory on a group, or a typed category on the catch-all group. */
  categoryLabel: string | null;
  /** The subcategory typed for a typed category. */
  subcategoryLabel: string | null;
}

/** What still has to be filled in before the listing can be published, or null when the choice is complete. */
export function categoryError(tree: ServiceCategory[], value: CategoryValue): string | null {
  const group = tree.find(g => g.id === value.categoryId);
  if (!value.categoryId || (group?.is_catch_all && !value.categoryLabel?.trim())) return "Pick a category, or type your own";
  if (group?.is_catch_all) return value.subcategoryLabel?.trim() ? null : "Add a subcategory for your new category";
  if (group && !value.categoryLabel?.trim()) return "Pick a subcategory, or type your own";
  return null;
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
 * Category picker: pick a category or type your own, then pick one of its subcategories or
 * type your own. What the owner types stays on the listing as text (a typed category sits
 * on the catch-all group, which is never listed here) and becomes a real category for
 * everyone when an admin approves the listing.
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
      if (match.id !== groupId) onChange({ categoryId: match.id, categoryLabel: null, subcategoryLabel: null });
    } else if (typed && catchAll) {
      // Still the owner's own category: the subcategory typed for it stays.
      onChange({ categoryId: catchAll.id, categoryLabel: text, subcategoryLabel: group?.is_catch_all ? value.subcategoryLabel : null });
    } else {
      onChange({ categoryId: null, categoryLabel: null, subcategoryLabel: null });
    }
  };

  // Typing filters the list; text that names a subcategory picks it, anything else stays as the owner's label.
  const handleText = (text: string | null) => {
    const typed = (text ?? "").trim();
    const match = shelves.find(s => nameOf(s).toLowerCase() === typed.toLowerCase());
    if (match) onChange({ categoryId: match.id, categoryLabel: null, subcategoryLabel: null });
    else onChange({ categoryId: groupId, categoryLabel: text || null, subcategoryLabel: null });
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
          error={!group || (group.is_catch_all && !ownCategory.trim()) ? error : undefined}
        />
        {ownCategory.trim() && (
          <p className={hintCss}>New category. It is added to the site when your listing is approved.</p>
        )}
      </div>

      {group?.is_catch_all && ownCategory.trim() && (
        <AutocompleteInput
          freeSolo
          label="Subcategory"
          required={required}
          value={value.subcategoryLabel}
          onChange={text => onChange({ categoryId: group.id, categoryLabel: value.categoryLabel, subcategoryLabel: text || null })}
          options={[]}
          placeholder={`Type a subcategory for ${ownCategory.trim()}`}
          error={error}
        />
      )}

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
              New subcategory. It is added under {nameOf(group)} when your listing is approved.
            </p>
          )}
        </div>
      )}
    </Stack>
  );
}
