"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { css, cva, cx } from "styled-system/css";
import { Alert, Spinner } from "@/components/ds";
import { sanitizeMoneyInput } from "@/components/ui/inputs";
import { api } from "@/lib/api";
import { CustomOrder } from "@/types/customOrder";
import { CoInput, CoTextArea, coBtn, coBtnEnd, coCard, coLabel } from "./kit";
import { useCoInvalidate } from "./hooks";
import { diffTerms, firstName, fmtDays, fmtRevisions, fmtUsd, fmtUsdShort, roundTitle, senderLabel, termsOf, type OfferTerms } from "./offerRounds";
import { MONEY } from "@/lib/moneyTerms";

const layout = css({
  display: "grid",
  gap: "20px",
  alignItems: "start",
  gridTemplateColumns: { base: "1fr", md: "minmax(0,1fr) 380px" },
  gridTemplateAreas: { base: '"table" "form" "changes"', md: '"form table" "form changes"' },
});
const formCard = cx(coCard, css({ gridArea: "form", p: { base: "16px", md: "24px" }, display: "flex", flexDirection: "column", gap: "20px" }));
const tableCard = cx(coCard, css({ gridArea: "table", p: { base: "16px", md: "20px" }, display: "flex", flexDirection: "column", gap: "12px" }));
const changesCard = cx(coCard, css({ gridArea: "changes", p: { base: "16px", md: "20px" }, display: "flex", flexDirection: "column", gap: "12px" }));

const intro = css({ mb: "20px" });
const introTitle = css({ textStyle: "title", fontWeight: 600, color: "ink" });
const introSub = css({ textStyle: "ui", color: "ink2", mt: "4px" });

const labelRow = css({ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "8px", mb: "6px" });
const label = css({ textStyle: "meta", fontWeight: 600, color: "ink" });
const labelSub = css({ color: "ink3", fontWeight: 400 });
const wasTag = css({ textStyle: "micro", fontWeight: 600, color: "#6D28D9" });
/** The kit's field draws its own border; a changed field gets the accent from outside. */
const changedField = css({ "& > div": { borderColor: "#7C3AED !important", bg: "#FAF7FF !important" } });
const numbers = css({ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", sm: { gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: "16px" } });
const priceCell = css({ gridColumn: { base: "span 2", sm: "auto" } });

const tableHead = css({ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" });
const tablePill = css({ px: "8px", py: "1px", borderRadius: "999px", borderWidth: "1px", borderStyle: "solid", borderColor: "rgba(46,125,50,0.7)", color: "#2E7D32", textStyle: "micro", fontWeight: 700, whiteSpace: "nowrap" });
const tableRows = css({ display: "flex", flexDirection: "column", gap: "8px", textStyle: "ui" });
const tableRow = css({ display: "flex", justifyContent: "space-between", gap: "8px" });
const tableKey = css({ color: "ink2" });
const tableVal = css({ fontWeight: 600, fontVariantNumeric: "tabular-nums" });
const tableToggle = css({ display: { base: "inline-flex", md: "none" }, alignSelf: "flex-start", minH: "44px", alignItems: "center", border: "none", bg: "transparent", p: 0, color: "accent", textStyle: "meta", fontWeight: 600, cursor: "pointer" });
const tableDetails = cva({
  base: { flexDirection: "column", gap: "10px" },
  variants: { open: { true: { display: "flex" }, false: { display: { base: "none", md: "flex" } } } },
});
const tableScope = css({ textStyle: "meta", color: "ink2", pt: "10px", borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "hairline", whiteSpace: "pre-wrap" });
const earlier = css({ display: "flex", flexDirection: "column", gap: "6px", pt: "10px", borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "hairline" });
const earlierRow = css({ display: "flex", justifyContent: "space-between", gap: "8px", textStyle: "meta", color: "ink2", fontVariantNumeric: "tabular-nums" });

const changeRow = css({ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "8px", textStyle: "ui" });
const changeKey = css({ color: "ink2" });
const changeFrom = css({ textDecoration: "line-through", color: "ink3", fontVariantNumeric: "tabular-nums" });
const changeTo = css({ fontWeight: 600, fontVariantNumeric: "tabular-nums", ml: "4px" });
const noChangesText = css({ textStyle: "ui", color: "ink2" });
const helpNote = css({ textStyle: "micro", color: "ink3", textAlign: "center" });
const spinnerOnBlack = css({ color: "#fff" });

const num = (v: string) => v.replace(/[^0-9]/g, "");

/**
 * The client's counter-offer. It starts as a copy of the offer on the table; every field
 * the client changes is marked, the original stays in the Order Record, and the send
 * button only wakes up once something actually differs.
 */
export default function CounterOfferForm({ order, onSent, onCancel }: { order: CustomOrder; onSent: () => void; onCancel: () => void }) {
  const invalidate = useCoInvalidate();
  const rounds = order.offers ?? [];
  const table = rounds[rounds.length - 1] ?? null;
  const base: OfferTerms = table ? termsOf(table) : { scope: order.offer?.scope ?? "", total: order.offer?.total ?? 0, delivery_days: order.offer?.delivery_days ?? null, revisions: order.offer?.revisions ?? null };
  const first = firstName(order.freelancer.name);

  const [scope, setScope] = useState(base.scope ?? "");
  const [price, setPrice] = useState(String(base.total));
  const [days, setDays] = useState(base.delivery_days != null ? String(base.delivery_days) : "");
  const [revisions, setRevisions] = useState(base.revisions != null ? String(base.revisions) : "");
  const [note, setNote] = useState("");
  const [tableOpen, setTableOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const draft: OfferTerms = {
    scope,
    total: Number(price) || 0,
    delivery_days: days === "" ? null : Number(days),
    revisions: revisions === "" ? null : Number(revisions),
  };
  const changes = diffTerms(base, draft);
  const changed = new Set(changes.map((c) => c.key));
  const noChanges = changes.length === 0;

  const reset = () => {
    setScope(base.scope ?? "");
    setPrice(String(base.total));
    setDays(base.delivery_days != null ? String(base.delivery_days) : "");
    setRevisions(base.revisions != null ? String(base.revisions) : "");
    setNote("");
    setError(null);
  };

  const handleSend = async () => {
    if (!scope.trim()) { setError("Describe the scope of work."); return; }
    if (!(draft.total >= 1)) { setError("The price must be at least $1."); return; }
    if (draft.delivery_days == null || draft.delivery_days < 1) { setError("Add a delivery time in days."); return; }
    setSubmitting(true);
    setError(null);
    try {
      await api.counterCustomOffer(order.id, {
        scope: scope.trim(),
        price: draft.total,
        delivery_days: draft.delivery_days,
        revisions: draft.revisions,
        note: note.trim() || null,
      });
      await invalidate();
      onSent();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send the counter-offer.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className={intro}>
        <p className={introTitle}>Your counter-offer to {first}</p>
        <p className={introSub}>It starts as a copy of the offer on the table. Change what you want; everything you leave alone stays as {first} offered it.</p>
      </div>

      <div className={layout}>
        {/* ── The form ── */}
        <div className={formCard}>
          <div>
            <div className={labelRow}>
              <p className={label}>Scope of work</p>
              {changed.has("scope") && <span className={wasTag}>Edited · the original stays in the record</span>}
            </div>
            <div className={changed.has("scope") ? changedField : undefined}>
              <CoTextArea radius="9" minRows={5} value={scope} onChange={setScope} />
            </div>
          </div>

          <div className={numbers}>
            <div className={priceCell}>
              <div className={labelRow}>
                <p className={label}>Price</p>
                {changed.has("price") && <span className={wasTag}>was {fmtUsdShort(base.total)}</span>}
              </div>
              <div className={changed.has("price") ? changedField : undefined}>
                <CoInput mono radius="9" inputMode="decimal" value={price} onChange={(v) => setPrice(sanitizeMoneyInput(v))} start="$" />
              </div>
            </div>
            <div>
              <div className={labelRow}>
                <p className={label}>Delivery</p>
                {changed.has("delivery") && <span className={wasTag}>was {base.delivery_days ?? "unset"}</span>}
              </div>
              <div className={changed.has("delivery") ? changedField : undefined}>
                <CoInput mono radius="9" inputMode="numeric" value={days} onChange={(v) => setDays(num(v))} end="days" />
              </div>
            </div>
            <div>
              <div className={labelRow}>
                <p className={label}>Revisions</p>
                {changed.has("revisions") && <span className={wasTag}>was {base.revisions ?? "unset"}</span>}
              </div>
              <div className={changed.has("revisions") ? changedField : undefined}>
                <CoInput mono radius="9" inputMode="numeric" value={revisions} onChange={(v) => setRevisions(num(v))} end="rounds" />
              </div>
            </div>
          </div>

          <div>
            <div className={labelRow}>
              <p className={label}>Note to {first} <span className={labelSub}>· optional</span></p>
            </div>
            <CoTextArea radius="9" minRows={3} value={note} onChange={setNote} placeholder="Say why you are changing it. It helps the other side say yes." />
          </div>
        </div>

        {/* ── The offer on the table, and the rounds before it ── */}
        <div className={tableCard}>
          <div className={tableHead}>
            <p className={coLabel}>On the table</p>
            {table && <span className={tablePill}>{roundTitle(table)} · {senderLabel(table, "client") === "you" ? "you" : first}</span>}
          </div>
          <div className={tableRows}>
            <div className={tableRow}><span className={tableKey}>Price</span><span className={tableVal}>{fmtUsd(base.total)}</span></div>
            <div className={tableRow}><span className={tableKey}>Delivery</span><span className={tableVal}>{fmtDays(base.delivery_days)}</span></div>
            <div className={tableRow}><span className={tableKey}>Revisions</span><span className={tableVal}>{fmtRevisions(base.revisions)}</span></div>
          </div>
          <button type="button" onClick={() => setTableOpen((o) => !o)} aria-expanded={tableOpen} className={tableToggle}>
            {tableOpen ? "Hide scope and earlier offers" : "Show scope and earlier offers"}
          </button>
          <div className={tableDetails({ open: tableOpen })}>
            <p className={tableScope}>{base.scope || "No scope written."}</p>
            {rounds.length > 1 && (
              <div className={earlier}>
                <p className={coLabel}>Earlier</p>
                {rounds.slice(0, -1).reverse().map((r) => (
                  <div key={r.id} className={earlierRow}>
                    <span>#{r.round} · {senderLabel(r, "client") === "you" ? "you" : first}</span>
                    <span>{fmtUsdShort(r.total)} · {fmtDays(r.delivery_days)} · {fmtRevisions(r.revisions)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── What this counter changes, and the send ── */}
        <div className={changesCard}>
          <p className={coLabel}>Your changes</p>
          {noChanges ? (
            <p className={noChangesText}>Nothing changed yet. A counter-offer has to differ from the offer on the table.</p>
          ) : (
            changes.map((c) => (
              <div key={c.key} className={changeRow}>
                <span className={changeKey}>{c.label}</span>
                <span>{c.from ? <span className={changeFrom}>{c.from}</span> : null}<span className={changeTo}>{c.to}</span></span>
              </div>
            ))
          )}
          {error && <Alert tone="error">{error}</Alert>}
          <button type="button" onClick={handleSend} disabled={noChanges || submitting} className={coBtn({ tone: "black", size: "xl", strong: true, full: true })}>
            {submitting ? <Spinner size={20} className={spinnerOnBlack} /> : <>Send counter-offer<ArrowRight size={20} className={coBtnEnd} /></>}
          </button>
          <button type="button" onClick={noChanges ? onCancel : reset} disabled={submitting} className={coBtn({ tone: "quiet", font: "ui", strong: true, full: true })}>
            {noChanges ? "Back to the offer" : `Reset to ${first}'s offer`}
          </button>
          <p className={helpNote}>{first} gets 3 days to accept, counter or decline. {MONEY.youPay} only after you both agree.</p>
        </div>
      </div>
    </>
  );
}
