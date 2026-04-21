"use client";
import { useCallback, useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
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
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { api } from "@/lib/api";
import { AdminKycSubmission } from "@/types/user";

type StatusFilter = "all" | "pending" | "approved" | "rejected";

function statusChipColor(status: string) {
  if (status === "approved") return "success";
  if (status === "pending") return "warning";
  return "error";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function KycReviewSection() {
  const [submissions, setSubmissions] = useState<AdminKycSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // Reject dialog state
  const [rejectTarget, setRejectTarget] = useState<AdminKycSubmission | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [rejectError, setRejectError] = useState("");

  // Document preview dialog
  const [previewKyc, setPreviewKyc] = useState<AdminKycSubmission | null>(null);

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getAdminKyc(1, statusFilter === "all" ? undefined : statusFilter);
      setSubmissions(res.data);
    } catch {
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const handleApprove = async (kyc: AdminKycSubmission) => {
    setActionLoading(kyc.id);
    try {
      await api.approveKyc(kyc.id);
      await fetchSubmissions();
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectTarget) return;
    if (!rejectNote.trim()) {
      setRejectError("Please provide a reason for rejection.");
      return;
    }
    setActionLoading(rejectTarget.id);
    try {
      await api.rejectKyc(rejectTarget.id, rejectNote.trim());
      setRejectTarget(null);
      setRejectNote("");
      setRejectError("");
      await fetchSubmissions();
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <>
      <Paper variant="outlined" sx={{ borderRadius: 2, mb: 4 }}>
        <Box sx={{ p: 3, borderBottom: "1px solid", borderColor: "grey.200" }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
            <Stack direction="row" alignItems="center" gap={1}>
              <VerifiedUserIcon color="primary" />
              <Box>
                <Typography fontWeight={700} fontSize={17}>Identity Verification (KYC) Queue</Typography>
                <Typography variant="body2" color="text.secondary">Review and approve user identity documents</Typography>
              </Box>
            </Stack>
            <ToggleButtonGroup
              value={statusFilter}
              exclusive
              onChange={(_, v) => { if (v) setStatusFilter(v); }}
              size="small"
            >
              <ToggleButton value="pending">Pending</ToggleButton>
              <ToggleButton value="approved">Approved</ToggleButton>
              <ToggleButton value="rejected">Rejected</ToggleButton>
              <ToggleButton value="all">All</ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        ) : submissions.length === 0 ? (
          <Box sx={{ py: 6, textAlign: "center" }}>
            <Typography color="text.secondary">No {statusFilter !== "all" ? statusFilter : ""} KYC submissions.</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "grey.50" }}>
                  {["User", "Role", "Submitted", "Status", "Actions"].map(h => (
                    <TableCell key={h} sx={{ fontWeight: 600, fontSize: 12, color: "text.secondary", textTransform: "uppercase" }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {submissions.map(k => (
                  <TableRow key={k.id} hover>
                    <TableCell>
                      <Stack direction="row" alignItems="center" gap={1.5}>
                        <Avatar src={k.user.avatar_url ?? undefined} sx={{ width: 32, height: 32, fontSize: 13 }}>
                          {k.user.name[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>{k.user.name}</Typography>
                          <Typography variant="caption" color="text.secondary">{k.user.email ?? k.user.telephone}</Typography>
                          {k.admin_note && (
                            <Typography variant="caption" color="error.main" display="block">
                              Note: {k.admin_note}
                            </Typography>
                          )}
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" gap={0.5}>
                        {k.user.is_freelancer && <Chip label="Freelancer" size="small" variant="outlined" />}
                        {k.user.is_client && <Chip label="Client" size="small" variant="outlined" />}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">{formatDate(k.submitted_at)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={k.status} size="small" color={statusChipColor(k.status) as "success" | "warning" | "error"} sx={{ textTransform: "capitalize" }} />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" gap={0.5}>
                        <IconButton size="small" title="View documents" onClick={() => setPreviewKyc(k)}>
                          <VisibilityIcon fontSize="small" color="primary" />
                        </IconButton>
                        {k.status === "pending" && (
                          <>
                            <IconButton
                              size="small"
                              title="Approve"
                              disabled={actionLoading === k.id}
                              onClick={() => handleApprove(k)}
                            >
                              {actionLoading === k.id
                                ? <CircularProgress size={16} />
                                : <CheckCircleIcon fontSize="small" color="success" />}
                            </IconButton>
                            <IconButton
                              size="small"
                              title="Reject"
                              disabled={actionLoading === k.id}
                              onClick={() => { setRejectTarget(k); setRejectNote(""); setRejectError(""); }}
                            >
                              <CancelIcon fontSize="small" color="error" />
                            </IconButton>
                          </>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Document preview dialog */}
      <Dialog open={!!previewKyc} onClose={() => setPreviewKyc(null)} maxWidth="md" fullWidth>
        <DialogTitle>KYC Documents — {previewKyc?.user.name}</DialogTitle>
        <DialogContent>
          <Stack direction={{ xs: "column", sm: "row" }} gap={2} sx={{ mt: 1 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" fontWeight={600} gutterBottom>ID Document</Typography>
              {previewKyc?.id_document_url ? (
                <Box
                  component="img"
                  src={previewKyc.id_document_url}
                  alt="ID document"
                  sx={{ width: "100%", borderRadius: 2, border: 1, borderColor: "divider" }}
                />
              ) : (
                <Typography variant="body2" color="text.secondary">No image available</Typography>
              )}
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" fontWeight={600} gutterBottom>Selfie with ID</Typography>
              {previewKyc?.selfie_url ? (
                <Box
                  component="img"
                  src={previewKyc.selfie_url}
                  alt="Selfie"
                  sx={{ width: "100%", borderRadius: 2, border: 1, borderColor: "divider" }}
                />
              ) : (
                <Typography variant="body2" color="text.secondary">No image available</Typography>
              )}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          {previewKyc?.status === "pending" && (
            <>
              <Button
                color="success"
                onClick={() => { handleApprove(previewKyc!); setPreviewKyc(null); }}
              >
                Approve
              </Button>
              <Button
                color="error"
                onClick={() => { setRejectTarget(previewKyc); setPreviewKyc(null); setRejectNote(""); setRejectError(""); }}
              >
                Reject
              </Button>
            </>
          )}
          <Button onClick={() => setPreviewKyc(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Reject dialog */}
      <Dialog open={!!rejectTarget} onClose={() => setRejectTarget(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Reject KYC — {rejectTarget?.user.name}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Please provide a reason. The user will see this message and can resubmit.
          </Typography>
          <TextField
            label="Rejection reason"
            fullWidth
            multiline
            rows={3}
            value={rejectNote}
            onChange={e => { setRejectNote(e.target.value); setRejectError(""); }}
            error={!!rejectError}
            helperText={rejectError}
            placeholder="e.g. Document is blurry or expired."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectTarget(null)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            disabled={actionLoading === rejectTarget?.id}
            onClick={handleRejectConfirm}
          >
            {actionLoading === rejectTarget?.id ? <CircularProgress size={18} color="inherit" /> : "Reject"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
