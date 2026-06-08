"use client";
import { useCallback, useEffect, useState } from "react";
import {
  Avatar, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Skeleton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography,
} from "@mui/material";
import { TextArea } from "@/components/ui/inputs";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import { api } from "@/lib/api";
import { AdminKycSubmission } from "@/types/user";
import { registerAdminRefresh } from "@/components/layout/GlobalNotificationToast";
import { tokens } from "@/theme";
import { StatusPill, type CardTone } from "@/components/dashboard/ManagementCard";
import { SectionHead, FilterPills, AdminEmpty, adminCardSx, adminTableSx } from "@/components/admin/adminKit";

type StatusFilter = "all" | "pending" | "approved" | "rejected";

const DOC_TYPE_LABEL: Record<string, string> = {
  national_id: "National ID",
  passport: "Passport",
  drivers_license: "Driver's License",
};

function kycTone(status: string): { tone: CardTone; label: string } {
  if (status === "approved") return { tone: "success", label: "Approved" };
  if (status === "pending") return { tone: "pending", label: "Pending" };
  return { tone: "error", label: "Rejected" };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function KycReviewSection() {
  const [submissions, setSubmissions] = useState<AdminKycSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const [rejectTarget, setRejectTarget] = useState<AdminKycSubmission | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [rejectError, setRejectError] = useState("");
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

  useEffect(() => { fetchSubmissions(); }, [fetchSubmissions]);

  // Live: a new KYC submission pushes an admin alert — refetch the queue.
  useEffect(() => registerAdminRefresh(type => { if (type === "admin_kyc_pending") fetchSubmissions(); }), [fetchSubmissions]);

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

  const pendingCount = submissions.filter(s => s.status === "pending").length;

  return (
    <Box component="section" sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <SectionHead
        icon={<BadgeOutlinedIcon sx={{ fontSize: 21 }} />}
        title="Identity verification (KYC) queue"
        count={loading || statusFilter === "approved" || statusFilter === "rejected" ? null : pendingCount}
        desc="Pending identity checks. Compare the submitted ID document against the live selfie, then approve or reject the verification."
      />

      <FilterPills
        options={[{ id: "pending", label: "Pending" }, { id: "approved", label: "Approved" }, { id: "rejected", label: "Rejected" }, { id: "all", label: "All" }]}
        value={statusFilter}
        onChange={v => setStatusFilter(v as StatusFilter)}
      />

      <Box sx={adminCardSx}>
        {loading ? (
          <Box sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 2 }}>
            {[0, 1, 2].map(i => (
              <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Skeleton variant="circular" width={32} height={32} /><Skeleton variant="text" width="32%" /><Skeleton variant="text" width="20%" /><Skeleton variant="rounded" width={80} height={24} sx={{ borderRadius: "999px" }} />
              </Box>
            ))}
          </Box>
        ) : submissions.length === 0 ? (
          <AdminEmpty icon={<VerifiedUserOutlinedIcon sx={{ fontSize: 28 }} />} title="No pending verifications" body="The KYC queue is clear. New identity submissions from users will show up here for review." />
        ) : (
          <TableContainer>
            <Table sx={adminTableSx}>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Document type</TableCell>
                  <TableCell>Submitted</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right" />
                </TableRow>
              </TableHead>
              <TableBody>
                {submissions.map(k => {
                  const cfg = kycTone(k.status);
                  return (
                    <TableRow key={k.id}>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.375 }}>
                          <Avatar src={k.user.avatar_url ?? undefined} sx={{ width: 32, height: 32, fontSize: 13 }}>{k.user.name[0]}</Avatar>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontSize: 13.5, fontWeight: 600, whiteSpace: "nowrap" }}>{k.user.name}</Typography>
                            <Typography sx={{ fontSize: 11.5, color: tokens.text3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 180 }}>{k.user.email ?? k.user.telephone}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, fontSize: 13.5, fontWeight: 500 }}>
                          <BadgeOutlinedIcon sx={{ fontSize: 17, color: tokens.text3 }} />
                          {DOC_TYPE_LABEL[k.document_type ?? ""] ?? "Document"}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.875, color: tokens.text2, fontSize: 13 }}>
                          <AccessTimeOutlinedIcon sx={{ fontSize: 14, color: tokens.text3 }} />{formatDate(k.submitted_at)}
                        </Box>
                      </TableCell>
                      <TableCell><StatusPill tone={cfg.tone} label={cfg.label} /></TableCell>
                      <TableCell align="right">
                        <Box
                          component="button"
                          onClick={() => setPreviewKyc(k)}
                          sx={{
                            height: 32, px: 1.75, borderRadius: "999px", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600,
                            border: `1px solid ${tokens.borderStrong}`, bgcolor: tokens.surface, color: tokens.text,
                            "&:hover": { bgcolor: tokens.surface2 },
                          }}>
                          Review
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Document review dialog */}
      <Dialog open={!!previewKyc} onClose={() => setPreviewKyc(null)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>
          Identity verification — {previewKyc?.user.name}
          {previewKyc?.document_type && (
            <Typography component="span" sx={{ ml: 1.5, fontSize: 13, color: tokens.text2 }}>{DOC_TYPE_LABEL[previewKyc.document_type] ?? previewKyc.document_type}</Typography>
          )}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(auto-fit, minmax(180px, 1fr))" }, gap: 2, mt: 1 }}>
            {[
              { label: previewKyc?.document_type === "passport" ? "Passport" : "ID front", url: previewKyc?.id_document_url },
              ...(previewKyc?.id_document_back_url ? [{ label: "ID back", url: previewKyc.id_document_back_url }] : []),
              { label: "Live selfie", url: previewKyc?.selfie_url },
            ].map(doc => (
              <Box key={doc.label}>
                <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 0.75 }}>{doc.label}</Typography>
                {doc.url ? (
                  <Box component="img" src={doc.url} alt={doc.label} sx={{ width: "100%", borderRadius: 2, border: `1px solid ${tokens.border}` }} />
                ) : (
                  <Typography sx={{ fontSize: 13, color: tokens.text3 }}>No image available</Typography>
                )}
              </Box>
            ))}
          </Box>
          {previewKyc?.admin_note && (
            <Typography sx={{ fontSize: 12.5, color: tokens.errorText, mt: 2 }}>Previous note: {previewKyc.admin_note}</Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          {previewKyc?.status === "pending" && (
            <>
              <Button color="error" onClick={() => { setRejectTarget(previewKyc); setPreviewKyc(null); setRejectNote(""); setRejectError(""); }} sx={{ textTransform: "none", fontWeight: 600 }}>Reject</Button>
              <Button variant="contained" color="success" disableElevation onClick={() => { handleApprove(previewKyc!); setPreviewKyc(null); }} sx={{ textTransform: "none", fontWeight: 600 }}>Approve verification</Button>
            </>
          )}
          <Button onClick={() => setPreviewKyc(null)} sx={{ textTransform: "none", color: tokens.text2 }}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Reject dialog */}
      <Dialog open={!!rejectTarget} onClose={() => setRejectTarget(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Reject verification — {rejectTarget?.user.name}</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: 13.5, color: tokens.text2, mb: 2 }}>Tell the user what to fix. They&rsquo;ll see this message and can resubmit.</Typography>
          <TextArea label="Rejection reason" minRows={3} value={rejectNote} onChange={v => { setRejectNote(v); setRejectError(""); }} error={rejectError || undefined} placeholder="e.g. Document is blurry or expired." />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setRejectTarget(null)} sx={{ textTransform: "none", color: tokens.text2 }}>Cancel</Button>
          <Button variant="contained" color="error" disableElevation disabled={actionLoading === rejectTarget?.id} onClick={handleRejectConfirm} sx={{ textTransform: "none", fontWeight: 600 }}>
            {actionLoading === rejectTarget?.id ? <CircularProgress size={18} color="inherit" /> : "Reject verification"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
