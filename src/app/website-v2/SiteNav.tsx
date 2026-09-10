"use client";

import { Search } from "lucide-react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { useState } from "react";
import { css, cx } from "styled-system/css";
import { material, spring, text } from "./design";
import { Button } from "./ui";

/**
 * Marketing chrome for website-v2.
 *
 * The search field lives here rather than in the hero. On the old page it was
 * the hero's centrepiece, which put a database query at the emotional centre of
 * the front door; here the hero makes the argument and search stays available
 * the whole way down the page instead of scrolling away.
 *
 * §16 Familiarity — links are named for their contents, not safe umbrellas.
 */
const LINKS = [
  { label: "Services", href: "#services" },
  { label: "Freelancers", href: "#freelancers" },
  { label: "How escrow works", href: "#escrow" },
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
  display: "flex", alignItems: "center", gap: "1.5rem",
});

const navLink = cx(
  text.onMaterial,
  css({
    px: "0.6875rem", py: "0.5rem", borderRadius: "var(--v2-r-chip)", cursor: "pointer",
    WebkitTapHighlightColor: "transparent",
    _hover: { color: "var(--v2-primary)" },
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
  fontSize: "0.8125rem",
  cursor: "text",
  transition: "background-color 150ms ease-out",
  _hover: { bg: "rgba(10,10,11,0.08)" },
});

export default function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();

  // §1 — evaluated every scroll frame, no debounce on the input path.
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 8));

  return (
    <header className={bar}>
      <motion.div
        aria-hidden
        className={cx(materialLayer, material)}
        initial={false}
        animate={{ opacity: scrolled ? 1 : 0 }}
        transition={spring.ui}
        style={{ boxShadow: scrolled ? "var(--v2-sh-chrome)" : "none" }}
      />
      {scrolled && (
        <motion.div
          aria-hidden className={scrollEdge}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={spring.ui}
        />
      )}

      <div className={inner}>
        <span className={css({ fontSize: "1.0625rem", fontWeight: 600, letterSpacing: "-0.02em", color: "var(--v2-primary)", flexShrink: 0 })}>
          Kick Air
        </span>

        <nav className={css({ display: { base: "none", md: "flex" }, alignItems: "center", gap: "0.125rem" })}>
          {LINKS.map((l) => (
            <motion.a
              key={l.label}
              href={l.href}
              className={navLink}
              whileTap={reduced ? undefined : { scale: 0.96 }}
              transition={spring.quick}
            >
              {l.label}
            </motion.a>
          ))}
        </nav>

        <div className={css({ display: "flex", alignItems: "center", gap: "0.625rem", ml: "auto" })}>
          <label className={searchPill}>
            <Search size={15} aria-hidden />
            <span>Search services</span>
          </label>
          <Button variant="ghost" size="sm">Sign in</Button>
          <Button variant="primary" size="sm">Join</Button>
        </div>
      </div>
    </header>
  );
}
