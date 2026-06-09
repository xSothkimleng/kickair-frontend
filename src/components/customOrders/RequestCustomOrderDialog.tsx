"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  Box,
  Typography,
  IconButton,
  Avatar,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Close,
  CheckCircle,
  LockOutlined,
  InfoOutlined,
  StarRounded,
} from "@mui/icons-material";
import { tokens } from "@/theme";
import { api } from "@/lib/api";
import { Money, coLabel, initials } from "./kit";
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

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    fontSize: 14,
    borderRadius: "10px",
    "& fieldset": { borderColor: tokens.borderStrong },
    "&:hover fieldset": { borderColor: tokens.text3 },
    "&.Mui-focused fieldset": { borderColor: tokens.accent, borderWidth: "1px" },
  },
};

const primaryBtn = {
  textTransform: "none" as const,
  fontWeight: 600,
  fontSize: 14,
  borderRadius: "999px",
  bgcolor: tokens.text,
  color: "#fff",
  px: 2.5,
  height: 44,
  boxShadow: "none",
  "&:hover": { bgcolor: "rgba(0,0,0,0.82)", boxShadow: "none" },
};

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
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: "16px", border: `1px solid ${tokens.border}` } }}
    >
      {/* header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", p: "22px 24px 0" }}>
        <Box>
          <Typography sx={{ ...coLabel, color: tokens.accent, fontFamily: tokens.mono }}>
            {sent ? "Request sent" : "Request a custom order"}
          </Typography>
          <Typography sx={{ fontSize: 21, fontWeight: 600, letterSpacing: "-0.02em", mt: 0.5 }}>
            {sent ? "Request sent" : "Request a custom order"}
          </Typography>
        </Box>
        <IconButton onClick={handleClose} size="small"><Close sx={{ fontSize: 20 }} /></IconButton>
      </Box>

      {sent ? (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", p: "24px 36px 32px", gap: 2 }}>
          <Box sx={{ width: 64, height: 64, borderRadius: "50%", bgcolor: tokens.successTint, display: "grid", placeItems: "center" }}>
            <CheckCircle sx={{ fontSize: 32, color: tokens.success }} />
          </Box>
          <Typography sx={{ fontSize: 15, fontWeight: 500 }}>
            Your request is on its way to {freelancerName.split(" ")[0]}.
          </Typography>
          <Typography sx={{ fontSize: 13.5, color: tokens.text2, lineHeight: 1.5 }}>
            {responds ? `They typically respond ${responds}. ` : ""}You&apos;ll get a notification when a custom offer arrives — nothing is charged until you accept and fund the first milestone.
          </Typography>
          <Button fullWidth sx={primaryBtn} onClick={() => { handleClose(); router.push("/dashboard/client/custom-orders"); }}>
            View my requests
          </Button>
        </Box>
      ) : (
        <>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, p: "20px 24px" }}>
            {/* freelancer context */}
            <Box sx={{ p: 2, borderRadius: "12px", border: `1px solid ${tokens.border}`, bgcolor: tokens.surface2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Avatar sx={{ width: 44, height: 44, bgcolor: tokens.text, fontSize: 15, fontWeight: 600 }}>{initials(freelancerName)}</Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 600, fontSize: 15 }}>{freelancerName}</Typography>
                  <Typography sx={{ display: "flex", alignItems: "center", gap: 0.5, fontSize: 12, color: tokens.text2 }}>
                    <StarRounded sx={{ fontSize: 14, color: tokens.pending }} /> Custom orders accepted
                  </Typography>
                </Box>
                {minBudget != null && (
                  <Box sx={{ textAlign: "right" }}>
                    <Typography sx={coLabel}>Min budget</Typography>
                    <Money value={minBudget} size={15} weight={600} />
                  </Box>
                )}
              </Box>
              {instructions && (
                <Box sx={{ display: "flex", gap: 1, mt: 1.5, p: 1.25, bgcolor: tokens.surface, border: `1px solid ${tokens.border}`, borderRadius: "9px" }}>
                  <InfoOutlined sx={{ fontSize: 15, color: tokens.text3, flex: "none" }} />
                  <Typography sx={{ fontSize: 12.5, color: tokens.text2, lineHeight: 1.45 }}>{instructions}</Typography>
                </Box>
              )}
            </Box>

            {error && <Alert severity="error" sx={{ borderRadius: "10px" }} onClose={() => setError(null)}>{error}</Alert>}

            <Box>
              <Typography sx={{ fontSize: 12, fontWeight: 600, mb: 0.75 }}>What do you need?</Typography>
              <TextField
                fullWidth multiline minRows={4}
                placeholder="Describe the project, what you want delivered, and any hard deadlines…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                sx={fieldSx}
              />
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              <Box>
                <Typography sx={{ fontSize: 12, fontWeight: 600, mb: 0.75 }}>Budget (USD)</Typography>
                <TextField
                  fullWidth value={budget} onChange={(e) => setBudget(e.target.value)}
                  placeholder="2,000" inputMode="decimal"
                  InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment>, sx: { fontFamily: tokens.mono } }}
                  sx={fieldSx}
                />
              </Box>
              <Box>
                <Typography sx={{ fontSize: 12, fontWeight: 600, mb: 0.75 }}>Desired timeline</Typography>
                <TextField
                  fullWidth value={timeline} onChange={(e) => setTimeline(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="30" inputMode="numeric"
                  InputProps={{ endAdornment: <InputAdornment position="end">days</InputAdornment>, sx: { fontFamily: tokens.mono } }}
                  sx={fieldSx}
                />
              </Box>
            </Box>
          </Box>

          {/* footer */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1.5, p: "16px 24px", borderTop: `1px solid ${tokens.border}`, bgcolor: tokens.surface2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, color: tokens.text3, fontSize: 11.5 }}>
              <LockOutlined sx={{ fontSize: 13 }} /> No charge until you accept an offer
            </Box>
            <Box sx={{ display: "flex", gap: 1.25 }}>
              <Button onClick={handleClose} sx={{ textTransform: "none", fontWeight: 600, fontSize: 14, color: tokens.text2, borderRadius: "999px" }}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={submitting} sx={primaryBtn}>
                {submitting ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : "Send request"}
              </Button>
            </Box>
          </Box>
        </>
      )}
    </Dialog>
  );
}
