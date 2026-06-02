"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box, Paper, Typography, Stack, Button, Chip, Avatar, CircularProgress, Alert,
  RadioGroup, FormControlLabel, Radio, TextField, Divider, InputAdornment,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import GavelIcon from "@mui/icons-material/Gavel";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import ImageIcon from "@mui/icons-material/Image";
import SendIcon from "@mui/icons-material/Send";
import { api } from "@/lib/api";
import { AdminDispute, EvidenceFile } from "@/types/order";
import { Message } from "@/types/message";
import OrderTimeline from "@/components/dashboard/OrderTimeline";
import DeliverablesReference from "@/components/dashboard/DeliverablesReference";
import { getEcho } from "@/lib/echo";
import { useAuth } from "@/components/context/AuthContext";

const OUTCOMES = [
  { value: "full_freelancer", label: "Release full payment to freelancer" },
  { value: "full_client", label: "Refund the client in full" },
  { value: "partial", label: "Split — partial amount to freelancer" },
];

function EvidenceFiles({ files }: { files: EvidenceFile[] | null }) {
  if (!files?.length) return null;
  return (
    <Stack spacing={1} mt={1}>
      {files.map((f, i) => (
        <Box key={i} component="a" href={f.url} target="_blank" rel="noopener noreferrer"
          sx={{ display: "flex", alignItems: "center", gap: 1, p: 1, border: "1px solid", borderColor: "grey.200", borderRadius: 1.5, textDecoration: "none", color: "inherit", "&:hover": { borderColor: "grey.400" } }}>
          {f.file_type === "image" ? <ImageIcon fontSize="small" color="action" /> : <InsertDriveFileIcon fontSize="small" color="action" />}
          <Typography variant="caption" sx={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.file_name}</Typography>
          <Typography variant="caption" color="primary">Open</Typography>
        </Box>
      ))}
    </Stack>
  );
}

function PartyEvidence({ title, name, statement, files }: { title: string; name: string; statement: string | null; files: EvidenceFile[] | null }) {
  return (
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, flex: 1, minWidth: 260 }}>
      <Typography fontWeight={700} fontSize={14} mb={0.25}>{title}</Typography>
      <Typography variant="caption" color="text.secondary">{name}</Typography>
      <Box mt={1.5}>
        {statement ? (
          <Typography variant="body2" sx={{ color: "text.primary", lineHeight: 1.6 }}>{statement}</Typography>
        ) : (
          <Typography variant="body2" color="text.disabled">No statement submitted.</Typography>
        )}
        <EvidenceFiles files={files} />
      </Box>
    </Paper>
  );
}

export default function AdminDisputeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const disputeId = Number(params.id);

  const [dispute, setDispute] = useState<AdminDispute | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Resolve form
  const [outcome, setOutcome] = useState("");
  const [partialAmount, setPartialAmount] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [resolving, setResolving] = useState(false);
  const [resolveError, setResolveError] = useState<string | null>(null);

  // Chat
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const fetchDispute = useCallback(async () => {
    try {
      const d = await api.getAdminDispute(disputeId);
      setDispute(d);
      if (d.order.conversation_id) {
        const res = await api.getConversationMessages(d.order.conversation_id);
        setMessages(res.data ?? []);
      }
    } catch {
      setError("Failed to load dispute.");
    } finally {
      setLoading(false);
    }
  }, [disputeId]);

  useEffect(() => { fetchDispute(); }, [fetchDispute]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  // Real-time: subscribe to the order's conversation so the admin sees client/freelancer
  // replies live (their messages broadcast on conversation.{id}). Our own sends use
  // ->toOthers() server-side, so we won't get echoes of our own messages.
  const conversationId = dispute?.order.conversation_id ?? null;
  useEffect(() => {
    if (!conversationId) return;
    let echo: ReturnType<typeof getEcho>;
    try { echo = getEcho(); } catch { return; }

    const channel = echo.private(`conversation.${conversationId}`);
    channel.listen(".message.sent", (event: { message: Message }) => {
      setMessages(prev => {
        if (prev.some(m => m.id === event.message.id)) return prev;
        return [...prev, { ...event.message, is_mine: event.message.sender_id === user?.id }];
      });
    });

    return () => {
      try { echo.leave(`conversation.${conversationId}`); } catch {}
    };
  }, [conversationId, user?.id]);

  const handleResolve = async () => {
    if (!outcome) { setResolveError("Choose an outcome."); return; }
    if (!adminNote.trim()) { setResolveError("Add a note explaining the decision."); return; }
    if (outcome === "partial" && (!partialAmount || Number(partialAmount) <= 0)) { setResolveError("Enter the amount for the freelancer."); return; }
    setResolving(true); setResolveError(null);
    try {
      await api.resolveDispute(disputeId, {
        outcome,
        admin_note: adminNote.trim(),
        ...(outcome === "partial" ? { partial_freelancer_amount: Number(partialAmount) } : {}),
      });
      await fetchDispute();
    } catch {
      setResolveError("Failed to resolve. Please try again.");
    } finally {
      setResolving(false);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !dispute?.order.conversation_id) return;
    setSending(true);
    try {
      await api.sendConversationMessage(dispute.order.conversation_id, newMessage.trim());
      setNewMessage("");
      const res = await api.getConversationMessages(dispute.order.conversation_id);
      setMessages(res.data ?? []);
    } catch {
      // silent
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <Box sx={{ display: "flex", justifyContent: "center", py: 12 }}><CircularProgress /></Box>;
  }
  if (error || !dispute) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography color="text.secondary" mb={2}>{error ?? "Dispute not found."}</Typography>
        <Button variant="outlined" onClick={() => router.push("/admin/trust")}>Back to Trust &amp; Safety</Button>
      </Box>
    );
  }

  const resolved = dispute.status === "resolved";

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: "auto" }}>
      {/* Header */}
      <Button startIcon={<ArrowBackIcon fontSize="small" />} onClick={() => router.back()} sx={{ textTransform: "none", color: "text.secondary", mb: 1.5 }}>
        Back to disputes
      </Button>
      <Stack direction="row" alignItems="center" gap={1.5} mb={0.5} flexWrap="wrap">
        <GavelIcon sx={{ color: resolved ? "success.main" : "error.main" }} />
        <Typography variant="h5" fontWeight={700}>Dispute #{dispute.id}</Typography>
        <Chip label={resolved ? "Resolved" : "Open"} size="small" color={resolved ? "success" : "error"} />
      </Stack>
      <Typography color="text.secondary" mb={3}>Order #{dispute.order.id} · {dispute.order.title} · ${dispute.order.price}</Typography>

      <Box sx={{ display: "flex", gap: 3, flexDirection: { xs: "column", lg: "row" } }}>
        {/* Left: details */}
        <Box sx={{ flex: 2, minWidth: 0, display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Parties */}
          <Stack direction="row" gap={2} flexWrap="wrap">
            {[dispute.client, dispute.freelancer].map((p, i) => (
              <Paper key={p.id} variant="outlined" sx={{ p: 2, borderRadius: 2, flex: 1, minWidth: 220, display: "flex", alignItems: "center", gap: 1.5 }}>
                <Avatar src={p.avatar_url ?? undefined} sx={{ width: 40, height: 40 }}>{p.name.charAt(0)}</Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="caption" color="text.secondary">{i === 0 ? "Client" : "Freelancer"}</Typography>
                  <Typography fontWeight={600} fontSize={14} noWrap>{p.name}</Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>{p.email}</Typography>
                </Box>
              </Paper>
            ))}
          </Stack>

          {/* Reason */}
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
            <Typography fontWeight={700} fontSize={14} mb={1}>Dispute reason</Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.6 }}>{dispute.reason}</Typography>
          </Paper>

          {/* Evidence */}
          <Stack direction="row" gap={2} flexWrap="wrap">
            <PartyEvidence title="Client's evidence" name={dispute.client.name} statement={dispute.client_statement} files={dispute.client_evidence} />
            <PartyEvidence title="Freelancer's evidence" name={dispute.freelancer.name} statement={dispute.freelancer_statement} files={dispute.freelancer_evidence} />
          </Stack>

          {/* Delivered work & revision requests — persistent record for judging the dispute */}
          <DeliverablesReference
            deliveryHistory={dispute.order.delivery_history}
            revisionHistory={dispute.order.revision_history}
          />

          {/* Timeline */}
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
            <OrderTimeline orderId={dispute.order.id} />
          </Paper>

          {/* Resolve / outcome */}
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
            {resolved ? (
              <>
                <Typography fontWeight={700} fontSize={14} mb={1}>Resolution</Typography>
                <Chip
                  label={OUTCOMES.find(o => o.value === dispute.outcome)?.label ?? "Resolved"}
                  color="success" size="small" sx={{ mb: 1 }}
                />
                {dispute.outcome === "partial" && dispute.partial_freelancer_amount && (
                  <Typography variant="body2" mb={1}>Freelancer received: <strong>${dispute.partial_freelancer_amount}</strong></Typography>
                )}
                {dispute.admin_note && (
                  <Typography variant="body2" color="text.secondary"><strong>Admin note:</strong> {dispute.admin_note}</Typography>
                )}
              </>
            ) : (
              <>
                <Typography fontWeight={700} fontSize={14} mb={1.5}>Resolve dispute</Typography>
                {resolveError && <Alert severity="error" sx={{ mb: 2 }}>{resolveError}</Alert>}
                <RadioGroup value={outcome} onChange={e => setOutcome(e.target.value)}>
                  {OUTCOMES.map(o => (
                    <FormControlLabel key={o.value} value={o.value} control={<Radio size="small" />} label={<Typography variant="body2">{o.label}</Typography>} />
                  ))}
                </RadioGroup>
                {outcome === "partial" && (
                  <TextField
                    type="number" size="small" label="Amount to freelancer" value={partialAmount}
                    onChange={e => setPartialAmount(e.target.value)} sx={{ mt: 1, mb: 1, maxWidth: 240 }}
                    InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                    helperText={`Order total: $${dispute.order.price}`}
                  />
                )}
                <TextField
                  fullWidth multiline minRows={3} label="Admin note (required)" value={adminNote}
                  onChange={e => setAdminNote(e.target.value)} sx={{ mt: 1.5 }}
                  slotProps={{ htmlInput: { maxLength: 2000 } }}
                />
                <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                  <Button variant="contained" color="error" onClick={handleResolve} disabled={resolving} sx={{ textTransform: "none" }}>
                    {resolving ? <CircularProgress size={18} color="inherit" /> : "Resolve dispute"}
                  </Button>
                </Box>
              </>
            )}
          </Paper>
        </Box>

        {/* Right: 3-way chat */}
        <Box sx={{ flex: 1, minWidth: { lg: 320 } }}>
          <Paper variant="outlined" sx={{ borderRadius: 2, display: "flex", flexDirection: "column", height: { xs: 480, lg: "calc(100vh - 140px)" }, position: { lg: "sticky" }, top: { lg: 16 } }}>
            <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "grey.200" }}>
              <Typography fontWeight={700} fontSize={14}>Dispute chat</Typography>
              <Typography variant="caption" color="text.secondary">You, the client, and the freelancer</Typography>
            </Box>

            <Box sx={{ flex: 1, overflowY: "auto", p: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
              {!dispute.order.conversation_id ? (
                <Typography variant="caption" color="text.disabled" sx={{ m: "auto" }}>No conversation for this order.</Typography>
              ) : messages.length === 0 ? (
                <Typography variant="caption" color="text.disabled" sx={{ m: "auto" }}>No messages yet. Start the conversation.</Typography>
              ) : (
                messages.map(m => (
                  <Box key={m.id} sx={{ alignSelf: m.is_mine ? "flex-end" : "flex-start", maxWidth: "85%" }}>
                    {!m.is_mine && <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>{m.sender.name}</Typography>}
                    <Box sx={{
                      px: 1.5, py: 1, borderRadius: 2, mt: 0.25,
                      bgcolor: m.is_mine ? "primary.main" : "grey.100",
                      color: m.is_mine ? "white" : "text.primary",
                    }}>
                      {m.type === "file" && m.file_url ? (
                        <a href={m.file_url} target="_blank" rel="noopener noreferrer" style={{ color: "inherit" }}>{m.file_name ?? "File"}</a>
                      ) : (
                        <Typography variant="body2" sx={{ wordBreak: "break-word" }}>{m.body}</Typography>
                      )}
                    </Box>
                  </Box>
                ))
              )}
              <div ref={chatEndRef} />
            </Box>

            {dispute.order.conversation_id && (
              <Box sx={{ p: 1.5, borderTop: "1px solid", borderColor: "grey.200", display: "flex", gap: 1 }}>
                <TextField
                  fullWidth size="small" placeholder="Message both parties…" value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                />
                <Button variant="contained" onClick={handleSend} disabled={sending || !newMessage.trim()} sx={{ minWidth: 44, px: 0 }}>
                  {sending ? <CircularProgress size={18} color="inherit" /> : <SendIcon fontSize="small" />}
                </Button>
              </Box>
            )}
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}
