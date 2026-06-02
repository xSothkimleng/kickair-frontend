"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Container,
  Typography,
  Stack,
  Button,
  Avatar,
  CircularProgress,
  Alert,
  Dialog,
  DialogContent,
  TextField,
  IconButton,
} from "@mui/material";
import {
  ChevronLeft,
  Star,
  StarBorder,
  InsertDriveFile as FileIcon,
  Image as ImageIcon,
  AttachFile as AttachFileIcon,
  FileDownload as DownloadIcon,
  CheckCircle as CheckIcon,
} from "@mui/icons-material";
import { api } from "@/lib/api";
import { Order, OrderStatus, MyOrdersResponse, Review, Dispute, EvidenceFile } from "@/types/order";
import { useAuth } from "@/components/context/AuthContext";
import OrderTimeline from "@/components/dashboard/OrderTimeline";
import DeliverablesReference from "@/components/dashboard/DeliverablesReference";

// ─── Design tokens ────────────────────────────────────────────────────────────

const CARD = {
  bgcolor: "#FFFFFF",
  border: "1px solid rgba(15,23,42,0.08)",
  borderRadius: "14px",
  p: "24px 28px",
  boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
};

const SEC_LABEL = {
  fontSize: 11,
  fontWeight: 600,
  color: "#94A3B8",
  letterSpacing: "0.06em",
  textTransform: "uppercase" as const,
  mb: 1.75,
};

const BTN_PRIMARY = {
  height: 40,
  px: 2.5,
  borderRadius: "8px",
  textTransform: "none" as const,
  fontSize: 13,
  fontWeight: 600,
  letterSpacing: "-0.005em",
  bgcolor: "#0F172A",
  color: "#FFF",
  boxShadow: "none",
  "&:hover": { bgcolor: "#1E293B", boxShadow: "none" },
  "&.Mui-disabled": { bgcolor: "rgba(15,23,42,0.12)", color: "rgba(15,23,42,0.4)", boxShadow: "none" },
};

const BTN_OUTLINE = {
  height: 40,
  px: 2.5,
  borderRadius: "8px",
  textTransform: "none" as const,
  fontSize: 13,
  fontWeight: 600,
  letterSpacing: "-0.005em",
  color: "#0F172A",
  borderColor: "#E2E8F0",
  bgcolor: "#FFF",
  "&:hover": { bgcolor: "#0F172A", color: "#FFF", borderColor: "#0F172A" },
};

const BTN_DANGER = {
  height: 40,
  px: 2.5,
  borderRadius: "8px",
  textTransform: "none" as const,
  fontSize: 13,
  fontWeight: 600,
  letterSpacing: "-0.005em",
  color: "#DC2626",
  borderColor: "rgba(220,38,38,0.28)",
  bgcolor: "#FFF",
  "&:hover": { bgcolor: "#DC2626", color: "#FFF", borderColor: "#DC2626" },
};

const STATUS_MAP: Record<OrderStatus, { label: string; bgcolor: string; color: string }> = {
  pending:            { label: "Pending",            bgcolor: "#F1F5F9", color: "#64748B" },
  active:             { label: "Active",             bgcolor: "#EFF6FF", color: "#2563EB" },
  delivered:          { label: "Delivered",          bgcolor: "#EFF6FF", color: "#2563EB" },
  revision_requested: { label: "Revision Requested", bgcolor: "#FFF7ED", color: "#C2410C" },
  disputed:           { label: "Disputed",           bgcolor: "#FEF2F2", color: "#DC2626" },
  completed:          { label: "Completed",          bgcolor: "#F0FDF4", color: "#16A34A" },
  cancelled:          { label: "Cancelled",          bgcolor: "#F1F5F9", color: "#94A3B8" },
};

type UploadedFile = { url: string; file_name: string; file_type: string };

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: OrderStatus }) {
  const cfg = STATUS_MAP[status] ?? { label: status, bgcolor: "#F1F5F9", color: "#64748B" };
  return (
    <Box sx={{ display: "inline-flex", alignItems: "center", gap: "5px", height: 23, px: 1.25, borderRadius: "999px", bgcolor: cfg.bgcolor, color: cfg.color, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>
      <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "currentColor" }} />
      {cfg.label}
    </Box>
  );
}

function InteractiveStars({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;
  return (
    <Box sx={{ display: "flex", gap: 0.25 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <IconButton key={s} size="small" disableRipple onClick={() => onChange(s)} onMouseEnter={() => setHovered(s)} onMouseLeave={() => setHovered(0)} sx={{ p: 0.25, color: s <= display ? "#F59E0B" : "#E2E8F0" }}>
          {s <= display ? <Star sx={{ fontSize: 26 }} /> : <StarBorder sx={{ fontSize: 26 }} />}
        </IconButton>
      ))}
    </Box>
  );
}

function ReadonlyStars({ rating }: { rating: number }) {
  return (
    <Box sx={{ display: "flex", gap: "2px" }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} sx={{ fontSize: 14, color: s <= rating ? "#F59E0B" : "#E2E8F0" }} />
      ))}
    </Box>
  );
}

function FileRow({ file }: { file: UploadedFile }) {
  const isImage = file.file_type?.startsWith("image/");
  return (
    <Box component="a" href={file.url} target="_blank" rel="noopener noreferrer"
      sx={{ display: "flex", alignItems: "center", gap: 1.5, p: "10px 12px", border: "1px solid rgba(15,23,42,0.08)", borderRadius: "8px", textDecoration: "none", color: "inherit", transition: "border-color 0.12s", "&:hover": { borderColor: "#CBD5E1" } }}>
      <Box sx={{ width: 34, height: 34, bgcolor: "#F1F5F9", borderRadius: "7px", display: "grid", placeItems: "center", color: "#334155", flexShrink: 0 }}>
        {isImage ? <ImageIcon sx={{ fontSize: 16 }} /> : <FileIcon sx={{ fontSize: 16 }} />}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.file_name}</Typography>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, fontSize: 12, fontWeight: 600, color: "#334155", px: 1.25, py: 0.75, borderRadius: "6px", "&:hover": { bgcolor: "#F1F5F9" } }}>
        <DownloadIcon sx={{ fontSize: 14 }} /> Download
      </Box>
    </Box>
  );
}

type DeliveryHistoryEntry = { note: string | null; attachments: UploadedFile[]; submitted_at: string };

function PreviousSubmissions({ history }: { history?: DeliveryHistoryEntry[] }) {
  if (!history || history.length <= 1) return null;
  const prior = history.slice(0, -1).reverse(); // everything before the current delivery, newest first
  return (
    <Box sx={{ mt: 2.5, pt: 2, borderTop: "1px solid #F1F5F9" }}>
      <Typography sx={{ fontSize: 11, fontWeight: 600, color: "#94A3B8", letterSpacing: "0.06em", textTransform: "uppercase", mb: 1.25 }}>
        Previous submissions ({prior.length})
      </Typography>
      <Stack spacing={1.5}>
        {prior.map((sub, i) => (
          <Box key={i} sx={{ p: "12px 14px", bgcolor: "#F8FAFC", border: "1px solid #F1F5F9", borderRadius: "8px" }}>
            <Typography sx={{ fontSize: 11, color: "#94A3B8", mb: (sub.note || sub.attachments.length) ? 0.75 : 0 }}>
              {new Date(sub.submitted_at).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}
            </Typography>
            {sub.note && <Typography sx={{ fontSize: 13, color: "#475569", lineHeight: 1.6, mb: sub.attachments.length ? 1 : 0 }}>{sub.note}</Typography>}
            {sub.attachments.length > 0 && (
              <Stack spacing={1}>{sub.attachments.map((f, j) => <FileRow key={j} file={f} />)}</Stack>
            )}
          </Box>
        ))}
      </Stack>
    </Box>
  );
}

const OUTCOME_LABEL: Record<string, string> = {
  full_freelancer: "Resolved in favor of the freelancer",
  full_client: "Resolved in favor of the client — refunded",
  partial: "Partial resolution — split between both parties",
};

function EvidenceParty({ label, files, statement }: { label: string; files: EvidenceFile[] | null; statement: string | null }) {
  const has = (files?.length ?? 0) > 0 || !!statement;
  return (
    <Box sx={{ flex: 1, minWidth: 220 }}>
      <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#334155", mb: 0.75 }}>{label}</Typography>
      {!has ? (
        <Typography sx={{ fontSize: 12, color: "#94A3B8" }}>No evidence submitted yet.</Typography>
      ) : (
        <>
          {statement && <Typography sx={{ fontSize: 13, color: "#475569", lineHeight: 1.6, mb: files?.length ? 1 : 0 }}>{statement}</Typography>}
          {files?.length ? <Stack spacing={1}>{files.map((f, i) => <FileRow key={i} file={f} />)}</Stack> : null}
        </>
      )}
    </Box>
  );
}

function DisputeBlock({ dispute }: { dispute: Dispute }) {
  const resolved = dispute.status === "resolved";
  return (
    <Box sx={CARD}>
      <Box sx={{
        display: "flex", alignItems: "flex-start", gap: 1.25, p: "12px 14px", mb: 2.25, fontSize: 13, fontWeight: 500, borderRadius: "8px",
        ...(resolved
          ? { bgcolor: "#F0FDF4", color: "#16A34A", border: "1px solid rgba(22,163,74,0.18)" }
          : { bgcolor: "#FEF2F2", color: "#DC2626", border: "1px solid rgba(220,38,38,0.18)" }),
      }}>
        <Box component="span" sx={{ fontSize: 16, mt: "1px", flexShrink: 0 }}>{resolved ? "✓" : "⚠"}</Box>
        {resolved ? "This dispute has been resolved by an admin." : "This order is under dispute. An admin will review it."}
      </Box>

      <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#334155", mb: 0.75 }}>Dispute reason</Typography>
      <Typography sx={{ fontSize: 13, color: "#334155", lineHeight: 1.6 }}>{dispute.reason}</Typography>

      {resolved && (
        <Box sx={{ mt: 1.75, p: "12px 14px", bgcolor: "#F1F5F9", borderRadius: "8px" }}>
          <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#334155", mb: 0.5 }}>
            Outcome: {OUTCOME_LABEL[dispute.outcome ?? ""] ?? "Resolved"}
            {dispute.outcome === "partial" && dispute.partial_freelancer_amount
              ? ` ($${dispute.partial_freelancer_amount} to freelancer)` : ""}
          </Typography>
          {dispute.admin_note && (
            <Typography sx={{ fontSize: 13, color: "#475569", lineHeight: 1.6 }}>
              <strong>Admin note:</strong> {dispute.admin_note}
            </Typography>
          )}
        </Box>
      )}

      <Box sx={{ display: "flex", gap: 2.5, flexWrap: "wrap", mt: 2.25 }}>
        <EvidenceParty label="Client's evidence" files={dispute.client_evidence} statement={dispute.client_statement} />
        <EvidenceParty label="Freelancer's evidence" files={dispute.freelancer_evidence} statement={dispute.freelancer_statement} />
      </Box>
    </Box>
  );
}

function DialogDropzone({ onFiles, files, onRemove, uploading }: { onFiles: (fl: FileList) => void; files: UploadedFile[]; onRemove: (i: number) => void; uploading: boolean }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <Box sx={{ mt: 1.5 }}>
      <input ref={ref} type="file" accept="image/jpeg,image/png,image/gif,image/webp,.pdf" multiple hidden onChange={(e) => e.target.files && onFiles(e.target.files)} />
      <Box onClick={() => ref.current?.click()} sx={{ border: "1.5px dashed #CBD5E1", borderRadius: "8px", p: 2.25, textAlign: "center", cursor: "pointer", "&:hover": { borderColor: "#94A3B8" } }}>
        <AttachFileIcon sx={{ fontSize: 20, color: "#94A3B8", display: "block", mx: "auto", mb: 0.5 }} />
        <Typography sx={{ fontSize: 12, color: "#64748B", fontWeight: 500 }}>
          {uploading ? "Uploading…" : "Drag files here or click to upload"}
        </Typography>
      </Box>
      {files.length > 0 && (
        <Stack spacing={0.75} mt={1.25}>
          {files.map((f, i) => (
            <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1, px: 1.25, py: 0.75, bgcolor: "#F1F5F9", borderRadius: "6px" }}>
              <FileIcon sx={{ fontSize: 14, color: "#64748B" }} />
              <Typography sx={{ flex: 1, fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.file_name}</Typography>
              <IconButton size="small" onClick={() => onRemove(i)} sx={{ p: 0.25 }}><Box component="span" sx={{ fontSize: 14, color: "#94A3B8" }}>×</Box></IconButton>
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ClientOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const orderId = Number(params.id);

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Dialog open states
  const [revisionOpen, setRevisionOpen] = useState(false);
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [evidenceOpen, setEvidenceOpen] = useState(false);

  // Form values
  const [revisionNote, setRevisionNote] = useState("");
  const [disputeReason, setDisputeReason] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitReviewError, setSubmitReviewError] = useState<string | null>(null);

  // File upload
  const [disputeFiles, setDisputeFiles] = useState<UploadedFile[]>([]);
  const [evidenceFiles, setEvidenceFiles] = useState<UploadedFile[]>([]);
  const [evidenceStatement, setEvidenceStatement] = useState("");
  const [uploadToken, setUploadToken] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetchOrder = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response: MyOrdersResponse = await api.get("/api/my-orders");
      const found = response.data.find((o: Order) => o.id === orderId);
      if (!found) setError("Order not found.");
      else setOrder(found);
    } catch {
      setError("Failed to load order.");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => { fetchOrder(); }, [fetchOrder]);

  const handleFileUpload = async (files: FileList, setter: React.Dispatch<React.SetStateAction<UploadedFile[]>>, current: UploadedFile[]) => {
    setUploading(true);
    try {
      let token = uploadToken;
      if (!token) { token = await api.getUploadToken(); setUploadToken(token); }
      for (const file of Array.from(files)) {
        if (current.length >= 5) break;
        const res = await api.uploadFormData("/api/temporary-uploads", file, { upload_token: token });
        const entry: UploadedFile = { url: res.data.file_url, file_name: res.data.file_name, file_type: res.data.file_type };
        setter((prev) => [...prev, entry]);
        current = [...current, entry];
      }
    } catch { setActionError("Failed to upload file."); }
    finally { setUploading(false); }
  };

  const handleApprove = async () => {
    setSubmitting(true); setActionError(null);
    try { await api.approveOrder(orderId); await fetchOrder(); }
    catch { setActionError("Failed to approve order."); }
    finally { setSubmitting(false); }
  };

  const handleRequestRevision = async () => {
    if (!revisionNote.trim()) return;
    setSubmitting(true); setActionError(null);
    try { await api.requestRevision(orderId, revisionNote); setRevisionNote(""); setRevisionOpen(false); await fetchOrder(); }
    catch { setActionError("Failed to request revision."); }
    finally { setSubmitting(false); }
  };

  const handleOpenDispute = async () => {
    if (!disputeReason.trim()) return;
    setSubmitting(true); setActionError(null);
    try { await api.openDispute(orderId, disputeReason, disputeFiles.length ? disputeFiles : undefined); setDisputeReason(""); setDisputeFiles([]); setDisputeOpen(false); await fetchOrder(); }
    catch { setActionError("Failed to open dispute."); }
    finally { setSubmitting(false); }
  };

  const handleSubmitEvidence = async () => {
    if (!evidenceFiles.length && !evidenceStatement.trim()) return;
    setSubmitting(true); setActionError(null);
    try { await api.submitDisputeEvidence(orderId, evidenceFiles, evidenceStatement.trim() || undefined); setEvidenceFiles([]); setEvidenceStatement(""); setEvidenceOpen(false); await fetchOrder(); }
    catch { setActionError("Failed to submit evidence."); }
    finally { setSubmitting(false); }
  };

  const handleSubmitReview = async () => {
    if (rating === 0) { setSubmitReviewError("Please select a rating."); return; }
    setSubmitting(true); setSubmitReviewError(null);
    try {
      const res = await api.submitReview(orderId, { rating, comment: comment.trim() || undefined });
      setOrder((prev) => prev ? { ...prev, review: res.data } : prev);
    } catch { setSubmitReviewError("Failed to submit review."); }
    finally { setSubmitting(false); }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress sx={{ color: "#0F172A" }} />
      </Box>
    );
  }

  if (error || !order) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 2 }}>
        <Typography sx={{ color: "#64748B" }}>{error ?? "Order not found."}</Typography>
        <Button onClick={() => router.back()} sx={{ ...BTN_OUTLINE, height: 36 }} variant="outlined">Go back</Button>
      </Box>
    );
  }

  const isJobBased = !order.pricing_option_id;
  const service = order.service;
  const freelancer = order.freelancer ?? order.proposal?.freelancer_profile;
  const pricingOption = order.pricing_option;
  const deliveryDays = isJobBased ? order.proposal?.timeline_days : parseInt(String(pricingOption?.delivery_time ?? ""));
  const revisions = Number(pricingOption?.revisions ?? 0);
  const canReview = user?.is_client && order.status === "completed" && !order.review;
  const hasReview = order.status === "completed" && order.review;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#F8FAFC" }}>
      <Container disableGutters sx={{ maxWidth: "720px !important", px: { xs: 2.5, sm: 3.5 }, py: 4 }}>

        {/* Back */}
        <Button startIcon={<ChevronLeft sx={{ fontSize: 16 }} />} onClick={() => router.back()}
          sx={{ mb: 2.25, fontSize: 13, fontWeight: 500, color: "#64748B", textTransform: "none", p: 0, minWidth: 0, "&:hover": { color: "#0F172A", bgcolor: "transparent" } }}>
          Back to Orders
        </Button>

        {/* Header */}
        <Box sx={{ mb: 3.5 }}>
          <Stack direction="row" alignItems="center" gap={1.5} mb={0.75} flexWrap="wrap">
            <Typography sx={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.025em", color: "#0F172A" }}>
              Order #{order.id}
            </Typography>
            <StatusBadge status={order.status} />
          </Stack>
          <Typography sx={{ fontSize: 13, color: "#64748B" }}>Placed on {formatDate(order.created_at)}</Typography>
        </Box>

        {actionError && (
          <Alert severity="error" onClose={() => setActionError(null)} sx={{ mb: 2.5, borderRadius: "10px" }}>{actionError}</Alert>
        )}

        <Stack spacing={2.5}>

          {/* ── Section 2: Info row ── */}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2.5 }}>
            {/* Service */}
            <Box sx={CARD}>
              <Typography sx={SEC_LABEL}>Service</Typography>
              <Typography sx={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.01em", mb: 1.25 }}>
                {service?.title ?? (isJobBased ? order.proposal?.job_post?.title : "Service")}
              </Typography>
              {service?.category && (
                <Box sx={{ display: "inline-flex", alignItems: "center", height: 24, px: 1.25, bgcolor: "#F1F5F9", color: "#334155", borderRadius: "6px", fontSize: 12, fontWeight: 600, mb: 1.25 }}>
                  {service.category.category_name}
                </Box>
              )}
              {service?.description && (
                <Box sx={{ fontSize: 13, color: "#64748B", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", "& *": { fontSize: "inherit" } }}
                  dangerouslySetInnerHTML={{ __html: service.description }} />
              )}
            </Box>

            {/* Freelancer */}
            <Box sx={CARD}>
              <Typography sx={SEC_LABEL}>Freelancer</Typography>
              <Stack direction="row" spacing={1.75} alignItems="center">
                <Avatar src={freelancer?.user?.avatar_url ?? undefined} sx={{ width: 48, height: 48, background: "linear-gradient(135deg,#1E293B,#0F172A)", fontSize: 16, fontWeight: 600 }}>
                  {freelancer?.user?.name?.slice(0, 2).toUpperCase() ?? "?"}
                </Avatar>
                <Box>
                  <Typography sx={{ fontSize: 14, fontWeight: 700, mb: 0.25 }}>{freelancer?.user?.name ?? "Unknown"}</Typography>
                  {freelancer?.user?.email && <Typography sx={{ fontSize: 12, color: "#64748B", lineHeight: 1.6 }}>{freelancer.user.email}</Typography>}
                  {freelancer?.user?.telephone && <Typography sx={{ fontSize: 12, color: "#64748B" }}>{freelancer.user.telephone}</Typography>}
                </Box>
              </Stack>
            </Box>
          </Box>

          {/* ── Section 3: Package & Pricing ── */}
          <Box sx={CARD}>
            <Typography sx={SEC_LABEL}>Package</Typography>
            <Typography sx={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.01em", mb: 0.5 }}>
              {isJobBased ? "Job Contract" : (pricingOption?.title ?? "Standard")}
            </Typography>
            {pricingOption?.description && (
              <Typography sx={{ fontSize: 13, color: "#64748B", mb: 2.25 }}>{pricingOption.description}</Typography>
            )}
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 1.5, mb: 1.5 }}>
              {[
                { k: "Price", v: `$${pricingOption?.price ?? order.price ?? "0"}` },
                { k: "Delivery", v: !isNaN(deliveryDays as number) ? `${deliveryDays} day${deliveryDays !== 1 ? "s" : ""}` : "N/A" },
                { k: "Revisions", v: !isJobBased ? (revisions === -1 ? "Unlimited" : String(revisions)) : "N/A" },
              ].map(({ k, v }) => (
                <Box key={k} sx={{ bgcolor: "#F1F5F9", borderRadius: "10px", p: "14px 16px" }}>
                  <Typography sx={{ fontSize: 11, fontWeight: 600, color: "#64748B", letterSpacing: "0.02em", mb: 0.5 }}>{k}</Typography>
                  <Typography sx={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.01em" }}>{v}</Typography>
                </Box>
              ))}
            </Box>
            <Box sx={{ bgcolor: "#F1F5F9", borderRadius: "10px", p: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Typography sx={{ fontSize: 11, fontWeight: 600, color: "#64748B", letterSpacing: "0.02em" }}>Total</Typography>
              <Typography sx={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.01em" }}>${pricingOption?.price ?? order.price ?? "0"}</Typography>
            </Box>
          </Box>

          {/* ── Section 4: Timeline ── */}
          <Box sx={CARD}>
            <OrderTimeline orderId={order.id} createdAt={order.created_at} />
          </Box>

          {/* ── Deliverables & revisions — always visible, survives completion/dispute ── */}
          <DeliverablesReference deliveryHistory={order.delivery_history} revisionHistory={order.revision_history} />

          {/* ── Section 5: Status card ── */}

          {/* Delivered */}
          {order.status === "delivered" && (
            <Box sx={CARD}>
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.25, p: "12px 14px", bgcolor: "#EFF6FF", color: "#1D4ED8", border: "1px solid rgba(37,99,235,0.18)", borderRadius: "8px", mb: 2.25, fontSize: 13, fontWeight: 500 }}>
                <CheckIcon sx={{ fontSize: 16, mt: "1px", flexShrink: 0 }} />
                Work has been delivered — review and take action.
              </Box>
              {order.delivery_note && (
                <>
                  <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#334155", mb: 0.75 }}>Delivery note</Typography>
                  <Typography sx={{ fontSize: 13, color: "#334155", lineHeight: 1.6 }}>{order.delivery_note}</Typography>
                </>
              )}
              {order.delivery_attachments?.length > 0 && (
                <Stack spacing={1} mt={1.75}>
                  {order.delivery_attachments.map((f, i) => <FileRow key={i} file={f} />)}
                </Stack>
              )}
              <PreviousSubmissions history={order.delivery_history} />
            </Box>
          )}

          {/* Revision requested */}
          {order.status === "revision_requested" && (
            <Box sx={CARD}>
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.25, p: "12px 14px", bgcolor: "#FFF7ED", color: "#C2410C", border: "1px solid rgba(194,65,12,0.18)", borderRadius: "8px", mb: 2.25, fontSize: 13, fontWeight: 500 }}>
                <Box component="span" sx={{ fontSize: 16, mt: "1px", flexShrink: 0 }}>↺</Box>
                You requested a revision.
              </Box>
              {order.revision_note && (
                <>
                  <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#334155", mb: 0.75 }}>Feedback</Typography>
                  <Typography sx={{ fontSize: 13, color: "#334155", lineHeight: 1.6 }}>{order.revision_note}</Typography>
                </>
              )}
            </Box>
          )}

          {/* Dispute (open or resolved) */}
          {order.dispute && <DisputeBlock dispute={order.dispute} />}

          {/* Completed */}
          {order.status === "completed" && (
            <Box sx={CARD}>
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.25, p: "12px 14px", bgcolor: "#F0FDF4", color: "#16A34A", border: "1px solid rgba(22,163,74,0.18)", borderRadius: "8px", mb: 2.25, fontSize: 13, fontWeight: 500 }}>
                <CheckIcon sx={{ fontSize: 16, mt: "1px", flexShrink: 0 }} />
                Order completed.
              </Box>

              {hasReview && order.review && (
                <>
                  <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#334155", mb: 1 }}>Your review</Typography>
                  <Box sx={{ bgcolor: "#F1F5F9", borderRadius: "10px", p: "16px 18px" }}>
                    <Stack direction="row" alignItems="center" spacing={1.25} mb={1}>
                      <ReadonlyStars rating={order.review.rating} />
                      <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
                        {user?.name ?? "You"}
                      </Typography>
                    </Stack>
                    {order.review.comment && (
                      <Typography sx={{ fontSize: 13, color: "#334155", lineHeight: 1.6 }}>{order.review.comment}</Typography>
                    )}
                  </Box>
                </>
              )}

              {canReview && (
                <>
                  <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#334155", mb: 1.25 }}>Leave a review</Typography>
                  <Stack spacing={1.5}>
                    <InteractiveStars value={rating} onChange={setRating} />
                    <TextField multiline minRows={2} fullWidth placeholder="Share your experience (optional)" value={comment} onChange={(e) => setComment(e.target.value)}
                      sx={{ "& .MuiOutlinedInput-root": { fontSize: 13, borderRadius: "8px", "& fieldset": { borderColor: "#E2E8F0" }, "&:hover fieldset": { borderColor: "#CBD5E1" }, "&.Mui-focused fieldset": { borderColor: "#0F172A", borderWidth: "1px" } } }} />
                    {submitReviewError && <Alert severity="error" sx={{ borderRadius: "8px", fontSize: 13 }}>{submitReviewError}</Alert>}
                    <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                      <Button variant="contained" disabled={submitting || rating === 0} onClick={handleSubmitReview} sx={BTN_PRIMARY}>
                        {submitting ? <CircularProgress size={16} color="inherit" /> : "Submit review"}
                      </Button>
                    </Box>
                  </Stack>
                </>
              )}
            </Box>
          )}

          {/* ── Section 6: Actions ── */}
          <Box sx={CARD}>
            {/* delivered */}
            {order.status === "delivered" && (
              <Stack direction="row" justifyContent="flex-end" spacing={1.25} flexWrap="wrap">
                <Button variant="outlined" onClick={() => setDisputeOpen(true)} sx={BTN_DANGER}>Open Dispute</Button>
                <Button variant="outlined" onClick={() => setRevisionOpen(true)} sx={BTN_OUTLINE}>Request Revision</Button>
                <Button variant="contained" disabled={submitting} onClick={handleApprove} startIcon={submitting ? <CircularProgress size={14} color="inherit" /> : <CheckIcon sx={{ fontSize: 15 }} />} sx={BTN_PRIMARY}>
                  Approve &amp; Release Payment
                </Button>
              </Stack>
            )}

            {/* active */}
            {order.status === "active" && (
              <Stack direction="row" justifyContent="flex-end">
                <Button variant="outlined" onClick={() => setDisputeOpen(true)} sx={BTN_DANGER}>Open Dispute</Button>
              </Stack>
            )}

            {/* disputed — submit evidence */}
            {order.status === "disputed" && order.dispute?.status === "open" && !order.dispute.client_evidence?.length && !order.dispute.client_statement && (
              <Stack direction="row" justifyContent="flex-end">
                <Button variant="outlined" onClick={() => setEvidenceOpen(true)} sx={BTN_OUTLINE}>Submit Evidence</Button>
              </Stack>
            )}

            {/* completed */}
            {order.status === "completed" && (
              <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={1}>
                <CheckIcon sx={{ fontSize: 15, color: "#94A3B8" }} />
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#94A3B8" }}>Order Completed</Typography>
              </Stack>
            )}

            {/* cancelled */}
            {order.status === "cancelled" && (
              <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={1}>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#94A3B8" }}>Order Cancelled</Typography>
              </Stack>
            )}

            {/* pending — no client actions */}
            {order.status === "pending" && (
              <Typography sx={{ fontSize: 13, color: "#94A3B8", textAlign: "right" }}>Awaiting freelancer acceptance</Typography>
            )}
          </Box>

        </Stack>
      </Container>

      {/* ── Dialogs ── */}

      {/* Request Revision */}
      <Dialog open={revisionOpen} onClose={() => setRevisionOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: "14px" } }}>
        <Box sx={{ p: "22px 24px 0" }}>
          <Typography sx={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.015em", mb: 0.5 }}>Request a revision</Typography>
          <Typography sx={{ fontSize: 13, color: "#64748B" }}>
            Tell the freelancer what needs to change.{pricingOption?.revisions && Number(pricingOption.revisions) !== -1 ? ` You have ${pricingOption.revisions} revision${Number(pricingOption.revisions) !== 1 ? "s" : ""} included.` : ""}
          </Typography>
        </Box>
        <DialogContent sx={{ p: "18px 24px 4px" }}>
          <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#334155", mb: 0.75 }}>Feedback</Typography>
          <TextField multiline minRows={3} fullWidth placeholder="Describe the changes you'd like…" value={revisionNote} onChange={(e) => setRevisionNote(e.target.value)}
            sx={{ "& .MuiOutlinedInput-root": { fontSize: 13, borderRadius: "8px", "& fieldset": { borderColor: "#E2E8F0" }, "&:hover fieldset": { borderColor: "#CBD5E1" }, "&.Mui-focused fieldset": { borderColor: "#0F172A", borderWidth: "1px" } } }} />
        </DialogContent>
        <Stack direction="row" justifyContent="flex-end" spacing={1.25} sx={{ p: "16px 24px 22px" }}>
          <Button variant="outlined" onClick={() => { setRevisionOpen(false); setRevisionNote(""); }} sx={BTN_OUTLINE}>Cancel</Button>
          <Button variant="contained" disabled={submitting || !revisionNote.trim()} onClick={handleRequestRevision} sx={BTN_PRIMARY}>
            {submitting ? <CircularProgress size={14} color="inherit" /> : "Send request"}
          </Button>
        </Stack>
      </Dialog>

      {/* Open Dispute */}
      <Dialog open={disputeOpen} onClose={() => setDisputeOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: "14px" } }}>
        <Box sx={{ p: "22px 24px 0" }}>
          <Typography sx={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.015em", mb: 0.5 }}>Open a dispute</Typography>
          <Typography sx={{ fontSize: 13, color: "#64748B" }}>Our team will review the order. Please describe the issue clearly.</Typography>
        </Box>
        <DialogContent sx={{ p: "18px 24px 4px" }}>
          <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#334155", mb: 0.75 }}>Dispute reason</Typography>
          <TextField multiline minRows={3} fullWidth placeholder="Explain what went wrong…" value={disputeReason} onChange={(e) => setDisputeReason(e.target.value)}
            sx={{ "& .MuiOutlinedInput-root": { fontSize: 13, borderRadius: "8px", "& fieldset": { borderColor: "#E2E8F0" }, "&:hover fieldset": { borderColor: "#CBD5E1" }, "&.Mui-focused fieldset": { borderColor: "#0F172A", borderWidth: "1px" } } }} />
          <DialogDropzone onFiles={(fl) => handleFileUpload(fl, setDisputeFiles, disputeFiles)} files={disputeFiles} onRemove={(i) => setDisputeFiles((p) => p.filter((_, j) => j !== i))} uploading={uploading} />
        </DialogContent>
        <Stack direction="row" justifyContent="flex-end" spacing={1.25} sx={{ p: "16px 24px 22px" }}>
          <Button variant="outlined" onClick={() => { setDisputeOpen(false); setDisputeReason(""); setDisputeFiles([]); }} sx={BTN_OUTLINE}>Cancel</Button>
          <Button variant="outlined" disabled={submitting || !disputeReason.trim()} onClick={handleOpenDispute} sx={BTN_DANGER}>
            {submitting ? <CircularProgress size={14} sx={{ color: "#DC2626" }} /> : "Open dispute"}
          </Button>
        </Stack>
      </Dialog>

      {/* Submit Evidence */}
      <Dialog open={evidenceOpen} onClose={() => setEvidenceOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: "14px" } }}>
        <Box sx={{ p: "22px 24px 0" }}>
          <Typography sx={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.015em", mb: 0.5 }}>Submit evidence</Typography>
          <Typography sx={{ fontSize: 13, color: "#64748B" }}>Add files and context to support your side of the dispute.</Typography>
        </Box>
        <DialogContent sx={{ p: "18px 24px 4px" }}>
          <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#334155", mb: 0.75 }}>Your statement</Typography>
          <TextField multiline minRows={3} fullWidth placeholder="Explain your side of the dispute…" value={evidenceStatement} onChange={(e) => setEvidenceStatement(e.target.value)}
            sx={{ "& .MuiOutlinedInput-root": { fontSize: 13, borderRadius: "8px", "& fieldset": { borderColor: "#E2E8F0" }, "&:hover fieldset": { borderColor: "#CBD5E1" }, "&.Mui-focused fieldset": { borderColor: "#0F172A", borderWidth: "1px" } } }} />
          <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#334155", mt: 2, mb: 0.75 }}>Supporting files (optional)</Typography>
          <DialogDropzone onFiles={(fl) => handleFileUpload(fl, setEvidenceFiles, evidenceFiles)} files={evidenceFiles} onRemove={(i) => setEvidenceFiles((p) => p.filter((_, j) => j !== i))} uploading={uploading} />
        </DialogContent>
        <Stack direction="row" justifyContent="flex-end" spacing={1.25} sx={{ p: "16px 24px 22px" }}>
          <Button variant="outlined" onClick={() => { setEvidenceOpen(false); setEvidenceFiles([]); setEvidenceStatement(""); }} sx={BTN_OUTLINE}>Cancel</Button>
          <Button variant="contained" disabled={submitting || (!evidenceFiles.length && !evidenceStatement.trim())} onClick={handleSubmitEvidence} sx={BTN_PRIMARY}>
            {submitting ? <CircularProgress size={14} color="inherit" /> : "Submit evidence"}
          </Button>
        </Stack>
      </Dialog>

    </Box>
  );
}
