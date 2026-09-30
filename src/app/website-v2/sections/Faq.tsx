"use client";

import { Plus } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { css, cx } from "styled-system/css";
import { crossFade, spring, text } from "../design";

/**
 * The first cut of this page dropped the FAQ with the rest of the thirteen
 * sections. It is back, on purpose: the brief's audience is new to hiring and
 * selling online, and these are the questions that stop someone paying a
 * stranger. Six, not the old page's open-ended list — each one is a doubt about
 * money or trust, and anything else belongs in a help centre.
 *
 * Shape: a ruled list beside a heading that stays put, not another stack of
 * cards. The page already has three card grids; a fourth would flatten them all.
 */
const FAQS = [
  {
    q: "Is my money safe?",
    a: "Yes. Your payment goes into escrow the moment you pay and stays there until you approve the delivery. The freelancer cannot withdraw it early, and neither can we.",
  },
  {
    q: "What if I am not happy with the work?",
    a: "Ask for a revision — the freelancer resubmits and you review it again. If you still disagree, open a dispute. Both sides submit evidence and an admin decides: refund, release, or split.",
  },
  {
    q: "How do I pay?",
    a: "With the methods Cambodia already uses — ABA Bank, Wing and Pi Pay — or an international card or PayPal.",
  },
  {
    q: "How do I know the reviews are real?",
    a: "Only a client who paid for an order and saw it completed can review it. There is no other way to leave one.",
  },
  {
    q: "What is Kick Air Pro?",
    a: "A vetted tier. Pro freelancers have been checked beyond ID verification and have the completed orders and ratings to show for it. Look for the PRO mark beside a name.",
  },
  {
    q: "Can I find steady work as a freelancer?",
    a: "Yes. Alongside one-off projects, clients post part-time and full-time roles with recurring contracts. Browse open jobs and send a proposal.",
  },
];

const section = css({
  bg: "var(--v2-paper)",
  px: { base: "1.25rem", sm: "2rem", lg: "2.5rem" },
  py: { base: "4.5rem", md: "7rem" },
});

const grid = css({
  maxW: "78rem",
  mx: "auto",
  display: "grid",
  gridTemplateColumns: { base: "1fr", lg: "0.8fr 1.2fr" },
  gap: { base: "2rem", lg: "5rem" },
  alignItems: "start",
});

/** Holds its place while the answers scroll past, so the list never loses its title. */
const aside = css({
  position: { lg: "sticky" },
  top: { lg: "6rem" },
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
});

const list = css({ borderTop: "1px solid var(--v2-hairlineStrong)" });
const entry = css({ borderBottom: "1px solid var(--v2-hairline)" });

const trigger = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "1.5rem",
  width: "100%",
  boxSizing: "border-box",
  minHeight: "4rem",
  py: "1.125rem",
  px: 0,
  m: 0,
  border: "none",
  bg: "transparent",
  fontFamily: "inherit",
  textAlign: "left",
  color: "var(--v2-primary)",
  cursor: "pointer",
  WebkitTapHighlightColor: "transparent",
  _focusVisible: { outline: "2px solid var(--v2-accent)", outlineOffset: "2px", borderRadius: "var(--v2-r-chip)" },
});

const question = css({
  fontSize: { base: "1.0625rem", md: "1.1875rem" },
  lineHeight: 1.3,
  letterSpacing: "-0.016em",
  fontWeight: 600,
});

const mark = css({
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  w: "1.75rem", h: "1.75rem", borderRadius: "999px", flexShrink: 0,
  bg: "rgba(10,10,11,0.05)", color: "var(--v2-secondary)",
});

export default function Faq() {
  const reduced = useReducedMotion();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="questions" className={section}>
      <div className={grid}>
        <div className={aside}>
          <h2 className={cx(text.display, css({ color: "var(--v2-primary)", maxW: "12ch" }))}>
            Fair questions.
          </h2>
          <p className={cx(text.body, css({ color: "var(--v2-secondary)", maxW: "24rem" }))}>
            Paying someone you have never met is a reasonable thing to be careful
            about. Here is exactly how it works.
          </p>
        </div>

        <div className={list}>
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q} className={entry}>
                <h3>
                  <button
                    type="button"
                    id={`v2-faq-q-${i}`}
                    className={trigger}
                    aria-expanded={isOpen}
                    aria-controls={`v2-faq-a-${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                  >
                    <span className={question}>{f.q}</span>
                    {/* A plus that turns into a close mark: one glyph, so the
                        control never swaps out from under the pointer (§8). */}
                    <motion.span
                      aria-hidden
                      className={mark}
                      initial={false}
                      animate={{ rotate: isOpen ? 45 : 0 }}
                      transition={reduced ? crossFade : spring.quick}
                    >
                      <Plus size={16} strokeWidth={2.2} />
                    </motion.span>
                  </button>
                </h3>

                {/* §3 — height is sprung, so tapping a second question while the
                    first is still closing redirects both from where they are. */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`v2-faq-a-${i}`}
                      role="region"
                      aria-labelledby={`v2-faq-q-${i}`}
                      className={css({ overflow: "hidden" })}
                      initial={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
                      animate={reduced ? { opacity: 1 } : { height: "auto", opacity: 1 }}
                      exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
                      transition={reduced ? crossFade : spring.ui}
                    >
                      {/* Padding on the wrapper: globals.css zeroes it on a bare <p>. */}
                      <div className={css({ pb: "1.5rem", pr: { md: "3.25rem" }, maxW: "40rem" })}>
                        <p className={cx(text.body, css({ color: "var(--v2-secondary)" }))}>{f.a}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
