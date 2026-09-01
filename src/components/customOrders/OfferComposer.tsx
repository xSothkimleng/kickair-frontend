"use client";

import { useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  ArrowForward,
  CheckCircle,
  InfoOutlined,
} from "@mui/icons-material";
import { tokens } from "@/theme";
import { sanitizeMoneyInput } from "@/components/ui/inputs";
import { api } from "@/lib/api";
import { CustomOrder } from "@/types/customOrder";
import { useCommissionRate } from "@/hooks/useCommissionRate";
import { Money, coCard, coLabel, initials } from "./kit";
import { useCoInvalidate } from "./hooks";

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    fontSize: 14,
    borderRadius: "9px",
    "& fieldset": { borderColor: tokens.borderStrong },
    "&:hover fieldset": { borderColor: tokens.text3 },
    "&.Mui-focused fieldset": { borderColor: tokens.accent, borderWidth: "1px" },
  },
};

const labelSx = { fontSize: 12, fontWeight: 600, mb: 0.75, color: tokens.text };

export default function OfferComposer({ order, onSent, onCancel }: { order: CustomOrder; onSent: () => void; onCancel: () => void }) {
  const invalidate = useCoInvalidate();
  const rate = useCommissionRate();
  const clientName = order.client.name ?? "the client";

  const [scope, setScope] = useState(order.description ?? "");
  const [deliveryDays, setDeliveryDays] = useState("30");
  const [revisions, setRevisions] = useState("3");
  const [note, setNote] = useState("");
  const [expiresIn, setExpiresIn] = useState("3");
  const [amount, setAmount] = useState(String(order.budget || ""));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = Number(amount) || 0;
  const over = total - order.budget;
  const overBudget = over > 0;
  const commission = rate != null ? total * rate : null;
  const net = commission != null ? total - commission : null;

  const handleSend = async () => {
    if (!scope.trim()) { setError("Add a scope of work."); return; }
    if (!total) { setError("Add a project price."); return; }

    setSubmitting(true);
    setError(null);
    try {
      // One-time payment: the offer is a single "Complete project" payment.
      await api.sendCustomOffer(order.id, {
        offer_scope: scope.trim(),
        offer_delivery_days: Number(deliveryDays) || 30,
        offer_revisions: revisions ? Number(revisions) : null,
        offer_note: note.trim() || null,
        offer_expires_in_days: expiresIn ? Number(expiresIn) : null,
        is_split: false,
        milestones: [{ title: "Complete project", amount: total, due_days: Number(deliveryDays) || null }],
      });
      await invalidate();
      onSent();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send the offer.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "minmax(0,1fr) 340px" }, gap: 3, alignItems: "start" }}>
      {/* ── Builder ── */}
      <Box sx={{ ...coCard, p: { xs: 2.25, md: 3 } }}>
        <Typography sx={labelSx}>Scope of work</Typography>
        <TextField fullWidth multiline minRows={3} value={scope} onChange={(e) => setScope(e.target.value)} sx={{ ...fieldSx, mb: 2.5 }} placeholder="What you'll deliver overall…" />

        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 2.5 }}>
          <Box>
            <Typography sx={labelSx}>Delivery</Typography>
            <TextField fullWidth value={deliveryDays} onChange={(e) => setDeliveryDays(e.target.value.replace(/[^0-9]/g, ""))}
              InputProps={{ endAdornment: <InputAdornment position="end">days</InputAdornment>, sx: { fontFamily: tokens.mono } }} sx={fieldSx} />
          </Box>
          <Box>
            <Typography sx={labelSx}>Revisions</Typography>
            <TextField fullWidth value={revisions} onChange={(e) => setRevisions(e.target.value.replace(/[^0-9]/g, ""))}
              InputProps={{ endAdornment: <InputAdornment position="end">rounds</InputAdornment>, sx: { fontFamily: tokens.mono } }} sx={fieldSx} />
          </Box>
        </Box>

        <Typography sx={labelSx}>Project price <Box component="span" sx={{ color: tokens.text3, fontWeight: 400 }}>· one-time payment</Box></Typography>
        <TextField size="small" sx={{ ...fieldSx, maxWidth: 220, mb: 2.5 }} value={amount} onChange={(e) => setAmount(sanitizeMoneyInput(e.target.value))}
          InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment>, sx: { fontFamily: tokens.mono } }} />

        <Box sx={{ borderTop: `1px solid ${tokens.border}`, pt: 2.25 }}>
          <Typography sx={labelSx}>Note to client <Box component="span" sx={{ color: tokens.text3, fontWeight: 400 }}>· optional</Box></Typography>
          <TextField fullWidth multiline minRows={2} value={note} onChange={(e) => setNote(e.target.value)} sx={{ ...fieldSx, mb: 2 }} placeholder="Anything the client should know about the plan…" />
          <Typography sx={labelSx}>Offer to client expires in</Typography>
          <TextField value={expiresIn} onChange={(e) => setExpiresIn(e.target.value.replace(/[^0-9]/g, ""))} sx={{ ...fieldSx, maxWidth: 200 }} size="small"
            InputProps={{ endAdornment: <InputAdornment position="end">days</InputAdornment>, sx: { fontFamily: tokens.mono } }} />
        </Box>
      </Box>

      {/* ── Summary sidebar ── */}
      <Box sx={{ ...coCard, p: { xs: 2.25, md: 3 }, position: { md: "sticky" }, top: 24 }}>
        <Typography sx={coLabel}>Offer summary</Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, my: 1.75 }}>
          <Avatar sx={{ width: 36, height: 36, bgcolor: tokens.text, fontSize: 13, fontWeight: 600 }}>{initials(clientName)}</Avatar>
          <Box>
            <Typography sx={{ fontWeight: 600, fontSize: 14 }}>For {clientName}</Typography>
            <Typography sx={{ fontSize: 11.5, color: tokens.text2 }}>
              Budget ${order.budget.toLocaleString()}{order.desired_timeline_days ? ` · ${order.desired_timeline_days} days` : ""}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 1.5, borderTop: `1px solid ${tokens.borderStrong}` }}>
          <Typography sx={{ fontWeight: 600, fontSize: 16 }}>Total</Typography>
          <Money value={total} size={22} weight={600} color={overBudget ? tokens.errorText : tokens.text} />
        </Box>

        {/* Fee deduction — what actually lands in the freelancer's wallet. */}
        {rate != null && commission != null && net != null && (
          <Box sx={{ mt: 0.5, mb: 1.25, p: 1.5, border: `1px solid ${tokens.border}`, borderRadius: "10px", bgcolor: tokens.surface2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.375 }}>
              <Typography sx={{ fontSize: 12.5, color: tokens.text2 }}>Client pays</Typography>
              <Typography sx={{ fontSize: 12.5, fontFamily: tokens.mono, fontWeight: 600 }}>${total.toFixed(2)}</Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.375 }}>
              <Typography sx={{ fontSize: 12.5, color: tokens.text2 }}>Platform fee ({Math.round(rate * 100)}%)</Typography>
              <Typography sx={{ fontSize: 12.5, fontFamily: tokens.mono, fontWeight: 600, color: tokens.pendingText }}>−${commission.toFixed(2)}</Typography>
            </Box>
            <Box sx={{ height: "1px", bgcolor: tokens.border, my: 0.5 }} />
            <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.375 }}>
              <Typography sx={{ fontSize: 12.5, fontWeight: 700 }}>You receive</Typography>
              <Typography sx={{ fontSize: 13, fontFamily: tokens.mono, fontWeight: 700, color: tokens.successText }}>${net.toFixed(2)}</Typography>
            </Box>
          </Box>
        )}

        <Box sx={{ display: "flex", gap: 1, p: 1.5, borderRadius: "10px", bgcolor: overBudget ? tokens.errorTint : tokens.successTint, mt: 0.5 }}>
          {overBudget ? <InfoOutlined sx={{ fontSize: 16, color: tokens.errorText }} /> : <CheckCircle sx={{ fontSize: 16, color: tokens.success }} />}
          <Typography sx={{ fontSize: 12.5, lineHeight: 1.4, fontWeight: 500, color: overBudget ? tokens.errorText : tokens.successText }}>
            {overBudget
              ? <>Over the client&apos;s budget by <Box component="span" sx={{ fontFamily: tokens.mono }}>${over.toLocaleString()}</Box>. They may counter or decline.</>
              : over === 0
                ? <>Matches the client&apos;s ${order.budget.toLocaleString()} budget exactly.</>
                : <><Box component="span" sx={{ fontFamily: tokens.mono }}>${(-over).toLocaleString()}</Box> under budget — comfortable room.</>}
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ borderRadius: "10px", mt: 1.75 }}>{error}</Alert>}

        <Button fullWidth onClick={handleSend} disabled={submitting} endIcon={!submitting && <ArrowForward />}
          sx={{ mt: 2.25, textTransform: "none", fontWeight: 600, fontSize: 15, borderRadius: "999px", bgcolor: tokens.text, color: "#fff", height: 48, boxShadow: "none", "&:hover": { bgcolor: "rgba(0,0,0,0.82)", boxShadow: "none" } }}>
          {submitting ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : "Send offer"}
        </Button>
        <Button fullWidth onClick={onCancel} disabled={submitting} sx={{ mt: 1, textTransform: "none", fontWeight: 600, fontSize: 13.5, color: tokens.text2, borderRadius: "999px" }}>
          Cancel
        </Button>
      </Box>
    </Box>
  );
}
