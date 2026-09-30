"use client";

import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { css, cx } from "styled-system/css";
import { EarningsCard, PayoutCard, RequestCard } from "../components/ProductCards";
import { crossFade, spring, text } from "../design";
import { ButtonLink } from "../ui";

/**
 * The other half of the market. Everything above this speaks to the person
 * paying; a freelancer scrolling the old page had to infer that escrow protects
 * them too. It does — the order is funded before they lift a finger — and that
 * is the single argument this section makes.
 *
 * Shape: the hero mirrored. Product on the left, type on the right, so the two
 * audiences get the same weight and the page does not read as one long column
 * of left-aligned headlines. The cards are not scattered like the hero's; they
 * step down the column in the order the money actually moves — funded, earned,
 * withdrawn — which is Escrow's three steps seen from the earning side.
 */
const section = css({
  bg: "var(--v2-canvas)",
  px: { base: "1.25rem", sm: "2rem", lg: "2.5rem" },
  py: { base: "4.5rem", md: "7rem" },
  scrollMarginTop: "1rem",
});

const grid = css({
  maxW: "78rem",
  mx: "auto",
  display: "grid",
  gridTemplateColumns: { base: "1fr", lg: "0.9fr 1.1fr" },
  gap: { base: "3rem", lg: "5rem" },
  alignItems: "center",
});

/** On a phone the argument comes first and the picture second. */
const stage = css({
  order: { base: 2, lg: 1 },
  display: "flex",
  flexDirection: "column",
  gap: "0.875rem",
  width: "100%",
  maxW: "30rem",
  mx: { base: "auto", lg: "0" },
});

const copy = css({
  order: { base: 1, lg: 2 },
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: "1.5rem",
});

const ways = css({
  display: "flex",
  flexDirection: "column",
  width: "100%",
  listStyle: "none",
  borderTop: "1px solid var(--v2-hairlineStrong)",
});

const way = css({
  display: "grid",
  gridTemplateColumns: { base: "1fr", sm: "12rem 1fr" },
  gap: { base: "0.25rem", sm: "1.5rem" },
  py: "1rem",
  borderBottom: "1px solid var(--v2-hairline)",
});

const seeSpace = css({
  display: "inline-flex", alignItems: "center", gap: "0.375rem",
  height: "3rem",
  fontSize: "0.9375rem", fontWeight: 500,
  color: "var(--v2-accent) !important",
  WebkitTapHighlightColor: "transparent",
  _hover: { textDecoration: "underline", textUnderlineOffset: "3px" },
});

const WAYS = [
  { title: "Sell a service", body: "Package what you do at a fixed price. Clients buy it off the shelf." },
  { title: "Bid on a job", body: "Clients post the work. You send a proposal." },
  { title: "Take a custom request", body: "A client brings the brief. Accept it as it is, or make an offer." },
];

export default function Work() {
  const reduced = useReducedMotion();
  const item = reduced
    ? { hidden: { opacity: 0 }, show: { opacity: 1, transition: crossFade } }
    : { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: spring.ui } };
  const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };

  return (
    <section id="work" className={section}>
      <div className={grid}>
        <motion.div
          aria-hidden
          className={stage}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={container}
        >
          <motion.div variants={item} className={css({ width: "90%" })}>
            <RequestCard />
          </motion.div>
          <motion.div variants={item} className={css({ width: "82%", alignSelf: "flex-end" })}>
            <EarningsCard />
          </motion.div>
          <motion.div variants={item} className={css({ width: "88%", ml: "5%" })}>
            <PayoutCard />
          </motion.div>
        </motion.div>

        <motion.div
          className={copy}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          variants={container}
        >
          <motion.span variants={item} className={cx(text.label, css({ color: "var(--v2-secure)" }))}>
            For freelancers
          </motion.span>

          <motion.h2 variants={item} className={cx(text.display, css({ color: "var(--v2-primary)", maxW: "16ch" }))}>
            Start work knowing the money is there.
          </motion.h2>

          <motion.p variants={item} className={cx(text.lead, css({ color: "var(--v2-secondary)", maxW: "34rem" }))}>
            Every order is paid into escrow before you begin. Deliver, get
            approved, and it is yours to withdraw.
          </motion.p>

          <motion.ul variants={item} className={ways}>
            {WAYS.map((w) => (
              <li key={w.title} className={way}>
                <span className={cx(text.heading, css({ color: "var(--v2-primary)" }))}>{w.title}</span>
                <span className={cx(text.body, css({ color: "var(--v2-secondary)" }))}>{w.body}</span>
              </li>
            ))}
          </motion.ul>

          <motion.div
            variants={item}
            className={css({ display: "flex", flexWrap: "wrap", alignItems: "center", columnGap: "1.5rem", rowGap: "0.25rem" })}
          >
            <ButtonLink href="/auth/sign-up" variant="primary" size="lg">
              Start freelancing <ArrowRight size={16} aria-hidden />
            </ButtonLink>
            <Link href="/website-v2/freelancer" className={seeSpace}>
              See the freelancer space <ArrowRight size={15} aria-hidden />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
