import Link from "next/link";
import { css } from "styled-system/css";

/**
 * Links that have a redesigned page go to it; the rest go to the live site's
 * page, or to the section of this one that answers them. Nothing here is a dead
 * label — a footer is where people go when they could not find it anywhere else.
 */
const GROUPS = [
  {
    title: "Hire",
    links: [
      { label: "Browse services", href: "/website-v2/explore" },
      { label: "Find freelancers", href: "/find-freelancer" },
      { label: "Post a job", href: "/jobs" },
      { label: "Kick Air Pro", href: "/website-v2#services" },
    ],
  },
  {
    title: "Work",
    links: [
      { label: "Start freelancing", href: "/website-v2#work" },
      { label: "Find jobs", href: "/jobs" },
      { label: "Kick Air University", href: "/kick-air-university" },
      { label: "Get verified", href: "/settings" },
    ],
  },
  {
    title: "Trust",
    links: [
      { label: "How escrow works", href: "/website-v2#escrow" },
      { label: "Disputes", href: "/website-v2#escrow" },
      { label: "Reviews", href: "/website-v2#questions" },
      { label: "Questions", href: "/website-v2#questions" },
    ],
  },
];

const footLink = css({
  fontSize: "0.8125rem",
  color: "var(--v2-secondary) !important",
  WebkitTapHighlightColor: "transparent",
  _hover: { color: "var(--v2-primary) !important" },
});

export default function SiteFooter() {
  return (
    <footer className={css({ bg: "var(--v2-canvas)", px: { base: "1.25rem", sm: "2rem", lg: "2.5rem" }, pt: "4rem", pb: "3rem" })}>
      <div
        className={css({
          maxW: "78rem", mx: "auto",
          display: "grid",
          gridTemplateColumns: { base: "repeat(2, 1fr)", sm: "repeat(3, 1fr)", lg: "1.5fr repeat(3, 1fr)" },
          gap: "2.5rem",
        })}
      >
        {/* gap, not `mt` on the <p> — globals.css zeroes paragraph margins. */}
        <div className={css({ gridColumn: { base: "1 / -1", lg: "auto" }, display: "flex", flexDirection: "column", gap: "0.625rem" })}>
          <Link
            href="/website-v2"
            className={css({ fontSize: "1.0625rem", fontWeight: 600, letterSpacing: "-0.02em", color: "var(--v2-primary) !important", alignSelf: "flex-start" })}
          >
            Kick Air
          </Link>
          <p className={css({ fontSize: "0.8125rem", lineHeight: 1.5, color: "var(--v2-secondary)", maxW: "22rem" })}>
            Cambodia&apos;s freelance marketplace. Money held safe until the work is done.
          </p>
        </div>
        {GROUPS.map((g) => (
          <div key={g.title} className={css({ display: "flex", flexDirection: "column", gap: "0.875rem" })}>
            <div className={css({ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--v2-tertiary)" })}>
              {g.title}
            </div>
            <ul className={css({ display: "flex", flexDirection: "column", gap: "0.625rem", listStyle: "none" })}>
              {g.links.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className={footLink}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div
        className={css({
          maxW: "78rem", mx: "auto", mt: "3rem", pt: "1.5rem",
          borderTop: `1px solid ${"var(--v2-hairline)"}`,
          fontSize: "0.75rem", color: "var(--v2-tertiary)",
        })}
      >
        © 2026 Kick Air. Phnom Penh, Cambodia.
      </div>
    </footer>
  );
}
