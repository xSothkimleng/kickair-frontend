"use client";

import { useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  Button,
  TextField,
  IconButton,
  InputAdornment,
  CircularProgress,
  Alert,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import {
  Close,
  AddRounded,
  ArrowForward,
  LockOutlined,
  CheckCircle,
  InfoOutlined,
} from "@mui/icons-material";
import { tokens } from "@/theme";
import { api } from "@/lib/api";
import { CustomOrder, MilestoneInput } from "@/types/customOrder";
import { Money, coCard, coLabel, initials } from "./kit";
import { useCoInvalidate } from "./hooks";

interface Row {
  title: string;
  description: string;
  amount: string;
  due_days: string;
}

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
  const clientName = order.client.name ?? "the client";

  const [scope, setScope] = useState(order.description ?? "");
  const [deliveryDays, setDeliveryDays] = useState("30");
  const [revisions, setRevisions] = useState("3");
  const [note, setNote] = useState("");
  const [expiresIn, setExpiresIn] = useState("3");
  const [split, setSplit] = useState(true);
  const [singleAmount, setSingleAmount] = useState(String(order.budget || ""));
  const [rows, setRows] = useState<Row[]>([
    { title: "", description: "", amount: "", due_days: "7" },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = split
    ? rows.reduce((s, r) => s + (Number(r.amount) || 0), 0)
    : Number(singleAmount) || 0;
  const over = total - order.budget;
  const overBudget = over > 0;

  const setRow = (i: number, patch: Partial<Row>) => setRows((rs) => rs.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const addRow = () => setRows((rs) => [...rs, { title: "", description: "", amount: "", due_days: "7" }]);
  const delRow = (i: number) => setRows((rs) => (rs.length <= 1 ? rs : rs.filter((_, j) => j !== i)));

  const handleSend = async () => {
    if (!scope.trim()) { setError("Add a scope of work."); return; }
    let milestones: MilestoneInput[];
    if (split) {
      if (rows.some((r) => !r.title.trim() || !Number(r.amount))) {
        setError("Each milestone needs a title and an amount.");
        return;
      }
      milestones = rows.map((r) => ({
        title: r.title.trim(),
        description: r.description.trim() || null,
        amount: Number(r.amount),
        due_days: r.due_days ? Number(r.due_days) : null,
      }));
    } else {
      if (!Number(singleAmount)) { setError("Add a project price."); return; }
      milestones = [{ title: "Complete project", amount: Number(singleAmount), due_days: Number(deliveryDays) || null }];
    }

    setSubmitting(true);
    setError(null);
    try {
      await api.sendCustomOffer(order.id, {
        offer_scope: scope.trim(),
        offer_delivery_days: Number(deliveryDays) || 30,
        offer_revisions: revisions ? Number(revisions) : null,
        offer_note: note.trim() || null,
        offer_expires_in_days: expiresIn ? Number(expiresIn) : null,
        is_split: split,
        milestones,
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
            <Typography sx={labelSx}>Total delivery</Typography>
            <TextField fullWidth value={deliveryDays} onChange={(e) => setDeliveryDays(e.target.value.replace(/[^0-9]/g, ""))}
              InputProps={{ endAdornment: <InputAdornment position="end">days</InputAdornment>, sx: { fontFamily: tokens.mono } }} sx={fieldSx} />
          </Box>
          <Box>
            <Typography sx={labelSx}>Revisions / milestone</Typography>
            <TextField fullWidth value={revisions} onChange={(e) => setRevisions(e.target.value.replace(/[^0-9]/g, ""))}
              InputProps={{ endAdornment: <InputAdornment position="end">rounds</InputAdornment>, sx: { fontFamily: tokens.mono } }} sx={fieldSx} />
          </Box>
        </Box>

        {/* payment structure toggle */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.75, gap: 1.5, flexWrap: "wrap" }}>
          <Typography sx={coLabel}>Payment structure</Typography>
          <ToggleButtonGroup
            exclusive value={split ? "split" : "single"} size="small"
            onChange={(_, v) => v && setSplit(v === "split")}
            sx={{
              bgcolor: "rgba(0,0,0,0.05)", borderRadius: "999px", p: "3px",
              "& .MuiToggleButton-root": { border: 0, borderRadius: "999px !important", textTransform: "none", fontWeight: 600, fontSize: 12.5, px: 1.75, py: 0.5, color: tokens.text2, "&.Mui-selected": { bgcolor: tokens.text, color: "#fff", "&:hover": { bgcolor: tokens.text } } },
            }}
          >
            <ToggleButton value="single">Single payment</ToggleButton>
            <ToggleButton value="split">Split into milestones</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {split ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
            {rows.map((m, i) => (
              <Box key={i} sx={{ display: "flex", gap: 1.5, alignItems: "flex-start", p: "14px 14px 14px 12px", border: `1px solid ${tokens.borderStrong}`, borderRadius: `${tokens.radius.tile}px` }}>
                <Box sx={{ width: 22, height: 22, mt: 0.5, borderRadius: "50%", bgcolor: "rgba(0,0,0,0.05)", display: "grid", placeItems: "center", fontFamily: tokens.mono, fontSize: 11, fontWeight: 600, color: tokens.text2, flex: "none" }}>{i + 1}</Box>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1, flex: 1, minWidth: 0 }}>
                  <TextField fullWidth size="small" placeholder="Milestone title" value={m.title} onChange={(e) => setRow(i, { title: e.target.value })} sx={fieldSx} InputProps={{ sx: { fontWeight: 600 } }} />
                  <TextField fullWidth size="small" placeholder="What the client gets in this phase" value={m.description} onChange={(e) => setRow(i, { description: e.target.value })} sx={fieldSx} />
                  <Box sx={{ display: "flex", gap: 1.25 }}>
                    <TextField size="small" placeholder="0" value={m.amount} onChange={(e) => setRow(i, { amount: e.target.value.replace(/[^0-9.]/g, "") })}
                      InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment>, sx: { fontFamily: tokens.mono } }} sx={{ ...fieldSx, flex: 1 }} />
                    <TextField size="small" value={m.due_days} onChange={(e) => setRow(i, { due_days: e.target.value.replace(/[^0-9]/g, "") })}
                      InputProps={{ endAdornment: <InputAdornment position="end">days</InputAdornment>, sx: { fontFamily: tokens.mono } }} sx={{ ...fieldSx, flex: 1 }} />
                  </Box>
                </Box>
                <IconButton size="small" disabled={rows.length <= 1} onClick={() => delRow(i)}><Close sx={{ fontSize: 18 }} /></IconButton>
              </Box>
            ))}
            <Button startIcon={<AddRounded />} onClick={addRow}
              sx={{ alignSelf: "flex-start", textTransform: "none", fontWeight: 600, fontSize: 13, color: tokens.text, bgcolor: "rgba(0,0,0,0.05)", borderRadius: "999px", px: 1.75, "&:hover": { bgcolor: "rgba(0,0,0,0.09)" } }}>
              Add milestone
            </Button>
          </Box>
        ) : (
          <Box sx={{ p: 2, border: `1px solid ${tokens.borderStrong}`, borderRadius: `${tokens.radius.tile}px`, display: "flex", flexDirection: "column", gap: 1.25 }}>
            <Typography sx={{ fontWeight: 600, fontSize: 14 }}>Complete project — single payment</Typography>
            <TextField size="small" sx={{ ...fieldSx, maxWidth: 200 }} value={singleAmount} onChange={(e) => setSingleAmount(e.target.value.replace(/[^0-9.]/g, ""))}
              InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment>, sx: { fontFamily: tokens.mono } }} />
          </Box>
        )}

        <Box sx={{ borderTop: `1px solid ${tokens.border}`, mt: 2.5, pt: 2.25 }}>
          <Typography sx={labelSx}>Note to client <Box component="span" sx={{ color: tokens.text3, fontWeight: 400 }}>· optional</Box></Typography>
          <TextField fullWidth multiline minRows={2} value={note} onChange={(e) => setNote(e.target.value)} sx={{ ...fieldSx, mb: 2 }} placeholder="Anything the client should know about the plan…" />
          <Typography sx={labelSx}>Offer expires in</Typography>
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

        {split && (
          <Box sx={{ mb: 1.75 }}>
            {rows.map((m, i) => (
              <Box key={i} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1.5, py: 1.125, borderBottom: i < rows.length - 1 ? `1px solid ${tokens.border}` : "none" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
                  <Box sx={{ width: 18, height: 18, borderRadius: "50%", bgcolor: "rgba(0,0,0,0.05)", display: "grid", placeItems: "center", fontFamily: tokens.mono, fontSize: 10, fontWeight: 600, color: tokens.text2, flex: "none" }}>{i + 1}</Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.title || "Untitled phase"}</Typography>
                </Box>
                <Money value={Number(m.amount) || 0} size={13.5} weight={600} />
              </Box>
            ))}
          </Box>
        )}

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 1.5, borderTop: `1px solid ${tokens.borderStrong}` }}>
          <Typography sx={{ fontWeight: 600, fontSize: 16 }}>Total</Typography>
          <Money value={total} size={22} weight={600} color={overBudget ? tokens.errorText : tokens.text} />
        </Box>

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

        {split && (
          <Box sx={{ display: "flex", gap: 1, mt: 1.75, p: 1.5, bgcolor: tokens.surface2, border: `1px solid ${tokens.border}`, borderRadius: "10px" }}>
            <LockOutlined sx={{ fontSize: 14, color: tokens.text3, flex: "none" }} />
            <Typography sx={{ fontSize: 11.5, lineHeight: 1.4, color: tokens.text2 }}>
              Client funds milestone&nbsp;1 (<Box component="span" sx={{ fontFamily: tokens.mono }}>${(Number(rows[0]?.amount) || 0).toLocaleString()}</Box>) to start. Later phases are funded as you go.
            </Typography>
          </Box>
        )}

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
