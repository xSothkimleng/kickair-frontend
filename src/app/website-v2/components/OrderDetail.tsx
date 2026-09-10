"use client";

import {
  AlertTriangle, ArrowLeft, Check, Gavel, Lock, MessageCircle, RotateCcw, Upload, X,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { css, cx } from "styled-system/css";
import { crossFade, spring, text } from "../design";
import { Avatar, Button, EscrowBadge, Money, StatusBadge } from "../ui";
import OrderRecord from "./OrderRecord";
import type { Order } from "./orders";

/**
 * The single order page, shared by both spaces.
 *
 * One component, two audiences: the record and the summary are identical, and
 * only the action panel differs — because the *order* is one thing and the two
 * sides are just looking at it from opposite ends. Two separate order pages
 * would drift apart the first time a status was added.
 */

const backLink = cx(
  text.caption,
  css({
    display: "inline-flex", alignItems: "center", gap: "0.375rem",
    color: "var(--v2-secondary)", mb: "1rem",
    _hover: { color: "var(--v2-primary)" },
  })
);

const head = css({
  display: "flex", flexWrap: "wrap", alignItems: "flex-start",
  justifyContent: "space-between", gap: "1rem", mb: "1.5rem",
});

const cols = css({
  display: "grid",
  gridTemplateColumns: { base: "1fr", lg: "1.6fr 1fr" },
  gap: "1rem",
  alignItems: "start",
});

const panel = css({
  p: "1.375rem 1.5rem",
  bg: "var(--v2-white)",
  borderRadius: "var(--v2-r-card)",
  boxShadow: "inset 0 0 0 1px var(--v2-hairline), var(--v2-sh-card)",
});

/** The action panel is the point of the page, so it is the loudest surface. */
const actionPanel = css({
  p: "1.375rem 1.5rem",
  mb: "1rem",
  bg: "var(--v2-white)",
  borderRadius: "var(--v2-r-card)",
  boxShadow: "inset 0 0 0 2px rgba(217,119,6,0.20), var(--v2-sh-card)",
});

const quietPanel = css({
  display: "flex", alignItems: "center", gap: "0.75rem",
  p: "1rem 1.25rem", mb: "1rem",
  bg: "var(--v2-white)",
  borderRadius: "var(--v2-r-card)",
  boxShadow: "inset 0 0 0 1px var(--v2-hairline)",
});

const rowLine = css({
  display: "flex", alignItems: "center", justifyContent: "space-between",
  py: "0.625rem",
});

const dangerBtn = css({
  display: "inline-flex", alignItems: "center", gap: "0.375rem",
  px: "0.75rem", height: "2.5rem", borderRadius: "var(--v2-r-pill)",
  bg: "transparent", border: "none", fontFamily: "inherit",
  fontSize: "0.875rem", fontWeight: 500, color: "var(--v2-danger)",
  cursor: "pointer", WebkitTapHighlightColor: "transparent",
  _hover: { bg: "var(--v2-dangerTint)" },
});

const scrim = css({
  position: "fixed", inset: 0, zIndex: 90,
  bg: "rgba(10,10,11,0.45)",
  backdropFilter: "blur(4px)",
  display: "flex", alignItems: "center", justifyContent: "center",
  p: "1.25rem",
});

const dialog = css({
  width: "100%", maxW: "26rem", p: "1.5rem",
  bg: "var(--v2-white)", borderRadius: "var(--v2-r-panel)",
  boxShadow: "var(--v2-sh-float)",
});

interface Props {
  role: "client" | "freelancer";
  order: Order;
  backHref: string;
}

export default function OrderDetail({ role, order, backHref }: Props) {
  const reduced = useReducedMotion();
  const [confirming, setConfirming] = useState(false);
  const [released, setReleased] = useState(false);

  const status = released ? "completed" : order.status;
  const them = order.counterparty;
  const evidenceSent = order.events.some((e) => e.type === "evidence" && e.by === "You");

  /**
   * §16 — every state answers "what can I do here", and when the answer is
   * nothing, it says who it is waiting on rather than showing a dead button.
   */
  const waiting =
    role === "client"
      ? {
          pending: `Waiting for ${them} to accept this order.`,
          active: `${them} is working on this.`,
          revision_requested: `${them} is working on your revision.`,
          completed: "Paid and closed.",
          cancelled: "This order was cancelled.",
        }[status as string]
      : {
          delivered: `Waiting for ${them} to review your delivery.`,
          completed: "Paid. This order is closed.",
          cancelled: "This order was cancelled.",
          disputed: evidenceSent ? "Your evidence is in. An admin is reviewing the dispute." : undefined,
        }[status as string];

  const showActions = !waiting;

  return (
    <>
      <Link href={backHref} className={backLink}>
        <ArrowLeft size={14} aria-hidden /> All orders
      </Link>

      <div className={head}>
        <div>
          <div className={css({ display: "flex", alignItems: "center", gap: "0.625rem", mb: "0.4375rem" })}>
            <span className={cx(text.caption, css({ color: "var(--v2-tertiary)", fontVariantNumeric: "tabular-nums" }))}>
              {order.id}
            </span>
            <StatusBadge status={status} />
          </div>
          <h2 className={cx(text.title, css({ color: "var(--v2-primary)" }))}>{order.title}</h2>
        </div>
        <div className={css({ textAlign: "right" })}>
          <Money value={order.amount} className={css({ fontSize: "1.75rem", letterSpacing: "-0.03em", color: "var(--v2-primary)" })} />
          <div className={css({ mt: "0.4375rem" })}>
            {status === "completed" ? (
              <EscrowBadge><Check size={11} strokeWidth={3} aria-hidden /> Released</EscrowBadge>
            ) : (
              <EscrowBadge>
                <Lock size={11} strokeWidth={2.5} aria-hidden />
                {role === "client" ? "Held in escrow" : "Yours once approved"}
              </EscrowBadge>
            )}
          </div>
        </div>
      </div>

      <div className={cols}>
        <div>
          {showActions ? (
            <div className={actionPanel}>
              <h3 className={cx(text.heading, css({ color: "var(--v2-primary)", mb: "0.3125rem" }))}>
                {role === "client"
                  ? status === "delivered" ? "Your delivery is ready"
                  : status === "disputed" ? "Submit your evidence"
                  : "Something needs you"
                  : status === "pending" ? "New order — accept to start"
                  : status === "active" ? "Work in progress"
                  : status === "revision_requested" ? `${them} asked for a revision`
                  : "Submit your evidence"}
              </h3>
              <p className={cx(text.body, css({ color: "var(--v2-secondary)", mb: "1.125rem" }))}>
                {role === "client"
                  ? status === "delivered"
                    ? `Approving releases $${order.amount}.00 to ${them} immediately. Request a revision instead if it is not right — you have ${order.revisionsIncluded - order.revisionsUsed} left.`
                    : "Both sides submit evidence once, then an admin decides."
                  : status === "pending"
                  ? `${them} has already paid. The money is in escrow and is yours once they approve your work.`
                  : status === "active"
                  ? `Due ${order.due}. Submit when you are ready.`
                  : status === "revision_requested"
                  ? "Read their note in the record below, then send the updated work."
                  : "Both sides submit evidence once, then an admin decides."}
              </p>

              <div className={css({ display: "flex", flexWrap: "wrap", gap: "0.625rem", alignItems: "center" })}>
                {role === "client" && status === "delivered" && (
                  <>
                    <Button variant="primary" size="lg" onClick={() => setConfirming(true)}>
                      <Check size={16} strokeWidth={2.5} aria-hidden /> Approve &amp; release payment
                    </Button>
                    <Button variant="secondary" size="lg">
                      <RotateCcw size={15} aria-hidden /> Request revision
                    </Button>
                  </>
                )}
                {role === "freelancer" && status === "pending" && (
                  <>
                    <Button variant="primary" size="lg">Accept order</Button>
                    <Button variant="secondary" size="lg">Decline</Button>
                  </>
                )}
                {role === "freelancer" && (status === "active" || status === "revision_requested") && (
                  <Button variant="primary" size="lg">
                    <Upload size={15} aria-hidden />
                    {status === "active" ? "Submit delivery" : "Resubmit work"}
                  </Button>
                )}
                {status === "disputed" && (
                  <Button variant="primary" size="lg">
                    <Gavel size={15} aria-hidden /> Submit evidence
                  </Button>
                )}

                {["active", "delivered", "revision_requested"].includes(status) && (
                  <button type="button" className={dangerBtn}>
                    <AlertTriangle size={14} aria-hidden /> Open dispute
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className={quietPanel}>
              <span className={css({ color: "var(--v2-tertiary)", flexShrink: 0 })}>
                <Lock size={15} strokeWidth={1.9} aria-hidden />
              </span>
              <p className={cx(text.body, css({ color: "var(--v2-secondary)" }))}>{waiting}</p>
            </div>
          )}

          <section className={panel}>
            <h3 className={cx(text.heading, css({ color: "var(--v2-primary)", mb: "1.125rem" }))}>Order record</h3>
            <OrderRecord
              events={
                released
                  ? [
                      ...order.events,
                      { type: "released" as const, title: "Payment released", when: "just now", by: "You", note: `$${order.amount}.00 released from escrow to ${them}.` },
                      { type: "completed" as const, title: "Order completed", when: "just now" },
                    ]
                  : order.events
              }
            />
          </section>
        </div>

        <aside className={css({ display: "flex", flexDirection: "column", gap: "1rem" })}>
          <section className={panel}>
            <h3 className={cx(text.heading, css({ color: "var(--v2-primary)", mb: "0.5rem" }))}>
              {role === "client" ? "Freelancer" : "Client"}
            </h3>
            <div className={css({ display: "flex", alignItems: "center", gap: "0.75rem", mb: "1rem" })}>
              <Avatar name={them} size={40} />
              <div>
                <div className={css({ fontSize: "0.875rem", fontWeight: 600, color: "var(--v2-primary)" })}>{them}</div>
                <div className={cx(text.caption, css({ color: "var(--v2-secondary)" }))}>Verified · Phnom Penh</div>
              </div>
            </div>
            <Button variant="secondary" size="md" className={css({ width: "100%" })}>
              <MessageCircle size={15} aria-hidden /> Message {them.split(" ")[0]}
            </Button>
          </section>

          <section className={panel}>
            <h3 className={cx(text.heading, css({ color: "var(--v2-primary)", mb: "0.375rem" }))}>Summary</h3>
            {[
              ["Price", `$${order.amount}.00`],
              ["Delivery", `${order.delivery} day${order.delivery > 1 ? "s" : ""}`],
              ["Revisions", `${order.revisionsUsed} of ${order.revisionsIncluded} used`],
              ["Placed", order.placed],
              ["Due", order.due],
            ].map(([k, v], i, arr) => (
              <div
                key={k}
                className={rowLine}
                style={i < arr.length - 1 ? { boxShadow: "inset 0 -1px 0 var(--v2-hairline)" } : undefined}
              >
                <span className={cx(text.caption, css({ color: "var(--v2-secondary)" }))}>{k}</span>
                <span className={css({ fontSize: "0.8125rem", fontWeight: 550, color: "var(--v2-primary)", fontVariantNumeric: "tabular-nums" })}>
                  {v}
                </span>
              </div>
            ))}
          </section>

          <section className={panel}>
            <h3 className={cx(text.heading, css({ color: "var(--v2-primary)", mb: "0.5rem" }))}>Requirements</h3>
            <p className={cx(text.body, css({ color: "var(--v2-secondary)" }))}>{order.requirements}</p>
          </section>
        </aside>
      </div>

      {/* §16 Agency — a confirmation only for something genuinely irreversible.
          Releasing escrow is the one action on this page that cannot be undone.
          §12 — the dialog materializes (scale + opacity together) over a scrim
          that pushes the page back, rather than fading in flat. */}
      <AnimatePresence>
        {confirming && (
          <motion.div
            className={scrim}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={crossFade}
            onClick={() => setConfirming(false)}
          >
            <motion.div
              className={dialog}
              onClick={(e) => e.stopPropagation()}
              initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 8 }}
              animate={reduced ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 8 }}
              transition={reduced ? crossFade : spring.ui}
              role="dialog"
              aria-modal="true"
            >
              <div className={css({ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: "0.75rem" })}>
                <h3 className={cx(text.heading, css({ color: "var(--v2-primary)" }))}>
                  Release ${order.amount}.00 to {them}?
                </h3>
                <button
                  type="button"
                  aria-label="Cancel"
                  onClick={() => setConfirming(false)}
                  className={css({ bg: "transparent", border: "none", color: "var(--v2-tertiary)", cursor: "pointer", p: "0.125rem" })}
                >
                  <X size={17} aria-hidden />
                </button>
              </div>
              <p className={cx(text.body, css({ color: "var(--v2-secondary)", mb: "1.25rem" }))}>
                This cannot be undone. The money leaves escrow immediately and the
                order is closed. If the work is not right, request a revision instead.
              </p>
              <div className={css({ display: "flex", gap: "0.625rem" })}>
                <Button variant="secondary" size="md" onClick={() => setConfirming(false)} className={css({ flex: 1 })}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  className={css({ flex: 1 })}
                  onClick={() => { setReleased(true); setConfirming(false); }}
                >
                  Release payment
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
