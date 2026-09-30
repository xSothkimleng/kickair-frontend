"use client";

import {
  ArrowRight, BadgeCheck, Briefcase, GraduationCap, Sparkles, Star,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import type { ReactNode } from "react";
import { css, cx } from "styled-system/css";
import { crossFade, palette, spring, text } from "../design";
import { SERVICES } from "../explore/data";
import { Avatar } from "../ui";

/**
 * One asymmetric grid replaces four uniform card sections — Services, Freelancer
 * Empowerment, Kick Air Pro and Trust & Review. They were four scroll-lengths of
 * the same three-column grid saying different things at identical visual weight.
 * A bento gives them a hierarchy: what matters most is simply bigger.
 *
 * The three large tiles carry a rendering of the thing they describe — real
 * listings, a verified identity, a Pro record — because a tile of only words is
 * a bullet point with a border. The three small ones stay words on purpose, so
 * the imagery keeps its weight.
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

/**
 * minmax(0, 1fr), not 1fr: a bare 1fr track refuses to shrink below its
 * content's min-width, and the listing rows hold nowrap titles — on a phone that
 * pushed the whole grid wider than the screen.
 */
const grid = css({
  display: "grid",
  gridTemplateColumns: { base: "minmax(0, 1fr)", sm: "repeat(2, minmax(0, 1fr))", lg: "repeat(6, minmax(0, 1fr))" },
  gap: "1rem",
});

const tile = css({
  position: "relative",
  minWidth: 0,
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

/** Names match explore's category list exactly, so each chip lands on a real filter. */
const CHIPS = [
  "Design", "Development", "Marketing", "Video & Motion", "Writing",
  "Business", "Translation", "Tutoring", "Photography", "Music & Audio",
];

/** Three listings from three different categories, so the sample shows the range. */
const LISTED = ["Design", "Marketing", "Translation"].flatMap(
  (c) => SERVICES.find((s) => s.category === c) ?? []
);

const chip = css({
  px: "0.75rem", height: "2rem", display: "inline-flex", alignItems: "center",
  borderRadius: "var(--v2-r-pill)", fontSize: "0.8125rem",
  color: "var(--v2-secondary) !important",
  background: "var(--v2-canvas)",
  transition: "background-color 150ms ease-out, color 150ms ease-out",
  WebkitTapHighlightColor: "transparent",
  _hover: { background: "var(--v2-accentTint)", color: "var(--v2-accent) !important" },
});

/** The inset a rendering sits in — one step down the ground ramp from the tile. */
const inset = css({
  display: "flex", flexDirection: "column",
  mt: "auto",
  borderRadius: "var(--v2-r-card)",
  bg: "var(--v2-canvas)",
  px: "0.875rem",
});

const insetRow = css({
  display: "flex", alignItems: "center", gap: "0.75rem",
  py: "0.75rem", minWidth: 0,
});

const textLink = css({
  display: "inline-flex", alignItems: "center", gap: "0.375rem", mt: "0.25rem",
  fontSize: "0.8125rem", fontWeight: 500,
  color: "var(--v2-accent) !important",
  WebkitTapHighlightColor: "transparent",
  _hover: { textDecoration: "underline", textUnderlineOffset: "3px" },
});

const proMark = css({
  px: "0.3125rem", height: "1.125rem", display: "inline-flex", alignItems: "center",
  borderRadius: "0.3125rem", fontSize: "0.625rem", fontWeight: 700, letterSpacing: "0.04em",
  color: "var(--v2-white)", background: "var(--v2-primary)",
});

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
          <Tile span={css({ gridColumn: { sm: "span 2", lg: "span 3" }, gridRow: { lg: "span 2" } })}>
            <span className={iconTile} style={tint("var(--v2-accent)", "var(--v2-accentTint)")}>
              <Sparkles size={18} strokeWidth={1.9} aria-hidden />
            </span>
            <h3 className={cx(text.title, css({ color: "var(--v2-primary)" }))}>
              Twelve categories.
            </h3>
            <p className={p}>Pick a category and see people who already do this work.</p>

            <div className={css({ display: "flex", flexWrap: "wrap", gap: "0.5rem", pt: "0.5rem" })}>
              {CHIPS.map((c) => (
                <Link key={c} href={`/website-v2/explore?category=${encodeURIComponent(c)}`} className={chip}>
                  {c}
                </Link>
              ))}
            </div>

            {/* The same listings explore shows, so the picture is not a promise
                the next page breaks. */}
            <div aria-hidden className={cx(inset, css({ pt: "0.25rem", pb: "0.25rem" }))}>
              {LISTED.map((s, i) => (
                <div
                  key={s.id}
                  className={insetRow}
                  style={i > 0 ? { boxShadow: "inset 0 1px 0 var(--v2-hairline)" } : undefined}
                >
                  <span
                    className={css({
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      w: "2.25rem", h: "2.25rem", borderRadius: "var(--v2-r-tile)", flexShrink: 0,
                      fontSize: "0.875rem", fontWeight: 600,
                    })}
                    style={{ background: s.tintBg, color: s.tint }}
                  >
                    {s.category[0]}
                  </span>
                  <div className={css({ flex: 1, minWidth: 0 })}>
                    <div className={css({ fontSize: "0.8125rem", fontWeight: 600, letterSpacing: "-0.008em", color: "var(--v2-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" })}>
                      {s.title}
                    </div>
                    <div className={css({ fontSize: "0.75rem", color: "var(--v2-secondary)", mt: "0.125rem" })}>
                      {s.seller} · {s.days}-day delivery
                    </div>
                  </div>
                  <div className={css({ textAlign: "right", flexShrink: 0 })}>
                    <div className={css({ fontSize: "0.6875rem", color: "var(--v2-tertiary)" })}>From</div>
                    <div className={cx(text.money, css({ fontSize: "0.875rem", color: "var(--v2-primary)" }))}>${s.price}</div>
                  </div>
                </div>
              ))}
            </div>

            <Link href="/website-v2/explore" className={textLink}>
              Browse all services <ArrowRight size={14} aria-hidden />
            </Link>
          </Tile>

          <Tile span={css({ gridColumn: { lg: "span 3" } })}>
            <span className={iconTile} style={tint("var(--v2-secure)", "var(--v2-secureTint)")}>
              <BadgeCheck size={18} strokeWidth={1.9} aria-hidden />
            </span>
            <h3 className={h}>Verified people, not usernames</h3>
            <p className={p}>
              Every freelancer passes ID verification before they can take paid work.
            </p>
            <div aria-hidden className={inset}>
              <div className={insetRow}>
                <Avatar name="Dara Pich" size={32} />
                <span className={css({ flex: 1, minWidth: 0, fontSize: "0.8125rem", fontWeight: 600, color: "var(--v2-primary)" })}>
                  Dara Pich
                </span>
                <span
                  className={css({
                    display: "inline-flex", alignItems: "center", gap: "0.3125rem",
                    px: "0.5rem", height: "1.5rem", borderRadius: "var(--v2-r-chip)",
                    fontSize: "0.75rem", fontWeight: 550, whiteSpace: "nowrap",
                  })}
                  style={tint("var(--v2-secure)", "var(--v2-secureTint)")}
                >
                  <BadgeCheck size={13} strokeWidth={2.2} /> ID verified
                </span>
              </div>
            </div>
          </Tile>

          <Tile span={css({ gridColumn: { lg: "span 3" } })}>
            <span className={iconTile} style={tint("var(--v2-primary)", "rgba(10,10,11,0.06)")}>
              <Star size={18} strokeWidth={1.9} aria-hidden />
            </span>
            <h3 className={h}>Kick Air Pro</h3>
            <p className={p}>
              A vetted tier for the freelancers with the record to back it up.
            </p>
            <div aria-hidden className={inset}>
              <div className={insetRow}>
                <Avatar name="Sokha Chan" size={32} />
                <span className={css({ display: "inline-flex", alignItems: "center", gap: "0.375rem", flex: 1, minWidth: 0, fontSize: "0.8125rem", fontWeight: 600, color: "var(--v2-primary)" })}>
                  Sokha Chan <span className={proMark}>PRO</span>
                </span>
                <span className={css({ display: "inline-flex", alignItems: "center", gap: "0.3125rem", fontSize: "0.75rem", color: "var(--v2-secondary)", whiteSpace: "nowrap" })}>
                  <Star size={12} fill={palette.attention} color={palette.attention} />
                  <span className={css({ fontWeight: 600, color: "var(--v2-primary)" })}>4.9</span> · 128 jobs
                </span>
              </div>
            </div>
          </Tile>

          <Tile span={css({ gridColumn: { lg: "span 2" } })}>
            <span className={iconTile} style={tint("var(--v2-attention)", "var(--v2-attentionTint)")}>
              <Briefcase size={18} strokeWidth={1.9} aria-hidden />
            </span>
            <h3 className={h}>Post a job</h3>
            <p className={p}>Describe the work and let people come to you.</p>
            <Link href="/jobs" className={cx(textLink, css({ mt: "auto" }))}>
              See open jobs <ArrowRight size={14} aria-hidden />
            </Link>
          </Tile>

          <Tile span={css({ gridColumn: { lg: "span 2" } })}>
            <span className={iconTile} style={tint("var(--v2-success)", "var(--v2-successTint)")}>
              <Star size={18} strokeWidth={1.9} aria-hidden />
            </span>
            <h3 className={h}>Reviews that mean it</h3>
            <p className={p}>Only a completed, paid order can leave one.</p>
          </Tile>

          <Tile span={css({ gridColumn: { sm: "span 2", lg: "span 2" } })}>
            <span className={iconTile} style={tint("var(--v2-accent)", "var(--v2-accentTint)")}>
              <GraduationCap size={18} strokeWidth={1.9} aria-hidden />
            </span>
            <h3 className={h}>Kick Air University</h3>
            <p className={p}>Learn the skills people here are paying for.</p>
            <Link href="/kick-air-university" className={cx(textLink, css({ mt: "auto" }))}>
              Start learning <ArrowRight size={14} aria-hidden />
            </Link>
          </Tile>
        </motion.div>
      </div>
    </section>
  );
}
