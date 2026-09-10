"use client";

import { Check, Gavel, Lock, Wallet } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { css, cx } from "styled-system/css";
import { crossFade, shadow, spring, text } from "../design";

/**
 * The rhythm break. Every other section on this page sits on a light ground;
 * this one is full-bleed near-black and carries exactly one idea. The old page
 * had thirteen sections on a single flat grey, which is why nothing on it felt
 * more important than anything else.
 *
 * §14 — the dark↔light boundary is a hard cut between sections, not an animated
 * brightness change, so nobody gets a luminance jump mid-scroll.
 */
const section = css({
  bg: "var(--v2-ink)",
  color: "var(--v2-onDark)",
  px: { base: "1.25rem", sm: "2rem", lg: "2.5rem" },
  py: { base: "5rem", md: "8rem" },
});

const shell = css({ maxW: "72rem", mx: "auto" });

const steps = css({
  display: "grid",
  gridTemplateColumns: { base: "1fr", md: "repeat(3, 1fr)" },
  gap: "1rem",
  mt: "3.5rem",
});

const step = css({
  position: "relative",
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",
  p: "1.5rem",
  borderRadius: "var(--v2-r-panel)",
  bg: "var(--v2-inkRaised)",
  // §12 — on a dark ground, separation is a lit top edge, not a darker shadow.
  boxShadow: "var(--v2-sh-onDark)",
});

/** Static box; the tint is inline, since Panda cannot extract a runtime value. */
const stepIcon = css({
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  w: "2.25rem", h: "2.25rem", borderRadius: "var(--v2-r-tile)", flexShrink: 0,
  background: "rgba(255,255,255,0.06)",
});

const STEPS = [
  {
    icon: Wallet,
    tint: "var(--v2-onDark)",
    n: "01",
    title: "You pay up front",
    body: "The money leaves your account and stops. The freelancer can see it is there, and starts work knowing it exists.",
  },
  {
    icon: Lock,
    tint: "#2DD4BF",
    n: "02",
    title: "We hold it",
    body: "It sits in escrow for the whole job. Neither side can touch it — not the freelancer, not us.",
  },
  {
    icon: Check,
    tint: "#4ADE80",
    n: "03",
    title: "You release it",
    body: "Approve the delivery and the freelancer is paid instantly. Nothing moves until you say so.",
  },
];

export default function Escrow() {
  const reduced = useReducedMotion();
  const item = reduced
    ? { hidden: { opacity: 0 }, show: { opacity: 1, transition: crossFade } }
    : { hidden: { opacity: 0, y: 22 }, show: { opacity: 1, y: 0, transition: spring.ui } };

  return (
    <section id="escrow" className={section}>
      <motion.div
        className={shell}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
      >
        <motion.h2
          variants={item}
          className={cx(text.display, css({ maxW: "18ch", color: "var(--v2-onDark)" }))}
        >
          Your money doesn&apos;t move until you say so.
        </motion.h2>

        <motion.p
          variants={item}
          className={cx(text.lead, css({ mt: "1.25rem", maxW: "38rem", color: "var(--v2-onDark2)" }))}
        >
          Escrow is the whole point of Kick Air. It is why hiring a stranger here
          is not a leap of faith.
        </motion.p>

        <div className={steps}>
          {STEPS.map((s) => {
            const Icon = s.icon;
            return (
              <motion.div key={s.n} className={step} variants={item}>
                <div className={css({ display: "flex", alignItems: "center", gap: "0.75rem" })}>
                  <span className={stepIcon} style={{ color: s.tint }}>
                    <Icon size={17} strokeWidth={2} aria-hidden />
                  </span>
                  <span className={css({ fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.08em", color: "var(--v2-onDark3)" })}>
                    {s.n}
                  </span>
                </div>
                <h3 className={cx(text.heading, css({ color: "var(--v2-onDark)" }))}>{s.title}</h3>
                <p className={cx(text.body, css({ color: "var(--v2-onDark2)" }))}>{s.body}</p>
              </motion.div>
            );
          })}
        </div>

        {/* The honest footnote. A trust promise that hides its failure case is
            not a trust promise (§16 Responsibility). */}
        <motion.div
          variants={item}
          className={css({
            display: "flex", alignItems: "flex-start", gap: "0.75rem",
            mt: "1rem", p: "1.25rem 1.5rem", borderRadius: "var(--v2-r-panel)",
            bg: "rgba(255,255,255,0.04)",
            boxShadow: `inset 0 0 0 1px ${"var(--v2-inkHairline)"}`,
          })}
        >
          <span className={css({ color: "var(--v2-onDark3)", mt: "0.125rem", flexShrink: 0 })}>
            <Gavel size={16} strokeWidth={1.9} aria-hidden />
          </span>
          <p className={cx(text.body, css({ color: "var(--v2-onDark2)" }))}>
            <strong className={css({ color: "var(--v2-onDark)", fontWeight: 600 })}>
              And if you disagree?
            </strong>{" "}
            Either side can open a dispute. Both submit evidence, an admin reads
            it, and the money is refunded, released, or split. One dispute open at
            a time, and every decision is on the order&apos;s record.
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}
