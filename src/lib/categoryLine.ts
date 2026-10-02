/** What a listing needs for its category to be shown. */
export interface Categorised {
  category?: { category_name: string; is_catch_all?: boolean } | null;
  /** The owner's own words: a typed subcategory on a group, or a typed category on the catch-all group. */
  category_label?: string | null;
  /** The subcategory typed for a typed category. */
  subcategory_label?: string | null;
}

/**
 * The names a listing's category is shown as, outermost first. A listing on a subcategory
 * shows the subcategory; one with a typed subcategory shows "Web Development", "Podcast
 * editing"; one with a typed category shows the owner's words, never the catch-all group's
 * own name.
 */
export function categoryParts(listing: Categorised): string[] {
  const { category } = listing;
  if (!category) return [];
  const own = listing.category_label?.trim();
  const ownSub = listing.subcategory_label?.trim();
  if (category.is_catch_all && own) return ownSub ? [own, ownSub] : [own];
  return own ? [category.category_name, own] : [category.category_name];
}

/** How a listing's category reads on cards and detail pages: its parts joined with "›". */
export function categoryLine(listing: Categorised | null | undefined, fallback = "Uncategorized"): string {
  const parts = listing ? categoryParts(listing) : [];
  return parts.length ? parts.join(" › ") : fallback;
}
