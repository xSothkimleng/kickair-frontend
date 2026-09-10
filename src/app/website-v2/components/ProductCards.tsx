"use client";

/**
 * Renderings of the product's own interface, used as the landing page's imagery.
 *
 * There is no photography, so the interface is the hero visual — Apple shows the
 * device; here the device is the marketplace. These are deliberately real: the
 * same statuses, the same escrow language and the same amounts a user will meet
 * once they sign up, so the landing page is not making a promise the app breaks
 * (§16 Familiarity).
 */
import { Check, Lock, Paperclip } from "lucide-react";
import { css, cx } from "styled-system/css";

import { Avatar, EscrowBadge, Money, StatusBadge } from "../ui";

const surface = css({
  bg: "var(--v2-white)",
  borderRadius: "var(--v2-r-card)",
  boxShadow: `inset 0 0 0 1px ${"var(--v2-hairline)"}, ${"var(--v2-sh-raised)"}`,
  p: "1rem",
  width: "100%",
});

const row = css({ display: "flex", alignItems: "center", gap: "0.75rem" });
const col = css({ display: "flex", flexDirection: "column", gap: "0.75rem" });

/** An order mid-flight — the client's most common view. */
export function OrderCard() {
  return (
    <div className={surface}>
      <div className={row}>
        <Avatar name="Sokha Chan" size={38} />
        <div className={css({ flex: 1, minWidth: 0 })}>
          <div className={css({ fontSize: "0.875rem", fontWeight: 600, letterSpacing: "-0.01em" })}>
            Brand identity &amp; logo
          </div>
          <div className={css({ fontSize: "0.75rem", color: "var(--v2-secondary)", mt: "0.125rem" })}>
            Sokha Chan · 3-day delivery
          </div>
        </div>
        <Money value={240} className={css({ fontSize: "0.9375rem" })} />
      </div>
      <div className={css({ height: "1px", bg: "var(--v2-hairline)", my: "0.875rem" })} />
      <div className={css({ display: "flex", alignItems: "center", justifyContent: "space-between" })}>
        <StatusBadge status="delivered" />
        <EscrowBadge>
          <Lock size={11} strokeWidth={2.5} aria-hidden /> In escrow
        </EscrowBadge>
      </div>
    </div>
  );
}

/** The moment the product is built around: money moving because the client said so. */
export function ReleaseCard() {
  return (
    <div className={surface}>
      <div className={cx(col, css({ gap: "0.625rem" }))}>
        <div className={row}>
          <span
            className={css({
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              w: "1.75rem", h: "1.75rem", borderRadius: "999px", flexShrink: 0,
            })}
            style={{ background: "var(--v2-successTint)", color: "var(--v2-success)" }}
          >
            <Check size={15} strokeWidth={3} aria-hidden />
          </span>
          <span className={css({ fontSize: "0.875rem", fontWeight: 600, letterSpacing: "-0.01em" })}>
            Payment released
          </span>
          <Money value={240} className={css({ marginLeft: "auto", fontSize: "0.875rem" })} />
        </div>
        <div className={css({ fontSize: "0.75rem", color: "var(--v2-secondary)", lineHeight: 1.45 })}>
          You approved the delivery. Sokha was paid instantly.
        </div>
      </div>
    </div>
  );
}

/** A delivery arriving, with files — what the freelancer sends. */
export function DeliveryCard() {
  return (
    <div className={surface}>
      <div className={css({ display: "flex", alignItems: "center", gap: "0.5rem", mb: "0.625rem" })}>
        <span className={css({ fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--v2-tertiary)" })}>
          Delivery 2
        </span>
        <span className={css({ fontSize: "0.6875rem", color: "var(--v2-tertiary)" })}>· just now</span>
      </div>
      <div className={css({ fontSize: "0.8125rem", lineHeight: 1.5, color: "var(--v2-secondary)" })}>
        Final logo files, all formats. Revisions from your notes are in.
      </div>
      <div className={cx(row, css({ gap: "0.5rem", mt: "0.75rem" }))}>
        {["logo-final.zip", "guide.pdf"].map((f) => (
          <span
            key={f}
            className={css({
              display: "inline-flex", alignItems: "center", gap: "0.3125rem",
              px: "0.5rem", height: "1.625rem", borderRadius: "var(--v2-r-chip)",
              fontSize: "0.6875rem", color: "var(--v2-secondary)",
            })}
            style={{ background: "var(--v2-canvas)" }}
          >
            <Paperclip size={11} aria-hidden /> {f}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Freelancer-side: what the money looks like from the earning end. */
export function EarningsCard() {
  return (
    <div className={surface}>
      <div className={css({ fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--v2-tertiary)" })}>
        Available to withdraw
      </div>
      <div className={css({ display: "flex", alignItems: "baseline", gap: "0.5rem", mt: "0.375rem" })}>
        <Money value={1840} className={css({ fontSize: "1.75rem", letterSpacing: "-0.03em" })} />
      </div>
      <div className={cx(row, css({ gap: "0.375rem", mt: "0.625rem" }))}>
        <EscrowBadge>
          <Lock size={11} strokeWidth={2.5} aria-hidden /> $620.00 in escrow
        </EscrowBadge>
      </div>
    </div>
  );
}
