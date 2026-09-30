/**
 * How a listing's category reads on cards and detail pages. A listing filed on a group
 * with the owner's own label shows as "Web Development › Podcast editing"; one on a
 * subcategory shows the subcategory name.
 */
export function categoryLine(
  category: { category_name: string } | null | undefined,
  label?: string | null,
  fallback = "Uncategorized",
): string {
  if (!category) return fallback;
  const own = label?.trim();
  return own ? `${category.category_name} › ${own}` : category.category_name;
}
