"use client";

import { motion, useReducedMotion } from "motion/react";
import { css, cx } from "styled-system/css";
import { crossFade, spring, text } from "../design";

/**
 * Replaces the old trust-badge row — three tick marks in 13px grey under the
 * hero, which is where trust signals go to be ignored. Given their own band and
 * their own scale, the same numbers actually carry.
 */
const STATS = [
  { value: "15,000+", label: "Freelancers verified" },
  { value: "50,000+", label: "Projects completed" },
  { value: "$4.2M", label: "Released from escrow" },
  { value: "4.9/5", label: "Average rating" },
];

export default function Stats() {
  const reduced = useReducedMotion();
  const item = reduced
    ? { hidden: { opacity: 0 }, show: { opacity: 1, transition: crossFade } }
    : { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: spring.ui } };

  return (
    <section className={css({ bg: "var(--v2-paper)", px: { base: "1.25rem", sm: "2rem", lg: "2.5rem" }, py: { base: "3.5rem", md: "5rem" } })}>
      <motion.div
        className={css({
          maxW: "78rem", mx: "auto",
          display: "grid",
          gridTemplateColumns: { base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
          gap: { base: "2rem", md: "1rem" },
        })}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.4 }}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
      >
        {STATS.map((s) => (
          <motion.div key={s.label} variants={item}>
            <div
              className={cx(
                text.money,
                css({
                  fontSize: "clamp(2rem, 4vw, 3rem)",
                  lineHeight: 1.05,
                  letterSpacing: "-0.035em",
                  color: "var(--v2-primary)",
                })
              )}
            >
              {s.value}
            </div>
            <div className={cx(text.caption, css({ color: "var(--v2-secondary)", mt: "0.5rem" }))}>
              {s.label}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
