"use client";

import { ChevronRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { css, cx } from "styled-system/css";
import { spring, text } from "../design";
import { Avatar, Money, StatusBadge } from "../ui";
import type { Order } from "./orders";

/**
 * The Orders tab for either space.
 *
 * Filters are status chips rather than a dropdown: there are six states, they
 * are the only axis anyone filters on, and a chip shows its count without being
 * opened (§16 Simplicity — the common path first).
 */

const FILTERS = [
  { key: "all", label: "All" },
  { key: "needs_you", label: "Needs you" },
  { key: "active", label: "In progress" },
  { key: "completed", label: "Completed" },
] as const;

const chipRow = css({ display: "flex", flexWrap: "wrap", gap: "0.5rem", mb: "1rem" });

const chip = css({
  display: "inline-flex", alignItems: "center", gap: "0.4375rem",
  px: "0.875rem", height: "2.125rem", borderRadius: "var(--v2-r-pill)",
  fontSize: "0.8125rem", fontWeight: 500, fontFamily: "inherit",
  border: "none", cursor: "pointer", WebkitTapHighlightColor: "transparent",
});

const countBadge = css({
  minWidth: "1.125rem", height: "1.125rem", px: "0.25rem",
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  borderRadius: "var(--v2-r-pill)", fontSize: "0.6875rem", fontWeight: 700,
  fontVariantNumeric: "tabular-nums",
});

const list = css({
  bg: "var(--v2-white)", borderRadius: "var(--v2-r-card)", overflow: "hidden",
  boxShadow: "inset 0 0 0 1px var(--v2-hairline), var(--v2-sh-card)",
});

const row = css({
  display: "flex", alignItems: "center", gap: "1rem",
  p: "1rem 1.25rem", width: "100%",
  boxShadow: "inset 0 -1px 0 var(--v2-hairline)",
  _last: { boxShadow: "none" },
});

/** "Needs you" is role-dependent — the same status means opposite things. */
function needsYou(role: "client" | "freelancer", o: Order) {
  return role === "client"
    ? ["delivered", "disputed"].includes(o.status)
    : ["pending", "active", "revision_requested", "disputed"].includes(o.status);
}

export default function OrdersList({
  role, orders, basePath,
}: { role: "client" | "freelancer"; orders: Order[]; basePath: string }) {
  const reduced = useReducedMotion();
  const [filter, setFilter] = useState<string>("all");

  const counts = useMemo(
    () => ({
      all: orders.length,
      needs_you: orders.filter((o) => needsYou(role, o)).length,
      active: orders.filter((o) => ["pending", "active", "revision_requested", "delivered"].includes(o.status)).length,
      completed: orders.filter((o) => o.status === "completed").length,
    }),
    [orders, role]
  );

  const shown = useMemo(() => {
    if (filter === "all") return orders;
    if (filter === "needs_you") return orders.filter((o) => needsYou(role, o));
    if (filter === "active") return orders.filter((o) => ["pending", "active", "revision_requested", "delivered"].includes(o.status));
    return orders.filter((o) => o.status === "completed");
  }, [filter, orders, role]);

  return (
    <>
      <div className={chipRow}>
        {FILTERS.map((f) => {
          const on = f.key === filter;
          const n = counts[f.key];
          return (
            <motion.button
              key={f.key}
              type="button"
              className={chip}
              onClick={() => setFilter(f.key)}
              whileTap={reduced ? undefined : { scale: 0.96 }}
              transition={spring.quick}
              style={
                on
                  ? { background: "var(--v2-primary)", color: "var(--v2-white)" }
                  : { background: "var(--v2-white)", color: "var(--v2-secondary)", boxShadow: "inset 0 0 0 1px var(--v2-hairline)" }
              }
            >
              {f.label}
              <span
                className={countBadge}
                style={on
                  ? { background: "rgba(255,255,255,0.22)", color: "var(--v2-white)" }
                  : { background: "var(--v2-canvas)", color: "var(--v2-tertiary)" }}
              >
                {n}
              </span>
            </motion.button>
          );
        })}
      </div>

      <div className={list}>
        {shown.map((o) => (
          <Link key={o.id} href={`${basePath}/${o.id}`} className={css({ display: "block" })}>
            <motion.div
              className={row}
              whileHover={reduced ? undefined : { backgroundColor: "rgba(10,10,11,0.02)" }}
              whileTap={reduced ? undefined : { scale: 0.995 }}
              transition={spring.quick}
            >
              <Avatar name={o.counterparty} size={40} />
              <div className={css({ flex: 1, minWidth: 0 })}>
                <div className={css({ fontSize: "0.9375rem", fontWeight: 600, letterSpacing: "-0.012em", color: "var(--v2-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" })}>
                  {o.title}
                </div>
                <div className={cx(text.caption, css({ color: "var(--v2-secondary)", mt: "0.1875rem" }))}>
                  {o.id} · {o.counterparty} · {o.note}
                </div>
              </div>
              <div className={css({ display: { base: "none", sm: "block" } })}>
                <StatusBadge status={o.status} />
              </div>
              <Money value={o.amount} className={css({ fontSize: "0.9375rem", color: "var(--v2-primary)" })} />
              <ChevronRight size={16} className={css({ color: "var(--v2-tertiary)", flexShrink: 0 })} aria-hidden />
            </motion.div>
          </Link>
        ))}

        {shown.length === 0 && (
          <div className={css({ p: "3rem 1.25rem", textAlign: "center" })}>
            <p className={cx(text.body, css({ color: "var(--v2-secondary)" }))}>Nothing here right now.</p>
          </div>
        )}
      </div>
    </>
  );
}
