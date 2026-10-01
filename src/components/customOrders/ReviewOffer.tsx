"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, Lock, RotateCcw, Shield, Star } from "lucide-react";
import { css, cx } from "styled-system/css";
import { Spinner } from "@/components/ds";
import { api } from "@/lib/api";
import { CustomOrder } from "@/types/customOrder";
import { Chip, Money, coAvatar, coBtn, coBtnStart, coCard, coLabel, initials } from "./kit";
import { useCoInvalidate } from "./hooks";
import FundMilestoneDialog from "./FundMilestoneDialog";
import { MONEY, ESCROW_SHORT, escrowSentence } from "@/lib/moneyTerms";
import { AgreedStrip, ChangedStrip, diffTerms, firstName, roundTitle, termsOf } from "./offerRounds";

const grid = css({ display: "grid", gridTemplateColumns: { base: "1fr", md: "minmax(0,1fr) 348px" }, gap: "24px", alignItems: "start" });
const mainCol = css({ display: "flex", flexDirection: "column", gap: "16px" });

const offerCard = cx(coCard, css({ p: { base: "20px", md: "24px" } }));
const offerHead = css({ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", mb: "18px" });
const who = css({ display: "flex", gap: "12px", alignItems: "center" });
const whoName = css({ fontWeight: 600, textStyle: "lead", color: "ink" });
const whoMeta = css({ display: "flex", alignItems: "center", gap: "4px", textStyle: "meta", color: "ink2" });
const scopeText = css({ textStyle: "body", color: "ink", whiteSpace: "pre-wrap" });
const metaRow = css({ display: "flex", gap: "18px", flexWrap: "wrap", color: "ink2", textStyle: "meta", mt: "12px" });
const metaItem = css({ display: "flex", alignItems: "center", gap: "6px" });
const noteBlock = css({ mt: "16px", pt: "14px", borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "hairline" });
const noteText = css({ textStyle: "ui", color: "ink", whiteSpace: "pre-wrap" });

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
const shieldTitle = css({ fontWeight: 600, textStyle: "body", color: "ink" });
const shieldBody = css({ textStyle: "ui", color: "ink2" });

const aside = cx(coCard, css({ p: { base: "20px", md: "24px" }, position: { md: "sticky" }, top: "24px" }));
// Neutral surface, same as the escrow explainer card: the amount is a fact, not a warning.
const payBox = css({
  p: "16px",
  mt: "12px",
  mb: "12px",
  borderRadius: "12px",
  bg: "surface2",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "hairline",
});
const payValue = css({ mt: "6px" });
const payNote = css({ textStyle: "micro", color: "ink2" });

const laterList = css({ display: "flex", flexDirection: "column", gap: "10px", mb: "16px" });
const betweenRow = css({ display: "flex", justifyContent: "space-between", alignItems: "center" });
const betweenLabel = css({ textStyle: "ui", color: "ink2" });
const errorText = css({ textStyle: "meta", color: "errorText", mb: "10px" });

const expiredBox = css({ display: "flex", gap: "8px", p: "12px 14px", bg: "rgba(0,0,0,0.04)", borderRadius: "10px" });
const expiredText = css({ textStyle: "meta", color: "ink2" });
const btnGap = css({ mt: "10px" });
const helpNote = css({ textStyle: "micro", color: "ink3", textAlign: "center", mt: "12px" });

/**
 * The client's view of the offer on the table: who sent it, what changed since the
 * client's own last round, the full terms, and the three ways to answer. Accept pays;
 * a counter keeps the request open; decline ends it.
 */
export default function ReviewOffer({ order, onChanged, onCounter }: { order: CustomOrder; onChanged: () => void; onCounter: () => void }) {
  const invalidate = useCoInvalidate();
  const offer = order.offer;
  const ms = order.milestones;
  const m1 = ms[0];
  const rounds = order.offers ?? [];
  const current = rounds[rounds.length - 1] ?? null;
  const previous = rounds.length >= 2 ? rounds[rounds.length - 2] : null;
  const freelancerName = order.freelancer.name ?? "the freelancer";
  const first = firstName(freelancerName);
  const expired = !!offer?.expires_at && new Date(offer.expires_at).getTime() < Date.now();

  const [fundOpen, setFundOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [declining, setDeclining] = useState(false);
  const [messaging, setMessaging] = useState(false);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  if (!offer || !m1) return null;

  // One-time payment: new offers carry a single payment. (Older split offers
  // may still have later phases — those keep funding as they go.)
  const payNow = m1.amount;
  const fundedLater = offer.total - payNow;
  const changes = current && previous ? diffTerms(termsOf(previous), termsOf(current)) : [];
  const sentOn = current ? new Date(current.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : null;

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
    // Declining closes the request for good, so it asks first.
    if (!window.confirm("Decline this offer? This closes the request and cannot be undone.")) return;
    setDeclining(true);
    setError(null);
    try {
      await api.withdrawCustomOrder(order.id);
      await invalidate();
      onChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not decline the offer.");
    } finally {
      setDeclining(false);
    }
  };

  // Opens the conversation with the freelancer (used when the offer has expired).
  const handleMessage = async () => {
    if (!order.freelancer.user_id) return;
    setMessaging(true);
    setError(null);
    try {
      const conversation = await api.startConversation(order.freelancer.user_id);
      router.push(`/dashboard/client/messages?id=${conversation.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not open the conversation.");
      setMessaging(false);
    }
  };

  const main = (
    <div className={mainCol}>
      <div className={offerCard}>
        <div className={offerHead}>
          <div className={who}>
            <span className={coAvatar({ size: "lg" })}>{initials(freelancerName)}</span>
            <div>
              <p className={whoName}>{freelancerName}</p>
              <p className={whoMeta}>
                <Star size={14} fill="currentColor" className={css({ color: "pending", flexShrink: 0 })} /> {current ? roundTitle(current) : "Custom offer"}{sentOn ? ` · sent ${sentOn}` : ""}
              </p>
            </div>
          </div>
          {expired ? <Chip tone="neutral">Expired</Chip> : <Chip tone="pending" dot>Your turn</Chip>}
        </div>

        {current?.accepts_previous && previous ? (
          <AgreedStrip>{first} agreed to your {roundTitle(previous).toLowerCase()} as it stood.</AgreedStrip>
        ) : previous ? (
          <ChangedStrip heading={`Changed since your ${roundTitle(previous).toLowerCase()}`} changes={changes} keptSuffix="kept as you asked" />
        ) : null}

        <p className={coLabel}>Scope</p>
        <p className={scopeText}>{offer.scope}</p>
        <div className={metaRow}>
          {offer.delivery_days != null && <span className={metaItem}><Clock size={14} /> {offer.delivery_days}-day delivery</span>}
          {offer.revisions != null && <span className={metaItem}><RotateCcw size={14} /> {offer.revisions} revisions</span>}
          {offer.expires_at && !expired && <span className={metaItem}><Clock size={14} /> Expires {new Date(offer.expires_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>}
        </div>
        {offer.note && (
          <div className={noteBlock}>
            <p className={coLabel}>Note from {first}</p>
            <p className={noteText}>{offer.note}</p>
          </div>
        )}
      </div>

      <div className={shieldCard}>
        <div className={shieldRow}>
          <div className={shieldIcon}>
            <Shield size={19} className={css({ color: "pendingText" })} />
          </div>
          <div>
            <p className={shieldTitle}>Your payment is protected</p>
            <p className={shieldBody}>{escrowSentence(first)}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const asideCol = (
    <div className={aside}>
      <p className={coLabel}>To start the project</p>
      <div className={payBox}>
        <p className={coLabel}>{MONEY.youPay}</p>
        <div className={payValue}><Money value={payNow} size="stat" weight={600} color="var(--colors-ink)" cents /></div>
        <p className={payNote}>One-time payment. {ESCROW_SHORT}</p>
      </div>
      {fundedLater > 0 && (
        <div className={laterList}>
          <Between label="Total project value"><Money value={offer.total} size="body" weight={500} /></Between>
          <Between label="Funded later"><Money value={fundedLater} size="body" weight={500} color="var(--colors-ink3)" /></Between>
        </div>
      )}

      {error && <p className={errorText}>{error}</p>}

      {expired ? (
        <>
          <div className={expiredBox}>
            <Clock size={15} className={css({ color: "ink3", flexShrink: 0 })} />
            <p className={expiredText}>This offer ran out of time, so it can no longer be accepted. {first} can send a new one. You can ask for it in a message, or decline to close the request.</p>
          </div>
          <button type="button" onClick={handleMessage} disabled={messaging || declining} className={cx(coBtn({ tone: "outline", size: "lg", strong: true, full: true }), btnGap)}>
            {messaging ? <Spinner size={16} /> : `Message ${first}`}
          </button>
          <button type="button" onClick={handleDecline} disabled={declining || messaging} className={cx(coBtn({ tone: "quiet", font: "ui", strong: true, full: true }), btnGap)}>
            {declining ? <Spinner size={16} /> : "Decline"}
          </button>
        </>
      ) : (
        <>
          <button type="button" onClick={() => setFundOpen(true)} className={coBtn({ tone: "black", size: "xl", strong: true, full: true })}>
            <Lock size={20} className={coBtnStart} />
            {MONEY.acceptAndPay}
          </button>
          <button type="button" onClick={onCounter} disabled={declining} className={cx(coBtn({ tone: "outline", size: "lg", strong: true, full: true }), btnGap)}>
            Counter-offer
          </button>
          <button type="button" onClick={handleDecline} disabled={declining} className={cx(coBtn({ tone: "quiet", font: "ui", strong: true, full: true }), btnGap)}>
            {declining ? <Spinner size={16} /> : "Decline"}
          </button>
          <p className={helpNote}>A counter-offer keeps the request open. Decline ends it for good.</p>
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
        title={MONEY.acceptAndPay}
        annotation={ESCROW_SHORT}
        ctaLabel={MONEY.acceptAndPay}
        error={error}
      />
    </>
  );
}

function Between({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className={betweenRow}>
      <p className={betweenLabel}>{label}</p>
      {children}
    </div>
  );
}
