"use client";

import { Menu, Search, X } from "lucide-react";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { css, cx } from "styled-system/css";
import { crossFade, material, spring, text } from "./design";
import { ButtonLink, MotionLink } from "./ui";

/**
 * Marketing chrome for website-v2.
 *
 * The search field lives here rather than in the hero. On the old page it was
 * the hero's centrepiece, which put a database query at the emotional centre of
 * the front door; here the hero makes the argument and search stays available
 * the whole way down the page instead of scrolling away.
 *
 * §16 Familiarity — links are named for their contents, not safe umbrellas.
 * Every href is absolute, because this bar also sits on /website-v2/explore,
 * where a bare "#escrow" would point at nothing.
 */
const LINKS = [
  { label: "Services", href: "/website-v2/explore" },
  { label: "People", href: "/website-v2#freelancers" },
  { label: "How escrow works", href: "/website-v2#escrow" },
  { label: "For freelancers", href: "/website-v2#work" },
];

const bar = css({ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, height: "3.5rem" });

/**
 * §12 — the material is its own layer so it can materialize independently of
 * the content on it. At the top of the page nothing is underneath the bar, so it
 * stays clear; the glass arrives once content slides under. Opacity gates the
 * layer and its backdrop-filter together, which fades the blur in rather than
 * snapping it on.
 */
const materialLayer = css({ position: "absolute", inset: 0, pointerEvents: "none" });

/** §12 — a soft edge where content meets chrome, never a 1px rule. */
const scrollEdge = css({
  position: "absolute", top: "100%", left: 0, right: 0, height: "1.25rem", pointerEvents: "none",
  backgroundImage: "linear-gradient(to bottom, rgba(255,255,255,0.6), rgba(255,255,255,0))",
  "@media (prefers-reduced-transparency: reduce)": { display: "none" },
});

const inner = css({
  position: "relative", height: "100%", maxW: "78rem", mx: "auto", px: { base: "1.25rem", sm: "2rem", lg: "2.5rem" },
  display: "flex", alignItems: "center", gap: { base: "0.75rem", md: "1.5rem" },
});

const wordmark = css({
  fontSize: "1.0625rem", fontWeight: 600, letterSpacing: "-0.02em", flexShrink: 0,
  color: "var(--v2-primary) !important",
});

const navLink = cx(
  text.onMaterial,
  css({
    px: "0.6875rem", py: "0.5rem", borderRadius: "var(--v2-r-chip)", cursor: "pointer",
    WebkitTapHighlightColor: "transparent",
    color: "rgba(10,10,11,0.82) !important",
    _hover: { color: "var(--v2-primary) !important" },
  })
);

const searchPill = css({
  display: { base: "none", lg: "flex" },
  alignItems: "center",
  gap: "0.5rem",
  height: "2.125rem",
  width: "15rem",
  px: "0.875rem",
  borderRadius: "var(--v2-r-pill)",
  bg: "rgba(10,10,11,0.05)",
  color: "var(--v2-tertiary)",
  cursor: "text",
  transition: "background-color 150ms ease-out",
  _hover: { bg: "rgba(10,10,11,0.08)" },
  _focusWithin: { bg: "var(--v2-white)", boxShadow: "0 0 0 2px var(--v2-accent)" },
});

const searchInput = css({
  flex: 1, minWidth: 0, border: "none", outline: "none", bg: "transparent",
  fontFamily: "inherit", fontSize: "0.8125rem", color: "var(--v2-primary)",
  _placeholder: { color: "var(--v2-tertiary)" },
});

/** The phone menu's trigger. 2.75rem square: §10's minimum comfortable target. */
const menuBtn = css({
  display: { base: "inline-flex", md: "none" },
  alignItems: "center", justifyContent: "center",
  w: "2.75rem", h: "2.75rem", mr: "-0.625rem",
  border: "none", bg: "transparent", borderRadius: "var(--v2-r-pill)",
  color: "var(--v2-primary)", cursor: "pointer",
  WebkitTapHighlightColor: "transparent",
});

const scrim = css({
  position: "fixed", inset: 0, top: "3.5rem", bg: "rgba(10,10,11,0.28)",
  display: { md: "none" },
});

/**
 * The sheet's surface, shared with the bar while the sheet is open so the two
 * read as one object. Solid on purpose: the bar's 72% glass is fine over a page
 * scrolling past, but this holds the primary navigation over a hero set in 3rem
 * type. Even at 97% the hero's black button ghosted through the search field,
 * and legibility here must not depend on a blur rendering.
 */
const SHEET_SURFACE = "#FFFFFF";

/**
 * §8 — the sheet grows out of the bar it belongs to, so it opens from the top
 * edge rather than fading in from nowhere.
 */
const sheet = css({
  position: "fixed", top: "3.5rem", left: 0, right: 0,
  display: { base: "flex", md: "none" },
  flexDirection: "column",
  bg: "#FFFFFF",
  px: "1.25rem", pt: "0.5rem", pb: "1.5rem",
  borderBottomRadius: "var(--v2-r-panel)",
  boxShadow: "var(--v2-sh-float)",
  transformOrigin: "top center",
  boxSizing: "border-box",
});

const sheetLink = css({
  display: "flex", alignItems: "center", minHeight: "3.25rem",
  fontSize: "1.25rem", fontWeight: 600, letterSpacing: "-0.02em",
  color: "var(--v2-primary) !important",
  borderBottom: "1px solid var(--v2-hairline)",
  WebkitTapHighlightColor: "transparent",
});

const sheetSearch = css({
  display: "flex", alignItems: "center", gap: "0.625rem",
  height: "2.875rem", px: "1rem", mt: "1.25rem",
  borderRadius: "var(--v2-r-pill)", bg: "rgba(10,10,11,0.06)", color: "var(--v2-tertiary)",
  boxSizing: "border-box",
  _focusWithin: { bg: "var(--v2-white)", boxShadow: "0 0 0 2px var(--v2-accent)" },
});

/** 1rem, not smaller: iOS zooms the page on focus for any input under 16px. */
const sheetSearchInput = css({
  flex: 1, minWidth: 0, border: "none", outline: "none", bg: "transparent",
  fontFamily: "inherit", fontSize: "1rem", color: "var(--v2-primary)",
  _placeholder: { color: "var(--v2-tertiary)" },
});

export default function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const reduced = useReducedMotion();
  const router = useRouter();
  const { scrollY } = useScroll();

  // §1 — evaluated every scroll frame, no debounce on the input path.
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 8));

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    // A desktop-width window has no sheet to show, so it must not stay "open".
    const wide = window.matchMedia("(min-width: 48rem)");
    const onWide = () => { if (wide.matches) setOpen(false); };
    window.addEventListener("keydown", onKey);
    wide.addEventListener("change", onWide);
    return () => {
      window.removeEventListener("keydown", onKey);
      wide.removeEventListener("change", onWide);
    };
  }, [open]);

  const search = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    setOpen(false);
    router.push(q ? `/website-v2/explore?q=${encodeURIComponent(q)}` : "/website-v2/explore");
  };

  // With the sheet open the bar is its header, so it needs the glass regardless
  // of scroll position.
  const solid = scrolled || open;

  return (
    <header className={bar}>
      <motion.div
        aria-hidden
        className={cx(materialLayer, material)}
        initial={false}
        animate={{ opacity: solid ? 1 : 0 }}
        transition={spring.ui}
        style={{
          boxShadow: solid && !open ? "var(--v2-sh-chrome)" : "none",
          background: open ? SHEET_SURFACE : undefined,
        }}
      />
      {scrolled && !open && (
        <motion.div
          aria-hidden className={scrollEdge}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={spring.ui}
        />
      )}

      <div className={inner}>
        <Link href="/website-v2" className={wordmark} onClick={() => setOpen(false)}>
          Kick Air
        </Link>

        <nav aria-label="Main" className={css({ display: { base: "none", md: "flex" }, alignItems: "center", gap: "0.125rem" })}>
          {LINKS.map((l) => (
            <MotionLink
              key={l.label}
              href={l.href}
              className={navLink}
              whileTap={reduced ? undefined : { scale: 0.96 }}
              transition={spring.quick}
            >
              {l.label}
            </MotionLink>
          ))}
        </nav>

        <div className={css({ display: "flex", alignItems: "center", gap: { base: "0.25rem", sm: "0.625rem" }, ml: "auto" })}>
          <form role="search" className={searchPill} onSubmit={search}>
            <Search size={15} aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search services"
              aria-label="Search services"
              className={searchInput}
            />
          </form>
          <ButtonLink href="/auth/sign-in" variant="ghost" size="sm">Sign in</ButtonLink>
          <ButtonLink href="/auth/sign-up" variant="primary" size="sm">Join</ButtonLink>
          <button
            type="button"
            className={menuBtn}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="v2-site-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="scrim"
              aria-hidden
              className={scrim}
              onClick={() => setOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={crossFade}
            />
            <motion.div
              key="sheet"
              id="v2-site-menu"
              className={sheet}
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: -12, scaleY: 0.96 }}
              animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0, scaleY: 1 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8, scaleY: 0.98 }}
              transition={reduced ? crossFade : spring.ui}
            >
              <nav aria-label="Main" className={css({ display: "flex", flexDirection: "column" })}>
                {LINKS.map((l) => (
                  <Link key={l.label} href={l.href} className={sheetLink} onClick={() => setOpen(false)}>
                    {l.label}
                  </Link>
                ))}
              </nav>
              <form role="search" className={sheetSearch} onSubmit={search}>
                <Search size={17} aria-hidden />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search services"
                  aria-label="Search services"
                  className={sheetSearchInput}
                />
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
