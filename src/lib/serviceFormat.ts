/**
 * Shared formatters for a service pricing option's delivery/revision fields.
 * The API returns these as loosely-typed strings ("7", "-1", "Unlimited"), so we
 * normalize them into human copy in one place — used by checkout and the purchase
 * gate's order summary so they always read identically.
 */

export function deliveryText(d: string | number): string {
  const s = String(d).trim();
  if (/^\d+$/.test(s)) return `${s}-day delivery`;
  return s || "Delivery on agreed date";
}

export function revisionsText(r: string | number): string {
  const s = String(r).trim();
  if (s === "-1") return "Unlimited revisions";
  if (/^\d+$/.test(s)) return `${s} revision${s === "1" ? "" : "s"}`;
  return s || "Revisions on request";
}
