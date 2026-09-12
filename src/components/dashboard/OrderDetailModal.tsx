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
  Star as StarIcon,
  Star as StarBorderIcon,
  MessageSquareQuote as ReviewIcon,
  ThumbsUp as ApproveIcon,
  Gavel as DisputeIcon,
  Send as SendIcon,
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
  iconTextRow8Css, lineCardCss, pillStatCss, row1Css, stack05Css, stack15Css, starBtnCss,
  starRowCss, starRowTightCss, statusChipCss, startIconCss, startIconSmCss, t11body,
  t11muted, t12, t12body, t12muted, t13b, t13m, t14b, t15b, tintCardCss, truncate,
} from "@/components/dashboard/orderModalKit";
import { Order, OrderStatus, Review } from "@/types/order";
import { useAuth } from "@/components/context/AuthContext";
import { api } from "@/lib/api";
import { TextArea } from "@/components/ui/inputs";

interface OrderDetailModalProps {
  open: boolean;
  order: Order | null;
  onClose: () => void;
  onReviewSubmitted?: (orderId: number, review: Review) => void;
  onOrderUpdate?: () => void;
}

function InteractiveStars({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;

  return (
    <div className={starRowCss}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className={starBtnCss}
          style={{ color: star <= display ? "#f59e0b" : "rgba(0,0,0,0.2)" }}
        >
          {star <= display ? (
            <StarIcon size={28} fill="currentColor" />
          ) : (
            <StarBorderIcon size={28} />
          )}
        </button>
      ))}
    </div>
  );
}

function ReadonlyStars({ rating }: { rating: number }) {
  return (
    <div className={starRowTightCss}>
      {[1, 2, 3, 4, 5].map((star) => (
        <StarIcon
          key={star}
          size={16}
          fill="currentColor"
          style={{ color: star <= rating ? "#f59e0b" : "rgba(0,0,0,0.15)" }}
        />
      ))}
    </div>
  );
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
const reviewCardCss = css({ p: "20px", borderWidth: "1px", borderStyle: "solid", borderColor: "rgba(22, 163, 74, 0.2)", bg: "rgba(22, 163, 74, 0.03)", borderRadius: "12px", overflow: "hidden" });
const leaveReviewCardCss = css({ p: "20px", borderWidth: "1px", borderStyle: "solid", borderColor: "rgba(0,113,227,0.2)", bg: "rgba(0,113,227,0.03)", borderRadius: "12px", overflow: "hidden" });

export default function OrderDetailModal({ open, order, onClose, onReviewSubmitted, onOrderUpdate }: OrderDetailModalProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [revisionNote, setRevisionNote] = useState("");
  const [showRevisionForm, setShowRevisionForm] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [evidenceFiles, setEvidenceFiles] = useState<{ url: string; file_name: string; file_type: string }[]>([]);
  const [separateEvidenceFiles, setSeparateEvidenceFiles] = useState<{ url: string; file_name: string; file_type: string }[]>([]);
  const [uploadToken, setUploadToken] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const evidenceFileInputRef = useRef<HTMLInputElement>(null);

  if (!order) return null;

  const canReview =
    user?.is_client === true &&
    user.client_profile?.id === order.client_profile_id &&
    order.status === "completed" &&
    order.review === null;

  const showSubmittedReview =
    order.status === "completed" && order.review !== null;

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
      pending: "Pending",
      delivered: "Delivered — Review Required",
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleApprove = async () => {
    setSubmitting(true);
    setActionError(null);
    try {
      await api.approveOrder(order!.id);
      onOrderUpdate?.();
      onClose();
    } catch {
      setActionError("Failed to approve order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestRevision = async () => {
    if (!revisionNote.trim()) return;
    setSubmitting(true);
    setActionError(null);
    try {
      await api.requestRevision(order!.id, revisionNote);
      setRevisionNote("");
      setShowRevisionForm(false);
      onOrderUpdate?.();
      onClose();
    } catch {
      setActionError("Failed to request revision. Please try again.");
    } finally {
      setSubmitting(false);
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
      await api.openDispute(order!.id, disputeReason, evidenceFiles.length ? evidenceFiles : undefined);
      setDisputeReason("");
      setEvidenceFiles([]);
      setShowDisputeForm(false);
      onOrderUpdate?.();
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
      await api.submitDisputeEvidence(order!.id, separateEvidenceFiles);
      setSeparateEvidenceFiles([]);
      onOrderUpdate?.();
    } catch {
      setActionError("Failed to submit evidence. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReview = async () => {
    if (rating === 0) {
      setSubmitError("Please select a star rating.");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const response = await api.submitReview(order.id, {
        rating,
        comment: comment.trim() || undefined,
      });
      onReviewSubmitted?.(order.id, response.data);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  const isJobBased = !order.pricing_option_id;
  const service = order.service;
  const freelancer = order.freelancer ?? order.proposal?.freelancer_profile;
  const pricingOption = order.pricing_option;
  const statusConfig = getStatusConfig(order.status);

  return (
    <BareModal
      open={open}
      onOpenChange={(next) => { if (!next) onClose(); }}
      maxW="600px"
    >
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

          {/* Delivered: Freelancer delivery note + action buttons */}
          {order.status === "delivered" && (
            <div className={alertCss({ tone: "success" })}>
              <span className={alertIconCss({ tone: "success" })}><CheckIcon size={22} /></span>
              <div className={alertMsgCss}>
                <p className={`${t13b} ${mb05}`}>Work Delivered!</p>
                {order.delivery_note && (
                  <p className={t12}>{order.delivery_note}</p>
                )}
                {order.delivery_attachments?.length > 0 && (
                  <div className={`${stack05Css} ${mt05}`}>
                    <p className={css({ fontSize: "11px", fontWeight: 600, lineHeight: 1.5, color: "rgba(0,0,0,0.5)", textTransform: "uppercase", letterSpacing: "0.4px" })}>
                      Attachments
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

          {/* Revision Requested: Awaiting resubmission */}
          {order.status === "revision_requested" && (
            <div className={alertCss({ tone: "warning" })}>
              <span className={alertIconCss({ tone: "warning" })}><WarningIcon size={22} /></span>
              <div className={alertMsgCss}>
                <p className={`${t13b} ${mb05}`}>Revision Requested</p>
                {order.revision_note && (
                  <p className={t12}>Your feedback: {order.revision_note}</p>
                )}
                <p className={`${t12muted} ${mt05}`}>
                  Awaiting the freelancer to resubmit their work.
                </p>
              </div>
            </div>
          )}

          {/* Disputed */}
          {order.status === "disputed" && order.dispute && (
            <div className={alertCss({ tone: "error" })}>
              <span className={alertIconCss({ tone: "error" })}><DisputeIcon size={24} /></span>
              <div className={alertMsgCss}>
                <p className={`${t13b} ${mb05}`}>Dispute Opened</p>
                <p className={`${t12} ${mb1}`}>{order.dispute.reason}</p>
                {order.dispute.client_evidence?.length ? (
                  <p className={t12body}>
                    Your evidence ({order.dispute.client_evidence.length} file{order.dispute.client_evidence.length !== 1 ? "s" : ""}) has been submitted.
                  </p>
                ) : null}
              </div>
            </div>
          )}

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

          {/* Freelancer Info */}
          <div className={lineCardCss}>
            <p className={`${eyebrowCss} ${mb15}`}>
              Service Provider
            </p>
            <div className={css({ display: "flex", alignItems: "center", "& > :not(style) ~ :not(style)": { marginLeft: "16px" } })}>
              <ModalAvatar src={freelancer?.user?.avatar_url} alt={freelancer?.user?.name || "Freelancer"} fallback={freelancer?.user?.name?.charAt(0) || "?"} />
              <div className={flex1}>
                <p className={`${t14b} ${mb05}`}>{freelancer?.user?.name || "Unknown"}</p>
                <div className={stack05Css}>
                  {freelancer?.user?.email && (
                    <div className={iconTextRowCss}>
                      <EmailIcon size={12} style={{ color: "rgba(0, 0, 0, 0.4)", flexShrink: 0 }} />
                      <p className={t11body}>{freelancer.user.email}</p>
                    </div>
                  )}
                  {freelancer?.user?.telephone && (
                    <div className={iconTextRowCss}>
                      <PhoneIcon size={12} style={{ color: "rgba(0, 0, 0, 0.4)", flexShrink: 0 }} />
                      <p className={t11body}>{freelancer.user.telephone}</p>
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
                <p className={`${t11muted} ${mb05}`}>Total</p>
                <p className={css({ fontSize: "20px", fontWeight: 600, lineHeight: 1.5 })}>
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
                  <p className={t13m}>Order Placed</p>
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

          {/* ── Delivered Actions ── */}
          {order.status === "delivered" && (
            <div className={stack15Css}>
              {!showRevisionForm && !showDisputeForm && (
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleApprove}
                  className={dlgBtn({ look: "cta", full: true })}
                  style={{ backgroundColor: submitting ? undefined : "#16a34a" }}>
                  <span className={startIconCss}>{submitting ? <Spinner size={16} /> : <ApproveIcon size={20} />}</span>
                  Approve &amp; Release Payment
                </button>
              )}

              {!showRevisionForm && !showDisputeForm ? (
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setShowRevisionForm(true)}
                  className={dlgBtn({ look: "outline44", full: true })}>
                  <span className={startIconCss}><RevisionIcon size={20} /></span>
                  Request Revision
                </button>
              ) : (
                <div>
                  <div className={mb1}>
                    <TextArea
                      minRows={2}
                      placeholder="Describe what you'd like changed..."
                      value={revisionNote}
                      onChange={setRevisionNote}
                    />
                  </div>
                  <div className={row1Css}>
                    <button
                      type="button"
                      disabled={submitting || !revisionNote.trim()}
                      onClick={handleRequestRevision}
                      className={dlgBtn({ look: "outlineSm" })}>
                      {submitting ? <Spinner size={14} /> : "Send Revision Request"}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowRevisionForm(false); setRevisionNote(""); }}
                      className={dlgBtn({ look: "textSm" })}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Disputed: Submit evidence (files) */}
          {order.status === "disputed" && order.dispute?.status === "open" && !order.dispute.client_evidence?.length && (
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

          {/* Open Dispute — low prominence for active/delivered */}
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

          {/* ── Review Section ── */}
          {showSubmittedReview && order.review && (
            <div className={reviewCardCss}>
              <div className={`${iconTextRow8Css} ${mb15}`}>
                <ReviewIcon size={16} style={{ color: "#16a34a", flexShrink: 0 }} />
                <p className={css({ fontSize: "11px", lineHeight: 1.5, color: "#16a34a", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 })}>
                  Your Review
                </p>
              </div>
              <ReadonlyStars rating={order.review.rating} />
              {order.review.comment && (
                <p className={`${css({ fontSize: "13px", color: "rgba(0,0,0,0.7)", lineHeight: 1.6 })} ${mt1}`}>
                  {order.review.comment}
                </p>
              )}
              <p className={`${css({ fontSize: "11px", lineHeight: 1.5, color: "rgba(0,0,0,0.4)" })} ${mt1}`}>
                {formatDate(order.review.created_at)}
              </p>
            </div>
          )}

          {canReview && (
            <div className={leaveReviewCardCss}>
              <div className={`${iconTextRow8Css} ${mb2}`}>
                <ReviewIcon size={16} style={{ color: "#0071e3", flexShrink: 0 }} />
                <p className={css({ fontSize: "11px", lineHeight: 1.5, color: "#0071e3", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 })}>
                  Leave a Review
                </p>
              </div>

              <p className={`${css({ fontSize: "13px", lineHeight: 1.5, color: "rgba(0,0,0,0.6)" })} ${mb15}`}>
                How was your experience with this freelancer?
              </p>

              <div className={mb2}>
                <InteractiveStars value={rating} onChange={setRating} />
              </div>

              <div className={mb15}>
                <TextArea
                  minRows={3}
                  placeholder="Share your experience (optional)"
                  value={comment}
                  onChange={setComment}
                  maxLength={1000}
                />
              </div>

              {submitError && (
                <div className={`${alertCss({ tone: "error" })} ${mb15}`} style={{ fontSize: 13 }}>
                  <span className={alertIconCss({ tone: "error" })}><ErrorIcon size={22} /></span>
                  <div className={alertMsgCss}>{submitError}</div>
                </div>
              )}

              <button
                type="button"
                onClick={handleSubmitReview}
                disabled={submitting}
                className={dlgBtn({ look: "cta", full: true })}
                style={{ height: 40, backgroundColor: submitting ? undefined : "#0071e3" }}
              >
                {submitting ? <Spinner size={16} style={{ color: "white" }} /> : "Submit Review"}
              </button>
            </div>
          )}

        </div>
      </div>
    </BareModal>
  );
}
