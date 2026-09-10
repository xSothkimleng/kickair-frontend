"use client";

import { Check, ChevronDown, Search, SlidersHorizontal, Star } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useMemo, useState } from "react";
import { css, cx } from "styled-system/css";
import { crossFade, spring, text } from "../design";
import { Avatar, Button } from "../ui";
import { CATEGORIES, FILTERS, SERVICES } from "./data";

/**
 * Discovery, rebuilt.
 *
 * The old page was the marketplace default: a permanent filter sidebar eating a
 * third of the width, a sort bar, a grid/list toggle. It made browsing feel like
 * operating a query builder. Three changes:
 *
 *   · Filters became pills in a bar. They open on demand and give the results
 *     the full width the rest of the time (§16 Simplicity — show the common path,
 *     put the rest one level deeper).
 *   · Categories are a dragged rail, not a checkbox list.
 *   · Cards have no image, because no imagery exists. Rather than fake a cover,
 *     the card leads with the promise in type on a category tint. It reads as a
 *     deliberate system instead of a grid of empty grey rectangles.
 */

const page = css({ bg: "var(--v2-canvas)", minHeight: "100vh", pt: "3.5rem" });
const shell = css({ maxW: "78rem", mx: "auto", px: { base: "1.25rem", sm: "2rem", lg: "2.5rem" } });

const heading = css({ pt: { base: "2rem", md: "3rem" }, pb: "1.5rem" });

const searchRow = css({
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  height: "3rem",
  px: "1rem",
  bg: "var(--v2-white)",
  borderRadius: "var(--v2-r-pill)",
  boxShadow: "var(--v2-sh-card)",
  maxW: "34rem",
});

const searchInput = css({
  flex: 1, minWidth: 0, border: "none", outline: "none", bg: "transparent",
  fontFamily: "inherit", fontSize: "0.9375rem", color: "var(--v2-primary)",
  _placeholder: { color: "var(--v2-tertiary)" },
});

/** §12 — the toolbar is chrome that floats over results, so it is a material. */
const toolbar = css({
  position: "sticky",
  top: "3.5rem",
  zIndex: 20,
  py: "0.75rem",
  bg: "rgba(244,244,246,0.8)",
  backdropFilter: "blur(20px) saturate(180%)",
  "@media (prefers-reduced-transparency: reduce)": { bg: "var(--v2-canvas)", backdropFilter: "none" },
});

const catRail = css({
  display: "flex",
  gap: "0.5rem",
  overflowX: "auto",
  scrollbarWidth: "none",
  "&::-webkit-scrollbar": { display: "none" },
  pb: "0.125rem",
});

const catPill = css({
  flexShrink: 0, px: "0.875rem", height: "2.125rem",
  display: "inline-flex", alignItems: "center",
  borderRadius: "var(--v2-r-pill)", fontSize: "0.8125rem", fontWeight: 500,
  fontFamily: "inherit", border: "none", cursor: "pointer", whiteSpace: "nowrap",
  WebkitTapHighlightColor: "transparent",
});

const filterRow = css({
  display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.5rem", mt: "0.625rem",
});

const filterPill = css({
  display: "inline-flex", alignItems: "center", gap: "0.375rem",
  px: "0.75rem", height: "2rem", borderRadius: "var(--v2-r-pill)",
  fontSize: "0.8125rem", fontFamily: "inherit", cursor: "pointer",
  bg: "var(--v2-white)", color: "var(--v2-secondary)",
  boxShadow: "inset 0 0 0 1px var(--v2-hairline)", border: "none",
  WebkitTapHighlightColor: "transparent",
});

const menu = css({
  position: "absolute", top: "calc(100% + 0.375rem)", left: 0, zIndex: 30,
  minWidth: "11rem", p: "0.375rem",
  bg: "var(--v2-white)", borderRadius: "var(--v2-r-tile)",
  boxShadow: "inset 0 0 0 1px var(--v2-hairline), var(--v2-sh-float)",
});

const menuItem = css({
  display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem",
  width: "100%", px: "0.625rem", height: "2rem", borderRadius: "0.375rem",
  fontSize: "0.8125rem", fontFamily: "inherit", textAlign: "left",
  bg: "transparent", border: "none", cursor: "pointer", color: "var(--v2-primary)",
  _hover: { bg: "var(--v2-canvas)" },
});

const grid = css({
  display: "grid",
  gridTemplateColumns: { base: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" },
  gap: "1rem",
  pt: "1.25rem",
  pb: "4rem",
});

const cardBase = css({
  display: "flex", flexDirection: "column",
  bg: "var(--v2-white)", borderRadius: "var(--v2-r-card)", overflow: "hidden",
  boxShadow: "inset 0 0 0 1px var(--v2-hairline), var(--v2-sh-card)",
  cursor: "pointer", textAlign: "left", border: "none", fontFamily: "inherit",
  WebkitTapHighlightColor: "transparent", willChange: "transform",
});

/** The typographic cover that stands in for photography. */
const cover = css({
  p: "1.25rem 1.25rem 1.125rem",
  display: "flex", flexDirection: "column", gap: "0.625rem", minHeight: "8.25rem",
});

function FilterMenu({ label, options }: { label: string; options: string[] }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(options[0]);
  const reduced = useReducedMotion();
  const active = value !== options[0];

  return (
    <div className={css({ position: "relative" })}>
      <button
        type="button"
        className={filterPill}
        onClick={() => setOpen((o) => !o)}
        style={active ? { background: "var(--v2-primary)", color: "var(--v2-white)", boxShadow: "none" } : undefined}
      >
        {active ? value : label}
        <ChevronDown size={13} aria-hidden />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className={css({ position: "fixed", inset: 0, zIndex: 25 })} onClick={() => setOpen(false)} />
            {/* §7 — the menu scales from the pill that opened it, so the
                relationship between trigger and content stays obvious. */}
            <motion.div
              className={menu}
              initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: -4 }}
              animate={reduced ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: -4 }}
              transition={reduced ? crossFade : spring.quick}
              style={{ transformOrigin: "top left" }}
            >
              {options.map((o) => (
                <button
                  key={o}
                  type="button"
                  className={menuItem}
                  onClick={() => { setValue(o); setOpen(false); }}
                >
                  {o}
                  {o === value && <Check size={14} aria-hidden />}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Explore() {
  const reduced = useReducedMotion();
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");

  const results = useMemo(
    () =>
      SERVICES.filter(
        (s) =>
          (cat === "All" || s.category === cat) &&
          (q === "" || s.title.toLowerCase().includes(q.toLowerCase()))
      ),
    [cat, q]
  );

  return (
    <div className={page}>
      <div className={shell}>
        <div className={heading}>
          <h1 className={cx(text.display, css({ color: "var(--v2-primary)" }))}>Browse services</h1>
          <p className={cx(text.lead, css({ color: "var(--v2-secondary)", mt: "0.75rem", mb: "1.5rem" }))}>
            Fixed scope, fixed price, money held until you approve.
          </p>
          <div className={searchRow}>
            <Search size={17} className={css({ color: "var(--v2-tertiary)", flexShrink: 0 })} aria-hidden />
            <input
              className={searchInput}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search services…"
              aria-label="Search services"
            />
            <Button variant="accent" size="sm">Search</Button>
          </div>
        </div>
      </div>

      <div className={toolbar}>
        <div className={shell}>
          <div className={catRail}>
            {CATEGORIES.map((c) => {
              const on = c === cat;
              return (
                <motion.button
                  key={c}
                  type="button"
                  className={catPill}
                  onClick={() => setCat(c)}
                  whileTap={reduced ? undefined : { scale: 0.96 }}
                  transition={spring.quick}
                  style={
                    on
                      ? { background: "var(--v2-primary)", color: "var(--v2-white)" }
                      : { background: "var(--v2-white)", color: "var(--v2-secondary)", boxShadow: "inset 0 0 0 1px var(--v2-hairline)" }
                  }
                >
                  {c}
                </motion.button>
              );
            })}
          </div>

          <div className={filterRow}>
            <span className={css({ display: "inline-flex", alignItems: "center", gap: "0.375rem", color: "var(--v2-tertiary)", fontSize: "0.8125rem", mr: "0.125rem" })}>
              <SlidersHorizontal size={14} aria-hidden />
            </span>
            {FILTERS.map((f) => (
              <FilterMenu key={f.label} label={f.label} options={f.options} />
            ))}
            <span className={cx(text.caption, css({ color: "var(--v2-tertiary)", ml: "auto" }))}>
              {results.length} {results.length === 1 ? "service" : "services"}
            </span>
          </div>
        </div>
      </div>

      <div className={shell}>
        <motion.div layout className={grid}>
          <AnimatePresence mode="popLayout">
            {results.map((s) => (
              <motion.button
                key={s.id}
                type="button"
                layout
                className={cardBase}
                initial={reduced ? { opacity: 0 } : { opacity: 0, y: 14 }}
                animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
                transition={reduced ? crossFade : spring.ui}
                whileHover={reduced ? undefined : { y: -4, boxShadow: "inset 0 0 0 1px var(--v2-hairline), var(--v2-sh-raised)" }}
                whileTap={reduced ? undefined : { scale: 0.985 }}
              >
                <div className={cover} style={{ background: s.tintBg }}>
                  <span
                    className={css({ fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" })}
                    style={{ color: s.tint }}
                  >
                    {s.category}
                  </span>
                  <span className={css({ fontSize: "1.0625rem", lineHeight: 1.3, letterSpacing: "-0.018em", fontWeight: 600, color: "var(--v2-primary)" })}>
                    {s.title}
                  </span>
                </div>

                <div className={css({ p: "1rem 1.25rem 1.25rem", display: "flex", flexDirection: "column", gap: "0.875rem" })}>
                  <div className={css({ display: "flex", alignItems: "center", gap: "0.5rem" })}>
                    <Avatar name={s.seller} size={26} />
                    <span className={css({ fontSize: "0.8125rem", fontWeight: 500, color: "var(--v2-primary)" })}>{s.seller}</span>
                    {s.pro && (
                      <span className={css({ px: "0.3125rem", height: "1.0625rem", display: "inline-flex", alignItems: "center", borderRadius: "0.25rem", fontSize: "0.5625rem", fontWeight: 700, letterSpacing: "0.04em", color: "var(--v2-white)", bg: "var(--v2-primary)" })}>
                        PRO
                      </span>
                    )}
                    <span className={css({ display: "inline-flex", alignItems: "center", gap: "0.25rem", ml: "auto", fontSize: "0.8125rem", color: "var(--v2-secondary)" })}>
                      <Star size={12} className={css({ color: "var(--v2-attention)" })} fill="currentColor" aria-hidden />
                      <span className={css({ fontWeight: 600, color: "var(--v2-primary)" })}>{s.rating.toFixed(1)}</span>
                      <span>({s.reviews})</span>
                    </span>
                  </div>

                  <div className={css({ height: "1px", bg: "var(--v2-hairline)" })} />

                  <div className={css({ display: "flex", alignItems: "baseline", justifyContent: "space-between" })}>
                    <span className={cx(text.caption, css({ color: "var(--v2-tertiary)" }))}>
                      {s.days} day{s.days > 1 ? "s" : ""} delivery
                    </span>
                    <span className={cx(text.money, css({ fontSize: "1.0625rem", color: "var(--v2-primary)" }))}>
                      ${s.price}
                    </span>
                  </div>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </motion.div>

        {results.length === 0 && (
          <div className={css({ py: "5rem", textAlign: "center" })}>
            <p className={cx(text.heading, css({ color: "var(--v2-primary)" }))}>Nothing matches that yet.</p>
            <p className={cx(text.body, css({ color: "var(--v2-secondary)", mt: "0.5rem" }))}>
              Try a different category, or post a job and let people come to you.
            </p>
            <Button variant="secondary" size="md" className={css({ mt: "1.25rem" })}>Post a job</Button>
          </div>
        )}
      </div>
    </div>
  );
}
