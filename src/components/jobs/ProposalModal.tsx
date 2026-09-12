"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { css, cx } from "styled-system/css";
import { Dialog as Ark, Portal, Spinner } from "@/components/ds";
import { api } from "@/lib/api";
import { Proposal, CreateProposalRequest } from "@/types/job";

const money = (v: string | number) => "$" + Number(v).toLocaleString("en-US");
const stripHtml = (s: string) => s.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

const COVER_PLACEHOLDER =
  "Introduce yourself and explain why you're a great fit. What relevant work have you done? How would you approach this project, and what will you deliver?";

/* ── dialog shell (MUI `Dialog fullWidth maxWidth="sm"`, full-screen under 640px) ── */
const backdrop = css({ position: "fixed", inset: 0, zIndex: 1300, bg: "rgba(0, 0, 0, 0.5)" });
const positioner = css({
  position: "fixed", inset: 0, zIndex: 1300,
  display: "flex", alignItems: "center", justifyContent: "center",
  p: { base: "0", sm: "32px" },
});
const panel = css({
  bg: "surface",
  display: "flex",
  flexDirection: "column",
  overflowY: "auto",
  outline: "none",
  boxShadow: "0 11px 15px -7px rgba(0,0,0,0.2), 0 24px 38px 3px rgba(0,0,0,0.14), 0 9px 46px 8px rgba(0,0,0,0.12)",
  w: "100%",
  h: { base: "100%", sm: "auto" },
  maxW: { base: "100%", sm: "600px" },
  maxH: { base: "100%", sm: "calc(100% - 64px)" },
  borderRadius: { base: "0", sm: "card" },
});

/* ── header ── */
const header = css({
  display: "flex", justifyContent: "space-between", alignItems: "center",
  p: { base: "16px 18px", sm: "20px 24px" },
  borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "hairline",
  flex: "none",
});
const headTitle = css({ lineHeight: 1.5, fontSize: { base: "18px", sm: "19px" }, fontWeight: 600, letterSpacing: "-0.01em" });
const headSub = css({ lineHeight: 1.5, display: { base: "none", sm: "block" }, fontSize: "12px", color: "ink2" });
const closeBtn = css({
  w: "36px", h: "36px", p: 0, m: 0, borderRadius: "50%", border: "none",
  bg: "rgba(0,0,0,0.05)", color: "ink2", cursor: "pointer", fontFamily: "inherit",
  display: "flex", alignItems: "center", justifyContent: "center", flex: "none",
  _focusVisible: { outline: "none", boxShadow: "focusRing" },
  "& svg": { display: "block" },
});

/* ── body ── */
const body = css({ p: { base: "18px 18px 8px", sm: "22px 24px 10px" }, display: "flex", flexDirection: "column", gap: "20px" });
const recap = css({
  display: "flex", justifyContent: "space-between", alignItems: "center", gap: "14px",
  p: "13px 16px", bg: "surface2",
  borderWidth: "1px", borderStyle: "solid", borderColor: "hairline", borderRadius: "cardSm",
});
const capText = css({ lineHeight: 1.5, fontSize: "9.5px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "ink3" });
const recapTitle = css({ lineHeight: 1.5, fontSize: "13.5px", fontWeight: 600, letterSpacing: "-0.01em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" });
const recapBudget = css({ lineHeight: 1.5, fontFamily: "mono", fontSize: "14px", fontWeight: 600, color: "successText", whiteSpace: "nowrap" });
const fieldGrid = css({ display: "grid", gridTemplateColumns: { base: "1fr", sm: "1fr 1fr" }, gap: { base: "18px", sm: "16px" } });
const fieldLabel = css({ lineHeight: 1.5, display: "block", fontSize: "13.5px", fontWeight: 500, color: "ink2", mb: "7px" });
const fieldHint = css({ lineHeight: 1.5, fontSize: "11.5px", color: "ink2" });
const hintStrong = css({ color: "successText", fontWeight: 600 });
const relative = css({ position: "relative" });
const pricePrefix = css({ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", fontFamily: "mono", fontSize: "20px", fontWeight: 600, color: "ink3", pointerEvents: "none" });
const daysSuffix = css({ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", fontSize: "14px", fontWeight: 500, color: "ink3", pointerEvents: "none" });
const coverHead = css({ display: "flex", justifyContent: "space-between", alignItems: "center", mb: "7px" });
const coverLabel = css({ lineHeight: 1.5, display: "block", fontSize: "13.5px", fontWeight: 500, color: "ink2" });
const errorText = css({ lineHeight: 1.5, fontSize: "13px", color: "errorText" });

const fieldBase = css({
  w: "100%", boxSizing: "border-box", m: 0,
  borderWidth: "1px", borderStyle: "solid", borderColor: "hairlineStrong", borderRadius: "input",
  bg: "surface", color: "ink", outline: "none",
  _placeholder: { color: "ink3", opacity: 1 },
  _focus: { borderColor: "accent", boxShadow: "0 0 0 3px rgba(0, 113, 227, 0.05)" },
  _disabled: { opacity: 0.6 },
});
const priceInput = css({ h: "56px", pl: "34px", pr: "14px", fontFamily: "mono", fontSize: "22px", fontWeight: 600 });
const daysInput = css({ h: "56px", pl: "16px", pr: "64px", fontFamily: "mono", fontSize: "22px", fontWeight: 600 });
const coverInput = css({ minH: { base: "200px", sm: "184px" }, p: "14px 16px", fontFamily: "inherit", fontSize: "14.5px", lineHeight: 1.55, resize: "vertical" });

/* ── footer ── */
const footer = css({
  display: "flex", gap: "12px", justifyContent: "flex-end",
  p: { base: "14px 18px", sm: "16px 24px" },
  borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "hairline",
  flex: "none",
});
const btnBase = css({
  alignItems: "center", justifyContent: "center", gap: "8px",
  boxSizing: "border-box", m: 0, minW: "64px", border: "none",
  fontFamily: "inherit", fontWeight: 500, lineHeight: 1.75, cursor: "pointer",
  transition: "background-color .25s, color .25s",
  _focusVisible: { outline: "none", boxShadow: "focusRing" },
  _disabled: { pointerEvents: "none" },
  "& svg": { flexShrink: 0 },
});
/* `display` lives only here and on `submitBtn` — two atomic classes for one property
   are resolved by stylesheet order, not by `cx` order. */
const cancelBtn = css({
  display: { base: "none", sm: "inline-flex" },
  h: "44px", px: "16px", borderRadius: "pill", bg: "transparent", color: "ink2", fontSize: "14px",
  _hover: { bg: "rgba(0,0,0,0.04)" },
});
const submitBtn = css({
  display: "inline-flex",
  h: "52px", px: "24px", borderRadius: "pill", bg: "#000", color: "#fff", fontSize: "16px",
  w: { base: "100%", sm: "auto" },
  minW: { base: "0", sm: "190px" },
  _hover: { bg: "rgba(0,0,0,0.8)" },
  _disabled: { bg: "rgba(0,0,0,0.18)", color: "#fff" },
});

export default function ProposalModal({
  open,
  jobPostId,
  jobTitle,
  budgetMin,
  budgetMax,
  existing,
  onSaved,
  onClose,
}: {
  open: boolean;
  jobPostId: number;
  jobTitle: string;
  budgetMin: string | number;
  budgetMax: string | number;
  existing?: Proposal | null;
  onSaved: (p: Proposal) => void;
  onClose: () => void;
}) {
  const isEdit = !!existing;

  const [price, setPrice] = useState("");
  const [days, setDays] = useState("");
  const [cover, setCover] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (existing) {
      setPrice(existing.price ? String(parseInt(existing.price, 10)) : "");
      setDays(existing.timeline_days ? String(existing.timeline_days) : "");
      setCover(stripHtml(existing.cover_letter ?? ""));
    } else {
      setPrice(""); setDays(""); setCover("");
    }
    setError(null);
  }, [open, existing]);

  const submit = async () => {
    if (!price || Number(price) <= 0) return setError("Enter a price greater than 0.");
    if (!days || Number(days) < 1) return setError("Timeline must be at least 1 day.");
    if (!cover.trim()) return setError("Write a cover letter so the client knows why you're a fit.");
    setSubmitting(true);
    setError(null);
    try {
      const payload: CreateProposalRequest = { price: Number(price), timeline_days: Number(days), cover_letter: cover.trim() };
      const saved = isEdit ? await api.updateProposal(existing!.id, payload) : await api.submitProposal(jobPostId, payload);
      onSaved(saved);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to submit proposal.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Ark.Root
      open={open}
      onOpenChange={(d) => { if (!d.open && !submitting) onClose(); }}
      closeOnInteractOutside={!submitting}
      closeOnEscape={!submitting}
      lazyMount
      unmountOnExit>
      <Portal>
        <Ark.Backdrop className={backdrop} />
        <Ark.Positioner className={positioner}>
          <Ark.Content className={panel}>
            {/* Header */}
            <div className={header}>
              <div>
                <Ark.Title className={headTitle}>{isEdit ? "Edit your proposal" : "Submit a proposal"}</Ark.Title>
                <p className={headSub}>Take your time — this is your pitch to the client.</p>
              </div>
              <button type="button" onClick={onClose} aria-label="Close" className={closeBtn}>
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className={body}>
              {/* Recap */}
              <div className={recap}>
                <div className={css({ minW: 0 })}>
                  <p className={capText}>Applying to</p>
                  <p className={recapTitle}>{jobTitle}</p>
                </div>
                <div className={css({ textAlign: "right", flex: "none" })}>
                  <p className={capText}>Budget</p>
                  <p className={recapBudget}>{money(budgetMin)} – {money(budgetMax)}</p>
                </div>
              </div>

              {/* Price + timeline */}
              <div className={fieldGrid}>
                <div>
                  <label className={fieldLabel}>Your price (USD)</label>
                  <div className={relative}>
                    <span className={pricePrefix}>$</span>
                    <input
                      inputMode="numeric"
                      disabled={submitting}
                      placeholder="0"
                      value={price ? Number(price).toLocaleString("en-US") : ""}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPrice(e.target.value.replace(/[^0-9]/g, ""))}
                      className={cx(fieldBase, priceInput)} />
                  </div>
                  <p className={fieldHint}>Client&rsquo;s budget: <span className={hintStrong}>{money(budgetMin)} – {money(budgetMax)}</span></p>
                </div>
                <div>
                  <label className={fieldLabel}>Delivery timeline</label>
                  <div className={relative}>
                    <input
                      inputMode="numeric"
                      disabled={submitting}
                      placeholder="0"
                      value={days}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDays(e.target.value.replace(/[^0-9]/g, ""))}
                      className={cx(fieldBase, daysInput)} />
                    <span className={daysSuffix}>days</span>
                  </div>
                  <p className={fieldHint}>How long until you deliver final work.</p>
                </div>
              </div>

              {/* Cover letter */}
              <div>
                <div className={coverHead}>
                  <label className={coverLabel}>Cover letter</label>
                  <p className={fieldHint}>{cover.length} characters</p>
                </div>
                <textarea
                  disabled={submitting}
                  placeholder={COVER_PLACEHOLDER}
                  value={cover}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCover(e.target.value)}
                  className={cx(fieldBase, coverInput)} />
              </div>

              {error && <p className={errorText}>{error}</p>}
            </div>

            {/* Footer */}
            <div className={footer}>
              <button type="button" onClick={onClose} disabled={submitting} className={cx(btnBase, cancelBtn)}>Cancel</button>
              <button type="button" onClick={submit} disabled={submitting} className={cx(btnBase, submitBtn)}>
                {submitting && <Spinner size={16} className={css({ color: "#fff" })} />}
                {submitting ? "Submitting…" : isEdit ? "Save changes" : "Submit proposal"}
              </button>
            </div>
          </Ark.Content>
        </Ark.Positioner>
      </Portal>
    </Ark.Root>
  );
}
