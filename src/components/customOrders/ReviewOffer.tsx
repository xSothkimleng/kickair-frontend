"use client";

import { useState } from "react";
import { Clock, Lock, RotateCcw, Shield, Star } from "lucide-react";
import { css, cx } from "styled-system/css";
import { Spinner } from "@/components/ds";
import { api } from "@/lib/api";
import { CustomOrder } from "@/types/customOrder";
import { Chip, Money, coAvatar, coBtn, coBtnStart, coCard, coLabel, coLabelPending, initials } from "./kit";
import { useCoInvalidate } from "./hooks";
import FundMilestoneDialog from "./FundMilestoneDialog";

const grid = css({ display: "grid", gridTemplateColumns: { base: "1fr", md: "minmax(0,1fr) 348px" }, gap: "24px", alignItems: "start" });
const mainCol = css({ display: "flex", flexDirection: "column", gap: "16px" });

const offerCard = cx(coCard, css({ p: { base: "20px", md: "24px" } }));
const offerHead = css({ display: "flex", justifyContent: "space-between", gap: "12px", mb: "18px" });
const who = css({ display: "flex", gap: "12px" });
const whoName = css({ fontWeight: 600, fontSize: "15.5px", lineHeight: 1.5, color: "ink" });
const whoMeta = css({ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", lineHeight: 1.5, color: "ink2" });
const scopeText = css({ fontSize: "14px", lineHeight: 1.55, color: "ink" });
const metaRow = css({ display: "flex", gap: "18px", flexWrap: "wrap", color: "ink2", fontSize: "12.5px" });
const metaItem = css({ display: "flex", alignItems: "center", gap: "6px" });

// Same card, but on surface2 — written out rather than cx()'d over `coCard`
// so the background isn't a class-order coin flip.
const shieldCard = css({
  p: { base: "18px", md: "22px" },
  bg: "surface2",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "hairline",
  borderRadius: "card",
});
const shieldRow = css({ display: "flex", gap: "12px", alignItems: "flex-start" });
const shieldIcon = css({ width: "38px", height: "38px", borderRadius: "10px", bg: "pendingTint", display: "grid", placeItems: "center", flex: "none" });
const shieldTitle = css({ fontWeight: 600, fontSize: "14.5px", lineHeight: 1.5, color: "ink" });
const shieldBody = css({ fontSize: "13.5px", color: "ink2", lineHeight: 1.5 });

const aside = cx(coCard, css({ p: { base: "20px", md: "24px" }, position: { md: "sticky" }, top: "24px" }));
const payBox = css({
  p: "16px",
  mt: "12px",
  mb: "12px",
  borderRadius: "12px",
  bg: "pendingTint",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "rgba(234,88,12,0.18)",
});

const payValue = css({ mt: "6px" });
const payNote = css({ fontSize: "11.5px", lineHeight: 1.5, color: "pendingText", opacity: 0.85 });

const laterList = css({ display: "flex", flexDirection: "column", gap: "10px", mb: "16px" });
const betweenRow = css({ display: "flex", justifyContent: "space-between", alignItems: "center" });
const betweenLabel = css({ fontSize: "13.5px", lineHeight: 1.5, color: "ink2" });
const errorText = css({ fontSize: "12.5px", lineHeight: 1.5, color: "errorText" });

const expiredBox = css({ display: "flex", gap: "8px", p: "12px 14px", bg: "rgba(0,0,0,0.04)", borderRadius: "10px" });
const expiredText = css({ fontSize: "12.5px", lineHeight: 1.5, color: "ink2" });
const declineBtn = css({ mt: "10px" });
const escrowNote = css({ display: "flex", justifyContent: "center", alignItems: "center", gap: "6px", mt: "12px", color: "ink3", fontSize: "11.5px" });

export default function ReviewOffer({ order, onChanged }: { order: CustomOrder; onChanged: () => void }) {
  const invalidate = useCoInvalidate();
  const offer = order.offer;
  const ms = order.milestones;
  const m1 = ms[0];
  const freelancerName = order.freelancer.name ?? "the freelancer";
  const expired = !!offer?.expires_at && new Date(offer.expires_at).getTime() < Date.now();

  const [fundOpen, setFundOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [declining, setDeclining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!offer || !m1) return null;

  // One-time payment: new offers carry a single payment. (Older split offers
  // may still have later phases — those keep funding as they go.)
  const payNow = m1.amount;
  const fundedLater = offer.total - payNow;

  const handleAccept = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await api.acceptCustomOrder(order.id);
      await invalidate();
      setFundOpen(false);
      onChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to accept the offer.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDecline = async () => {
    setDeclining(true);
    try { await api.withdrawCustomOrder(order.id); await invalidate(); onChanged(); } finally { setDeclining(false); }
  };

  const main = (
    <div className={mainCol}>
      {/* freelancer + scope */}
      <div className={offerCard}>
        <div className={offerHead}>
          <div className={who}>
            <span className={coAvatar({ size: "lg" })}>{initials(freelancerName)}</span>
            <div>
              <p className={whoName}>{freelancerName}</p>
              <p className={whoMeta}>
                <Star size={14} fill="currentColor" className={css({ color: "pending", flexShrink: 0 })} /> Custom offer
              </p>
            </div>
          </div>
          {expired ? <Chip tone="neutral">Expired</Chip> : <Chip tone="pending" dot>New offer</Chip>}
        </div>
        <p className={coLabel}>Scope</p>
        <p className={scopeText}>{offer.scope}</p>
        <div className={metaRow}>
          {offer.delivery_days != null && <Span icon={<Clock size={14} />}>{offer.delivery_days}-day delivery</Span>}
          {offer.revisions != null && <Span icon={<RotateCcw size={14} />}>{offer.revisions} revisions</Span>}
          {offer.expires_at && !expired && <Span icon={<Clock size={14} />}>Expires {new Date(offer.expires_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</Span>}
        </div>
      </div>

      {/* escrow explainer */}
      <div className={shieldCard}>
        <div className={shieldRow}>
          <div className={shieldIcon}>
            <Shield size={19} className={css({ color: "pendingText" })} />
          </div>
          <div>
            <p className={shieldTitle}>Your payment is protected</p>
            <p className={shieldBody}>
              The payment goes into escrow now — it only releases to {freelancerName.split(" ")[0]} after you approve the delivery.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const asideCol = (
    <div className={aside}>
      <p className={coLabel}>To start the project</p>
      <div className={payBox}>
        <p className={coLabelPending}>You pay now</p>
        <div className={payValue}><Money value={payNow} size={32} weight={600} color="var(--colors-pending-text)" cents /></div>
        <p className={payNote}>One-time payment → held in escrow</p>
      </div>
      {fundedLater > 0 && (
        <div className={laterList}>
          <Between label="Total project value"><Money value={offer.total} size={14} weight={500} /></Between>
          <Between label="Funded later"><Money value={fundedLater} size={14} weight={500} color="var(--colors-ink3)" /></Between>
        </div>
      )}

      {error && <p className={errorText}>{error}</p>}

      {expired ? (
        <div className={expiredBox}>
          <Clock size={15} className={css({ color: "ink3", flexShrink: 0 })} />
          <p className={expiredText}>This offer expired. Ask {freelancerName.split(" ")[0]} to resend it.</p>
        </div>
      ) : (
        <>
          <button type="button" onClick={() => setFundOpen(true)} className={coBtn({ tone: "black", size: "xl", strong: true, full: true })}>
            <Lock size={20} className={coBtnStart} />
            Accept &amp; Pay
          </button>
          <button type="button" onClick={handleDecline} disabled={declining} className={cx(coBtn({ tone: "quiet", font: "13.5", strong: true, full: true }), declineBtn)}>
            {declining ? <Spinner size={16} /> : "Decline"}
          </button>
          <div className={escrowNote}>
            <Lock size={12} /> Funds held in escrow · refundable until delivery
          </div>
        </>
      )}
    </div>
  );

  return (
    <>
      <div className={grid}>
        {main}
        {asideCol}
      </div>
      <FundMilestoneDialog
        open={fundOpen}
        onClose={() => setFundOpen(false)}
        milestoneTitle={m1.title}
        amount={payNow}
        onConfirm={handleAccept}
        submitting={submitting}
        title="Fund the project"
        annotation="Accept & fund into escrow"
        ctaLabel={`Confirm & pay $${payNow.toLocaleString()}`}
        error={error}
      />
    </>
  );
}

function Span({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return <div className={metaItem}>{icon}{children}</div>;
}

function Between({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className={betweenRow}>
      <p className={betweenLabel}>{label}</p>
      {children}
    </div>
  );
}
