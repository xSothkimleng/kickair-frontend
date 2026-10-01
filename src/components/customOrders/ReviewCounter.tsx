"use client";

import { useState } from "react";
import { Check, Clock, RotateCcw, Star } from "lucide-react";
import { css, cx } from "styled-system/css";
import { Alert, Spinner } from "@/components/ds";
import { api } from "@/lib/api";
import { CustomOrder } from "@/types/customOrder";
import { useCommissionRate } from "@/hooks/useCommissionRate";
import { Chip, Money, coAvatar, coBtn, coBtnStart, coCard, coLabel, initials } from "./kit";
import { useCoInvalidate } from "./hooks";
import { ChangedStrip, diffTerms, firstName, roundTitle, termsOf } from "./offerRounds";
import { MONEY, platformFee } from "@/lib/moneyTerms";

const grid = css({ display: "grid", gridTemplateColumns: { base: "1fr", md: "minmax(0,1fr) 348px" }, gap: "24px", alignItems: "start" });
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

const aside = cx(coCard, css({ p: { base: "20px", md: "24px" }, position: { md: "sticky" }, top: "24px" }));
const feeBox = css({ mt: "12px", mb: "12px", p: "14px 16px", borderRadius: "12px", bg: "surface2", borderWidth: "1px", borderStyle: "solid", borderColor: "hairline", display: "flex", flexDirection: "column", gap: "6px" });
const feeRow = css({ display: "flex", justifyContent: "space-between", alignItems: "baseline", textStyle: "meta", color: "ink2" });
const feeVal = css({ fontVariantNumeric: "tabular-nums", fontWeight: 600, color: "ink" });
const feeNet = css({ display: "flex", justifyContent: "space-between", alignItems: "baseline", pt: "8px", mt: "2px", borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "hairline", textStyle: "ui", fontWeight: 700, color: "ink" });
const btnGap = css({ mt: "10px" });
const helpNote = css({ textStyle: "micro", color: "ink3", textAlign: "center", mt: "12px" });
const expiredBox = css({ display: "flex", gap: "8px", p: "12px 14px", bg: "rgba(0,0,0,0.04)", borderRadius: "10px" });
const expiredText = css({ textStyle: "meta", color: "ink2" });
const spinnerOnBlack = css({ color: "#fff" });

/**
 * The freelancer's side of a client counter-offer: what changed against their own last
 * offer, and three ways out. Agreeing re-issues the client's terms as the freelancer's
 * offer, so the client then pays; countering opens the composer pre-filled from the table.
 */
export default function ReviewCounter({ order, onChanged, onCounter }: { order: CustomOrder; onChanged: () => void; onCounter: () => void }) {
  const invalidate = useCoInvalidate();
  const rate = useCommissionRate();
  const rounds = order.offers ?? [];
  const current = rounds[rounds.length - 1] ?? null;
  const previous = rounds.length >= 2 ? rounds[rounds.length - 2] : null;
  const clientName = order.client.name ?? "the client";
  const first = firstName(clientName);
  const expired = !!order.offer?.expires_at && new Date(order.offer.expires_at).getTime() < Date.now();

  const [agreeing, setAgreeing] = useState(false);
  const [declining, setDeclining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!current) return null;

  const changes = previous ? diffTerms(termsOf(previous), termsOf(current)) : [];
  const sentOn = new Date(current.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const total = Number(current.total);
  const fee = rate != null ? total * rate : null;
  const net = fee != null ? total - fee : null;

  const handleAgree = async () => {
    setAgreeing(true);
    setError(null);
    try { await api.acceptCustomCounter(order.id); await invalidate(); onChanged(); }
    catch (e) { setError(e instanceof Error ? e.message : "Failed to agree to the counter-offer."); }
    finally { setAgreeing(false); }
  };
  const handleDecline = async () => {
    if (!window.confirm("Decline this counter-offer? This closes the request and cannot be undone.")) return;
    setDeclining(true);
    setError(null);
    try { await api.declineCustomOrder(order.id); await invalidate(); onChanged(); }
    catch (e) { setError(e instanceof Error ? e.message : "Failed to decline."); }
    finally { setDeclining(false); }
  };

  return (
    <div className={grid}>
      <div className={offerCard}>
        <div className={offerHead}>
          <div className={who}>
            <span className={coAvatar({ size: "lg" })}>{initials(clientName)}</span>
            <div>
              <p className={whoName}>{clientName}</p>
              <p className={whoMeta}><Star size={14} fill="currentColor" className={css({ color: "pending", flexShrink: 0 })} /> {roundTitle(current)} · sent {sentOn}</p>
            </div>
          </div>
          {expired ? <Chip tone="neutral">Expired</Chip> : <Chip tone="pending" dot>Your turn</Chip>}
        </div>

        {previous && <ChangedStrip heading={`Changed since your ${roundTitle(previous).toLowerCase()}`} changes={changes} keptSuffix="kept as you offered" />}

        <p className={coLabel}>Scope</p>
        <p className={scopeText}>{current.scope}</p>
        <div className={metaRow}>
          {current.delivery_days != null && <span className={metaItem}><Clock size={14} /> {current.delivery_days}-day delivery</span>}
          {current.revisions != null && <span className={metaItem}><RotateCcw size={14} /> {current.revisions} revisions</span>}
          {current.expires_at && !expired && <span className={metaItem}><Clock size={14} /> Expires {new Date(current.expires_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>}
        </div>
        {current.note && (
          <div className={noteBlock}>
            <p className={coLabel}>Note from {first}</p>
            <p className={noteText}>{current.note}</p>
          </div>
        )}
      </div>

      <div className={aside}>
        <p className={coLabel}>If you agree</p>
        <div className={feeBox}>
          <div className={feeRow}><span>{MONEY.clientPays}</span><span className={feeVal}><Money value={total} size="body" weight={600} cents /></span></div>
          {rate != null && fee != null && <div className={feeRow}><span>{platformFee(Math.round(rate * 100))}</span><span className={feeVal}>−${fee.toFixed(2)}</span></div>}
          {net != null && <div className={feeNet}><span>{MONEY.youReceive}</span><span className={feeVal}>${net.toFixed(2)}</span></div>}
        </div>

        {error && <Alert tone="error">{error}</Alert>}

        {expired ? (
          <div className={expiredBox}>
            <Clock size={15} className={css({ color: "ink3", flexShrink: 0 })} />
            <p className={expiredText}>This counter-offer expired. Send a new offer to keep the request going.</p>
          </div>
        ) : (
          <>
            <button type="button" onClick={handleAgree} disabled={agreeing || declining} className={coBtn({ tone: "black", size: "xl", strong: true, full: true })}>
              {agreeing ? <Spinner size={20} className={spinnerOnBlack} /> : <><Check size={20} className={coBtnStart} />Agree to these terms</>}
            </button>
            <button type="button" onClick={onCounter} disabled={agreeing || declining} className={cx(coBtn({ tone: "outline", size: "lg", strong: true, full: true }), btnGap)}>Counter-offer</button>
            <button type="button" onClick={handleDecline} disabled={agreeing || declining} className={cx(coBtn({ tone: "quiet", font: "ui", strong: true, full: true }), btnGap)}>
              {declining ? <Spinner size={16} /> : "Decline"}
            </button>
            <p className={helpNote}>Agreeing sends these terms back to {first}, who pays to start the order. Decline ends the request for good.</p>
          </>
        )}
      </div>
    </div>
  );
}
