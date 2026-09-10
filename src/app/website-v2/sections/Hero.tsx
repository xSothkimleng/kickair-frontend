"use client";

import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { css, cx } from "styled-system/css";
import { DeliveryCard, OrderCard, ReleaseCard } from "../components/ProductCards";
import { crossFade, spring, text } from "../design";
import { Button } from "../ui";

/**
 * The composition is the change here: the old hero was centred, with a search
 * field and a badge row stacked under the headline — the standard marketplace
 * shape. This is asymmetric. Type holds the left, the product holds the right,
 * and the search moved into the nav where it belongs once you know what you
 * came for.
 */
const section = css({
  position: "relative",
  overflow: "hidden",
  bg: "var(--v2-white)",
  px: { base: "1.25rem", sm: "2rem", lg: "2.5rem" },
  pt: { base: "6.5rem", md: "9rem" },
  pb: { base: "4rem", md: "7rem" },
});

/** §14 — a static wash. Never a moving one behind reading content. */
const ambient = css({
  position: "absolute",
  inset: 0,
  pointerEvents: "none",
  backgroundImage:
    "radial-gradient(48rem 28rem at 78% 12%, rgba(0,113,227,0.11), transparent 60%), radial-gradient(38rem 24rem at 12% 88%, rgba(13,148,136,0.07), transparent 62%)",
});

const grid = css({
  position: "relative",
  maxW: "78rem",
  mx: "auto",
  display: "grid",
  gridTemplateColumns: { base: "1fr", lg: "1.05fr 0.95fr" },
  gap: { base: "3.5rem", lg: "3rem" },
  alignItems: "center",
});

const copy = css({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: "1.5rem",
});

const stage = css({
  position: "relative",
  width: "100%",
  minHeight: { base: "22rem", md: "27rem" },
});

/**
 * Each card sits at its own depth. Only the shared box is a class — the per-card
 * offsets ride on inline style, because a css() call with a spread argument is
 * invisible to Panda's static extraction and would emit no rule at all.
 */
const at = css({ position: "absolute", width: "min(21rem, 82%)" });

export default function Hero() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  /**
   * §11 — parallax on transform only, so it stays on the compositor. Each card
   * drifts at its own rate, which is what reads as depth rather than as a single
   * image sliding. Under reduced motion every rate collapses to zero.
   */
  const yBack = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : -70]);
  const yMid = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : -30]);
  const yFront = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 26]);

  const item = reduced
    ? { hidden: { opacity: 0 }, show: { opacity: 1, transition: crossFade } }
    : { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: spring.ui } };
  const container = { hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } } };

  return (
    <section className={section} ref={ref}>
      <div aria-hidden className={ambient} />

      <div className={grid}>
        <motion.div className={copy} variants={container} initial="hidden" animate="show">
          <motion.h1
            variants={item}
            className={cx(text.hero, css({ color: "var(--v2-primary)" }))}
          >
            Hire Cambodia&apos;s best.
          </motion.h1>

          <motion.p
            variants={item}
            className={cx(text.lead, css({ color: "var(--v2-secondary)", maxW: "30rem" }))}
          >
            Your money is held safely until you approve the work. Every project,
            every time.
          </motion.p>

          <motion.div
            variants={item}
            className={css({ display: "flex", flexWrap: "wrap", gap: "0.75rem", mt: "0.25rem" })}
          >
            <Button variant="primary" size="lg">
              Browse services <ArrowRight size={16} aria-hidden />
            </Button>
            <Button variant="secondary" size="lg">
              Start freelancing
            </Button>
          </motion.div>
        </motion.div>

        {/* §8 — the cards settle upward into place, so the entrance frames point
            at where the composition is going. */}
        <motion.div
          className={stage}
          variants={container}
          initial="hidden"
          animate="show"
          aria-hidden
        >
          <motion.div variants={item} className={at} style={{ y: yBack, top: "0%", right: "0%", zIndex: 1 }}>
            <div className={css({ transform: "scale(0.9)", transformOrigin: "top right", opacity: 0.96 })}>
              <DeliveryCard />
            </div>
          </motion.div>

          <motion.div variants={item} className={at} style={{ y: yMid, top: "34%", left: "0%", zIndex: 3 }}>
            <OrderCard />
          </motion.div>

          <motion.div variants={item} className={at} style={{ y: yFront, bottom: "0%", right: "4%", zIndex: 2 }}>
            <div className={css({ transform: "scale(0.94)", transformOrigin: "bottom right" })}>
              <ReleaseCard />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
