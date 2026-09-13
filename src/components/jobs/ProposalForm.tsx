"use client";

import { useState } from "react";
import { Clock } from "lucide-react";
import { css, cx } from "styled-system/css";
import { Alert, Spinner } from "@/components/ds";
import { api } from "@/lib/api";
import { Proposal, CreateProposalRequest } from "@/types/job";
import RichTextEditor from "@/components/ui/RichTextEditor";
import { TextInput } from "@/components/ui/inputs";

interface ProposalFormProps {
  jobPostId: number;
  existing?: Proposal | null;
  onSaved: (proposal: Proposal) => void;
  onCancel: () => void;
}

const stack = css({ display: "flex", flexDirection: "column", gap: "20px" });
const heading = css({ textStyle: "body", fontWeight: 700 });
const subHeading = css({ textStyle: "meta", color: "ink2" });
const alertTweak = css({ borderRadius: "12px", textStyle: "meta", py: "4px" });
const endAdornment = css({ display: "inline-flex", alignItems: "center", gap: "4px", "& svg": { flexShrink: 0 } });
const endAdornmentText = css({ textStyle: "meta" });
const fieldLabel = css({ textStyle: "ui", fontWeight: 500, color: "#334155" });
const actions = css({ display: "flex", gap: "8px" });

/* Button medium metrics (min-width 64, 6px/16px padding). */
const btnBase = css({
  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px",
  boxSizing: "border-box", m: 0, minW: "64px", borderRadius: "12px",
  textStyle: "ui", cursor: "pointer",
  transition: "background-color .25s, border-color .25s, color .25s",
  _focusVisible: { outline: "none", boxShadow: "focusRing" },
  _disabled: { pointerEvents: "none" },
});
const cancelBtn = css({
  flex: 1, p: "5px 15px", fontWeight: 500,
  borderWidth: "1px", borderStyle: "solid", borderColor: "rgba(0, 0, 0, 0.12)",
  bg: "transparent", color: "ink2",
  _hover: { borderColor: "rgba(0,0,0,0.3)", bg: "transparent", color: "ink" },
});
const submitBtn = css({
  flex: 2, p: "6px 16px", fontWeight: 600, border: "none",
  bg: "#1976d2", color: "white",
  _hover: { bg: "#1565c0" },
  _disabled: { bg: "rgba(0, 0, 0, 0.12)", color: "rgba(0, 0, 0, 0.26)" },
});

export default function ProposalForm({ jobPostId, existing, onSaved, onCancel }: ProposalFormProps) {
  const isEditing = !!existing;

  const [price, setPrice] = useState(existing?.price ?? "");
  const [timelineDays, setTimelineDays] = useState(existing?.timeline_days ? String(existing.timeline_days) : "");
  const [coverLetter, setCoverLetter] = useState(existing?.cover_letter ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!price) {
      setError("Price is required.");
      return;
    }
    if (Number(price) <= 0) {
      setError("Price must be greater than 0.");
      return;
    }
    if (!timelineDays || Number(timelineDays) < 1) {
      setError("Timeline must be at least 1 day.");
      return;
    }
    if (!coverLetter.trim() || coverLetter === "<p></p>") {
      setError("Cover letter is required.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const payload: CreateProposalRequest = {
        price: Number(price),
        timeline_days: Number(timelineDays),
        cover_letter: coverLetter,
      };
      const saved = isEditing ? await api.updateProposal(existing!.id, payload) : await api.submitProposal(jobPostId, payload);
      onSaved(saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit proposal.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={stack}>
      <div>
        <p className={heading}>
          {isEditing ? "Edit Your Proposal" : "Submit a Proposal"}
        </p>
        <p className={subHeading}>Fill in your terms for this project.</p>
      </div>

      {error && (
        <Alert tone="error" className={alertTweak} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <TextInput
        label="Your Price"
        helper="What you'll charge for this project"
        inputMode="decimal"
        value={price}
        onChange={setPrice}
        placeholder="0"
        startIcon="$"
      />

      <TextInput
        label="Timeline"
        helper="How long will this project take?"
        inputMode="numeric"
        value={timelineDays}
        onChange={setTimelineDays}
        placeholder="14"
        endIcon={(
          <span className={endAdornment}>
            <Clock size={14} />
            <span className={endAdornmentText}>days</span>
          </span>
        )}
      />

      <div>
        <p className={fieldLabel}>Cover Letter</p>
        <RichTextEditor
          value={coverLetter}
          onChange={setCoverLetter}
          placeholder="Explain your relevant experience and approach…"
          minHeight={130}
        />
      </div>

      <div className={actions}>
        <button type="button" onClick={onCancel} className={cx(btnBase, cancelBtn)}>
          Cancel
        </button>
        <button type="button" disabled={submitting} onClick={handleSubmit} className={cx(btnBase, submitBtn)}>
          {submitting ? <Spinner size={16} className={css({ color: "white" })} /> : isEditing ? "Save Changes" : "Submit Proposal"}
        </button>
      </div>
    </div>
  );
}
