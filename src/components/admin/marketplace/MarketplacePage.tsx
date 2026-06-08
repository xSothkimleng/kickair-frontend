"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import {
  Box, Typography, Avatar, Tooltip, CircularProgress, Skeleton, Alert, Snackbar,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button,
} from "@mui/material";
import { SearchInput, TextArea } from "@/components/ui/inputs";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import SellOutlinedIcon from "@mui/icons-material/SellOutlined";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import PowerSettingsNewOutlinedIcon from "@mui/icons-material/PowerSettingsNewOutlined";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import { api } from "@/lib/api";
import { Service } from "@/types/service";
import { JobPost } from "@/types/job";
import { tokens } from "@/theme";
import DisputeReviewSection from "../trust/DisputeReviewSection";
import CategoryAssignDialog, { CategoryAssignTarget } from "./CategoryAssignDialog";
import { registerAdminRefresh } from "@/components/layout/GlobalNotificationToast";
import { SectionTabs, FilterPills, AdminEmpty, adminCardSx, adminTableSx, type PillOption } from "@/components/admin/adminKit";
import { StatusPill, CoverThumb, CategoryPill, type CardTone } from "@/components/dashboard/ManagementCard";

type TabId = "services" | "jobs" | "hiring" | "disputes" | "reviews";

const TAB_COPY: Record<TabId, { title: string; desc: string }> = {
  services: { title: "Freelancer Services", desc: "Review and moderate services freelancers offer. Approve new listings, assign categories, and disable anything that breaks policy." },
  jobs: { title: "Client Jobs", desc: "Moderate jobs posted by clients. Approve listings, set the right category, and reject jobs that violate marketplace rules." },
  hiring: { title: "Freelancer Hiring", desc: "Direct hiring requests sent from clients to specific freelancers." },
  disputes: { title: "Disputes", desc: "Order disputes raised on the marketplace. Full review lives in Trust & Safety." },
  reviews: { title: "Reviews", desc: "Flagged or reported reviews awaiting moderation." },
};

const SERVICE_FILTERS: PillOption[] = [
  { id: "pending_review", label: "Pending review" },
  { id: "active", label: "Active" },
  { id: "rejected", label: "Rejected" },
  { id: "disabled", label: "Disabled" },
  { id: "", label: "All" },
];
const JOB_FILTERS: PillOption[] = [
  { id: "pending_review", label: "Pending review" },
  { id: "open", label: "Open" },
  { id: "rejected", label: "Rejected" },
  { id: "", label: "All" },
];

const REJECT_PRESETS: Record<"reject" | "disable", string[]> = {
  reject: ["Incomplete or low-quality listing", "Misleading title or description", "Prohibited / out-of-policy", "Pricing looks fraudulent"],
  disable: ["Repeated buyer complaints", "Quality below marketplace standard", "Policy violation reported"],
};

function listingPill(status: string): { tone: CardTone; label: string } {
  const m: Record<string, { tone: CardTone; label: string }> = {
    active: { tone: "success", label: "Active" }, open: { tone: "success", label: "Open" },
    pending_review: { tone: "pending", label: "Pending review" }, rejected: { tone: "error", label: "Rejected" },
    in_progress: { tone: "info", label: "In progress" }, completed: { tone: "neutral", label: "Completed" },
    cancelled: { tone: "neutral", label: "Cancelled" }, disabled: { tone: "neutral", label: "Disabled" },
  };
  return m[status] ?? { tone: "neutral", label: status };
}

/* Thumbnail + title cell */
function ListingCell({ src, title }: { src?: string | null; title: string }) {
  return (
    <Box sx={{ display: "flex", gap: 1.625, alignItems: "center", minWidth: 0 }}>
      <CoverThumb src={src} size={42} radius={9} />
      <Typography sx={{ fontSize: 14, fontWeight: 500, letterSpacing: "-0.012em", lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{title}</Typography>
    </Box>
  );
}

function PartyCell({ name, avatar }: { name: string; avatar?: string | null }) {
  return (
    <Box sx={{ display: "flex", gap: 1.125, alignItems: "center", minWidth: 0 }}>
      <Avatar src={avatar ?? undefined} sx={{ width: 30, height: 30, fontSize: 12 }}>{name.charAt(0)}</Avatar>
      <Typography sx={{ fontSize: 13.5, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</Typography>
    </Box>
  );
}

function CategoryCell({ category, requested }: { category?: { category_name: string } | null; requested?: string | null }) {
  if (category) return <CategoryPill>{category.category_name}</CategoryPill>;
  if (requested) {
    return (
      <Box component="span" sx={{ display: "inline-flex", alignItems: "center", height: 24, px: 1.375, borderRadius: "999px", fontSize: 11.5, fontWeight: 600, bgcolor: tokens.pendingTint, color: tokens.pendingText, whiteSpace: "nowrap" }}>
        Requested: {requested}
      </Box>
    );
  }
  return <Typography sx={{ fontSize: 13, color: tokens.text3 }}>—</Typography>;
}

const dividerSx = { width: "1px", height: 22, bgcolor: tokens.border, mx: 0.25, flex: "none" } as const;

function IconActBtn({ title, onClick, highlight, children }: { title: string; onClick: () => void; highlight?: boolean; children: ReactNode }) {
  return (
    <Tooltip title={title}>
      <Box component="button" onClick={onClick} sx={{ width: 34, height: 34, borderRadius: "9px", border: 0, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", bgcolor: "transparent", color: highlight ? tokens.pendingText : tokens.text3, "&:hover": { bgcolor: "rgba(0,0,0,0.05)", color: highlight ? tokens.pendingText : tokens.text } }}>{children}</Box>
    </Tooltip>
  );
}

function ActBtn({ tone, icon, children, onClick, busy }: { tone: "approve" | "reject" | "disable" | "enable"; icon?: ReactNode; children: ReactNode; onClick: () => void; busy?: boolean }) {
  const s = {
    approve: { bg: tokens.success, color: "#fff", border: "transparent", hover: tokens.successText },
    enable: { bg: tokens.surface, color: tokens.successText, border: tokens.borderStrong, hover: tokens.surface2 },
    reject: { bg: tokens.surface, color: tokens.errorText, border: tokens.borderStrong, hover: tokens.errorTint },
    disable: { bg: tokens.surface, color: tokens.errorText, border: tokens.borderStrong, hover: tokens.errorTint },
  }[tone];
  return (
    <Box component="button" disabled={busy} onClick={onClick}
      sx={{ height: 30, px: 1.5, borderRadius: "999px", display: "inline-flex", alignItems: "center", gap: 0.625, cursor: busy ? "default" : "pointer", fontFamily: "inherit", fontSize: 12.5, fontWeight: 600, border: `1px solid ${s.border}`, bgcolor: s.bg, color: s.color, opacity: busy ? 0.65 : 1, whiteSpace: "nowrap", "&:hover": busy ? {} : { bgcolor: s.hover } }}>
      {busy ? <CircularProgress size={13} sx={{ color: s.color }} /> : icon}{children}
    </Box>
  );
}

function TableSkeleton() {
  return (
    <Box sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 2.25 }}>
      {[0, 1, 2, 3].map(i => (
        <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Skeleton variant="rounded" width={42} height={42} sx={{ borderRadius: "9px" }} />
          <Skeleton variant="text" width="26%" /><Skeleton variant="text" width="18%" /><Skeleton variant="rounded" width={100} height={24} sx={{ borderRadius: "999px", ml: "auto" }} /><Skeleton variant="rounded" width={150} height={30} sx={{ borderRadius: "999px" }} />
        </Box>
      ))}
    </Box>
  );
}

type RejectTarget = { kind: "service" | "job"; id: number; title: string; action: "reject" | "disable" } | null;

export default function MarketplacePage() {
  const [tab, setTab] = useState<TabId>("services");

  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [servicesError, setServicesError] = useState<string | null>(null);
  const [serviceSearch, setServiceSearch] = useState("");
  const [serviceStatus, setServiceStatus] = useState("pending_review");

  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobsError, setJobsError] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState("pending_review");

  const [actioningId, setActioningId] = useState<number | null>(null);
  const [rejectTarget, setRejectTarget] = useState<RejectTarget>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [categoryTarget, setCategoryTarget] = useState<CategoryAssignTarget | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const loadServices = useCallback(() => {
    setServicesLoading(true);
    setServicesError(null);
    api.getAdminServices(serviceStatus)
      .then(data => setServices(data ?? []))
      .catch(() => setServicesError("Failed to load services."))
      .finally(() => setServicesLoading(false));
  }, [serviceStatus]);

  const loadJobs = useCallback(() => {
    setJobsLoading(true);
    setJobsError(null);
    api.getAdminJobPosts(jobStatus)
      .then(data => setJobs(data ?? []))
      .catch(() => setJobsError("Failed to load client jobs."))
      .finally(() => setJobsLoading(false));
  }, [jobStatus]);

  useEffect(() => { if (tab === "services") loadServices(); }, [tab, loadServices]);
  useEffect(() => { if (tab === "jobs") loadJobs(); }, [tab, loadJobs]);

  // Live: a new service/job submission pushes an admin alert — refetch the open tab.
  useEffect(() => registerAdminRefresh(type => {
    if (type === "admin_service_pending" && tab === "services") loadServices();
    if (type === "admin_job_pending" && tab === "jobs") loadJobs();
  }), [tab, loadServices, loadJobs]);

  const filteredServices = services.filter(s =>
    s.title.toLowerCase().includes(serviceSearch.toLowerCase()) ||
    (s.freelancer_profile?.user?.name ?? "").toLowerCase().includes(serviceSearch.toLowerCase())
  );

  const lowestPrice = (s: Service) => {
    const prices = s.pricing_options?.map(p => Number(p.price_raw)).filter(p => p > 0) ?? [];
    return prices.length ? Math.min(...prices) : null;
  };

  const approveService = async (id: number) => {
    setActioningId(id);
    try { await api.approveService(id); setToast("Service approved."); loadServices(); }
    catch { setToast("Failed to approve service."); }
    finally { setActioningId(null); }
  };
  const approveJob = async (id: number) => {
    setActioningId(id);
    try { await api.approveJobPost(id); setToast("Job post approved."); loadJobs(); }
    catch { setToast("Failed to approve job post."); }
    finally { setActioningId(null); }
  };
  const confirmReject = async () => {
    if (!rejectTarget) return;
    const { kind, id, action } = rejectTarget;
    const reason = rejectReason.trim() || undefined;
    setActioningId(id);
    try {
      if (action === "disable") { await api.disableService(id, reason); setToast("Service disabled."); loadServices(); }
      else if (kind === "service") { await api.rejectService(id, reason); setToast("Service rejected."); loadServices(); }
      else { await api.rejectJobPost(id, reason); setToast("Job post rejected."); loadJobs(); }
      setRejectTarget(null);
      setRejectReason("");
    } catch { setToast("Action failed. Please try again."); }
    finally { setActioningId(null); }
  };
  const enableService = async (id: number) => {
    setActioningId(id);
    try { await api.enableService(id); setToast("Service re-enabled."); loadServices(); }
    catch { setToast("Failed to re-enable service."); }
    finally { setActioningId(null); }
  };

  const tabs = [
    { id: "services", label: "Freelancer Services", count: services.length || undefined },
    { id: "jobs", label: "Client Jobs", count: jobs.length || undefined },
    { id: "hiring", label: "Freelancer Hiring" },
    { id: "disputes", label: "Disputes" },
    { id: "reviews", label: "Reviews" },
  ];

  return (
    <Box sx={{ p: { xs: 2.5, md: 4 } }}>
      <Box sx={{ maxWidth: 1280, mx: "auto", display: "flex", flexDirection: "column", gap: 2.75 }}>
        <Box>
          <Typography sx={{ fontSize: { xs: 24, md: 28 }, fontWeight: 600, letterSpacing: "-0.025em" }}>Marketplace Operations</Typography>
          <Typography sx={{ fontSize: 14, color: tokens.text2, mt: 0.5 }}>Moderate everything that goes live on KickAir — services, jobs, and more.</Typography>
        </Box>

        <SectionTabs tabs={tabs} value={tab} onChange={t => setTab(t as TabId)} />

        <Box>
          <Typography sx={{ fontSize: 21, fontWeight: 600, letterSpacing: "-0.02em" }}>{TAB_COPY[tab].title}</Typography>
          <Typography sx={{ fontSize: 13.5, color: tokens.text2, mt: 0.375, maxWidth: 640, lineHeight: 1.5 }}>{TAB_COPY[tab].desc}</Typography>
        </Box>

        {/* ── Freelancer Services ── */}
        {tab === "services" && (
          <>
            <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1.75, flexWrap: "wrap", alignItems: "center" }}>
              <FilterPills options={SERVICE_FILTERS} value={serviceStatus} onChange={setServiceStatus} />
              <Box sx={{ width: 300 }}><SearchInput size="sm" placeholder="Search services or freelancers…" value={serviceSearch} onChange={setServiceSearch} /></Box>
            </Box>
            <Box sx={adminCardSx}>
              {servicesLoading ? <TableSkeleton />
                : servicesError ? <Box sx={{ p: 3 }}><Alert severity="error">{servicesError}</Alert></Box>
                : filteredServices.length === 0 ? <AdminEmpty icon={<StorefrontOutlinedIcon sx={{ fontSize: 28 }} />} title={serviceSearch || serviceStatus ? "No results match your filters" : "The queue is empty"} body={serviceSearch || serviceStatus ? "Try a different status filter or clear your search." : "Every service has been reviewed. New submissions will land here."} />
                : (
                  <TableContainer>
                    <Table sx={adminTableSx}>
                      <TableHead>
                        <TableRow>
                          <TableCell>Service</TableCell><TableCell>Freelancer</TableCell><TableCell>Category</TableCell>
                          <TableCell align="right">Price</TableCell><TableCell>Status</TableCell><TableCell align="right" />
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredServices.map(s => {
                          const price = lowestPrice(s);
                          const busy = actioningId === s.id;
                          const cfg = listingPill(s.status);
                          return (
                            <TableRow key={s.id}>
                              <TableCell sx={{ maxWidth: 320 }}><ListingCell src={s.feature_image?.file_url} title={s.title} /></TableCell>
                              <TableCell><PartyCell name={s.freelancer_profile?.user?.name ?? "—"} avatar={s.freelancer_profile?.user?.avatar_url} /></TableCell>
                              <TableCell><CategoryCell category={s.category} requested={s.requested_category} /></TableCell>
                              <TableCell align="right"><Typography sx={{ fontSize: 13.5, fontWeight: 600, fontFamily: tokens.mono }}>{price != null ? `$${price}` : "—"}</Typography></TableCell>
                              <TableCell><StatusPill tone={cfg.tone} label={cfg.label} /></TableCell>
                              <TableCell align="right">
                                <Box sx={{ display: "flex", gap: 0.75, alignItems: "center", justifyContent: "flex-end" }}>
                                  <IconActBtn title="Preview in new tab" onClick={() => window.open(`/explore-services/${s.id}`, "_blank", "noopener,noreferrer")}><VisibilityOutlinedIcon sx={{ fontSize: 18 }} /></IconActBtn>
                                  <IconActBtn title={s.requested_category ? "Review requested category" : "Set / change category"} highlight={!!s.requested_category} onClick={() => setCategoryTarget({ kind: "service", id: s.id, title: s.title, requestedCategory: s.requested_category, requestedParentId: s.requested_parent_id })}><SellOutlinedIcon sx={{ fontSize: 18 }} /></IconActBtn>
                                  {s.status === "pending_review" && (<>
                                    <Box sx={dividerSx} />
                                    <ActBtn tone="approve" busy={busy} icon={<CheckOutlinedIcon sx={{ fontSize: 15 }} />} onClick={() => approveService(s.id)}>Approve</ActBtn>
                                    <ActBtn tone="reject" icon={<CloseOutlinedIcon sx={{ fontSize: 15 }} />} onClick={() => { setRejectTarget({ kind: "service", id: s.id, title: s.title, action: "reject" }); setRejectReason(""); }}>Reject</ActBtn>
                                  </>)}
                                  {s.status === "active" && (<>
                                    <Box sx={dividerSx} />
                                    <ActBtn tone="disable" icon={<BlockOutlinedIcon sx={{ fontSize: 15 }} />} onClick={() => { setRejectTarget({ kind: "service", id: s.id, title: s.title, action: "disable" }); setRejectReason(""); }}>Disable</ActBtn>
                                  </>)}
                                  {s.status === "disabled" && (<>
                                    <Box sx={dividerSx} />
                                    <ActBtn tone="enable" busy={busy} icon={<PowerSettingsNewOutlinedIcon sx={{ fontSize: 15 }} />} onClick={() => enableService(s.id)}>Enable</ActBtn>
                                  </>)}
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
          </>
        )}

        {/* ── Client Jobs ── */}
        {tab === "jobs" && (
          <>
            <FilterPills options={JOB_FILTERS} value={jobStatus} onChange={setJobStatus} />
            <Box sx={adminCardSx}>
              {jobsLoading ? <TableSkeleton />
                : jobsError ? <Box sx={{ p: 3 }}><Alert severity="error">{jobsError}</Alert></Box>
                : jobs.length === 0 ? <AdminEmpty icon={<StorefrontOutlinedIcon sx={{ fontSize: 28 }} />} title="The queue is empty" body="Every job has been reviewed. New client submissions will land here." />
                : (
                  <TableContainer>
                    <Table sx={adminTableSx}>
                      <TableHead>
                        <TableRow>
                          <TableCell>Job</TableCell><TableCell>Client</TableCell><TableCell>Category</TableCell>
                          <TableCell align="right">Budget</TableCell><TableCell>Status</TableCell><TableCell align="right" />
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {jobs.map(j => {
                          const busy = actioningId === j.id;
                          const cfg = listingPill(j.status);
                          const clientName = j.client_profile?.company_name || j.client_profile?.user?.name || "—";
                          return (
                            <TableRow key={j.id}>
                              <TableCell sx={{ maxWidth: 320 }}><ListingCell title={j.title} /></TableCell>
                              <TableCell><PartyCell name={clientName} avatar={j.client_profile?.user?.avatar_url} /></TableCell>
                              <TableCell><CategoryCell category={j.category} requested={j.requested_category} /></TableCell>
                              <TableCell align="right"><Typography sx={{ fontSize: 13.5, fontWeight: 600, fontFamily: tokens.mono, whiteSpace: "nowrap" }}>${j.budget_min} – ${j.budget_max}</Typography></TableCell>
                              <TableCell><StatusPill tone={cfg.tone} label={cfg.label} /></TableCell>
                              <TableCell align="right">
                                <Box sx={{ display: "flex", gap: 0.75, alignItems: "center", justifyContent: "flex-end" }}>
                                  <IconActBtn title="Preview in new tab" onClick={() => window.open(`/jobs/${j.id}`, "_blank", "noopener,noreferrer")}><VisibilityOutlinedIcon sx={{ fontSize: 18 }} /></IconActBtn>
                                  <IconActBtn title={j.requested_category ? "Review requested category" : "Set / change category"} highlight={!!j.requested_category} onClick={() => setCategoryTarget({ kind: "job", id: j.id, title: j.title, requestedCategory: j.requested_category, requestedParentId: j.requested_parent_id })}><SellOutlinedIcon sx={{ fontSize: 18 }} /></IconActBtn>
                                  {j.status === "pending_review" && (<>
                                    <Box sx={dividerSx} />
                                    <ActBtn tone="approve" busy={busy} icon={<CheckOutlinedIcon sx={{ fontSize: 15 }} />} onClick={() => approveJob(j.id)}>Approve</ActBtn>
                                    <ActBtn tone="reject" icon={<CloseOutlinedIcon sx={{ fontSize: 15 }} />} onClick={() => { setRejectTarget({ kind: "job", id: j.id, title: j.title, action: "reject" }); setRejectReason(""); }}>Reject</ActBtn>
                                  </>)}
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
          </>
        )}

        {/* ── Disputes (shared component) ── */}
        {tab === "disputes" && <DisputeReviewSection />}

        {/* ── Hiring ── */}
        {tab === "hiring" && (
          <Box sx={adminCardSx}><AdminEmpty icon={<StorefrontOutlinedIcon sx={{ fontSize: 28 }} />} title="Nothing in this queue" body="No direct hiring requests need moderation right now. New items will appear here." /></Box>
        )}

        {/* ── Reviews ── */}
        {tab === "reviews" && (
          <Box sx={adminCardSx}><AdminEmpty icon={<StorefrontOutlinedIcon sx={{ fontSize: 28 }} />} title="Nothing in this queue" body="No flagged reviews awaiting moderation. Reported reviews will show up here." /></Box>
        )}
      </Box>

      {/* ── Reason dialog (reject pending / disable active) ── */}
      <Dialog open={!!rejectTarget} onClose={() => setRejectTarget(null)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 600 }}>
          {rejectTarget?.action === "disable" ? "Disable service" : `Reject ${rejectTarget?.kind === "job" ? "job post" : "service"}`}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2, fontSize: 13.5, color: tokens.text2 }}>
            {rejectTarget?.action === "disable"
              ? <>Taking down <strong>{rejectTarget?.title}</strong>. It will be hidden from the public and the freelancer will be notified. You can re-enable it later.</>
              : <>Rejecting <strong>{rejectTarget?.title}</strong>. The owner will be notified and can edit and resubmit.</>}
          </DialogContentText>
          {rejectTarget && (
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
              {REJECT_PRESETS[rejectTarget.action].map(p => (
                <Box key={p} component="button" onClick={() => setRejectReason(p)}
                  sx={{ height: 30, px: 1.5, borderRadius: "999px", cursor: "pointer", fontFamily: "inherit", fontSize: 12.5, fontWeight: 500, border: `1px solid ${tokens.border}`, bgcolor: tokens.surface, color: tokens.text2, "&:hover": { borderColor: tokens.borderStrong, color: tokens.text } }}>{p}</Box>
              ))}
            </Box>
          )}
          <TextArea label="Reason (optional)" minRows={3} maxLength={500} value={rejectReason} onChange={setRejectReason} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setRejectTarget(null)} sx={{ textTransform: "none", color: tokens.text2 }}>Cancel</Button>
          <Button variant="contained" color="error" disableElevation onClick={confirmReject} disabled={actioningId === rejectTarget?.id} sx={{ textTransform: "none", fontWeight: 600 }}>
            {rejectTarget?.action === "disable" ? "Disable listing" : "Reject & notify"}
          </Button>
        </DialogActions>
      </Dialog>

      <CategoryAssignDialog
        open={!!categoryTarget}
        target={categoryTarget}
        onClose={() => setCategoryTarget(null)}
        onDone={msg => { setToast(msg); if (categoryTarget?.kind === "service") loadServices(); else loadJobs(); }}
      />

      <Snackbar open={!!toast} autoHideDuration={3000} onClose={() => setToast(null)} message={toast} anchorOrigin={{ vertical: "bottom", horizontal: "center" }} />
    </Box>
  );
}
