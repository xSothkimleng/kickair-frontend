// Formatting helpers for the admin console. Dates arrive from the API as ISO
// strings; every helper accepts either a string or a Date.

export type DateLike = string | Date;

export function toDate(d: DateLike): Date {
  return d instanceof Date ? d : new Date(d);
}

/** Money from a number or an API string like "1,250.00". */
export function money(v: number | string | null | undefined, opts: { compact?: boolean } = {}): string {
  const n = typeof v === "string" ? Number(v.replace(/,/g, "")) : (v ?? 0);
  if (!Number.isFinite(n)) return "—";
  if (opts.compact && Math.abs(n) >= 1000) {
    return "$" + (n / 1000).toFixed(n >= 100_000 ? 0 : 1).replace(/\.0$/, "") + "k";
  }
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2, minimumFractionDigits: n % 1 === 0 ? 0 : 2 });
}

export function num(n: number): string {
  return n.toLocaleString("en-US");
}

export function ago(d: DateLike): string {
  const diff = Date.now() - toDate(d).getTime();
  const m = Math.round(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const dd = Math.floor(h / 24);
  if (dd < 14) return `${dd}d ago`;
  const w = Math.floor(dd / 7);
  if (w < 8) return `${w}w ago`;
  return shortDate(d);
}

/** Waiting time for queues — coarser and always positive. */
export function waiting(d: DateLike): string {
  const h = Math.max(0, Math.round((Date.now() - toDate(d).getTime()) / 3_600_000));
  if (h < 1) return "under an hour";
  if (h < 24) return `${h}h`;
  return `${Math.round(h / 24)}d`;
}

export function shortDate(d: DateLike): string {
  return toDate(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function longDate(d: DateLike): string {
  return toDate(d).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

export function dateTime(d: DateLike): string {
  return toDate(d).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export function plural(n: number, one: string, many = one + "s"): string {
  return `${n} ${n === 1 ? one : many}`;
}

/** Earliest of a list of optional dates. */
export function oldest(dates: (DateLike | null | undefined)[]): Date | null {
  const ts = dates.filter(Boolean).map((d) => toDate(d as DateLike).getTime());
  return ts.length ? new Date(Math.min(...ts)) : null;
}

/** Short human message from a thrown API error. */
export function errorMessage(err: unknown, fallback = "Something went wrong. Please try again."): string {
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}
