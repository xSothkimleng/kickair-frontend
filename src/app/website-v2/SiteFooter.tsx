import { css } from "styled-system/css";

const GROUPS = [
  { title: "Hire", links: ["Browse services", "Find freelancers", "Post a job", "Kick Air Pro"] },
  { title: "Work", links: ["Start freelancing", "Find jobs", "Kick Air University", "Get verified"] },
  { title: "Trust", links: ["How escrow works", "Disputes", "Reviews", "Help centre"] },
];

export default function SiteFooter() {
  return (
    <footer className={css({ bg: "var(--v2-canvas)", px: { base: "1.25rem", sm: "2rem", lg: "2.5rem" }, pt: "4rem", pb: "3rem" })}>
      <div
        className={css({
          maxW: "78rem", mx: "auto",
          display: "grid",
          gridTemplateColumns: { base: "1fr", sm: "repeat(3, 1fr)", lg: "1.5fr repeat(3, 1fr)" },
          gap: "2.5rem",
        })}
      >
        <div>
          <div className={css({ fontSize: "1.0625rem", fontWeight: 600, letterSpacing: "-0.02em", color: "var(--v2-primary)" })}>
            Kick Air
          </div>
          <p className={css({ fontSize: "0.8125rem", lineHeight: 1.5, color: "var(--v2-secondary)", mt: "0.625rem", maxW: "22rem" })}>
            Cambodia&apos;s freelance marketplace. Money held safe until the work is done.
          </p>
        </div>
        {GROUPS.map((g) => (
          <div key={g.title}>
            <div className={css({ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--v2-tertiary)", mb: "0.875rem" })}>
              {g.title}
            </div>
            <ul className={css({ display: "flex", flexDirection: "column", gap: "0.625rem", listStyle: "none" })}>
              {g.links.map((l) => (
                <li key={l} className={css({ fontSize: "0.8125rem", color: "var(--v2-secondary)" })}>{l}</li>
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
