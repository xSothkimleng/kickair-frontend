"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Box, Paper, Typography, Stack, Tabs, Tab,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Chip, IconButton, CircularProgress, Alert, Button, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Snackbar,
} from "@mui/material";
import { SearchInput, SelectInput, TextArea } from "@/components/ui/inputs";
import VisibilityIcon from "@mui/icons-material/Visibility";
import WorkIcon from "@mui/icons-material/Work";
import PeopleIcon from "@mui/icons-material/People";
import PersonIcon from "@mui/icons-material/Person";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import BlockIcon from "@mui/icons-material/Block";
import { api } from "@/lib/api";
import { Service } from "@/types/service";
import { JobPost } from "@/types/job";
import DisputeReviewSection from "../trust/DisputeReviewSection";
import { registerAdminRefresh } from "@/components/layout/GlobalNotificationToast";

function EmptyState({ label }: { label: string }) {
  return (
    <Box sx={{ py: 10, textAlign: "center" }}>
      <Typography variant="body2" color="text.disabled">{label}</Typography>
    </Box>
  );
}

type StatusChipColor = "success" | "warning" | "error" | "default";

function StatusChip({ status }: { status: string }) {
  const map: Record<string, { label: string; color: StatusChipColor }> = {
    active: { label: "Active", color: "success" },
    open: { label: "Open", color: "success" },
    pending_review: { label: "Pending review", color: "warning" },
    rejected: { label: "Rejected", color: "error" },
    in_progress: { label: "In progress", color: "default" },
    completed: { label: "Completed", color: "default" },
    cancelled: { label: "Cancelled", color: "default" },
    disabled: { label: "Disabled", color: "error" },
  };
  const cfg = map[status] ?? { label: status, color: "default" as StatusChipColor };
  return <Chip label={cfg.label} size="small" color={cfg.color} variant={cfg.color === "default" ? "outlined" : "filled"} />;
}

const SERVICE_STATUS_FILTERS = [
  { value: "pending_review", label: "Pending review" },
  { value: "active", label: "Active" },
  { value: "rejected", label: "Rejected" },
  { value: "disabled", label: "Disabled" },
  { value: "", label: "All" },
];

// What a reason-dialog targets. action: reject (pending) or disable (active takedown).
type RejectTarget = { kind: "service" | "job"; id: number; title: string; action: "reject" | "disable" } | null;

export default function MarketplacePage() {
  const [tab, setTab] = useState(0);

  // ── Services ──
  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [servicesError, setServicesError] = useState<string | null>(null);
  const [serviceSearch, setServiceSearch] = useState("");
  const [serviceStatus, setServiceStatus] = useState("pending_review");

  // ── Job posts (client gigs) ──
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobsError, setJobsError] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState("pending_review");

  // ── Action state ──
  const [actioningId, setActioningId] = useState<number | null>(null);
  const [rejectTarget, setRejectTarget] = useState<RejectTarget>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const loadServices = useCallback(() => {
    setServicesLoading(true);
    setServicesError(null);
    api.getAdminServices(serviceStatus)
      .then((data) => setServices(data ?? []))
      .catch(() => setServicesError("Failed to load services."))
      .finally(() => setServicesLoading(false));
  }, [serviceStatus]);

  const loadJobs = useCallback(() => {
    setJobsLoading(true);
    setJobsError(null);
    api.getAdminJobPosts(jobStatus)
      .then((data) => setJobs(data ?? []))
      .catch(() => setJobsError("Failed to load client gigs."))
      .finally(() => setJobsLoading(false));
  }, [jobStatus]);

  useEffect(() => { if (tab === 0) loadServices(); }, [tab, loadServices]);
  useEffect(() => { if (tab === 1) loadJobs(); }, [tab, loadJobs]);

  // Live: a new service/job submission pushes an admin alert — refetch the open tab.
  useEffect(() => registerAdminRefresh((type) => {
    if (type === "admin_service_pending" && tab === 0) loadServices();
    if (type === "admin_job_pending" && tab === 1) loadJobs();
  }), [tab, loadServices, loadJobs]);

  const filteredServices = services.filter(s =>
    s.title.toLowerCase().includes(serviceSearch.toLowerCase()) ||
    (s.freelancer_profile?.user?.name ?? "").toLowerCase().includes(serviceSearch.toLowerCase())
  );

  const lowestPrice = (s: Service) => {
    const prices = s.pricing_options?.map(p => Number(p.price_raw)).filter(p => p > 0) ?? [];
    return prices.length ? Math.min(...prices) : null;
  };

  // ── Approve / reject handlers ──
  const approveService = async (id: number) => {
    setActioningId(id);
    try {
      await api.approveService(id);
      setToast("Service approved.");
      loadServices();
    } catch {
      setToast("Failed to approve service.");
    } finally {
      setActioningId(null);
    }
  };

  const approveJob = async (id: number) => {
    setActioningId(id);
    try {
      await api.approveJobPost(id);
      setToast("Job post approved.");
      loadJobs();
    } catch {
      setToast("Failed to approve job post.");
    } finally {
      setActioningId(null);
    }
  };

  const confirmReject = async () => {
    if (!rejectTarget) return;
    const { kind, id, action } = rejectTarget;
    const reason = rejectReason.trim() || undefined;
    setActioningId(id);
    try {
      if (action === "disable") {
        await api.disableService(id, reason);
        setToast("Service disabled.");
        loadServices();
      } else if (kind === "service") {
        await api.rejectService(id, reason);
        setToast("Service rejected.");
        loadServices();
      } else {
        await api.rejectJobPost(id, reason);
        setToast("Job post rejected.");
        loadJobs();
      }
      setRejectTarget(null);
      setRejectReason("");
    } catch {
      setToast("Action failed. Please try again.");
    } finally {
      setActioningId(null);
    }
  };

  const enableService = async (id: number) => {
    setActioningId(id);
    try {
      await api.enableService(id);
      setToast("Service re-enabled.");
      loadServices();
    } catch {
      setToast("Failed to re-enable service.");
    } finally {
      setActioningId(null);
    }
  };

  const StatusFilter = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <Box sx={{ minWidth: 180 }}>
      <SelectInput
        size="sm"
        value={value}
        onChange={v => onChange(String(v))}
        options={SERVICE_STATUS_FILTERS}
      />
    </Box>
  );

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>Marketplace Operations</Typography>
        <Typography color="text.secondary">Manage all KickAir marketplace activities</Typography>
      </Box>

      <Paper variant="outlined" sx={{ borderRadius: 2 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{ borderBottom: "1px solid", borderColor: "grey.200", px: 2 }}
        >
          <Tab icon={<WorkIcon fontSize="small" />} iconPosition="start" label="Freelancer Services" />
          <Tab icon={<PeopleIcon fontSize="small" />} iconPosition="start" label="Client Jobs" />
          <Tab icon={<PersonIcon fontSize="small" />} iconPosition="start" label="Freelancer Hiring" />
          <Tab icon={<WarningAmberIcon fontSize="small" />} iconPosition="start" label="Disputes" />
          <Tab icon={<ThumbUpIcon fontSize="small" />} iconPosition="start" label="Reviews" />
        </Tabs>

        {/* ── Freelancer Services (real API + moderation) ── */}
        {tab === 0 && (
          <Box>
            <Box sx={{ p: 3, borderBottom: "1px solid", borderColor: "grey.200" }}>
              <Typography fontWeight={700} fontSize={17} mb={0.5}>Freelancer Services</Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Review and approve services before they go live on the marketplace
              </Typography>
              <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap alignItems="center">
                <Box sx={{ width: 320 }}>
                  <SearchInput
                    size="sm"
                    placeholder="Search by title or freelancer…"
                    value={serviceSearch}
                    onChange={setServiceSearch}
                  />
                </Box>
                <StatusFilter value={serviceStatus} onChange={setServiceStatus} />
              </Stack>
            </Box>

            {servicesLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress /></Box>
            ) : servicesError ? (
              <Box sx={{ p: 3 }}><Alert severity="error">{servicesError}</Alert></Box>
            ) : filteredServices.length === 0 ? (
              <EmptyState label="No services found for this status." />
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "grey.50" }}>
                      {["Service", "Freelancer", "Category", "Price from", "Status", "Actions"].map(h => (
                        <TableCell key={h} sx={{ fontWeight: 600, fontSize: 12, color: "text.secondary", textTransform: "uppercase" }}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredServices.map(s => {
                      const price = lowestPrice(s);
                      const busy = actioningId === s.id;
                      const isPending = s.status === "pending_review";
                      return (
                        <TableRow key={s.id} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight={500}>{s.title}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {s.freelancer_profile?.user?.name ?? "—"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {s.category ? (
                              <Chip label={s.category.category_name} size="small" color="secondary" variant="outlined" />
                            ) : <Typography variant="caption" color="text.disabled">—</Typography>}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={500}>
                              {price != null ? `$${price}` : "—"}
                            </Typography>
                          </TableCell>
                          <TableCell><StatusChip status={s.status} /></TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <Tooltip title="Preview in new tab">
                                <IconButton size="small" onClick={() => window.open(`/explore-services/${s.id}`, "_blank", "noopener,noreferrer")}>
                                  <VisibilityIcon fontSize="small" color="primary" />
                                </IconButton>
                              </Tooltip>
                              {isPending && (
                                <>
                                  <Button
                                    size="small" variant="contained" color="success" disabled={busy}
                                    startIcon={busy ? <CircularProgress size={14} color="inherit" /> : <CheckCircleIcon fontSize="small" />}
                                    onClick={() => approveService(s.id)}
                                    sx={{ textTransform: "none" }}
                                  >Approve</Button>
                                  <Button
                                    size="small" variant="outlined" color="error" disabled={busy}
                                    startIcon={<CancelIcon fontSize="small" />}
                                    onClick={() => { setRejectTarget({ kind: "service", id: s.id, title: s.title, action: "reject" }); setRejectReason(""); }}
                                    sx={{ textTransform: "none" }}
                                  >Reject</Button>
                                </>
                              )}
                              {s.status === "active" && (
                                <Button
                                  size="small" variant="outlined" color="error" disabled={busy}
                                  startIcon={<BlockIcon fontSize="small" />}
                                  onClick={() => { setRejectTarget({ kind: "service", id: s.id, title: s.title, action: "disable" }); setRejectReason(""); }}
                                  sx={{ textTransform: "none" }}
                                >Disable</Button>
                              )}
                              {s.status === "disabled" && (
                                <Button
                                  size="small" variant="contained" color="success" disabled={busy}
                                  startIcon={busy ? <CircularProgress size={14} color="inherit" /> : <CheckCircleIcon fontSize="small" />}
                                  onClick={() => enableService(s.id)}
                                  sx={{ textTransform: "none" }}
                                >Enable</Button>
                              )}
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {/* ── Client Jobs (job posts + moderation) ── */}
        {tab === 1 && (
          <Box>
            <Box sx={{ p: 3, borderBottom: "1px solid", borderColor: "grey.200" }}>
              <Typography fontWeight={700} fontSize={17} mb={0.5}>Client Jobs</Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Review and approve job listings before they go live
              </Typography>
              <StatusFilter value={jobStatus} onChange={setJobStatus} />
            </Box>

            {jobsLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress /></Box>
            ) : jobsError ? (
              <Box sx={{ p: 3 }}><Alert severity="error">{jobsError}</Alert></Box>
            ) : jobs.length === 0 ? (
              <EmptyState label="No client jobs found for this status." />
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "grey.50" }}>
                      {["Title", "Client", "Category", "Budget", "Status", "Actions"].map(h => (
                        <TableCell key={h} sx={{ fontWeight: 600, fontSize: 12, color: "text.secondary", textTransform: "uppercase" }}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {jobs.map(j => {
                      const busy = actioningId === j.id;
                      const isPending = j.status === "pending_review";
                      const clientName = j.client_profile?.company_name || j.client_profile?.user?.name || "—";
                      return (
                        <TableRow key={j.id} hover>
                          <TableCell><Typography variant="body2" fontWeight={500}>{j.title}</Typography></TableCell>
                          <TableCell><Typography variant="body2" color="text.secondary">{clientName}</Typography></TableCell>
                          <TableCell>
                            {j.category ? (
                              <Chip label={j.category.category_name} size="small" color="secondary" variant="outlined" />
                            ) : <Typography variant="caption" color="text.disabled">—</Typography>}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={500}>${j.budget_min} – ${j.budget_max}</Typography>
                          </TableCell>
                          <TableCell><StatusChip status={j.status} /></TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              {isPending && (
                                <>
                                  <Button
                                    size="small" variant="contained" color="success" disabled={busy}
                                    startIcon={busy ? <CircularProgress size={14} color="inherit" /> : <CheckCircleIcon fontSize="small" />}
                                    onClick={() => approveJob(j.id)}
                                    sx={{ textTransform: "none" }}
                                  >Approve</Button>
                                  <Button
                                    size="small" variant="outlined" color="error" disabled={busy}
                                    startIcon={<CancelIcon fontSize="small" />}
                                    onClick={() => { setRejectTarget({ kind: "job", id: j.id, title: j.title, action: "reject" }); setRejectReason(""); }}
                                    sx={{ textTransform: "none" }}
                                  >Reject</Button>
                                </>
                              )}
                              {!isPending && <Typography variant="caption" color="text.disabled">—</Typography>}
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {/* ── Hiring ── */}
        {tab === 2 && (
          <Box>
            <Box sx={{ p: 3, borderBottom: "1px solid", borderColor: "grey.200" }}>
              <Typography fontWeight={700} fontSize={17} mb={0.5}>Freelancer Hiring</Typography>
              <Typography variant="body2" color="text.secondary">Freelancers available for direct hire</Typography>
            </Box>
            <EmptyState label="Hiring management coming soon." />
          </Box>
        )}

        {/* ── Disputes (real API via shared component) ── */}
        {tab === 3 && (
          <Box sx={{ p: 3 }}>
            <DisputeReviewSection />
          </Box>
        )}

        {/* ── Reviews ── */}
        {tab === 4 && (
          <Box>
            <Box sx={{ p: 3, borderBottom: "1px solid", borderColor: "grey.200" }}>
              <Typography fontWeight={700} fontSize={17} mb={0.5}>Reviews & Ratings</Typography>
              <Typography variant="body2" color="text.secondary">Review moderation coming soon.</Typography>
            </Box>
            <EmptyState label="Review moderation coming soon." />
          </Box>
        )}
      </Paper>

      {/* ── Reason dialog (reject pending / disable active) ── */}
      <Dialog open={!!rejectTarget} onClose={() => setRejectTarget(null)} fullWidth maxWidth="sm">
        <DialogTitle>
          {rejectTarget?.action === "disable"
            ? "Disable service"
            : `Reject ${rejectTarget?.kind === "job" ? "job post" : "service"}`}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {rejectTarget?.action === "disable" ? (
              <>Taking down <strong>{rejectTarget?.title}</strong>. It will be hidden from the public and the freelancer will be notified. You can re-enable it later.</>
            ) : (
              <>Rejecting <strong>{rejectTarget?.title}</strong>. The owner will be notified. You can include an optional reason to help them fix and resubmit.</>
            )}
          </DialogContentText>
          <TextArea
            label="Reason (optional)"
            minRows={3}
            maxLength={500}
            value={rejectReason}
            onChange={setRejectReason}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setRejectTarget(null)} sx={{ textTransform: "none" }}>Cancel</Button>
          <Button
            variant="contained" color="error" onClick={confirmReject}
            disabled={actioningId === rejectTarget?.id}
            sx={{ textTransform: "none" }}
          >{rejectTarget?.action === "disable" ? "Disable" : "Reject"}</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!toast}
        autoHideDuration={3000}
        onClose={() => setToast(null)}
        message={toast}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </Box>
  );
}
