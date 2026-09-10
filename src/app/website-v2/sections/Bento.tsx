"use client";

import {
  ArrowRight, BadgeCheck, Briefcase, GraduationCap, Sparkles, Star,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { css, cx } from "styled-system/css";
import { crossFade, spring, text } from "../design";

/**
 * One asymmetric grid replaces four uniform card sections — Services, Freelancer
 * Empowerment, Kick Air Pro and Trust & Review. They were four scroll-lengths of
 * the same three-column grid saying different things at identical visual weight.
 * A bento gives them a hierarchy: what matters most is simply bigger.
 */
const section = css({ bg: "var(--v2-canvas)", px: { base: "1.25rem", sm: "2rem", lg: "2.5rem" }, py: { base: "4.5rem", md: "7rem" } });
const shell = css({ maxW: "78rem", mx: "auto" });

const head = css({
  display: "flex",
  flexDirection: { base: "column", md: "row" },
  alignItems: { base: "flex-start", md: "flex-end" },
  justifyContent: "space-between",
  gap: "1rem",
  mb: "2.5rem",
});

const grid = css({
  display: "grid",
  gridTemplateColumns: { base: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(6, 1fr)" },
  gap: "1rem",
});

const tile = css({
  position: "relative",
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",
  p: { base: "1.5rem", md: "1.75rem" },
  bg: "var(--v2-white)",
  borderRadius: "var(--v2-r-panel)",
  boxShadow: `inset 0 0 0 1px ${"var(--v2-hairline)"}, ${"var(--v2-sh-card)"}`,
  willChange: "transform",
});

/** Static box; the tint is inline, since Panda cannot extract a runtime value. */
const iconTile = css({
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  w: "2.25rem", h: "2.25rem", borderRadius: "var(--v2-r-tile)", flexShrink: 0,
});
const tint = (fg: string, bg: string) => ({ color: fg, background: bg });

const CHIPS = [
  "Design", "Development", "Marketing", "Video & Motion", "Writing",
  "Business", "Translation", "Tutoring", "Photography", "Music & Audio",
];

function Tile({ span, children }: { span: string; children: ReactNode }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={cx(tile, span)}
      variants={
        reduced
          ? { hidden: { opacity: 0 }, show: { opacity: 1, transition: crossFade } }
          : { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: spring.ui } }
      }
      whileHover={reduced ? undefined : { y: -4, boxShadow: `inset 0 0 0 1px ${"var(--v2-hairline)"}, ${"var(--v2-sh-raised)"}` }}
      transition={spring.quick}
    >
      {children}
    </motion.div>
  );
}

const h = cx(text.heading, css({ color: "var(--v2-primary)" }));
const p = cx(text.body, css({ color: "var(--v2-secondary)" }));

export default function Bento() {
  return (
    <section id="services" className={section}>
      <div className={shell}>
        <div className={head}>
          <h2 className={cx(text.display, css({ color: "var(--v2-primary)", maxW: "20ch" }))}>
            Everything the work needs.
          </h2>
          <p className={cx(text.body, css({ color: "var(--v2-secondary)", maxW: "24rem" }))}>
            Twelve categories, verified people, and a payment system that protects
            both sides of every job.
          </p>
        </div>

        <motion.div
          className={grid}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.12 }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
        >
          {/* The anchor tile — biggest, because browsing is the main path in. */}
          <Tile span={css({ gridColumn: { lg: "span 3" }, gridRow: { lg: "span 2" } })}>
            <span className={iconTile} style={tint("var(--v2-accent)", "var(--v2-accentTint)")}>
              <Sparkles size={18} strokeWidth={1.9} aria-hidden />
            </span>
            <h3 className={cx(text.title, css({ color: "var(--v2-primary)" }))}>
              Twelve categories.
            </h3>
            <p className={p}>Pick a category and see people who already do this work.</p>
            <div className={css({ display: "flex", flexWrap: "wrap", gap: "0.5rem", mt: "auto", pt: "1rem" })}>
              {CHIPS.map((c) => (
                <span
                  key={c}
                  className={css({
                    px: "0.75rem", height: "2rem", display: "inline-flex", alignItems: "center",
                    borderRadius: "var(--v2-r-pill)", fontSize: "0.8125rem", color: "var(--v2-secondary)",
                    background: "var(--v2-canvas)",
                  })}
                >
                  {c}
                </span>
              ))}
            </div>
          </Tile>

          <Tile span={css({ gridColumn: { lg: "span 3" } })}>
            <span className={iconTile} style={tint("var(--v2-secure)", "var(--v2-secureTint)")}>
              <BadgeCheck size={18} strokeWidth={1.9} aria-hidden />
            </span>
            <h3 className={h}>Verified people, not usernames</h3>
            <p className={p}>
              Every freelancer passes ID verification before they can take paid work.
            </p>
          </Tile>

          <Tile span={css({ gridColumn: { lg: "span 3" } })}>
            <span className={iconTile} style={tint("var(--v2-primary)", "rgba(10,10,11,0.06)")}>
              <Star size={18} strokeWidth={1.9} aria-hidden />
            </span>
            <h3 className={h}>Kick Air Pro</h3>
            <p className={p}>
              A vetted tier for the freelancers with the record to back it up.
            </p>
          </Tile>

          <Tile span={css({ gridColumn: { lg: "span 2" } })}>
            <span className={iconTile} style={tint("var(--v2-attention)", "var(--v2-attentionTint)")}>
              <Briefcase size={18} strokeWidth={1.9} aria-hidden />
            </span>
            <h3 className={h}>Post a job</h3>
            <p className={p}>Describe the work and let people come to you.</p>
          </Tile>

          <Tile span={css({ gridColumn: { lg: "span 2" } })}>
            <span className={iconTile} style={tint("var(--v2-success)", "var(--v2-successTint)")}>
              <Star size={18} strokeWidth={1.9} aria-hidden />
            </span>
            <h3 className={h}>Reviews that mean it</h3>
            <p className={p}>Only a completed, paid order can leave one.</p>
          </Tile>

          <Tile span={css({ gridColumn: { lg: "span 2" } })}>
            <span className={iconTile} style={tint("var(--v2-accent)", "var(--v2-accentTint)")}>
              <GraduationCap size={18} strokeWidth={1.9} aria-hidden />
            </span>
            <h3 className={h}>Kick Air University</h3>
            <p className={p}>Learn the skills people here are paying for.</p>
            <span className={css({ display: "inline-flex", alignItems: "center", gap: "0.375rem", mt: "0.25rem", fontSize: "0.8125rem", fontWeight: 500, color: "var(--v2-accent)" })}>
              Start learning <ArrowRight size={14} aria-hidden />
            </span>
          </Tile>
        </motion.div>
      </div>
    </section>
  );
}
