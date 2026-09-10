"use client";

import { ArrowRight, Lock } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { css, cx } from "styled-system/css";
import AppShell from "../components/AppShell";
import { CLIENT_ORDERS } from "../components/orders";
import { CLIENT } from "../components/spaces";
import { spring, text } from "../design";
import { Avatar, Button, EscrowBadge, Money, StatusBadge } from "../ui";

/**
 * The client dashboard.
 *
 * A client is not doing the work — they are watching it and deciding whether to
 * let the money go. So the page opens on the decision, and money is framed as an
 * obligation held rather than income earned. The freelancer dashboard opens on a
 * balance and a queue: same shell, deliberately different first screen.
 *
 * The order history lives on the order page, not here. A second copy of the
 * record on the dashboard is exactly the parallel-history trap.
 */

const stats = css({
  display: "grid", gridTemplateColumns: { base: "1fr", md: "repeat(3, 1fr)" },
  gap: "0.75rem", mb: "1.75rem",
});

const card = css({
  p: "1.125rem 1.25rem", bg: "var(--v2-white)",
  borderRadius: "var(--v2-r-card)",
  boxShadow: "inset 0 0 0 1px var(--v2-hairline), var(--v2-sh-card)",
});

const statLabel = css({
  fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.05em",
  textTransform: "uppercase", color: "var(--v2-tertiary)",
});

const reviewCard = css({
  display: "flex", flexDirection: { base: "column", lg: "row" },
  alignItems: { lg: "center" }, gap: "1rem", p: "1.25rem",
  bg: "var(--v2-white)", borderRadius: "var(--v2-r-card)",
  boxShadow: "inset 0 0 0 2px rgba(217,119,6,0.20), var(--v2-sh-card)",
});

const listCard = css({
  bg: "var(--v2-white)", borderRadius: "var(--v2-r-card)", overflow: "hidden",
  boxShadow: "inset 0 0 0 1px var(--v2-hairline), var(--v2-sh-card)",
});

const row = css({
  display: "flex", alignItems: "center", gap: "0.875rem", p: "0.875rem 1.25rem",
  boxShadow: "inset 0 -1px 0 var(--v2-hairline)", _last: { boxShadow: "none" },
});

export default function ClientDashboard() {
  const reduced = useReducedMotion();
  const needsReview = CLIENT_ORDERS.filter((o) => o.status === "delivered");
  const inEscrow = CLIENT_ORDERS
    .filter((o) => !["completed", "cancelled"].includes(o.status))
    .reduce((s, o) => s + o.amount, 0);

  return (
    <AppShell {...CLIENT} activeTab="Dashboard">
      <h2 className={cx(text.heading, css({ color: "var(--v2-primary)", mb: "0.75rem" }))}>
        Two deliveries need you
      </h2>
      <div className={css({ display: "flex", flexDirection: "column", gap: "0.75rem", mb: "1.75rem" })}>
        {needsReview.map((o) => (
          <motion.div
            key={o.id}
            className={reviewCard}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={spring.ui}
          >
            <Avatar name={o.counterparty} size={40} />
            <div className={css({ flex: 1, minWidth: 0 })}>
              <div className={css({ fontSize: "0.9375rem", fontWeight: 600, letterSpacing: "-0.012em", color: "var(--v2-primary)" })}>
                {o.title}
              </div>
              <div className={cx(text.caption, css({ color: "var(--v2-secondary)", mt: "0.125rem" }))}>
                {o.counterparty} · {o.note}
              </div>
            </div>
            <Money value={o.amount} className={css({ fontSize: "1rem", color: "var(--v2-primary)" })} />
            <Link href={`/website-v2/client/orders/${o.id}`}>
              <Button variant="primary" size="md">
                Review delivery <ArrowRight size={15} aria-hidden />
              </Button>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className={stats}>
        <div className={card}>
          <div className={statLabel}>Held in escrow</div>
          <div className={css({ display: "flex", alignItems: "center", gap: "0.625rem", mt: "0.375rem" })}>
            <Money value={inEscrow} className={css({ fontSize: "1.5rem", letterSpacing: "-0.03em", color: "var(--v2-primary)" })} />
            <EscrowBadge><Lock size={11} strokeWidth={2.5} aria-hidden /> Protected</EscrowBadge>
          </div>
        </div>
        <div className={card}>
          <div className={statLabel}>Active orders</div>
          <div className={cx(text.money, css({ fontSize: "1.5rem", letterSpacing: "-0.03em", color: "var(--v2-primary)", mt: "0.375rem" }))}>4</div>
        </div>
        <div className={card}>
          <div className={statLabel}>Completed this year</div>
          <div className={cx(text.money, css({ fontSize: "1.5rem", letterSpacing: "-0.03em", color: "var(--v2-primary)", mt: "0.375rem" }))}>17</div>
        </div>
      </div>

      <div className={css({ display: "flex", alignItems: "center", justifyContent: "space-between", mb: "0.75rem" })}>
        <h2 className={cx(text.heading, css({ color: "var(--v2-primary)" }))}>Recent orders</h2>
        <Link href="/website-v2/client/orders" className={cx(text.caption, css({ color: "var(--v2-accent)", fontWeight: 500 }))}>
          View all
        </Link>
      </div>
      <div className={listCard}>
        {CLIENT_ORDERS.slice(0, 4).map((o) => (
          <Link key={o.id} href={`/website-v2/client/orders/${o.id}`} className={css({ display: "block" })}>
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
