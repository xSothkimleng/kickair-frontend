"use client";
import { useCallback, useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  InputAdornment,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import GavelIcon from "@mui/icons-material/Gavel";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { api } from "@/lib/api";
import { AdminDispute } from "@/types/order";

type StatusFilter = "open" | "resolved" | "all";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function statusChipColor(status: string) {
  return status === "open" ? "warning" : "success";
}

function outcomeLabel(outcome: string | null) {
  if (!outcome) return "—";
  const labels: Record<string, string> = {
    full_freelancer: "Full payment to Freelancer",
    partial: "Partial split",
    full_client: "Full refund to Client",
  };
  return labels[outcome] ?? outcome;
}

export default function DisputeReviewSection() {
  const [disputes, setDisputes] = useState<AdminDispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("open");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [resolveTarget, setResolveTarget] = useState<AdminDispute | null>(null);
  const [outcome, setOutcome] = useState("full_freelancer");
  const [partialAmount, setPartialAmount] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [resolving, setResolving] = useState(false);
  const [resolveError, setResolveError] = useState("");

  const fetchDisputes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getAdminDisputes(1, statusFilter === "all" ? undefined : statusFilter);
      setDisputes(res.data);
    } catch {
      setDisputes([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchDisputes();
  }, [fetchDisputes]);

  const handleResolveOpen = (dispute: AdminDispute) => {
    setResolveTarget(dispute);
    setOutcome("full_freelancer");
    setPartialAmount("");
    setAdminNote("");
    setResolveError("");
  };

  const handleResolveConfirm = async () => {
    if (!resolveTarget) return;
    if (!adminNote.trim()) {
      setResolveError("Admin note is required.");
      return;
    }
    if (outcome === "partial" && (!partialAmount || Number(partialAmount) <= 0)) {
      setResolveError("Enter a valid freelancer share amount.");
      return;
    }

    setResolving(true);
    setResolveError("");
    try {
      await api.resolveDispute(resolveTarget.id, {
        outcome,
        partial_freelancer_amount: outcome === "partial" ? Number(partialAmount) : undefined,
        admin_note: adminNote,
      });
      setResolveTarget(null);
      await fetchDisputes();
    } catch {
      setResolveError("Failed to resolve dispute. Please try again.");
    } finally {
      setResolving(false);
    }
  };

  return (
    <Box mb={4}>
      <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
        <GavelIcon sx={{ color: "#ef4444" }} />
        <Typography variant="h6" fontWeight={600}>
          Dispute Review
        </Typography>
      </Stack>

      <ToggleButtonGroup
        value={statusFilter}
        exclusive
        onChange={(_, val) => { if (val) setStatusFilter(val); }}
        size="small"
        sx={{ mb: 2 }}>
        <ToggleButton value="open">Open</ToggleButton>
        <ToggleButton value="resolved">Resolved</ToggleButton>
        <ToggleButton value="all">All</ToggleButton>
      </ToggleButtonGroup>

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : disputes.length === 0 ? (
        <Typography color="text.secondary" py={2}>
          No disputes found.
        </Typography>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid rgba(0,0,0,0.08)", borderRadius: 3 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "rgba(0,0,0,0.02)" }}>
                <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>Order</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>Opened By</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>Reason</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {disputes.map(dispute => (
                <>
                  <TableRow key={dispute.id} hover>
                    <TableCell>
                      <Typography sx={{ fontSize: 12, fontWeight: 600 }}>#{dispute.order.id}</Typography>
                      <Typography sx={{ fontSize: 11, color: "text.secondary", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {dispute.order.title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: 13, fontWeight: 600 }}>${dispute.order.price}</Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Avatar
                          src={dispute.client.avatar_url ?? undefined}
                          sx={{ width: 24, height: 24, fontSize: 10 }}>
                          {dispute.client.name.charAt(0)}
                        </Avatar>
                        <Typography sx={{ fontSize: 12 }}>{dispute.client.name}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 180 }}>
                      <Typography sx={{ fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {dispute.reason}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: 12 }}>{formatDate(dispute.opened_at)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={dispute.status}
                        color={statusChipColor(dispute.status)}
                        size="small"
                        sx={{ fontSize: 11, textTransform: "capitalize" }}
                      />
                      {dispute.outcome && (
                        <Typography sx={{ fontSize: 10, color: "text.secondary", mt: 0.5 }}>
                          {outcomeLabel(dispute.outcome)}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5}>
                        <IconButton
                          size="small"
                          onClick={() => setExpandedId(expandedId === dispute.id ? null : dispute.id)}>
                          {expandedId === dispute.id ? <ExpandLessIcon sx={{ fontSize: 18 }} /> : <ExpandMoreIcon sx={{ fontSize: 18 }} />}
                        </IconButton>
                        {dispute.status === "open" && (
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => handleResolveOpen(dispute)}
                            sx={{
                              fontSize: 11,
                              textTransform: "none",
                              borderRadius: 10,
                              bgcolor: "#ef4444",
                              boxShadow: "none",
                              "&:hover": { bgcolor: "#dc2626", boxShadow: "none" },
                            }}>
                            Resolve
                          </Button>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>

                  {/* Expanded evidence row */}
                  <TableRow key={`${dispute.id}-evidence`}>
                    <TableCell colSpan={7} sx={{ py: 0, border: 0 }}>
                      <Collapse in={expandedId === dispute.id} unmountOnExit>
                        <Box sx={{ p: 2, bgcolor: "rgba(0,0,0,0.01)" }}>
                          <Stack direction={{ xs: "column", md: "row" }} spacing={2} divider={<Divider orientation="vertical" flexItem />}>
                            <Box flex={1}>
                              <Typography sx={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", color: "text.secondary", mb: 1 }}>
                                Client Evidence — {dispute.client.name}
                              </Typography>
                              <Typography sx={{ fontSize: 13, color: dispute.client_evidence ? "text.primary" : "text.secondary" }}>
                                {dispute.client_evidence ?? "No evidence submitted."}
                              </Typography>
                            </Box>
                            <Box flex={1}>
                              <Typography sx={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", color: "text.secondary", mb: 1 }}>
                                Freelancer Evidence — {dispute.freelancer.name}
                              </Typography>
                              <Typography sx={{ fontSize: 13, color: dispute.freelancer_evidence ? "text.primary" : "text.secondary" }}>
                                {dispute.freelancer_evidence ?? "No evidence submitted."}
                              </Typography>
                            </Box>
                          </Stack>
                          {dispute.admin_note && (
                            <Box mt={2}>
                              <Typography sx={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", color: "text.secondary", mb: 0.5 }}>
                                Admin Note
                              </Typography>
                              <Typography sx={{ fontSize: 13 }}>{dispute.admin_note}</Typography>
                            </Box>
                          )}
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Resolve Dialog */}
      <Dialog open={!!resolveTarget} onClose={() => setResolveTarget(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Resolve Dispute #{resolveTarget?.id}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} mt={1}>
            <FormControl>
              <FormLabel sx={{ fontSize: 13, fontWeight: 600, mb: 1 }}>Outcome</FormLabel>
              <RadioGroup value={outcome} onChange={e => setOutcome(e.target.value)}>
                <FormControlLabel value="full_freelancer" control={<Radio size="small" />} label={<Typography sx={{ fontSize: 13 }}>Full payment to Freelancer</Typography>} />
                <FormControlLabel value="partial" control={<Radio size="small" />} label={<Typography sx={{ fontSize: 13 }}>Partial payment (split)</Typography>} />
                <FormControlLabel value="full_client" control={<Radio size="small" />} label={<Typography sx={{ fontSize: 13 }}>Full refund to Client</Typography>} />
              </RadioGroup>
            </FormControl>

            {outcome === "partial" && (
              <TextField
                label="Freelancer's share"
                type="number"
                size="small"
                value={partialAmount}
                onChange={e => setPartialAmount(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                helperText={`Order total: $${resolveTarget?.order.price}`}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
            )}

            <TextField
              label="Admin note (required)"
              multiline
              minRows={3}
              size="small"
              fullWidth
              value={adminNote}
              onChange={e => setAdminNote(e.target.value)}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />

            {resolveError && (
              <Typography color="error" sx={{ fontSize: 13 }}>
                {resolveError}
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setResolveTarget(null)} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={resolving}
            onClick={handleResolveConfirm}
            sx={{
              textTransform: "none",
              bgcolor: "#ef4444",
              boxShadow: "none",
              "&:hover": { bgcolor: "#dc2626", boxShadow: "none" },
            }}>
            {resolving ? <CircularProgress size={16} color="inherit" /> : "Resolve Dispute"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
