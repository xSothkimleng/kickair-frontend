"use client";

import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Avatar,
  Stack,
  Chip,
  Button,
  Card,
  CircularProgress,
  TextField,
  Alert,
} from "@mui/material";
import {
  Close as CloseIcon,
  AccessTime as DeliveryIcon,
  Refresh as RevisionIcon,
  LocationOn as LocationIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  CheckCircle as CheckIcon,
  Done as CompleteIcon,
  Cancel as CancelIcon,
  Send as SendIcon,
  Gavel as DisputeIcon,
  HourglassEmpty as AwaitingIcon,
  AttachFile as AttachFileIcon,
  InsertDriveFile as FileIcon,
  Image as ImageIcon,
} from "@mui/icons-material";
import { Order, OrderStatus } from "@/types/order";
import { api } from "@/lib/api";

interface FreelancerOrderDetailModalProps {
  open: boolean;
  order: Order | null;
  onClose: () => void;
  onAccept: (orderId: number) => Promise<void>;
  onComplete: (orderId: number) => Promise<void>;
  onCancel: (orderId: number) => Promise<void>;
  onOrderUpdate: () => void;
  actionLoading: number | null;
}

export default function FreelancerOrderDetailModal({
  open,
  order,
  onClose,
  onAccept,
  onComplete,
  onCancel,
  onOrderUpdate,
  actionLoading,
}: FreelancerOrderDetailModalProps) {
  const [deliveryNote, setDeliveryNote] = useState("");
  const [deliveryFiles, setDeliveryFiles] = useState<{ url: string; file_name: string; file_type: string }[]>([]);
  const [disputeReason, setDisputeReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [evidenceFiles, setEvidenceFiles] = useState<{ url: string; file_name: string; file_type: string }[]>([]);
  const [separateEvidenceFiles, setSeparateEvidenceFiles] = useState<{ url: string; file_name: string; file_type: string }[]>([]);
  const [uploadToken, setUploadToken] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const deliveryFileInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const evidenceFileInputRef = useRef<HTMLInputElement>(null);

  if (!order) return null;

  const isLoading = actionLoading === order.id;

  const getStatusConfig = (status: OrderStatus) => {
    switch (status) {
      case "active":
        return { bgcolor: "rgba(0, 113, 227, 0.1)", color: "#0071e3" };
      case "pending":
        return { bgcolor: "rgba(234, 88, 12, 0.1)", color: "#ea580c" };
      case "delivered":
        return { bgcolor: "rgba(124, 58, 237, 0.1)", color: "#7c3aed" };
      case "revision_requested":
        return { bgcolor: "rgba(234, 88, 12, 0.1)", color: "#ea580c" };
      case "disputed":
        return { bgcolor: "rgba(239, 68, 68, 0.1)", color: "#ef4444" };
      case "completed":
        return { bgcolor: "rgba(22, 163, 74, 0.1)", color: "#16a34a" };
      case "cancelled":
        return { bgcolor: "rgba(239, 68, 68, 0.1)", color: "#ef4444" };
      default:
        return { bgcolor: "rgba(0, 0, 0, 0.05)", color: "rgba(0, 0, 0, 0.6)" };
    }
  };

  const getStatusLabel = (status: OrderStatus) => {
    const labels: Record<OrderStatus, string> = {
      active: "In Progress",
      pending: "Pending Approval",
      delivered: "Delivered — Awaiting Client",
      revision_requested: "Revision Requested",
      disputed: "Disputed",
      completed: "Completed",
      cancelled: "Cancelled",
    };
    return labels[status] ?? status;
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const handleDeliver = async () => {
    setSubmitting(true);
    setActionError(null);
    try {
      await api.deliverOrder(order.id, deliveryNote || undefined, deliveryFiles.length ? deliveryFiles : undefined);
      setDeliveryNote("");
      setDeliveryFiles([]);
      onOrderUpdate();
      onClose();
    } catch {
      setActionError("Failed to submit delivery. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResubmit = async () => {
    setSubmitting(true);
    setActionError(null);
    try {
      await api.resubmitOrder(order.id, deliveryNote || undefined, deliveryFiles.length ? deliveryFiles : undefined);
      setDeliveryNote("");
      setDeliveryFiles([]);
      onOrderUpdate();
      onClose();
    } catch {
      setActionError("Failed to resubmit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeliveryFileUpload = async (files: FileList | null) => {
    if (!files || !files.length) return;
    setUploading(true);
    try {
      let token = uploadToken;
      if (!token) {
        token = await api.getUploadToken();
        setUploadToken(token);
      }
      let current = deliveryFiles;
      for (const file of Array.from(files)) {
        if (current.length >= 5) break;
        const result = await api.uploadFormData("/api/temporary-uploads", file, { upload_token: token });
        const entry = { url: result.data.file_url, file_name: result.data.file_name, file_type: result.data.file_type };
        setDeliveryFiles(prev => [...prev, entry]);
        current = [...current, entry];
      }
    } catch {
      setActionError("Failed to upload file. Please try again.");
    } finally {
      setUploading(false);
      if (deliveryFileInputRef.current) deliveryFileInputRef.current.value = "";
    }
  };

  const handleFileUpload = async (files: FileList | null, setter: React.Dispatch<React.SetStateAction<{ url: string; file_name: string; file_type: string }[]>>, current: { url: string; file_name: string; file_type: string }[]) => {
    if (!files || !files.length) return;
    setUploading(true);
    try {
      let token = uploadToken;
      if (!token) {
        token = await api.getUploadToken();
        setUploadToken(token);
      }
      for (const file of Array.from(files)) {
        if (current.length >= 5) break;
        const result = await api.uploadFormData("/api/temporary-uploads", file, { upload_token: token });
        setter(prev => [...prev, { url: result.data.file_url, file_name: result.data.file_name, file_type: result.data.file_type }]);
        current = [...current, { url: result.data.file_url, file_name: result.data.file_name, file_type: result.data.file_type }];
      }
    } catch {
      setActionError("Failed to upload file. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (evidenceFileInputRef.current) evidenceFileInputRef.current.value = "";
    }
  };

  const handleOpenDispute = async () => {
    if (!disputeReason.trim()) return;
    setSubmitting(true);
    setActionError(null);
    try {
      await api.openDispute(order.id, disputeReason, evidenceFiles.length ? evidenceFiles : undefined);
      setDisputeReason("");
      setEvidenceFiles([]);
      setShowDisputeForm(false);
      onOrderUpdate();
      onClose();
    } catch {
      setActionError("Failed to open dispute. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitEvidence = async () => {
    if (!separateEvidenceFiles.length) return;
    setSubmitting(true);
    setActionError(null);
    try {
      await api.submitDisputeEvidence(order.id, separateEvidenceFiles);
      setSeparateEvidenceFiles([]);
      onOrderUpdate();
    } catch {
      setActionError("Failed to submit evidence. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const isJobBased = !order.pricing_option_id;
  const service = order.service || order.pricing_option?.service;
  const client = order.client_profile;
  const pricingOption = order.pricing_option;
  const statusConfig = getStatusConfig(order.status);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          maxHeight: "90vh",
          border: "1px solid rgba(0, 0, 0, 0.08)",
        },
      }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 3,
          py: 2,
          borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
        }}>
        <Box>
          <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.5)", textTransform: "uppercase", letterSpacing: 0.5 }}>
            Order #{order.id}
          </Typography>
          <Typography sx={{ fontSize: 17, fontWeight: 600 }}>Order Details</Typography>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: "rgba(0, 0, 0, 0.5)",
            "&:hover": { bgcolor: "rgba(0, 0, 0, 0.04)" },
          }}>
          <CloseIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={2.5}>
          {/* Status Badge */}
          <Chip
            label={getStatusLabel(order.status)}
            icon={order.status === "completed" ? <CheckIcon sx={{ fontSize: 14 }} /> : undefined}
            size="small"
            sx={{
              alignSelf: "flex-start",
              fontSize: 11,
              fontWeight: 500,
              height: 24,
              ...statusConfig,
              "& .MuiChip-icon": { color: statusConfig.color },
            }}
          />

          {/* Delivered: Awaiting client banner */}
          {order.status === "delivered" && (
            <Alert
              icon={<AwaitingIcon />}
              severity="info"
              sx={{ borderRadius: 2 }}>
              Your delivery is awaiting client approval. You will be notified when they respond.
              {order.delivery_note && (
                <Box sx={{ mt: 1 }}>
                  <Typography sx={{ fontSize: 12, fontWeight: 600 }}>Your delivery note:</Typography>
                  <Typography sx={{ fontSize: 12, mt: 0.5 }}>{order.delivery_note}</Typography>
                </Box>
              )}
              {order.delivery_attachments?.length > 0 && (
                <Stack spacing={0.5} sx={{ mt: 1 }}>
                  <Typography sx={{ fontSize: 11, fontWeight: 600, color: "rgba(0,0,0,0.5)", textTransform: "uppercase", letterSpacing: 0.4 }}>
                    Attachments sent
                  </Typography>
                  {order.delivery_attachments.map((f, i) => (
                    <Stack
                      key={i}
                      component="a"
                      href={f.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      direction="row"
                      alignItems="center"
                      spacing={0.75}
                      sx={{
                        px: 1.25, py: 0.75,
                        bgcolor: "rgba(255,255,255,0.6)",
                        borderRadius: 1.5,
                        textDecoration: "none",
                        color: "inherit",
                        "&:hover": { bgcolor: "rgba(255,255,255,0.9)" },
                        cursor: "pointer",
                      }}
                    >
                      {f.file_type.startsWith("image/")
                        ? <ImageIcon sx={{ fontSize: 14, color: "rgba(0,0,0,0.5)", flexShrink: 0 }} />
                        : <FileIcon sx={{ fontSize: 14, color: "rgba(0,0,0,0.5)", flexShrink: 0 }} />}
                      <Typography sx={{ fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {f.file_name}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              )}
            </Alert>
          )}

          {/* Revision Requested: Show client feedback */}
          {order.status === "revision_requested" && order.revision_note && (
            <Alert
              severity="warning"
              sx={{ borderRadius: 2 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 0.5 }}>Revision Requested</Typography>
              <Typography sx={{ fontSize: 12 }}>{order.revision_note}</Typography>
            </Alert>
          )}

          {/* Disputed: Show dispute info + evidence form */}
          {order.status === "disputed" && order.dispute && (
            <Alert
              icon={<DisputeIcon />}
              severity="error"
              sx={{ borderRadius: 2 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 0.5 }}>Dispute Opened</Typography>
              <Typography sx={{ fontSize: 12, mb: 1 }}>{order.dispute.reason}</Typography>
              {order.dispute.freelancer_evidence?.length ? (
                <Typography sx={{ fontSize: 12, color: "rgba(0,0,0,0.6)" }}>
                  Your evidence ({order.dispute.freelancer_evidence.length} file{order.dispute.freelancer_evidence.length !== 1 ? "s" : ""}) has been submitted.
                </Typography>
              ) : null}
            </Alert>
          )}

          {/* Service Info */}
          <Card
            elevation={0}
            sx={{
              p: 2.5,
              bgcolor: "#F5F5F7",
              borderRadius: 3,
            }}>
            <Typography sx={{ fontSize: 15, fontWeight: 600, mb: 0.5 }}>{service?.title || "Service"}</Typography>
            {service?.category && (
              <Typography sx={{ fontSize: 12, color: "rgba(0, 0, 0, 0.5)", mb: 1.5 }}>
                {service.category.category_name}
              </Typography>
            )}
            {service?.description && (
              <Box
                sx={{ fontSize: 13, color: "rgba(0,0,0,0.7)", lineHeight: 1.6, mb: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", "& p": { m: 0 }, "& *": { fontSize: "inherit" } }}
                dangerouslySetInnerHTML={{ __html: service.description }}
              />
            )}
            {service?.location && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <LocationIcon sx={{ fontSize: 14, color: "rgba(0, 0, 0, 0.4)" }} />
                <Typography sx={{ fontSize: 12, color: "rgba(0, 0, 0, 0.6)" }}>{service.location}</Typography>
              </Box>
            )}
          </Card>

          {/* Client Info */}
          <Card
            elevation={0}
            sx={{
              p: 2.5,
              border: "1px solid rgba(0, 0, 0, 0.08)",
              borderRadius: 3,
            }}>
            <Typography
              sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.5)", textTransform: "uppercase", letterSpacing: 0.5, mb: 1.5 }}>
              Client
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                src={client?.user?.avatar_url || undefined}
                alt={client?.user?.name || "Client"}
                sx={{ width: 48, height: 48 }}>
                {client?.user?.name?.charAt(0) || "?"}
              </Avatar>
              <Box flex={1}>
                <Typography sx={{ fontSize: 14, fontWeight: 600, mb: 0.5 }}>{client?.user?.name || "Unknown"}</Typography>
                <Stack spacing={0.5}>
                  {client?.user?.email && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <EmailIcon sx={{ fontSize: 12, color: "rgba(0, 0, 0, 0.4)" }} />
                      <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)" }}>{client.user.email}</Typography>
                    </Box>
                  )}
                  {client?.user?.telephone && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <PhoneIcon sx={{ fontSize: 12, color: "rgba(0, 0, 0, 0.4)" }} />
                      <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)" }}>{client.user.telephone}</Typography>
                    </Box>
                  )}
                </Stack>
              </Box>
            </Stack>
          </Card>

          {/* Package & Price */}
          <Card
            elevation={0}
            sx={{
              p: 2.5,
              border: "1px solid rgba(0, 0, 0, 0.08)",
              borderRadius: 3,
            }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
              <Box>
                <Typography
                  sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.5)", textTransform: "uppercase", letterSpacing: 0.5, mb: 0.5 }}>
                  {isJobBased ? "Contract" : "Package"}
                </Typography>
                <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                  {pricingOption?.title ?? (isJobBased ? "Job Contract" : "Standard")}
                </Typography>
              </Box>
              <Box sx={{ textAlign: "right" }}>
                <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.5)", mb: 0.5 }}>Earnings</Typography>
                <Typography sx={{ fontSize: 20, fontWeight: 600, color: "#16a34a" }}>
                  ${pricingOption?.price ?? order.price ?? "0"}
                </Typography>
              </Box>
            </Box>

            {pricingOption?.description && (
              <Typography sx={{ fontSize: 12, color: "rgba(0, 0, 0, 0.6)", mb: 2, lineHeight: 1.5 }}>
                {pricingOption.description}
              </Typography>
            )}

            <Box sx={{ display: "flex", gap: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  px: 1.5,
                  py: 1,
                  bgcolor: "rgba(0, 0, 0, 0.03)",
                  borderRadius: 2,
                }}>
                <DeliveryIcon sx={{ fontSize: 14, color: "rgba(0, 0, 0, 0.5)" }} />
                <Typography sx={{ fontSize: 12, color: "rgba(0, 0, 0, 0.7)" }}>
                  {isJobBased
                    ? `${order.proposal?.timeline_days ?? "N/A"} day${order.proposal?.timeline_days !== 1 ? "s" : ""} (timeline)`
                    : (() => { const d = parseInt(String(pricingOption?.delivery_time ?? "")); return isNaN(d) ? "N/A" : `${d} day${d !== 1 ? "s" : ""}`; })()}
                </Typography>
              </Box>
              {!isJobBased && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    px: 1.5,
                    py: 1,
                    bgcolor: "rgba(0, 0, 0, 0.03)",
                    borderRadius: 2,
                  }}>
                  <RevisionIcon sx={{ fontSize: 14, color: "rgba(0, 0, 0, 0.5)" }} />
                  <Typography sx={{ fontSize: 12, color: "rgba(0, 0, 0, 0.7)" }}>
                    {Number(pricingOption?.revisions) === -1 ? "Unlimited" : pricingOption?.revisions || "N/A"} revision
                    {Number(pricingOption?.revisions) !== 1 ? "s" : ""}
                  </Typography>
                </Box>
              )}
            </Box>
          </Card>

          {/* Timeline */}
          <Card
            elevation={0}
            sx={{
              p: 2.5,
              bgcolor: "#F5F5F7",
              borderRadius: 3,
            }}>
            <Typography
              sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.5)", textTransform: "uppercase", letterSpacing: 0.5, mb: 1.5 }}>
              Timeline
            </Typography>
            <Stack spacing={1.5}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#0071e3" }} />
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 500 }}>Order Received</Typography>
                  <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.5)" }}>{formatDateTime(order.created_at)}</Typography>
                </Box>
              </Box>
              {order.updated_at !== order.created_at && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "rgba(0, 0, 0, 0.3)" }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 500 }}>Last Updated</Typography>
                    <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.5)" }}>{formatDateTime(order.updated_at)}</Typography>
                  </Box>
                </Box>
              )}
            </Stack>
          </Card>

          {actionError && (
            <Alert severity="error" sx={{ borderRadius: 2 }} onClose={() => setActionError(null)}>
              {actionError}
            </Alert>
          )}

          {/* Action Buttons */}
          <Stack spacing={1.5}>
            {/* Pending: Accept & Decline */}
            {order.status === "pending" && (
              <Stack direction="row" spacing={1.5}>
                <Button
                  fullWidth
                  variant="contained"
                  disabled={isLoading}
                  startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : <CheckIcon sx={{ fontSize: 16 }} />}
                  onClick={() => onAccept(order.id)}
                  sx={{
                    height: 44,
                    bgcolor: "#16a34a",
                    fontSize: 13,
                    fontWeight: 500,
                    borderRadius: 28,
                    textTransform: "none",
                    boxShadow: "none",
                    "&:hover": { bgcolor: "#15803d", boxShadow: "none" },
                  }}>
                  Accept Order
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  disabled={isLoading}
                  startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : <CancelIcon sx={{ fontSize: 16 }} />}
                  onClick={() => onCancel(order.id)}
                  sx={{
                    height: 44,
                    bgcolor: "#ef4444",
                    fontSize: 13,
                    fontWeight: 500,
                    borderRadius: 28,
                    textTransform: "none",
                    boxShadow: "none",
                    "&:hover": { bgcolor: "#dc2626", boxShadow: "none" },
                  }}>
                  Decline
                </Button>
              </Stack>
            )}

            {/* Active: Submit Delivery */}
            {order.status === "active" && !showDisputeForm && (
              <Box>
                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  placeholder="Add a delivery note for the client (optional)..."
                  value={deliveryNote}
                  onChange={e => setDeliveryNote(e.target.value)}
                  size="small"
                  sx={{ mb: 1.5, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
                {/* Delivery file attachments */}
                <input
                  ref={deliveryFileInputRef}
                  type="file"
                  multiple
                  accept="image/*,application/pdf,.zip,.doc,.docx,.xls,.xlsx,.txt"
                  style={{ display: "none" }}
                  onChange={e => handleDeliveryFileUpload(e.target.files)}
                />
                {deliveryFiles.length > 0 && (
                  <Stack spacing={0.75} sx={{ mb: 1.5 }}>
                    {deliveryFiles.map((f, i) => (
                      <Stack key={i} direction="row" alignItems="center" spacing={1}
                        sx={{ px: 1.5, py: 0.75, bgcolor: "#F5F5F7", borderRadius: 2 }}>
                        {f.file_type.startsWith("image/")
                          ? <ImageIcon sx={{ fontSize: 16, color: "rgba(0,0,0,0.4)" }} />
                          : <FileIcon sx={{ fontSize: 16, color: "rgba(0,0,0,0.4)" }} />}
                        <Typography sx={{ fontSize: 12, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {f.file_name}
                        </Typography>
                        <IconButton size="small" onClick={() => setDeliveryFiles(prev => prev.filter((_, idx) => idx !== i))}
                          sx={{ p: 0.25, color: "rgba(0,0,0,0.4)", "&:hover": { color: "#dc2626" } }}>
                          <CloseIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Stack>
                    ))}
                  </Stack>
                )}
                <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    disabled={uploading || deliveryFiles.length >= 5}
                    startIcon={uploading ? <CircularProgress size={14} color="inherit" /> : <AttachFileIcon sx={{ fontSize: 14 }} />}
                    onClick={() => deliveryFileInputRef.current?.click()}
                    sx={{ textTransform: "none", fontSize: 12, borderRadius: 28, borderColor: "rgba(0,0,0,0.2)", color: "rgba(0,0,0,0.6)" }}>
                    {uploading ? "Uploading..." : `Attach files (${deliveryFiles.length}/5)`}
                  </Button>
                </Stack>
                <Button
                  fullWidth
                  variant="contained"
                  disabled={submitting || uploading}
                  startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <SendIcon sx={{ fontSize: 16 }} />}
                  onClick={handleDeliver}
                  sx={{
                    height: 44,
                    bgcolor: "#16a34a",
                    fontSize: 13,
                    fontWeight: 500,
                    borderRadius: 28,
                    textTransform: "none",
                    boxShadow: "none",
                    "&:hover": { bgcolor: "#15803d", boxShadow: "none" },
                  }}>
                  Submit Delivery
                </Button>
              </Box>
            )}

            {/* Revision Requested: Resubmit */}
            {order.status === "revision_requested" && !showDisputeForm && (
              <Box>
                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  placeholder="Describe what you changed in this revision..."
                  value={deliveryNote}
                  onChange={e => setDeliveryNote(e.target.value)}
                  size="small"
                  sx={{ mb: 1.5, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
                {/* Delivery file attachments */}
                <input
                  ref={deliveryFileInputRef}
                  type="file"
                  multiple
                  accept="image/*,application/pdf,.zip,.doc,.docx,.xls,.xlsx,.txt"
                  style={{ display: "none" }}
                  onChange={e => handleDeliveryFileUpload(e.target.files)}
                />
                {deliveryFiles.length > 0 && (
                  <Stack spacing={0.75} sx={{ mb: 1.5 }}>
                    {deliveryFiles.map((f, i) => (
                      <Stack key={i} direction="row" alignItems="center" spacing={1}
                        sx={{ px: 1.5, py: 0.75, bgcolor: "#F5F5F7", borderRadius: 2 }}>
                        {f.file_type.startsWith("image/")
                          ? <ImageIcon sx={{ fontSize: 16, color: "rgba(0,0,0,0.4)" }} />
                          : <FileIcon sx={{ fontSize: 16, color: "rgba(0,0,0,0.4)" }} />}
                        <Typography sx={{ fontSize: 12, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {f.file_name}
                        </Typography>
                        <IconButton size="small" onClick={() => setDeliveryFiles(prev => prev.filter((_, idx) => idx !== i))}
                          sx={{ p: 0.25, color: "rgba(0,0,0,0.4)", "&:hover": { color: "#dc2626" } }}>
                          <CloseIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Stack>
                    ))}
                  </Stack>
                )}
                <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    disabled={uploading || deliveryFiles.length >= 5}
                    startIcon={uploading ? <CircularProgress size={14} color="inherit" /> : <AttachFileIcon sx={{ fontSize: 14 }} />}
                    onClick={() => deliveryFileInputRef.current?.click()}
                    sx={{ textTransform: "none", fontSize: 12, borderRadius: 28, borderColor: "rgba(0,0,0,0.2)", color: "rgba(0,0,0,0.6)" }}>
                    {uploading ? "Uploading..." : `Attach files (${deliveryFiles.length}/5)`}
                  </Button>
                </Stack>
                <Button
                  fullWidth
                  variant="contained"
                  disabled={submitting || uploading}
                  startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <CompleteIcon sx={{ fontSize: 16 }} />}
                  onClick={handleResubmit}
                  sx={{
                    height: 44,
                    bgcolor: "#0071e3",
                    fontSize: 13,
                    fontWeight: 500,
                    borderRadius: 28,
                    textTransform: "none",
                    boxShadow: "none",
                    "&:hover": { bgcolor: "#0077ED", boxShadow: "none" },
                  }}>
                  Resubmit Work
                </Button>
              </Box>
            )}

            {/* Disputed: Submit evidence (files) */}
            {order.status === "disputed" && order.dispute?.status === "open" && !order.dispute.freelancer_evidence?.length && (
              <Box>
                <Typography sx={{ fontSize: 12, fontWeight: 600, mb: 1, color: "rgba(0,0,0,0.6)" }}>
                  Submit your evidence
                </Typography>
                <input
                  ref={evidenceFileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp,.pdf"
                  multiple
                  style={{ display: "none" }}
                  onChange={e => handleFileUpload(e.target.files, setSeparateEvidenceFiles, separateEvidenceFiles)}
                />
                <Button
                  size="small"
                  startIcon={uploading ? <CircularProgress size={12} /> : <AttachFileIcon sx={{ fontSize: 14 }} />}
                  disabled={uploading || separateEvidenceFiles.length >= 5}
                  onClick={() => evidenceFileInputRef.current?.click()}
                  sx={{ fontSize: 12, textTransform: "none", color: "rgba(0,0,0,0.5)", border: "1px dashed rgba(0,0,0,0.2)", borderRadius: 2, px: 1.5, py: 0.5, mb: 1, "&:hover": { borderColor: "rgba(0,0,0,0.4)", bgcolor: "rgba(0,0,0,0.02)" } }}>
                  {uploading ? "Uploading..." : "Attach files (images or PDF, max 5)"}
                </Button>
                {separateEvidenceFiles.length > 0 && (
                  <Stack direction="row" flexWrap="wrap" gap={0.5} mb={1}>
                    {separateEvidenceFiles.map((f, i) => (
                      <Chip
                        key={i}
                        label={f.file_name.length > 22 ? f.file_name.slice(0, 20) + "…" : f.file_name}
                        size="small"
                        icon={f.file_type === "image" ? <ImageIcon sx={{ fontSize: 12 }} /> : <FileIcon sx={{ fontSize: 12 }} />}
                        onDelete={() => setSeparateEvidenceFiles(prev => prev.filter((_, j) => j !== i))}
                        sx={{ fontSize: 11, height: 24 }}
                      />
                    ))}
                  </Stack>
                )}
                <Button
                  fullWidth
                  variant="contained"
                  disabled={submitting || !separateEvidenceFiles.length}
                  startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <SendIcon sx={{ fontSize: 16 }} />}
                  onClick={handleSubmitEvidence}
                  sx={{
                    height: 44,
                    bgcolor: "#7c3aed",
                    fontSize: 13,
                    fontWeight: 500,
                    borderRadius: 28,
                    textTransform: "none",
                    boxShadow: "none",
                    "&:hover": { bgcolor: "#6d28d9", boxShadow: "none" },
                  }}>
                  Submit Evidence
                </Button>
              </Box>
            )}

            {/* Open Dispute — low prominence link for active/delivered */}
            {(order.status === "active" || order.status === "delivered") && (
              <Box>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp,.pdf"
                  multiple
                  style={{ display: "none" }}
                  onChange={e => handleFileUpload(e.target.files, setEvidenceFiles, evidenceFiles)}
                />
                {!showDisputeForm ? (
                  <Button
                    size="small"
                    startIcon={<DisputeIcon sx={{ fontSize: 14 }} />}
                    onClick={() => setShowDisputeForm(true)}
                    sx={{
                      fontSize: 12,
                      color: "rgba(0,0,0,0.4)",
                      textTransform: "none",
                      "&:hover": { color: "#ef4444", bgcolor: "transparent" },
                    }}>
                    Open a dispute
                  </Button>
                ) : (
                  <Box>
                    <TextField
                      fullWidth
                      multiline
                      minRows={2}
                      placeholder="Describe the reason for the dispute..."
                      value={disputeReason}
                      onChange={e => setDisputeReason(e.target.value)}
                      size="small"
                      sx={{ mb: 1.5, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                    />
                    <Button
                      size="small"
                      startIcon={uploading ? <CircularProgress size={12} /> : <AttachFileIcon sx={{ fontSize: 14 }} />}
                      disabled={uploading || evidenceFiles.length >= 5}
                      onClick={() => fileInputRef.current?.click()}
                      sx={{ fontSize: 12, textTransform: "none", color: "rgba(0,0,0,0.5)", border: "1px dashed rgba(0,0,0,0.2)", borderRadius: 2, px: 1.5, py: 0.5, mb: 1, "&:hover": { borderColor: "rgba(0,0,0,0.4)", bgcolor: "rgba(0,0,0,0.02)" } }}>
                      {uploading ? "Uploading..." : "Attach evidence (optional)"}
                    </Button>
                    {evidenceFiles.length > 0 && (
                      <Stack direction="row" flexWrap="wrap" gap={0.5} mb={1}>
                        {evidenceFiles.map((f, i) => (
                          <Chip
                            key={i}
                            label={f.file_name.length > 22 ? f.file_name.slice(0, 20) + "…" : f.file_name}
                            size="small"
                            icon={f.file_type === "image" ? <ImageIcon sx={{ fontSize: 12 }} /> : <FileIcon sx={{ fontSize: 12 }} />}
                            onDelete={() => setEvidenceFiles(prev => prev.filter((_, j) => j !== i))}
                            sx={{ fontSize: 11, height: 24 }}
                          />
                        ))}
                      </Stack>
                    )}
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        disabled={submitting || !disputeReason.trim()}
                        onClick={handleOpenDispute}
                        sx={{ borderRadius: 28, textTransform: "none", fontSize: 12 }}>
                        {submitting ? <CircularProgress size={14} /> : "Open Dispute"}
                      </Button>
                      <Button
                        size="small"
                        onClick={() => { setShowDisputeForm(false); setDisputeReason(""); setEvidenceFiles([]); }}
                        sx={{ borderRadius: 28, textTransform: "none", fontSize: 12 }}>
                        Cancel
                      </Button>
                    </Stack>
                  </Box>
                )}
              </Box>
            )}
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
