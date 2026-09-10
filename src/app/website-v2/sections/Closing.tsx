"use client";

import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { css, cx } from "styled-system/css";
import { crossFade, spring, text } from "../design";
import { Button } from "../ui";

/** One decision, nothing else on screen competing for it. */
export default function Closing() {
  const reduced = useReducedMotion();
  return (
    <section className={css({ bg: "var(--v2-white)", px: { base: "1.25rem", sm: "2rem", lg: "2.5rem" }, py: { base: "5rem", md: "8.5rem" } })}>
      <motion.div
        className={css({
          maxW: "56rem", mx: "auto", textAlign: "center",
          display: "flex", flexDirection: "column", alignItems: "center", gap: "1.75rem",
        })}
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 20 }}
        whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={reduced ? crossFade : spring.ui}
      >
        <h2 className={cx(text.hero, css({ color: "var(--v2-primary)" }))}>Start today.</h2>
        <p className={cx(text.lead, css({ color: "var(--v2-secondary)", maxW: "32rem" }))}>
          Post a job, or put your skills up. It costs nothing until work begins.
        </p>
        <div className={css({ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0.75rem" })}>
          <Button variant="primary" size="lg">
            Hire a freelancer <ArrowRight size={16} aria-hidden />
          </Button>
          <Button variant="secondary" size="lg">Start freelancing</Button>
        </div>
      </motion.div>
    </section>
  );
}
