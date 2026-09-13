"use client";

import { useState, useRef } from "react";
import { css } from "styled-system/css";
import {
  X as CloseIcon,
  Clock as DeliveryIcon,
  RefreshCw as RevisionIcon,
  MapPin as LocationIcon,
  Mail as EmailIcon,
  Phone as PhoneIcon,
  CheckCircle2 as CheckIcon,
  Check as CompleteIcon,
  XCircle as CancelIcon,
  Send as SendIcon,
  Gavel as DisputeIcon,
  Hourglass as AwaitingIcon,
  Paperclip as AttachFileIcon,
  FileText as FileIcon,
  Image as ImageIcon,
  AlertCircle as ErrorIcon,
  AlertTriangle as WarningIcon,
} from "lucide-react";
import { Spinner } from "@/components/ds";
import { BareModal } from "@/components/ds/BareModal";
import {
  alertActionCss, alertCloseCss, alertCss, alertFileRowCss, alertIconCss, alertMsgCss,
  ModalAvatar, chipIconCss, chipWrapCss, descClampCss, dlgBodyCss, dlgBtn,
  dlgCloseCss, dlgEyebrowCss, dlgHeaderCss, dlgStackCss, dlgTitleCss, eyebrowCss,
  fileChipCss, fileChipDeleteCss, fileChipIconCss, fileChipLabelCss, iconTextRowCss,
  lineCardCss, pillStatCss, row1Css, row15Css, stack05Css, stack075Css, stack15Css,
  statusChipCss, startIconCss, startIconSmCss, t11body, t11muted, t12, t12body, t12muted,
  t13b, t13m, t14b, t15b, tintCardCss, truncate,
} from "@/components/dashboard/orderModalKit";
import { Order, OrderStatus } from "@/types/order";
import { api } from "@/lib/api";
import { TextArea } from "@/components/ui/inputs";

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

const mb05 = css({ mb: "4px" });
const mb1 = css({ mb: "8px" });
const mb15 = css({ mb: "12px" });
const mb2 = css({ mb: "16px" });
const mt05 = css({ mt: "4px" });
const mt1 = css({ mt: "8px" });
const flex1 = css({ flex: 1 });
const splitRow = css({ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: "16px" });
const statRow = css({ display: "flex", gap: "16px" });
const fileRowCss = css({
  display: "flex",
  alignItems: "center",
  px: "12px",
  py: "6px",
  bg: "#F5F5F7",
  borderRadius: "8px",
  "& > :not(style) ~ :not(style)": { marginLeft: "8px" },
});
const fileRemoveCss = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flex: "0 0 auto",
  m: 0,
  p: "2px",
  border: "none",
  borderRadius: "50%",
  bg: "transparent",
  color: "rgba(0,0,0,0.4)",
  cursor: "pointer",
  appearance: "none",
  fontFamily: "inherit",
  _hover: { color: "#dc2626" },
  _focusVisible: { outline: "none", boxShadow: "focusRing" },
  "& svg": { display: "block" },
});

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
    <BareModal
      open={open}
      onOpenChange={(next) => { if (!next) onClose(); }}
      maxW="600px">
      {/* Header */}
      <div className={dlgHeaderCss}>
        <div>
          <p className={dlgEyebrowCss}>
            Order #{order.id}
          </p>
          <p className={dlgTitleCss}>Order Details</p>
        </div>
        <button type="button" onClick={onClose} aria-label="Close" className={dlgCloseCss}>
          <CloseIcon size={20} />
        </button>
      </div>

      <div className={dlgBodyCss}>
        <div className={dlgStackCss}>
          {/* Status Badge */}
          <span className={statusChipCss} style={{ backgroundColor: statusConfig.bgcolor, color: statusConfig.color }}>
            {order.status === "completed" ? <span className={chipIconCss}><CheckIcon size={18} /></span> : null}
            {getStatusLabel(order.status)}
          </span>

          {/* Delivered: Awaiting client banner */}
          {order.status === "delivered" && (
            <div className={alertCss({ tone: "info" })}>
              <span className={alertIconCss({ tone: "info" })}><AwaitingIcon size={24} /></span>
              <div className={alertMsgCss}>
                Your delivery is awaiting client approval. You will be notified when they respond.
                {order.delivery_note && (
                  <div className={mt1}>
                    <p className={css({ fontSize: "12px", fontWeight: 600, lineHeight: 1.5 })}>Your delivery note:</p>
                    <p className={`${t12} ${mt05}`}>{order.delivery_note}</p>
                  </div>
                )}
                {order.delivery_attachments?.length > 0 && (
                  <div className={`${stack05Css} ${mt1}`}>
                    <p className={css({ fontSize: "11px", fontWeight: 600, lineHeight: 1.5, color: "rgba(0,0,0,0.5)", textTransform: "uppercase", letterSpacing: "0.4px" })}>
                      Attachments sent
                    </p>
                    {order.delivery_attachments.map((f, i) => (
                      <a
                        key={i}
                        href={f.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={alertFileRowCss}
                      >
                        {f.file_type.startsWith("image/")
                          ? <ImageIcon size={14} style={{ color: "rgba(0,0,0,0.5)", flexShrink: 0 }} />
                          : <FileIcon size={14} style={{ color: "rgba(0,0,0,0.5)", flexShrink: 0 }} />}
                        <span className={`${t12} ${truncate}`}>
                          {f.file_name}
                        </span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Revision Requested: Show client feedback */}
          {order.status === "revision_requested" && order.revision_note && (
            <div className={alertCss({ tone: "warning" })}>
              <span className={alertIconCss({ tone: "warning" })}><WarningIcon size={22} /></span>
              <div className={alertMsgCss}>
                <p className={`${t13b} ${mb05}`}>Revision Requested</p>
                <p className={t12}>{order.revision_note}</p>
              </div>
            </div>
          )}

          {/* Disputed: Show dispute info + evidence form */}
          {order.status === "disputed" && order.dispute && (
            <div className={alertCss({ tone: "error" })}>
              <span className={alertIconCss({ tone: "error" })}><DisputeIcon size={24} /></span>
              <div className={alertMsgCss}>
                <p className={`${t13b} ${mb05}`}>Dispute Opened</p>
                <p className={`${t12} ${mb1}`}>{order.dispute.reason}</p>
                {order.dispute.freelancer_evidence?.length ? (
                  <p className={t12body}>
                    Your evidence ({order.dispute.freelancer_evidence.length} file{order.dispute.freelancer_evidence.length !== 1 ? "s" : ""}) has been submitted.
                  </p>
                ) : null}
              </div>
            </div>
          )}

          {/* Service Info */}
          <div className={tintCardCss}>
            <p className={`${t15b} ${mb05}`}>{service?.title || "Service"}</p>
            {service?.category && (
              <p className={`${t12muted} ${mb15}`}>
                {service.category.category_name}
              </p>
            )}
            {service?.description && (
              <div
                className={`${descClampCss} ${mb15}`}
                dangerouslySetInnerHTML={{ __html: service.description }}
              />
            )}
            {service?.location && (
              <div className={iconTextRowCss}>
                <LocationIcon size={14} style={{ color: "rgba(0, 0, 0, 0.4)", flexShrink: 0 }} />
                <p className={t12body}>{service.location}</p>
              </div>
            )}
          </div>

          {/* Client Info */}
          <div className={lineCardCss}>
            <p className={`${eyebrowCss} ${mb15}`}>
              Client
            </p>
            <div className={css({ display: "flex", alignItems: "center", "& > :not(style) ~ :not(style)": { marginLeft: "16px" } })}>
              <ModalAvatar src={client?.user?.avatar_url} alt={client?.user?.name || "Client"} fallback={client?.user?.name?.charAt(0) || "?"} />
              <div className={flex1}>
                <p className={`${t14b} ${mb05}`}>{client?.user?.name || "Unknown"}</p>
                <div className={stack05Css}>
                  {client?.user?.email && (
                    <div className={iconTextRowCss}>
                      <EmailIcon size={12} style={{ color: "rgba(0, 0, 0, 0.4)", flexShrink: 0 }} />
                      <p className={t11body}>{client.user.email}</p>
                    </div>
                  )}
                  {client?.user?.telephone && (
                    <div className={iconTextRowCss}>
                      <PhoneIcon size={12} style={{ color: "rgba(0, 0, 0, 0.4)", flexShrink: 0 }} />
                      <p className={t11body}>{client.user.telephone}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Package & Price */}
          <div className={lineCardCss}>
            <div className={splitRow}>
              <div>
                <p className={`${eyebrowCss} ${mb05}`}>
                  {isJobBased ? "Contract" : "Package"}
                </p>
                <p className={t14b}>
                  {pricingOption?.title ?? (isJobBased ? "Job Contract" : "Standard")}
                </p>
              </div>
              <div className={css({ textAlign: "right" })}>
                <p className={`${t11muted} ${mb05}`}>Earnings</p>
                <p className={css({ fontSize: "20px", fontWeight: 600, lineHeight: 1.5, color: "#16a34a" })}>
                  ${pricingOption?.price ?? order.price ?? "0"}
                </p>
              </div>
            </div>

            {pricingOption?.description && (
              <p className={`${t12body} ${mb2}`}>
                {pricingOption.description}
              </p>
            )}

            <div className={statRow}>
              <div className={pillStatCss}>
                <DeliveryIcon size={14} style={{ color: "rgba(0, 0, 0, 0.5)", flexShrink: 0 }} />
                <p className={css({ fontSize: "12px", lineHeight: 1.5, color: "rgba(0, 0, 0, 0.7)" })}>
                  {isJobBased
                    ? `${order.proposal?.timeline_days ?? "N/A"} day${order.proposal?.timeline_days !== 1 ? "s" : ""} (timeline)`
                    : (() => { const d = parseInt(String(pricingOption?.delivery_time ?? "")); return isNaN(d) ? "N/A" : `${d} day${d !== 1 ? "s" : ""}`; })()}
                </p>
              </div>
              {!isJobBased && (
                <div className={pillStatCss}>
                  <RevisionIcon size={14} style={{ color: "rgba(0, 0, 0, 0.5)", flexShrink: 0 }} />
                  <p className={css({ fontSize: "12px", lineHeight: 1.5, color: "rgba(0, 0, 0, 0.7)" })}>
                    {Number(pricingOption?.revisions) === -1 ? "Unlimited" : pricingOption?.revisions || "N/A"} revision
                    {Number(pricingOption?.revisions) !== 1 ? "s" : ""}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className={tintCardCss}>
            <p className={`${eyebrowCss} ${mb15}`}>
              Timeline
            </p>
            <div className={stack15Css}>
              <div className={css({ display: "flex", alignItems: "center", gap: "12px" })}>
                <span className={css({ width: "6px", height: "6px", borderRadius: "50%", bg: "#0071e3", flexShrink: 0 })} />
                <div className={flex1}>
                  <p className={t13m}>Order Received</p>
                  <p className={t11muted}>{formatDateTime(order.created_at)}</p>
                </div>
              </div>
              {order.updated_at !== order.created_at && (
                <div className={css({ display: "flex", alignItems: "center", gap: "12px" })}>
                  <span className={css({ width: "6px", height: "6px", borderRadius: "50%", bg: "rgba(0, 0, 0, 0.3)", flexShrink: 0 })} />
                  <div className={flex1}>
                    <p className={t13m}>Last Updated</p>
                    <p className={t11muted}>{formatDateTime(order.updated_at)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {actionError && (
            <div className={alertCss({ tone: "error" })}>
              <span className={alertIconCss({ tone: "error" })}><ErrorIcon size={22} /></span>
              <div className={alertMsgCss}>{actionError}</div>
              <div className={alertActionCss}>
                <button type="button" aria-label="Close" onClick={() => setActionError(null)} className={alertCloseCss}>
                  <CloseIcon size={20} />
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className={stack15Css}>
            {/* Pending: Accept & Decline */}
            {order.status === "pending" && (
              <div className={row15Css}>
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => onAccept(order.id)}
                  className={dlgBtn({ look: "cta", full: true })}
                  style={{ backgroundColor: isLoading ? undefined : "#16a34a" }}>
                  <span className={startIconCss}>{isLoading ? <Spinner size={16} /> : <CheckIcon size={20} />}</span>
                  Accept Order
                </button>
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => onCancel(order.id)}
                  className={dlgBtn({ look: "cta", full: true })}
                  style={{ backgroundColor: isLoading ? undefined : "#ef4444" }}>
                  <span className={startIconCss}>{isLoading ? <Spinner size={16} /> : <CancelIcon size={20} />}</span>
                  Decline
                </button>
              </div>
            )}

            {/* Active: Submit Delivery */}
            {order.status === "active" && !showDisputeForm && (
              <div>
                <div className={mb15}>
                  <TextArea
                    minRows={2}
                    placeholder="Add a delivery note for the client (optional)..."
                    value={deliveryNote}
                    onChange={setDeliveryNote}
                  />
                </div>
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
                  <div className={`${stack075Css} ${mb15}`}>
                    {deliveryFiles.map((f, i) => (
                      <div key={i} className={fileRowCss}>
                        {f.file_type.startsWith("image/")
                          ? <ImageIcon size={16} style={{ color: "rgba(0,0,0,0.4)", flexShrink: 0 }} />
                          : <FileIcon size={16} style={{ color: "rgba(0,0,0,0.4)", flexShrink: 0 }} />}
                        <span className={`${t12} ${flex1} ${truncate}`}>
                          {f.file_name}
                        </span>
                        <button type="button" aria-label="Remove file" className={fileRemoveCss} onClick={() => setDeliveryFiles(prev => prev.filter((_, idx) => idx !== i))}>
                          <CloseIcon size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className={`${row1Css} ${mb15}`}>
                  <button
                    type="button"
                    disabled={uploading || deliveryFiles.length >= 5}
                    onClick={() => deliveryFileInputRef.current?.click()}
                    className={dlgBtn({ look: "attachOutline" })}>
                    <span className={startIconSmCss}>{uploading ? <Spinner size={14} /> : <AttachFileIcon size={18} />}</span>
                    {uploading ? "Uploading..." : `Attach files (${deliveryFiles.length}/5)`}
                  </button>
                </div>
                <button
                  type="button"
                  disabled={submitting || uploading}
                  onClick={handleDeliver}
                  className={dlgBtn({ look: "cta", full: true })}
                  style={{ backgroundColor: (submitting || uploading) ? undefined : "#16a34a" }}>
                  <span className={startIconCss}>{submitting ? <Spinner size={16} /> : <SendIcon size={20} />}</span>
                  Submit Delivery
                </button>
              </div>
            )}

            {/* Revision Requested: Resubmit */}
            {order.status === "revision_requested" && !showDisputeForm && (
              <div>
                <div className={mb15}>
                  <TextArea
                    minRows={2}
                    placeholder="Describe what you changed in this revision..."
                    value={deliveryNote}
                    onChange={setDeliveryNote}
                  />
                </div>
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
                  <div className={`${stack075Css} ${mb15}`}>
                    {deliveryFiles.map((f, i) => (
                      <div key={i} className={fileRowCss}>
                        {f.file_type.startsWith("image/")
                          ? <ImageIcon size={16} style={{ color: "rgba(0,0,0,0.4)", flexShrink: 0 }} />
                          : <FileIcon size={16} style={{ color: "rgba(0,0,0,0.4)", flexShrink: 0 }} />}
                        <span className={`${t12} ${flex1} ${truncate}`}>
                          {f.file_name}
                        </span>
                        <button type="button" aria-label="Remove file" className={fileRemoveCss} onClick={() => setDeliveryFiles(prev => prev.filter((_, idx) => idx !== i))}>
                          <CloseIcon size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className={`${row1Css} ${mb15}`}>
                  <button
                    type="button"
                    disabled={uploading || deliveryFiles.length >= 5}
                    onClick={() => deliveryFileInputRef.current?.click()}
                    className={dlgBtn({ look: "attachOutline" })}>
                    <span className={startIconSmCss}>{uploading ? <Spinner size={14} /> : <AttachFileIcon size={18} />}</span>
                    {uploading ? "Uploading..." : `Attach files (${deliveryFiles.length}/5)`}
                  </button>
                </div>
                <button
                  type="button"
                  disabled={submitting || uploading}
                  onClick={handleResubmit}
                  className={dlgBtn({ look: "cta", full: true })}
                  style={{ backgroundColor: (submitting || uploading) ? undefined : "#0071e3" }}>
                  <span className={startIconCss}>{submitting ? <Spinner size={16} /> : <CompleteIcon size={20} />}</span>
                  Resubmit Work
                </button>
              </div>
            )}

            {/* Disputed: Submit evidence (files) */}
            {order.status === "disputed" && order.dispute?.status === "open" && !order.dispute.freelancer_evidence?.length && (
              <div>
                <p className={`${css({ fontSize: "12px", fontWeight: 600, lineHeight: 1.5, color: "rgba(0,0,0,0.6)" })} ${mb1}`}>
                  Submit your evidence
                </p>
                <input
                  ref={evidenceFileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp,.pdf"
                  multiple
                  style={{ display: "none" }}
                  onChange={e => handleFileUpload(e.target.files, setSeparateEvidenceFiles, separateEvidenceFiles)}
                />
                <button
                  type="button"
                  disabled={uploading || separateEvidenceFiles.length >= 5}
                  onClick={() => evidenceFileInputRef.current?.click()}
                  className={`${dlgBtn({ look: "attach" })} ${mb1}`}>
                  <span className={startIconSmCss}>{uploading ? <Spinner size={12} /> : <AttachFileIcon size={18} />}</span>
                  {uploading ? "Uploading..." : "Attach files (images or PDF, max 5)"}
                </button>
                {separateEvidenceFiles.length > 0 && (
                  <div className={`${chipWrapCss} ${mb1}`}>
                    {separateEvidenceFiles.map((f, i) => (
                      <span key={i} className={fileChipCss}>
                        <span className={fileChipIconCss}>{f.file_type === "image" ? <ImageIcon size={18} /> : <FileIcon size={18} />}</span>
                        <span className={fileChipLabelCss}>{f.file_name.length > 22 ? f.file_name.slice(0, 20) + "…" : f.file_name}</span>
                        <button type="button" aria-label="Remove" className={fileChipDeleteCss} onClick={() => setSeparateEvidenceFiles(prev => prev.filter((_, j) => j !== i))}>
                          <CloseIcon size={16} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <button
                  type="button"
                  disabled={submitting || uploading || !separateEvidenceFiles.length}
                  onClick={handleSubmitEvidence}
                  className={dlgBtn({ look: "cta", full: true })}
                  style={{ backgroundColor: (submitting || uploading || !separateEvidenceFiles.length) ? undefined : "#7c3aed" }}>
                  <span className={startIconCss}>{submitting ? <Spinner size={16} /> : <SendIcon size={20} />}</span>
                  Submit Evidence
                </button>
              </div>
            )}

            {/* Open Dispute — low prominence link for active/delivered */}
            {(order.status === "active" || order.status === "delivered") && (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp,.pdf"
                  multiple
                  style={{ display: "none" }}
                  onChange={e => handleFileUpload(e.target.files, setEvidenceFiles, evidenceFiles)}
                />
                {!showDisputeForm ? (
                  <button
                    type="button"
                    onClick={() => setShowDisputeForm(true)}
                    className={dlgBtn({ look: "quiet" })}>
                    <span className={startIconSmCss}><DisputeIcon size={18} /></span>
                    Open a dispute
                  </button>
                ) : (
                  <div>
                    <div className={mb15}>
                      <TextArea
                        minRows={2}
                        placeholder="Describe the reason for the dispute..."
                        value={disputeReason}
                        onChange={setDisputeReason}
                      />
                    </div>
                    <button
                      type="button"
                      disabled={uploading || evidenceFiles.length >= 5}
                      onClick={() => fileInputRef.current?.click()}
                      className={`${dlgBtn({ look: "attach" })} ${mb1}`}>
                      <span className={startIconSmCss}>{uploading ? <Spinner size={12} /> : <AttachFileIcon size={18} />}</span>
                      {uploading ? "Uploading..." : "Attach evidence (optional)"}
                    </button>
                    {evidenceFiles.length > 0 && (
                      <div className={`${chipWrapCss} ${mb1}`}>
                        {evidenceFiles.map((f, i) => (
                          <span key={i} className={fileChipCss}>
                            <span className={fileChipIconCss}>{f.file_type === "image" ? <ImageIcon size={18} /> : <FileIcon size={18} />}</span>
                            <span className={fileChipLabelCss}>{f.file_name.length > 22 ? f.file_name.slice(0, 20) + "…" : f.file_name}</span>
                            <button type="button" aria-label="Remove" className={fileChipDeleteCss} onClick={() => setEvidenceFiles(prev => prev.filter((_, j) => j !== i))}>
                              <CloseIcon size={16} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    <div className={row1Css}>
                      <button
                        type="button"
                        disabled={submitting || uploading || !disputeReason.trim()}
                        onClick={handleOpenDispute}
                        className={dlgBtn({ look: "outlineSmError" })}>
                        {submitting ? <Spinner size={14} /> : "Open Dispute"}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowDisputeForm(false); setDisputeReason(""); setEvidenceFiles([]); }}
                        className={dlgBtn({ look: "textSm" })}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </BareModal>
  );
}
