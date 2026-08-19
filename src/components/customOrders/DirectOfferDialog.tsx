"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  Box,
  Typography,
  IconButton,
  Button,
  TextField,
  MenuItem,
  InputAdornment,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Close,
  AddRounded,
  CheckCircle,
  LockOutlined,
} from "@mui/icons-material";
import { tokens } from "@/theme";
import { sanitizeMoneyInput } from "@/components/ui/inputs";
import { api } from "@/lib/api";
import { qk } from "@/lib/queryKeys";
import { Service } from "@/types/service";
import { MilestoneInput } from "@/types/customOrder";
import { useConversations } from "@/hooks/useConversations";
import { coLabel, Money } from "./kit";
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
    borderRadius: "10px",
    "& fieldset": { borderColor: tokens.borderStrong },
    "&:hover fieldset": { borderColor: tokens.text3 },
    "&.Mui-focused fieldset": { borderColor: tokens.accent, borderWidth: "1px" },
  },
};

const labelSx = { fontSize: 12, fontWeight: 600, mb: 0.75, color: tokens.text };

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

/**
 * Freelancer-initiated custom order: pick a client you've talked to, anchor it
 * to one of your active services, and send a milestone offer. The client must
 * accept and fund milestone 1 — the freelancer can never approve it themselves.
 */
export default function DirectOfferDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const invalidate = useCoInvalidate();
  const { conversations, loading: convsLoading } = useConversations();

  const { data: services = [], isLoading: servicesLoading } = useQuery({
    queryKey: qk.services.mine(),
    queryFn: async () => {
      const response = await api.get("/api/my-services");
      return (response.data ?? []) as Service[];
    },
    enabled: open,
  });
  const activeServices = services.filter((s) => s.status === "active");

  // People the freelancer has an existing conversation with — the natural
  // "client who can't / won't write the request themselves" case.
  const people = useMemo(() => {
    const seen = new Map<number, { id: number; name: string }>();
    conversations.forEach((c) => {
      if (c.other_participant && !seen.has(c.other_participant.id)) {
        seen.set(c.other_participant.id, { id: c.other_participant.id, name: c.other_participant.name });
      }
    });
    return Array.from(seen.values());
  }, [conversations]);

  const [clientUserId, setClientUserId] = useState<number | "">("");
  const [serviceId, setServiceId] = useState<number | "">("");
  const [scope, setScope] = useState("");
  const [deliveryDays, setDeliveryDays] = useState("30");
  const [revisions, setRevisions] = useState("3");
  const [expiresIn, setExpiresIn] = useState("3");
  const [note, setNote] = useState("");
  const [rows, setRows] = useState<Row[]>([{ title: "", description: "", amount: "", due_days: "7" }]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const total = rows.reduce((s, r) => s + (Number(r.amount) || 0), 0);
  const clientName = people.find((p) => p.id === clientUserId)?.name ?? "the client";

  const setRow = (i: number, patch: Partial<Row>) => setRows((rs) => rs.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const addRow = () => setRows((rs) => [...rs, { title: "", description: "", amount: "", due_days: "7" }]);
  const delRow = (i: number) => setRows((rs) => (rs.length <= 1 ? rs : rs.filter((_, j) => j !== i)));

  const reset = () => {
    setClientUserId(""); setServiceId(""); setScope(""); setNote("");
    setDeliveryDays("30"); setRevisions("3"); setExpiresIn("3");
    setRows([{ title: "", description: "", amount: "", due_days: "7" }]);
    setError(null); setSent(false);
  };

  const handleClose = () => {
    if (submitting) return;
    reset();
    onClose();
  };

  const handleSend = async () => {
    if (!clientUserId) { setError("Pick who this offer is for."); return; }
    if (!serviceId) { setError("Pick one of your services to anchor the offer."); return; }
    if (!scope.trim()) { setError("Describe the work you're proposing."); return; }
    if (rows.some((r) => !r.title.trim() || !Number(r.amount))) {
      setError("Each milestone needs a title and an amount.");
      return;
    }
    const milestones: MilestoneInput[] = rows.map((r) => ({
      title: r.title.trim(),
      description: r.description.trim() || null,
      amount: Number(r.amount),
      due_days: r.due_days ? Number(r.due_days) : null,
    }));

    setSubmitting(true);
    setError(null);
    try {
      await api.createDirectCustomOffer({
        service_id: serviceId,
        client_user_id: clientUserId,
        description: scope.trim(),
        offer_scope: scope.trim(),
        offer_delivery_days: Number(deliveryDays) || 30,
        offer_revisions: revisions ? Number(revisions) : null,
        offer_note: note.trim() || null,
        offer_expires_in_days: expiresIn ? Number(expiresIn) : null,
        is_split: milestones.length > 1,
        milestones,
      });
      await invalidate();
      setSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send the offer.");
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
          <Typography sx={{ ...coLabel, color: tokens.accent, fontFamily: tokens.mono }}>Custom order</Typography>
          <Typography sx={{ fontSize: 21, fontWeight: 600, letterSpacing: "-0.02em", mt: 0.5 }}>
            {sent ? "Offer sent" : "Propose a custom order"}
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
            Your offer is on its way to {clientName}.
          </Typography>
          <Typography sx={{ fontSize: 13.5, color: tokens.text2, lineHeight: 1.5 }}>
            They&apos;ll see it with your milestone plan and can accept whenever they&apos;re ready. Nothing starts until they accept and fund the first milestone.
          </Typography>
          <Button fullWidth sx={primaryBtn} onClick={handleClose}>Done</Button>
        </Box>
      ) : (
        <>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, p: "20px 24px" }}>
            {error && <Alert severity="error" sx={{ borderRadius: "10px" }} onClose={() => setError(null)}>{error}</Alert>}

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
              <Box>
                <Typography sx={labelSx}>For</Typography>
                <TextField
                  select fullWidth value={clientUserId}
                  onChange={(e) => setClientUserId(e.target.value === "" ? "" : Number(e.target.value))}
                  sx={fieldSx}
                  SelectProps={{ displayEmpty: true, renderValue: (v) => (v === "" ? <Box component="span" sx={{ color: tokens.text3 }}>Pick a person…</Box> : people.find((p) => p.id === v)?.name ?? "") }}
                >
                  {convsLoading && <MenuItem disabled>Loading conversations…</MenuItem>}
                  {!convsLoading && people.length === 0 && (
                    <MenuItem disabled>No conversations yet — message a client first</MenuItem>
                  )}
                  {people.map((p) => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
                </TextField>
              </Box>
              <Box>
                <Typography sx={labelSx}>From your service</Typography>
                <TextField
                  select fullWidth value={serviceId}
                  onChange={(e) => setServiceId(e.target.value === "" ? "" : Number(e.target.value))}
                  sx={fieldSx}
                  SelectProps={{ displayEmpty: true, renderValue: (v) => (v === "" ? <Box component="span" sx={{ color: tokens.text3 }}>Pick a service…</Box> : activeServices.find((s) => s.id === v)?.title ?? "") }}
                >
                  {servicesLoading && <MenuItem disabled>Loading services…</MenuItem>}
                  {!servicesLoading && activeServices.length === 0 && (
                    <MenuItem disabled>No active services — publish one first</MenuItem>
                  )}
                  {activeServices.map((s) => <MenuItem key={s.id} value={s.id}>{s.title}</MenuItem>)}
                </TextField>
              </Box>
            </Box>

            <Box>
              <Typography sx={labelSx}>Scope of work</Typography>
              <TextField
                fullWidth multiline minRows={3}
                placeholder="What you'll deliver overall — write it the way you'd pitch it to them…"
                value={scope} onChange={(e) => setScope(e.target.value)} sx={fieldSx}
              />
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2 }}>
              <Box>
                <Typography sx={labelSx}>Total delivery</Typography>
                <TextField fullWidth value={deliveryDays} onChange={(e) => setDeliveryDays(e.target.value.replace(/[^0-9]/g, ""))}
                  InputProps={{ endAdornment: <InputAdornment position="end">days</InputAdornment>, sx: { fontFamily: tokens.mono } }} sx={fieldSx} />
              </Box>
              <Box>
                <Typography sx={labelSx}>Revisions</Typography>
                <TextField fullWidth value={revisions} onChange={(e) => setRevisions(e.target.value.replace(/[^0-9]/g, ""))}
                  InputProps={{ endAdornment: <InputAdornment position="end">rounds</InputAdornment>, sx: { fontFamily: tokens.mono } }} sx={fieldSx} />
              </Box>
              <Box>
                <Typography sx={labelSx}>Expires in</Typography>
                <TextField fullWidth value={expiresIn} onChange={(e) => setExpiresIn(e.target.value.replace(/[^0-9]/g, ""))}
                  InputProps={{ endAdornment: <InputAdornment position="end">days</InputAdornment>, sx: { fontFamily: tokens.mono } }} sx={fieldSx} />
              </Box>
            </Box>

            {/* milestone plan (same row pattern as OfferComposer) */}
            <Box>
              <Typography sx={{ ...coLabel, mb: 1.25 }}>Milestone plan</Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
                {rows.map((m, i) => (
                  <Box key={i} sx={{ display: "flex", gap: 1.5, alignItems: "flex-start", p: "14px 14px 14px 12px", border: `1px solid ${tokens.borderStrong}`, borderRadius: `${tokens.radius.tile}px` }}>
                    <Box sx={{ width: 22, height: 22, mt: 0.5, borderRadius: "50%", bgcolor: "rgba(0,0,0,0.05)", display: "grid", placeItems: "center", fontFamily: tokens.mono, fontSize: 11, fontWeight: 600, color: tokens.text2, flex: "none" }}>{i + 1}</Box>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1, flex: 1, minWidth: 0 }}>
                      <TextField fullWidth size="small" placeholder="Milestone title" value={m.title} onChange={(e) => setRow(i, { title: e.target.value })} sx={fieldSx} InputProps={{ sx: { fontWeight: 600 } }} />
                      <TextField fullWidth size="small" placeholder="What the client gets in this phase" value={m.description} onChange={(e) => setRow(i, { description: e.target.value })} sx={fieldSx} />
                      <Box sx={{ display: "flex", gap: 1.25 }}>
                        <TextField size="small" placeholder="0" value={m.amount} onChange={(e) => setRow(i, { amount: sanitizeMoneyInput(e.target.value) })}
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
            </Box>

            <Box>
              <Typography sx={labelSx}>Note to client <Box component="span" sx={{ color: tokens.text3, fontWeight: 400 }}>· optional</Box></Typography>
              <TextField fullWidth multiline minRows={2} value={note} onChange={(e) => setNote(e.target.value)} sx={fieldSx} placeholder="Anything they should know about the plan…" />
            </Box>
          </Box>

          {/* footer */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1.5, p: "16px 24px", borderTop: `1px solid ${tokens.border}`, bgcolor: tokens.surface2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <LockOutlined sx={{ fontSize: 13, color: tokens.text3 }} />
              <Typography sx={{ fontSize: 11.5, color: tokens.text3, lineHeight: 1.35 }}>
                Only the client can accept — total <Box component="span" sx={{ fontFamily: tokens.mono, fontWeight: 600, color: tokens.text2 }}><Money value={total} size={11.5} weight={600} /></Box>
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 1.25 }}>
              <Button onClick={handleClose} sx={{ textTransform: "none", fontWeight: 600, fontSize: 14, color: tokens.text2, borderRadius: "999px" }}>Cancel</Button>
              <Button onClick={handleSend} disabled={submitting} sx={primaryBtn}>
                {submitting ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : "Send offer"}
              </Button>
            </Box>
          </Box>
        </>
      )}
    </Dialog>
  );
}
