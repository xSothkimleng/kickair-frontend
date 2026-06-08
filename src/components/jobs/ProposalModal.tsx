"use client";

import { useEffect, useState } from "react";
import { Box, Button, CircularProgress, Dialog, Typography, useMediaQuery, useTheme } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { api } from "@/lib/api";
import { Proposal, CreateProposalRequest } from "@/types/job";
import { tokens } from "@/theme";

const money = (v: string | number) => "$" + Number(v).toLocaleString("en-US");
const stripHtml = (s: string) => s.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

const COVER_PLACEHOLDER =
  "Introduce yourself and explain why you're a great fit. What relevant work have you done? How would you approach this project, and what will you deliver?";

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
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down("sm"));
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

  const fieldSx = {
    width: "100%",
    boxSizing: "border-box",
    border: `1px solid ${tokens.borderStrong}`,
    borderRadius: `${tokens.radius.input}px`,
    bgcolor: tokens.surface,
    color: tokens.text,
    font: "inherit",
    outline: "none",
    "&::placeholder": { color: tokens.text3, opacity: 1 },
    "&:focus": { borderColor: tokens.accent, boxShadow: `0 0 0 3px ${tokens.accentFill}` },
    "&:disabled": { opacity: 0.6 },
  } as const;

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      fullScreen={mobile}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: mobile ? 0 : `${tokens.radius.card}px`, maxWidth: 600 } }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: { xs: "16px 18px", sm: "20px 24px" }, borderBottom: `1px solid ${tokens.border}` }}>
        <Box>
          <Typography sx={{ fontSize: { xs: 18, sm: 19 }, fontWeight: 600, letterSpacing: "-0.01em" }}>{isEdit ? "Edit your proposal" : "Submit a proposal"}</Typography>
          <Typography sx={{ display: { xs: "none", sm: "block" }, fontSize: 12, color: tokens.text2, mt: 0.25 }}>Take your time — this is your pitch to the client.</Typography>
        </Box>
        <Box component="button" onClick={onClose} aria-label="Close" sx={{ width: 36, height: 36, borderRadius: "50%", border: 0, bgcolor: "rgba(0,0,0,0.05)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
          <CloseIcon sx={{ fontSize: 18, color: tokens.text2 }} />
        </Box>
      </Box>

      {/* Body */}
      <Box sx={{ p: { xs: "18px 18px 8px", sm: "22px 24px 10px" }, display: "flex", flexDirection: "column", gap: 2.5 }}>
        {/* Recap */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1.75, p: "13px 16px", bgcolor: tokens.surface2, border: `1px solid ${tokens.border}`, borderRadius: `${tokens.radius.cardSm}px` }}>
          <Box sx={{ minWidth: 0 }}>
            <Cap>Applying to</Cap>
            <Typography sx={{ fontSize: 13.5, fontWeight: 600, letterSpacing: "-0.01em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{jobTitle}</Typography>
          </Box>
          <Box sx={{ textAlign: "right", flex: "none" }}>
            <Cap>Budget</Cap>
            <Typography sx={{ fontFamily: tokens.mono, fontSize: 14, fontWeight: 600, color: tokens.successText, whiteSpace: "nowrap" }}>{money(budgetMin)} – {money(budgetMax)}</Typography>
          </Box>
        </Box>

        {/* Price + timeline */}
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: { xs: 2.25, sm: 2 } }}>
          <Box>
            <FieldLabel>Your price (USD)</FieldLabel>
            <Box sx={{ position: "relative" }}>
              <Box component="span" sx={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", fontFamily: tokens.mono, fontSize: 20, fontWeight: 600, color: tokens.text3, pointerEvents: "none" }}>$</Box>
              <Box component="input" inputMode="numeric" disabled={submitting} placeholder="0"
                value={price ? Number(price).toLocaleString("en-US") : ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPrice(e.target.value.replace(/[^0-9]/g, ""))}
                sx={{ ...fieldSx, height: 56, pl: "34px", pr: "14px", fontFamily: tokens.mono, fontSize: 22, fontWeight: 600 }} />
            </Box>
            <Typography sx={{ fontSize: 11.5, color: tokens.text2, mt: 0.875 }}>Client&rsquo;s budget: <Box component="span" sx={{ color: tokens.successText, fontWeight: 600 }}>{money(budgetMin)} – {money(budgetMax)}</Box></Typography>
          </Box>
          <Box>
            <FieldLabel>Delivery timeline</FieldLabel>
            <Box sx={{ position: "relative" }}>
              <Box component="input" inputMode="numeric" disabled={submitting} placeholder="0"
                value={days}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDays(e.target.value.replace(/[^0-9]/g, ""))}
                sx={{ ...fieldSx, height: 56, pl: "16px", pr: "64px", fontFamily: tokens.mono, fontSize: 22, fontWeight: 600 }} />
              <Box component="span" sx={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", fontSize: 14, fontWeight: 500, color: tokens.text3, pointerEvents: "none" }}>days</Box>
            </Box>
            <Typography sx={{ fontSize: 11.5, color: tokens.text2, mt: 0.875 }}>How long until you deliver final work.</Typography>
          </Box>
        </Box>

        {/* Cover letter */}
        <Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.875 }}>
            <FieldLabel sx={{ mb: 0 }}>Cover letter</FieldLabel>
            <Typography sx={{ fontSize: 11.5, color: tokens.text2 }}>{cover.length} characters</Typography>
          </Box>
          <Box component="textarea" disabled={submitting} placeholder={COVER_PLACEHOLDER}
            value={cover}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCover(e.target.value)}
            sx={{ ...fieldSx, minHeight: { xs: 200, sm: 184 }, p: "14px 16px", fontSize: 14.5, lineHeight: 1.55, resize: "vertical" }} />
        </Box>

        {error && <Typography sx={{ fontSize: 13, color: tokens.errorText }}>{error}</Typography>}
      </Box>

      {/* Footer */}
      <Box sx={{ display: "flex", gap: 1.5, justifyContent: "flex-end", p: { xs: "14px 18px", sm: "16px 24px" }, borderTop: `1px solid ${tokens.border}` }}>
        <Button onClick={onClose} disabled={submitting} sx={{ display: { xs: "none", sm: "inline-flex" }, height: 44, px: 2, borderRadius: "999px", color: tokens.text2, textTransform: "none", fontSize: 14, "&:hover": { bgcolor: "rgba(0,0,0,0.04)" } }}>Cancel</Button>
        <Button onClick={submit} disabled={submitting} fullWidth={mobile}
          startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : undefined}
          sx={{ height: 52, minWidth: mobile ? 0 : 190, px: 3, borderRadius: "999px", bgcolor: "#000", color: "#fff", textTransform: "none", fontSize: 16, fontWeight: 500, "&:hover": { bgcolor: "rgba(0,0,0,0.8)" }, "&.Mui-disabled": { bgcolor: "rgba(0,0,0,0.18)", color: "#fff" } }}>
          {submitting ? "Submitting…" : isEdit ? "Save changes" : "Submit proposal"}
        </Button>
      </Box>
    </Dialog>
  );
}

function FieldLabel({ children, sx }: { children: React.ReactNode; sx?: object }) {
  return <Typography component="label" sx={{ display: "block", fontSize: 13.5, fontWeight: 500, color: tokens.text2, mb: "7px", ...sx }}>{children}</Typography>;
}
function Cap({ children }: { children: React.ReactNode }) {
  return <Typography sx={{ fontSize: 9.5, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: tokens.text3 }}>{children}</Typography>;
}
