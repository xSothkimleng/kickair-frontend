/**
 * Post-auth redirect helpers.
 *
 * When a guest is bounced to sign-in / sign-up mid-flow (e.g. from the purchase
 * gate), we thread a `?redirect=` param so they land back where they were headed
 * instead of the generic services page. Only same-origin, root-relative paths are
 * ever honored — never an absolute or protocol-relative URL — so the param can't
 * be used as an open-redirect to an attacker's site.
 */

/** Returns the target only if it's a safe internal path, otherwise null. */
export function safeRedirect(target: string | null | undefined): string | null {
  if (!target) return null;
  // Must be root-relative ("/foo") and not protocol-relative ("//evil.com").
  if (!target.startsWith("/") || target.startsWith("//")) return null;
  return target;
}

/** Appends a validated `?redirect=` param to an auth path (or returns it unchanged). */
export function withRedirect(base: string, redirectTo?: string | null): string {
  const safe = safeRedirect(redirectTo);
  return safe ? `${base}?redirect=${encodeURIComponent(safe)}` : base;
}
