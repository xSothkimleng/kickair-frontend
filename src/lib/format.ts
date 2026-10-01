/**
 * Small text formatters shared by the site (the admin console has its own set in
 * components/admin/format.ts).
 */

/** "1 order", "2 orders". Pass `many` for irregular plurals. */
export function plural(count: number, one: string, many = `${one}s`): string {
  return `${count} ${count === 1 ? one : many}`;
}

/** "1,200.00" from a number or a numeric string (which may already carry commas). */
export function formatAmount(value: number | string | null | undefined): string {
  const amount = typeof value === "string" ? Number(value.replace(/,/g, "")) : Number(value ?? 0);
  return (Number.isFinite(amount) ? amount : 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * A package's delivery time as words. The API stores it as "3 days" on newer
 * listings and as a bare number on older ones; both read "3 days" here.
 */
export function deliveryText(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "N/A";
  const text = String(value).trim();
  return /^\d+$/.test(text) ? plural(Number(text), "day") : text;
}

/**
 * A job's budget as words: "$500 – $1,000", "$500" when both ends match, "From $500" /
 * "Up to $1,000" when one end is missing, and "Budget not set" on a draft with neither.
 */
export function jobBudget(min: number | string | null | undefined, max: number | string | null | undefined): string {
  const whole = (value: number | string | null | undefined): string | null => {
    if (value === null || value === undefined || value === "") return null;
    const amount = Number(String(value).replace(/,/g, ""));
    return Number.isFinite(amount) ? `$${amount.toLocaleString("en-US", { maximumFractionDigits: 0 })}` : null;
  };
  const low = whole(min);
  const high = whole(max);
  if (low && high) return low === high ? low : `${low} – ${high}`;
  if (low) return `From ${low}`;
  if (high) return `Up to ${high}`;
  return "Budget not set";
}

/**
 * A package's revisions as words. The API stores a count ("3"), the word "Unlimited",
 * or -1 for unlimited on older rows; a missing value reads "N/A".
 */
export function revisionsText(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "N/A";
  const text = String(value).trim();
  if (text === "-1" || /^unlimited$/i.test(text)) return "Unlimited";
  return /^\d+$/.test(text) ? text : "N/A";
}

/**
 * A dollar amount for lists and summaries: "$300" for a whole number, "$270.50" when
 * there are cents. Never "$270.5", and never rounded to "$271".
 */
export function formatUsd(value: number | string | null | undefined): string {
  const amount = typeof value === "string" ? Number(value.replace(/,/g, "")) : Number(value ?? 0);
  const safe = Number.isFinite(amount) ? amount : 0;
  const cents = Number.isInteger(safe) ? 0 : 2;
  return `$${safe.toLocaleString("en-US", { minimumFractionDigits: cents, maximumFractionDigits: cents })}`;
}
