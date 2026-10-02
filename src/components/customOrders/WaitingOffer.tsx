"use client";

import { Clock, RotateCcw } from "lucide-react";
import { css, cx } from "styled-system/css";
import { CustomOrder } from "@/types/customOrder";
import { useCommissionRate } from "@/hooks/useCommissionRate";
import { Chip, Money, coAvatar, coBtn, coCard, coLabel, initials } from "./kit";
import { ChangedStrip, diffTerms, firstName, isOfferExpired, roundTitle, termsOf } from "./offerRounds";
import { MONEY, platformFee } from "@/lib/moneyTerms";

const grid = css({ display: "grid", gridTemplateColumns: { base: "1fr", md: "minmax(0,1fr) 348px" }, gap: "24px", alignItems: "start" });
const offerCard = cx(coCard, css({ p: { base: "20px", md: "24px" } }));
const offerHead = css({ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", mb: "18px" });
const who = css({ display: "flex", gap: "12px", alignItems: "center" });
const whoName = css({ fontWeight: 600, textStyle: "lead", color: "ink" });
const whoMeta = css({ textStyle: "meta", color: "ink2" });
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
const payRow = css({ display: "flex", justifyContent: "space-between", alignItems: "baseline", textStyle: "ui", fontWeight: 700, color: "ink" });
const waitBox = css({ display: "flex", gap: "8px", p: "12px 14px", bg: "rgba(0,0,0,0.04)", borderRadius: "10px" });
const waitIcon = css({ color: "ink3", flexShrink: 0, mt: "2px" });
const waitText = css({ textStyle: "meta", color: "ink2" });
const btnGap = css({ mt: "12px" });

const shortDate = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });

/**
 * "Your offer is with the other side": the viewer's own offer or counter-offer, laid out
 * like the review cards (what it changed, scope, terms, note) with the money in the side
 * panel. There is nothing to decide here, so the panel says who is expected to answer.
 * When the offer has run out of time it says so, and the freelancer (the only side that
 * can restart the negotiation) gets a button to send a new one.
 */
export default function WaitingOffer({ order, viewer, onResend }: { order: CustomOrder; viewer: "client" | "freelancer"; onResend?: () => void }) {
  const rate = useCommissionRate();
  const rounds = order.offers ?? [];
  const round = rounds[rounds.length - 1] ?? null;
  const previous = rounds.length >= 2 ? rounds[rounds.length - 2] : null;
  // Legacy offers have no rounds: the terms then come from the offer itself.
  const table = round ?? order.offer;
  if (!table) return null;

  const me = viewer === "client" ? order.client.name : order.freelancer.name;
  const otherName = (viewer === "client" ? order.freelancer.name : order.client.name) ?? (viewer === "client" ? "the freelancer" : "the client");
  const first = firstName(otherName);
  const expired = isOfferExpired(order);
  const title = round ? roundTitle(round).toLowerCase() : "offer";
  const sentAt = round?.created_at ?? order.offer?.offered_at ?? null;
  const expiresAt = order.offer?.expires_at ?? table.expires_at;
  const changes = round && previous ? diffTerms(termsOf(previous), termsOf(round)) : [];
  const previousIsMine = previous?.sender_role === viewer;
  const total = Number(table.total);
  const fee = rate != null ? total * rate : null;

  return (
    <div className={grid}>
      <div className={offerCard}>
        <div className={offerHead}>
          <div className={who}>
            <span className={coAvatar({ size: "lg" })}>{initials(me)}</span>
            <div>
              <p className={whoName}>Your {title}</p>
              <p className={whoMeta}>{sentAt ? `Sent ${shortDate(sentAt)} to ${otherName}` : `Sent to ${otherName}`}</p>
            </div>
          </div>
          {expired ? <Chip tone="neutral">Expired</Chip> : <Chip tone="neutral" dot>Waiting for {first}</Chip>}
        </div>

        {previous && (
          <ChangedStrip
            heading={`Changed since ${previousIsMine ? "your" : `${first}'s`} ${roundTitle(previous).toLowerCase()}`}
            changes={changes}
            keptSuffix={previousIsMine ? "kept as you offered" : `kept as ${first} offered`}
          />
        )}

        <p className={coLabel}>Scope</p>
        <p className={scopeText}>{table.scope}</p>
        <div className={metaRow}>
          {table.delivery_days != null && <span className={metaItem}><Clock size={14} /> {table.delivery_days}-day delivery</span>}
          {table.revisions != null && <span className={metaItem}><RotateCcw size={14} /> {table.revisions} revisions</span>}
          {expiresAt && !expired && <span className={metaItem}><Clock size={14} /> Expires {shortDate(expiresAt)}</span>}
        </div>
        {table.note && (
          <div className={noteBlock}>
            <p className={coLabel}>Your note</p>
            <p className={noteText}>{table.note}</p>
          </div>
        )}
      </div>

      <div className={aside}>
        <p className={coLabel}>On the table</p>
        <div className={feeBox}>
          {viewer === "client" ? (
            <div className={payRow}><span>{MONEY.youPay}</span><span className={feeVal}><Money value={total} size="body" weight={700} cents /></span></div>
          ) : (
            <>
              <div className={feeRow}><span>{MONEY.clientPays}</span><span className={feeVal}><Money value={total} size="body" weight={600} cents /></span></div>
              {rate != null && fee != null && <div className={feeRow}><span>{platformFee(Math.round(rate * 100))}</span><span className={feeVal}>−${fee.toFixed(2)}</span></div>}
              {fee != null && <div className={feeNet}><span>{MONEY.youReceive}</span><span className={feeVal}>${(total - fee).toFixed(2)}</span></div>}
            </>
          )}
        </div>

        <div className={waitBox}>
          <Clock size={15} className={waitIcon} />
          <p className={waitText}>
            {expired
              ? `${first} did not answer in time, so this ${title.startsWith("counter") ? "counter-offer" : "offer"} can no longer be accepted. ${onResend ? "Send a new offer to keep the request going." : `${first} can send a new offer.`}`
              : `Waiting for ${first} to ${viewer === "client" ? "agree" : "accept"}, counter or decline. You'll get a notification when there is an answer.`}
          </p>
        </div>
        {expired && onResend && (
          <button type="button" onClick={onResend} className={cx(coBtn({ tone: "black", size: "lg", strong: true, full: true }), btnGap)}>Send a new offer</button>
        )}
      </div>
    </div>
  );
}
