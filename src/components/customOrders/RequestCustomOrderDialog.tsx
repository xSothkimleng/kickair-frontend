"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Info, Lock, Star, X } from "lucide-react";
import { css } from "styled-system/css";
import { Alert, Dialog, Spinner } from "@/components/ds";
import { BareModal } from "@/components/ds/BareModal";
import { sanitizeMoneyInput } from "@/components/ui/inputs";
import { api } from "@/lib/api";
import RichTextDisplay from "@/components/ui/RichTextDisplay";
import { CoInput, CoTextArea, Money, coAvatar, coBtn, coIconBtn, coLabel, coLabelAccent, initials } from "./kit";
import { useCoInvalidate } from "./hooks";

interface Props {
  open: boolean;
  onClose: () => void;
  serviceId: number;
  freelancerName: string;
  minBudget?: number | null;
  instructions?: string | null;
  responds?: string;
}

const panel = css({ borderWidth: "1px", borderStyle: "solid", borderColor: "hairline" });
const header = css({ display: "flex", justifyContent: "space-between", alignItems: "flex-start", p: "22px 24px 0" });

const dlgTitle = css({ fontSize: "21px", fontWeight: 600, lineHeight: 1.5, letterSpacing: "-0.02em", color: "ink" });

const sentBox = css({ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", p: "24px 36px 32px", gap: "16px" });
const sentIcon = css({ width: "64px", height: "64px", borderRadius: "50%", bg: "successTint", display: "grid", placeItems: "center" });
const sentLead = css({ fontSize: "15px", fontWeight: 500, lineHeight: 1.5, color: "ink" });
const sentBody = css({ fontSize: "13.5px", color: "ink2", lineHeight: 1.5 });

const body = css({ display: "flex", flexDirection: "column", gap: "20px", p: "20px 24px" });
const contextCard = css({ p: "16px", borderRadius: "12px", borderWidth: "1px", borderStyle: "solid", borderColor: "hairline", bg: "surface2" });
const contextRow = css({ display: "flex", alignItems: "center", gap: "12px" });
const contextName = css({ fontWeight: 600, fontSize: "15px", lineHeight: 1.5, color: "ink" });
const contextMeta = css({ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", lineHeight: 1.5, color: "ink2" });
const contextBudget = css({ textAlign: "right" });

const instrBox = css({
  display: "flex",
  gap: "8px",
  mt: "12px",
  p: "10px",
  bg: "surface",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "hairline",
  borderRadius: "9px",
});
const instrIcon = css({ color: "ink3", flex: "none", mt: "2px" });
const instrText = css({
  fontSize: "12.5px",
  color: "ink2",
  lineHeight: 1.45,
  "& p": { margin: 0 },
  "& ul, & ol": { margin: 0, paddingLeft: "20px" },
});

const labelCss = css({ fontSize: "12px", fontWeight: 600, lineHeight: 1.5, color: "ink" });
const twoCol = css({ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" });

const footer = css({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "12px",
  p: "16px 24px",
  borderTopWidth: "1px",
  borderTopStyle: "solid",
  borderTopColor: "hairline",
  bg: "surface2",
});
const footNote = css({ display: "flex", alignItems: "center", gap: "6px", color: "ink3", fontSize: "11.5px" });
const actions = css({ display: "flex", gap: "10px" });

export default function RequestCustomOrderDialog({ open, onClose, serviceId, freelancerName, minBudget, instructions, responds }: Props) {
  const router = useRouter();
  const invalidate = useCoInvalidate();
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [timeline, setTimeline] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const reset = () => {
    setDescription("");
    setBudget("");
    setTimeline("");
    setError(null);
    setSent(false);
  };

  const handleClose = () => {
    if (submitting) return;
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    const budgetNum = Number(budget.replace(/[^0-9.]/g, ""));
    if (!description.trim() || !budgetNum) {
      setError("Add a brief description and a budget.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await api.requestCustomOrder(serviceId, {
        budget: budgetNum,
        description: description.trim(),
        desired_timeline_days: timeline ? Number(timeline) : null,
      });
      await invalidate();
      setSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send your request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BareModal open={open} onOpenChange={(o) => { if (!o) handleClose(); }} maxW="600px" className={panel} closeOnInteractOutside={!submitting} closeOnEscape={!submitting}>
      {/* header */}
      <div className={header}>
        <div>
          <p className={coLabelAccent}>{sent ? "Request sent" : "Request a custom order"}</p>
          <Dialog.Title className={dlgTitle}>{sent ? "Request sent" : "Request a custom order"}</Dialog.Title>
        </div>
        <button type="button" aria-label="Close" onClick={handleClose} className={coIconBtn()}><X size={20} /></button>
      </div>

      {sent ? (
        <div className={sentBox}>
          <div className={sentIcon}>
            <CheckCircle2 size={32} className={css({ color: "success" })} />
          </div>
          <p className={sentLead}>Your request is on its way to {freelancerName.split(" ")[0]}.</p>
          <p className={sentBody}>
            {responds ? `They typically respond ${responds}. ` : ""}You&apos;ll get a notification when a custom offer arrives — nothing is charged until you accept and pay.
          </p>
          <button
            type="button"
            onClick={() => { handleClose(); router.push("/dashboard/client?tab=orders"); }}
            className={coBtn({ tone: "black", size: "md", strong: true, full: true })}>
            View my requests
          </button>
        </div>
      ) : (
        <>
          <div className={body}>
            {/* freelancer context */}
            <div className={contextCard}>
              <div className={contextRow}>
                <span className={coAvatar({ size: "md" })}>{initials(freelancerName)}</span>
                <div className={css({ flex: 1, minW: 0 })}>
                  <p className={contextName}>{freelancerName}</p>
                  <p className={contextMeta}>
                    <Star size={14} fill="currentColor" className={css({ color: "pending", flexShrink: 0 })} /> Custom orders accepted
                  </p>
                </div>
                {minBudget != null && (
                  <div className={contextBudget}>
                    <p className={coLabel}>Min budget</p>
                    <Money value={minBudget} size={15} weight={600} />
                  </div>
                )}
              </div>
              {instructions && (
                <div className={instrBox}>
                  <Info size={15} className={instrIcon} />
                  <div className={instrText}>
                    <RichTextDisplay value={instructions} />
                  </div>
                </div>
              )}
            </div>

            {error && <Alert tone="error" onClose={() => setError(null)}>{error}</Alert>}

            <div>
              <p className={labelCss}>What do you need?</p>
              <CoTextArea
                minRows={4}
                placeholder="Describe the project, what you want delivered, and any hard deadlines…"
                value={description}
                onChange={setDescription}
              />
            </div>

            <div className={twoCol}>
              <div>
                <p className={labelCss}>Budget (USD)</p>
                <CoInput
                  mono
                  value={budget}
                  onChange={(v) => setBudget(sanitizeMoneyInput(v))}
                  placeholder="0.00"
                  inputMode="decimal"
                  start="$"
                />
              </div>
              <div>
                <p className={labelCss}>Desired timeline</p>
                <CoInput
                  mono
                  value={timeline}
                  onChange={(v) => setTimeline(v.replace(/[^0-9]/g, ""))}
                  placeholder="30"
                  inputMode="numeric"
                  end="days"
                />
              </div>
            </div>
          </div>

          {/* footer */}
          <div className={footer}>
            <div className={footNote}>
              <Lock size={13} className={css({ flexShrink: 0 })} /> No charge until you accept an offer
            </div>
            <div className={actions}>
              <button type="button" onClick={handleClose} className={coBtn({ tone: "quiet", strong: true })}>Cancel</button>
              <button type="button" onClick={handleSubmit} disabled={submitting} className={coBtn({ tone: "black", size: "md", strong: true })}>
                {submitting ? <Spinner size={18} className={css({ color: "#fff" })} /> : "Send request"}
              </button>
            </div>
          </div>
        </>
      )}
    </BareModal>
  );
}
