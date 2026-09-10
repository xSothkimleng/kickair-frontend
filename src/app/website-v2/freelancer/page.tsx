"use client";

import { ArrowUpRight, Lock, Upload } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { css, cx } from "styled-system/css";
import AppShell from "../components/AppShell";
import { FREELANCER_ORDERS } from "../components/orders";
import { FREELANCER } from "../components/spaces";
import { spring, text } from "../design";
import { Avatar, Button, EscrowBadge, Money, StatusBadge } from "../ui";

/**
 * The freelancer dashboard.
 *
 * Opposite job to the client side, so an opposite first screen. A freelancer is
 * doing the work and trying to get paid, so this opens on money — banked versus
 * still locked up — and then a queue of things only they can unblock. Escrow is
 * framed as "yours once approved" rather than "protected": the same mechanism,
 * read from the end that is waiting for it.
 */

const CTA: Record<string, string> = {
  pending: "Accept",
  active: "Submit delivery",
  revision_requested: "Resubmit work",
};

const earnings = css({
  display: "grid", gridTemplateColumns: { base: "1fr", md: "1.4fr 1fr 1fr" },
  gap: "0.75rem", mb: "1.75rem",
});

const card = css({
  p: "1.375rem 1.5rem", bg: "var(--v2-white)",
  borderRadius: "var(--v2-r-card)",
  boxShadow: "inset 0 0 0 1px var(--v2-hairline), var(--v2-sh-card)",
});

const statLabel = css({
  fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.05em",
  textTransform: "uppercase", color: "var(--v2-tertiary)",
});

const queueRow = css({
  display: "flex", alignItems: "center", gap: "0.875rem",
  p: "0.875rem 1.25rem", bg: "var(--v2-white)",
  borderRadius: "var(--v2-r-tile)",
  boxShadow: "inset 0 0 0 1px var(--v2-hairline)",
});

const listCard = css({
  bg: "var(--v2-white)", borderRadius: "var(--v2-r-card)", overflow: "hidden",
  boxShadow: "inset 0 0 0 1px var(--v2-hairline), var(--v2-sh-card)",
});

const row = css({
  display: "flex", alignItems: "center", gap: "0.875rem", p: "0.875rem 1.25rem",
  boxShadow: "inset 0 -1px 0 var(--v2-hairline)", _last: { boxShadow: "none" },
});

export default function FreelancerDashboard() {
  const reduced = useReducedMotion();
  const queue = FREELANCER_ORDERS.filter((o) => CTA[o.status]);
  const locked = FREELANCER_ORDERS
    .filter((o) => !["completed", "cancelled"].includes(o.status))
    .reduce((s, o) => s + o.amount, 0);

  return (
    <AppShell {...FREELANCER} activeTab="Dashboard">
      <div className={earnings}>
        <div className={card}>
          <div className={statLabel}>Available to withdraw</div>
          <div className={css({ display: "flex", alignItems: "center", gap: "0.875rem", mt: "0.5rem" })}>
            <Money value={1840} className={css({ fontSize: "2rem", letterSpacing: "-0.035em", color: "var(--v2-primary)" })} />
            <Button variant="primary" size="md">
              Withdraw <ArrowUpRight size={15} aria-hidden />
            </Button>
          </div>
        </div>
        <div className={card}>
          <div className={statLabel}>Locked in escrow</div>
          <div className={css({ mt: "0.5rem" })}>
            <Money value={locked} className={css({ fontSize: "1.5rem", letterSpacing: "-0.03em", color: "var(--v2-primary)" })} />
          </div>
          <div className={css({ mt: "0.5rem" })}>
            <EscrowBadge><Lock size={11} strokeWidth={2.5} aria-hidden /> Yours once approved</EscrowBadge>
          </div>
        </div>
        <div className={card}>
          <div className={statLabel}>Earned this month</div>
          <div className={css({ mt: "0.5rem" })}>
            <Money value={2465} className={css({ fontSize: "1.5rem", letterSpacing: "-0.03em", color: "var(--v2-primary)" })} />
          </div>
          <div className={cx(text.caption, css({ color: "var(--v2-success)", mt: "0.5rem" }))}>+18% on last month</div>
        </div>
      </div>

      <h2 className={cx(text.heading, css({ color: "var(--v2-primary)", mb: "0.75rem" }))}>Do this next</h2>
      <div className={css({ display: "flex", flexDirection: "column", gap: "0.5rem", mb: "1.75rem" })}>
        {queue.map((o) => (
          <motion.div
            key={o.id}
            className={queueRow}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 10 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={spring.ui}
          >
            <Avatar name={o.counterparty} size={34} />
            <div className={css({ flex: 1, minWidth: 0 })}>
              <div className={css({ fontSize: "0.875rem", fontWeight: 550, color: "var(--v2-primary)" })}>{o.title}</div>
              <div className={cx(text.caption, css({ color: "var(--v2-secondary)", mt: "0.125rem" }))}>
                {o.counterparty} · {o.note}
              </div>
            </div>
            <Money value={o.amount} className={css({ fontSize: "0.875rem", color: "var(--v2-primary)" })} />
            <Link href={`/website-v2/freelancer/orders/${o.id}`}>
              <Button variant={o.status === "pending" ? "primary" : "secondary"} size="sm">
                {o.status !== "pending" && <Upload size={14} aria-hidden />}
                {CTA[o.status]}
              </Button>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className={css({ display: "flex", alignItems: "center", justifyContent: "space-between", mb: "0.75rem" })}>
        <h2 className={cx(text.heading, css({ color: "var(--v2-primary)" }))}>Recent orders</h2>
        <Link href="/website-v2/freelancer/orders" className={cx(text.caption, css({ color: "var(--v2-accent)", fontWeight: 500 }))}>
          View all
        </Link>
      </div>
      <div className={listCard}>
        {FREELANCER_ORDERS.slice(0, 4).map((o) => (
          <Link key={o.id} href={`/website-v2/freelancer/orders/${o.id}`} className={css({ display: "block" })}>
            <motion.div className={row} whileHover={reduced ? undefined : { backgroundColor: "rgba(10,10,11,0.02)" }} transition={spring.quick}>
              <Avatar name={o.counterparty} size={34} />
              <div className={css({ flex: 1, minWidth: 0 })}>
                <div className={css({ fontSize: "0.875rem", fontWeight: 550, color: "var(--v2-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" })}>
                  {o.title}
                </div>
                <div className={css({ mt: "0.25rem" })}><StatusBadge status={o.status} /></div>
              </div>
              <Money value={o.amount} className={css({ fontSize: "0.875rem", color: "var(--v2-primary)" })} />
            </motion.div>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
