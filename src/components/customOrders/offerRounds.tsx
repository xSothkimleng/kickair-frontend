"use client";

import { css } from "styled-system/css";
import type { CustomOrder, CustomOrderOfferRound } from "@/types/customOrder";
import { formatUsd } from "@/lib/format";

/**
 * Shared vocabulary for the negotiation rounds: how a round is titled, who sent it as
 * seen by the viewer, how its terms print, and what changed against the round before.
 */
export type RoundViewer = "client" | "freelancer" | "admin";

export type OfferTerms = { scope: string | null; total: number; delivery_days: number | null; revisions: number | null };

/** "Offer #1" opens the negotiation; a round that agrees to the other side's terms is an offer too. */
export function roundTitle(r: CustomOrderOfferRound): string {
  return r.round === 1 || r.accepts_previous ? `Offer #${r.round}` : `Counter-offer #${r.round}`;
}

/** Lower case, the Order Record capitalises it: "you", "client", "freelancer". */
export function senderLabel(r: CustomOrderOfferRound, viewer: RoundViewer): string {
  return viewer === r.sender_role ? "you" : r.sender_role;
}

export const firstName = (name?: string | null) => (name ?? "").trim().split(" ")[0] || "them";

export const fmtUsd = (n: number) => `$${Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
// Whole dollars without decimals, cents always as two digits ("$270.50", never "$270.5").
export const fmtUsdShort = (n: number) => formatUsd(n);
export const fmtDays = (d: number | null) => (d == null ? "no delivery time" : `${d} ${d === 1 ? "day" : "days"}`);
export const fmtRevisions = (r: number | null) => (r == null ? "no revisions set" : `${r} ${r === 1 ? "revision" : "revisions"}`);

export const termsOf = (r: CustomOrderOfferRound): OfferTerms => ({ scope: r.scope, total: Number(r.total), delivery_days: r.delivery_days, revisions: r.revisions });

export interface TermChange { key: "price" | "delivery" | "revisions" | "scope"; label: string; from: string; to: string }

const LABELS: Record<TermChange["key"], string> = { price: "Price", delivery: "Delivery", revisions: "Revisions", scope: "Scope" };

/** What `cur` changed against `prev`. Empty when there is no earlier round. */
export function diffTerms(prev: OfferTerms | null, cur: OfferTerms): TermChange[] {
  if (!prev) return [];
  const out: TermChange[] = [];
  if (Number(prev.total) !== Number(cur.total)) out.push({ key: "price", label: LABELS.price, from: fmtUsdShort(prev.total), to: fmtUsdShort(cur.total) });
  if (prev.delivery_days !== cur.delivery_days) out.push({ key: "delivery", label: LABELS.delivery, from: fmtDays(prev.delivery_days), to: fmtDays(cur.delivery_days) });
  if (prev.revisions !== cur.revisions) out.push({ key: "revisions", label: LABELS.revisions, from: fmtRevisions(prev.revisions), to: fmtRevisions(cur.revisions) });
  if ((prev.scope ?? "").trim() !== (cur.scope ?? "").trim()) out.push({ key: "scope", label: LABELS.scope, from: "", to: "edited" });
  return out;
}

/** "Revisions and scope" for the fields a round left alone. */
export function keptLabels(changes: TermChange[]): string {
  const changed = new Set(changes.map((c) => c.key));
  const kept = (Object.keys(LABELS) as TermChange["key"][]).filter((k) => !changed.has(k)).map((k) => LABELS[k]);
  if (kept.length === 0) return "";
  if (kept.length === 1) return kept[0];
  return `${kept.slice(0, -1).join(", ")} and ${kept[kept.length - 1]}`.replace(/^(\w)/, (m) => m.toUpperCase());
}

/** A freelancer-initiated offer has no client request before it: its first round opens the story. */
export function isDirectOffer(order: CustomOrder): boolean {
  if (order.is_direct != null) return order.is_direct;
  const first = order.offers?.[0];
  if (!first || first.sender_role !== "freelancer") return false;
  return Math.abs(new Date(first.created_at).getTime() - new Date(order.created_at).getTime()) <= 2_000;
}

/**
 * The offer on the table ran out of time before the other side answered. The request
 * stays "offered" on the API; this is what tells the screens to stop offering Accept.
 */
export function isOfferExpired(order: CustomOrder): boolean {
  const expiresAt = order.status === "offered" ? order.offer?.expires_at : null;
  return !!expiresAt && new Date(expiresAt).getTime() < Date.now();
}

/* ── Small shared blocks ─────────────────────────────────────────────────── */

const stripCss = css({ display: "flex", flexDirection: "column", gap: "8px", p: "12px 14px", bg: "surface2", borderWidth: "1px", borderStyle: "solid", borderColor: "hairline", borderRadius: "12px", mb: "16px" });
const stripHead = css({ textStyle: "eyebrow", fontWeight: 600, color: "ink3" });
const stripRow = css({ display: "flex", gap: "8px 24px", flexWrap: "wrap", textStyle: "ui" });
const stripItem = css({ display: "flex", gap: "8px", alignItems: "baseline" });
const stripLabel = css({ color: "ink2" });
const stripFrom = css({ textDecoration: "line-through", color: "ink3", fontVariantNumeric: "tabular-nums" });
const stripTo = css({ fontWeight: 600, fontVariantNumeric: "tabular-nums" });
const stripKept = css({ fontWeight: 500, color: "ink2" });
const agreedCss = css({ display: "flex", gap: "8px", alignItems: "center", p: "12px 14px", bg: "successTint", color: "successText", borderRadius: "12px", textStyle: "ui", fontWeight: 500, mb: "16px" });

/** "Changed since your counter-offer #2": one line per changed term, then what was kept. */
export function ChangedStrip({ heading, changes, keptSuffix }: { heading: string; changes: TermChange[]; keptSuffix: string }) {
  const kept = keptLabels(changes);
  return (
    <div className={stripCss}>
      <p className={stripHead}>{heading}</p>
      <div className={stripRow}>
        {changes.map((c) => (
          <div key={c.key} className={stripItem}>
            <span className={stripLabel}>{c.label}</span>
            {c.from ? <span className={stripFrom}>{c.from}</span> : null}
            <span className={stripTo}>{c.to}</span>
          </div>
        ))}
        {kept ? <div className={stripItem}><span className={stripLabel}>{kept}</span><span className={stripKept}>{keptSuffix}</span></div> : null}
      </div>
    </div>
  );
}

export function AgreedStrip({ children }: { children: React.ReactNode }) {
  return <div className={agreedCss}>{children}</div>;
}
