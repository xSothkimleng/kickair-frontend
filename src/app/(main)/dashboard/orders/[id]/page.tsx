"use client";

import { useState, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/queryKeys";
import { useParams, useRouter } from "next/navigation";
import { css } from "styled-system/css";
import {
  ChevronLeft,
  Star,
  FileText as FileIcon,
  Image as ImageIcon,
  Paperclip as AttachFileIcon,
  Download as DownloadIcon,
  CheckCircle2 as CheckIcon,
  AlertCircle as ErrorIcon,
  X as CloseIcon,
} from "lucide-react";
import { Spinner } from "@/components/ds";
import { BareModal } from "@/components/ds/BareModal";
import {
  PageTextArea, backBtnCss, bannerCss, bannerGlyphCss, bodyMutedCss, bodyTextCss, cardCss,
  cardTitleCss, catChipCss, centerPageCss, centerPageColCss, colStackCss, containerCss,
  descClamp2Css, dlgBodyCss, dlgFootCss, dlgFootTightCss, dlgHeadCss, dlgInlineAlertCss,
  dlgSubCss, dlgTitleCss, dropIconCss, dropItemCss, dropItemNameCss, dropListCss,
  dropRemoveCss, dropTextCss, dropWrapCss, dropZoneCss, evidencePartyCss, evidenceRowCss,
  fieldLabelCss, fileDownloadCss, fileNameCss, fileNameWrapCss, fileRowCss, fileTileCss,
  headWrapCss, infoGridCss, mb225, mutedSmallCss, notFoundTextCss, outcomeBoxCss, pageBtn,
  pageCss, pageTitleCss, partyAvatarCss, partyAvatarImgCss, partyMeta16Css, partyMetaCss,
  partyNameCss, partyRowCss, placedCss, reviewBoxCss, reviewHeadCss, reviewerCss, secLabelCss,
  stack1Css, starBtnCss, starRowCss, startIconCss, statGridCss, statusBadgeCss, statusDotCss,
  tileCss, tileLabelCss, tileValCss, titleRowCss, topAlertActionCss, topAlertCloseCss,
  topAlertCss, topAlertIconCss, topAlertMsgCss, totalRowCss,
} from "@/components/dashboard/orderPageKit";
import { api } from "@/lib/api";
import { downloadOrderAttachment } from "@/lib/downloadFile";
import { Order, OrderStatus, MyOrdersResponse, Dispute, EvidenceFile } from "@/types/order";
import { useAuth } from "@/components/context/AuthContext";
import OrderRecord from "@/components/dashboard/OrderRecord";

// ─── Design tokens ────────────────────────────────────────────────────────────
// (the CARD / SEC_LABEL / BTN_* objects now live in `dashboard/orderPageKit`)

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
    <span className={statusBadgeCss} style={{ backgroundColor: cfg.bgcolor, color: cfg.color }}>
      <span className={statusDotCss} />
      {cfg.label}
    </span>
  );
}

function InteractiveStars({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;
  return (
    <div className={starRowCss}>
      {[1, 2, 3, 4, 5].map((s) => (
        <button key={s} type="button" className={starBtnCss} onClick={() => onChange(s)} onMouseEnter={() => setHovered(s)} onMouseLeave={() => setHovered(0)} style={{ color: s <= display ? "#F59E0B" : "#E2E8F0" }}>
          <Star size={26} fill={s <= display ? "currentColor" : "none"} />
        </button>
      ))}
    </div>
  );
}

function ReadonlyStars({ rating }: { rating: number }) {
  return (
    <div className={starRowCss}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} size={14} fill="currentColor" style={{ color: s <= rating ? "#F59E0B" : "#E2E8F0" }} />
      ))}
    </div>
  );
}

function FileRow({ file, orderId }: { file: UploadedFile; orderId?: number }) {
  const isImage = file.file_type?.startsWith("image/");
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!orderId) { window.open(file.url, "_blank"); return; }
    setDownloading(true);
    try { await downloadOrderAttachment(orderId, file.url, file.file_name); }
    catch { window.open(file.url, "_blank"); }
    finally { setDownloading(false); }
  };

  return (
    <a href={file.url} target="_blank" rel="noopener noreferrer" className={fileRowCss}>
      <span className={fileTileCss}>
        {isImage ? <ImageIcon size={16} /> : <FileIcon size={16} />}
      </span>
      <span className={fileNameWrapCss}>
        <span className={fileNameCss}>{file.file_name}</span>
      </span>
      <span onClick={handleDownload} className={fileDownloadCss}>
        {downloading ? <Spinner size={13} /> : <DownloadIcon size={14} />} Download
      </span>
    </a>
  );
}

const OUTCOME_LABEL: Record<string, string> = {
  full_freelancer: "Resolved in favor of the freelancer",
  full_client: "Resolved in favor of the client — refunded",
  partial: "Partial resolution — split between both parties",
  continue: "Order continues with admin feedback",
};

function EvidenceParty({ label, files, statement, orderId }: { label: string; files: EvidenceFile[] | null; statement: string | null; orderId?: number }) {
  const has = (files?.length ?? 0) > 0 || !!statement;
  return (
    <div className={evidencePartyCss}>
      <p className={fieldLabelCss}>{label}</p>
      {!has ? (
        <p className={mutedSmallCss}>No evidence submitted yet.</p>
      ) : (
        <>
          {statement && <p className={bodyMutedCss}>{statement}</p>}
          {files?.length ? <div className={stack1Css}>{files.map((f, i) => <FileRow key={i} file={f} orderId={orderId} />)}</div> : null}
        </>
      )}
    </div>
  );
}

function DisputeBlock({ dispute, orderId }: { dispute: Dispute; orderId?: number }) {
  const resolved = dispute.status === "resolved";
  return (
    <div className={cardCss}>
      <div className={`${bannerCss({ tone: resolved ? "success" : "danger" })} ${mb225}`}>
        <span className={bannerGlyphCss}>{resolved ? "✓" : "⚠"}</span>
        {resolved ? "This dispute has been resolved by an admin." : "This order is under dispute. An admin will review it."}
      </div>

      <p className={fieldLabelCss}>Dispute #{dispute.sequence} · reason</p>
      <p className={bodyTextCss}>{dispute.reason}</p>

      {resolved && (
        <div className={outcomeBoxCss}>
          <p className={fieldLabelCss}>
            Outcome: {OUTCOME_LABEL[dispute.outcome ?? ""] ?? "Resolved"}
            {dispute.outcome === "partial" && dispute.partial_freelancer_amount
              ? ` ($${dispute.partial_freelancer_amount} to freelancer)` : ""}
          </p>
          {dispute.admin_note && (
            <p className={bodyMutedCss}>
              <strong>Admin feedback:</strong> {dispute.admin_note}
            </p>
          )}
        </div>
      )}

      <div className={evidenceRowCss}>
        <EvidenceParty label="Client's evidence" files={dispute.client_evidence} statement={dispute.client_statement} orderId={orderId} />
        <EvidenceParty label="Freelancer's evidence" files={dispute.freelancer_evidence} statement={dispute.freelancer_statement} orderId={orderId} />
      </div>
    </div>
  );
}

function DialogDropzone({ onFiles, files, onRemove, uploading }: { onFiles: (fl: FileList) => void; files: UploadedFile[]; onRemove: (i: number) => void; uploading: boolean }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className={dropWrapCss}>
      <input ref={ref} type="file" accept="image/jpeg,image/png,image/gif,image/webp,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar" multiple hidden onChange={(e) => e.target.files && onFiles(e.target.files)} />
      <div onClick={() => ref.current?.click()} className={dropZoneCss}>
        <span className={dropIconCss}><AttachFileIcon size={20} /></span>
        <p className={dropTextCss}>
          {uploading ? "Uploading…" : "Drag files here or click to upload"}
        </p>
      </div>
      {files.length > 0 && (
        <div className={dropListCss}>
          {files.map((f, i) => (
            <div key={i} className={dropItemCss}>
              <FileIcon size={14} style={{ color: "#64748B", flexShrink: 0 }} />
              <span className={dropItemNameCss}>{f.file_name}</span>
              <button type="button" aria-label="Remove file" onClick={() => onRemove(i)} className={dropRemoveCss}>×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ClientOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const orderId = Number(params.id);

  const [actionError, setActionError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Dialog open states
  const [revisionOpen, setRevisionOpen] = useState(false);
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

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

  const queryClient = useQueryClient();
  const { data: order = null, isLoading: loading, error: queryError } = useQuery({
    queryKey: qk.orders.detail(orderId, "client"),
    queryFn: async () => {
      const response: MyOrdersResponse = await api.get("/api/my-orders");
      const found = response.data.find((o: Order) => o.id === orderId);
      if (!found) throw new Error("Order not found.");
      return found;
    },
    enabled: Number.isFinite(orderId),
  });
  const error = queryError ? (queryError instanceof Error ? queryError.message : "Failed to load order.") : null;

  // After an action, refresh this order + the lists, wallet, and dashboard that also reflect it.
  const fetchOrder = async () => {
    await queryClient.invalidateQueries({ queryKey: qk.orders.all() });
    queryClient.invalidateQueries({ queryKey: qk.wallet() });
    queryClient.invalidateQueries({ queryKey: qk.dashboard.client() });
  };

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

  const handleCancelOrder = async () => {
    setSubmitting(true); setActionError(null);
    try { await api.cancelOrder(orderId); setCancelOpen(false); await fetchOrder(); }
    catch { setActionError("Failed to cancel order."); }
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
      await api.submitReview(orderId, { rating, comment: comment.trim() || undefined });
      await fetchOrder();
    } catch { setSubmitReviewError("Failed to submit review."); }
    finally { setSubmitting(false); }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className={centerPageCss}>
        <Spinner size={40} style={{ color: "#0F172A" }} />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className={centerPageColCss}>
        <p className={notFoundTextCss}>{error ?? "Order not found."}</p>
        <button type="button" onClick={() => router.back()} className={pageBtn({ look: "outline", h36: true })}>Go back</button>
      </div>
    );
  }

  const isCustom = !!order.custom_order_id;
  const isJobBased = !order.pricing_option_id && !isCustom;
  const service = order.service;
  const freelancer = order.freelancer ?? order.proposal?.freelancer_profile;
  const pricingOption = order.pricing_option;
  const deliveryDays = isCustom
    ? order.custom_order?.delivery_days ?? undefined
    : isJobBased
      ? order.proposal?.timeline_days
      : parseInt(String(pricingOption?.delivery_time ?? ""));
  const revisions = Number((isCustom ? order.custom_order?.revisions : pricingOption?.revisions) ?? 0);
  const canReview = user?.is_client && order.status === "completed" && !order.review;
  const hasReview = order.status === "completed" && order.review;

  return (
    <div className={pageCss}>
      <div className={containerCss}>

        {/* Back */}
        <button type="button" onClick={() => router.back()} className={backBtnCss}>
          <span className={startIconCss}><ChevronLeft size={20} /></span>
          Back to Orders
        </button>

        {/* Header */}
        <div className={headWrapCss}>
          <div className={titleRowCss}>
            <p className={pageTitleCss}>
              Order {order.reference ?? `#${order.id}`}
            </p>
            <StatusBadge status={order.status} />
          </div>
          <p className={placedCss}>Placed on {formatDate(order.created_at)}</p>
        </div>

        {actionError && (
          <div className={topAlertCss}>
            <span className={topAlertIconCss}><ErrorIcon size={22} /></span>
            <div className={topAlertMsgCss}>{actionError}</div>
            <div className={topAlertActionCss}>
              <button type="button" aria-label="Close" onClick={() => setActionError(null)} className={topAlertCloseCss}><CloseIcon size={20} /></button>
            </div>
          </div>
        )}

        <div className={colStackCss}>

          {/* ── Section 2: Info row ── */}
          <div className={infoGridCss}>
            {/* Service */}
            <div className={cardCss}>
              <p className={secLabelCss}>Service</p>
              <p className={cardTitleCss}>
                {service?.title ?? (isJobBased ? order.proposal?.job_post?.title : "Service")}
              </p>
              {service?.category && (
                <div className={catChipCss}>
                  {service.category.category_name}
                </div>
              )}
              {service?.description && (
                <div className={descClamp2Css}
                  dangerouslySetInnerHTML={{ __html: service.description }} />
              )}
            </div>

            {/* Freelancer */}
            <div className={cardCss}>
              <p className={secLabelCss}>Freelancer</p>
              <div className={partyRowCss}>
                <span className={partyAvatarCss}>
                  {freelancer?.user?.avatar_url
                    /* eslint-disable-next-line @next/next/no-img-element -- remote avatars from many hosts */
                    ? <img src={freelancer.user.avatar_url} alt={freelancer?.user?.name ?? ""} className={partyAvatarImgCss} />
                    : (freelancer?.user?.name?.slice(0, 2).toUpperCase() ?? "?")}
                </span>
                <div>
                  <p className={partyNameCss}>{freelancer?.user?.name ?? "Unknown"}</p>
                  {freelancer?.user?.email && <p className={partyMeta16Css}>{freelancer.user.email}</p>}
                  {freelancer?.user?.telephone && <p className={partyMetaCss}>{freelancer.user.telephone}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* ── Section 3: Package & Pricing ── */}
          <div className={cardCss}>
            <p className={secLabelCss}>Package</p>
            <p className={cardTitleCss}>
              {isCustom ? "Custom order" : isJobBased ? "Job Contract" : (pricingOption?.title ?? "Standard")}
            </p>
            {pricingOption?.description && (
              <p className={css({ fontSize: "13px", lineHeight: 1.5, color: "#64748B" })}>{pricingOption.description}</p>
            )}
            <div className={statGridCss}>
              {[
                { k: "Price", v: `$${pricingOption?.price ?? order.price ?? "0"}` },
                { k: "Delivery", v: !isNaN(deliveryDays as number) ? `${deliveryDays} day${deliveryDays !== 1 ? "s" : ""}` : "N/A" },
                { k: "Revisions", v: !isJobBased ? (revisions === -1 ? "Unlimited" : String(revisions)) : "N/A" },
              ].map(({ k, v }) => (
                <div key={k} className={tileCss}>
                  <p className={tileLabelCss}>{k}</p>
                  <p className={tileValCss}>{v}</p>
                </div>
              ))}
            </div>
            <div className={totalRowCss}>
              <p className={tileLabelCss}>Total</p>
              <p className={tileValCss}>${pricingOption?.price ?? order.price ?? "0"}</p>
            </div>
          </div>

          {/* ── Section 4: Order record — events, deliveries & revisions in one timeline ── */}
          <OrderRecord
            orderId={orderId}
            createdAt={order.created_at}
            deliveryHistory={order.delivery_history}
            revisionHistory={order.revision_history}
            preEvents={isCustom && order.custom_order ? [
              ...(order.custom_order.requested_at ? [{ id: -101, event_type: "request_sent", description: "You sent a custom request to the freelancer.", actor_role: "client" as const, created_at: order.custom_order.requested_at }] : []),
              ...(order.custom_order.offered_at ? [{ id: -102, event_type: "offer_sent", description: "The freelancer sent you a custom offer.", actor_role: "freelancer" as const, created_at: order.custom_order.offered_at }] : []),
            ] : undefined}
          />

          {/* ── Section 5: Status card ── */}

          {/* Revision requested */}
          {order.status === "revision_requested" && (
            <div className={cardCss}>
              <div className={`${bannerCss({ tone: "warning" })} ${mb225}`}>
                <span className={bannerGlyphCss}>↺</span>
                You requested a revision.
              </div>
              {order.revision_note && (
                <>
                  <p className={fieldLabelCss}>Feedback</p>
                  <p className={bodyTextCss}>{order.revision_note}</p>
                </>
              )}
            </div>
          )}

          {/* Dispute (open or resolved) */}
          {/* Open dispute, or the one that ended the order. A "continue" resolution
              lives on in the order record instead, so the card doesn't linger. */}
          {order.dispute && (order.dispute.status === "open" || order.dispute.outcome !== "continue") && (
            <DisputeBlock dispute={order.dispute} orderId={order.id} />
          )}

          {/* Completed */}
          {order.status === "completed" && (
            <div className={cardCss}>
              <div className={`${bannerCss({ tone: "success" })} ${mb225}`}>
                <span className={bannerGlyphCss}><CheckIcon size={16} /></span>
                Order completed.
              </div>

              {hasReview && order.review && (
                <>
                  <p className={fieldLabelCss}>Your review</p>
                  <div className={reviewBoxCss}>
                    <div className={reviewHeadCss}>
                      <ReadonlyStars rating={order.review.rating} />
                      <p className={reviewerCss}>
                        {user?.name ?? "You"}
                      </p>
                    </div>
                    {order.review.comment && (
                      <p className={bodyTextCss}>{order.review.comment}</p>
                    )}
                  </div>
                </>
              )}

              {canReview && (
                <>
                  <p className={fieldLabelCss}>Leave a review</p>
                  <div className={css({ display: "flex", flexDirection: "column", "& > :not(style) ~ :not(style)": { marginTop: "12px" } })}>
                    <InteractiveStars value={rating} onChange={setRating} />
                    <PageTextArea minRows={2} placeholder="Share your experience (optional)" value={comment} onChange={setComment} />
                    {submitReviewError && <div className={dlgInlineAlertCss}><span className={topAlertIconCss}><ErrorIcon size={22} /></span><div className={topAlertMsgCss}>{submitReviewError}</div></div>}
                    <div className={css({ display: "flex", justifyContent: "flex-end" })}>
                      <button type="button" disabled={submitting || rating === 0} onClick={handleSubmitReview} className={pageBtn({ look: "primary" })}>
                        {submitting ? <Spinner size={16} /> : "Submit review"}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── Section 6: Actions ── */}
          <div className={cardCss}>
            {/* delivered */}
            {order.status === "delivered" && (
              <div className={css({ display: "flex", justifyContent: "flex-end", flexWrap: "wrap", "& > :not(style) ~ :not(style)": { marginLeft: "10px" } })}>
                <button type="button" onClick={() => setDisputeOpen(true)} className={pageBtn({ look: "danger" })}>Open Dispute</button>
                <button type="button" onClick={() => setRevisionOpen(true)} className={pageBtn({ look: "outline" })}>Request Revision</button>
                <button type="button" disabled={submitting} onClick={handleApprove} className={pageBtn({ look: "primary" })}>
                  <span className={startIconCss}>{submitting ? <Spinner size={14} /> : <CheckIcon size={20} />}</span>
                  Approve &amp; Release Payment
                </button>
              </div>
            )}

            {/* active */}
            {order.status === "active" && (
              <div className={css({ display: "flex", justifyContent: "flex-end" })}>
                <button type="button" onClick={() => setDisputeOpen(true)} className={pageBtn({ look: "danger" })}>Open Dispute</button>
              </div>
            )}

            {/* disputed — submit evidence */}
            {order.status === "disputed" && order.dispute?.status === "open" && !order.dispute.client_evidence?.length && !order.dispute.client_statement && (
              <div className={css({ display: "flex", justifyContent: "flex-end" })}>
                <button type="button" onClick={() => setEvidenceOpen(true)} className={pageBtn({ look: "outline" })}>Submit Evidence</button>
              </div>
            )}

            {/* completed */}
            {order.status === "completed" && (
              <div className={css({ display: "flex", justifyContent: "flex-end", alignItems: "center", "& > :not(style) ~ :not(style)": { marginLeft: "8px" } })}>
                <CheckIcon size={15} style={{ color: "#94A3B8", flexShrink: 0 }} />
                <p className={css({ fontSize: "13px", fontWeight: 600, lineHeight: 1.5, color: "#94A3B8" })}>Order Completed</p>
              </div>
            )}

            {/* cancelled */}
            {order.status === "cancelled" && (
              <div className={css({ display: "flex", justifyContent: "flex-end", alignItems: "center", "& > :not(style) ~ :not(style)": { marginLeft: "8px" } })}>
                <p className={css({ fontSize: "13px", fontWeight: 600, lineHeight: 1.5, color: "#94A3B8" })}>Order Cancelled</p>
              </div>
            )}

            {/* pending — client may cancel freely until the freelancer accepts */}
            {order.status === "pending" && (
              <div className={css({ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", "& > :not(style) ~ :not(style)": { marginLeft: "10px" } })}>
                <p className={css({ fontSize: "13px", lineHeight: 1.5, color: "#94A3B8" })}>Awaiting freelancer acceptance</p>
                <button type="button" onClick={() => setCancelOpen(true)} className={pageBtn({ look: "danger" })}>Cancel Order</button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ── Dialogs ── */}

      {/* Cancel pending order */}
      <BareModal open={cancelOpen} onOpenChange={(o) => { if (!o) setCancelOpen(false); }} maxW="444px">
        <div className={dlgHeadCss}>
          <p className={dlgTitleCss}>Cancel this order?</p>
          <p className={dlgSubCss}>
            The freelancer hasn&apos;t accepted yet, so you can cancel freely. Your ${Number(order.price ?? pricingOption?.price ?? 0).toFixed(2)} will be returned to your wallet immediately.
          </p>
        </div>
        <div className={dlgFootTightCss}>
          <button type="button" onClick={() => setCancelOpen(false)} className={pageBtn({ look: "outline" })}>Keep Order</button>
          <button type="button" disabled={submitting} onClick={handleCancelOrder} className={pageBtn({ look: "danger2" })}>
            {submitting ? <Spinner size={14} /> : "Cancel & Refund"}
          </button>
        </div>
      </BareModal>

      {/* Request Revision */}
      <BareModal open={revisionOpen} onOpenChange={(o) => { if (!o) setRevisionOpen(false); }} maxW="444px">
        <div className={dlgHeadCss}>
          <p className={dlgTitleCss}>Request a revision</p>
          <p className={dlgSubCss}>
            Tell the freelancer what needs to change.{pricingOption?.revisions && Number(pricingOption.revisions) !== -1 ? ` You have ${pricingOption.revisions} revision${Number(pricingOption.revisions) !== 1 ? "s" : ""} included.` : ""}
          </p>
        </div>
        <div className={dlgBodyCss}>
          <p className={fieldLabelCss}>Feedback</p>
          <PageTextArea minRows={3} placeholder="Describe the changes you'd like…" value={revisionNote} onChange={setRevisionNote} />
        </div>
        <div className={dlgFootCss}>
          <button type="button" onClick={() => { setRevisionOpen(false); setRevisionNote(""); }} className={pageBtn({ look: "outline" })}>Cancel</button>
          <button type="button" disabled={submitting || !revisionNote.trim()} onClick={handleRequestRevision} className={pageBtn({ look: "primary" })}>
            {submitting ? <Spinner size={14} /> : "Send request"}
          </button>
        </div>
      </BareModal>

      {/* Open Dispute */}
      <BareModal open={disputeOpen} onOpenChange={(o) => { if (!o) setDisputeOpen(false); }} maxW="444px">
        <div className={dlgHeadCss}>
          <p className={dlgTitleCss}>Open a dispute</p>
          <p className={dlgSubCss}>Our team will review the order. Please describe the issue clearly.</p>
        </div>
        <div className={dlgBodyCss}>
          <p className={fieldLabelCss}>Dispute reason</p>
          <PageTextArea minRows={3} placeholder="Explain what went wrong…" value={disputeReason} onChange={setDisputeReason} />
          <DialogDropzone onFiles={(fl) => handleFileUpload(fl, setDisputeFiles, disputeFiles)} files={disputeFiles} onRemove={(i) => setDisputeFiles((p) => p.filter((_, j) => j !== i))} uploading={uploading} />
        </div>
        <div className={dlgFootCss}>
          <button type="button" onClick={() => { setDisputeOpen(false); setDisputeReason(""); setDisputeFiles([]); }} className={pageBtn({ look: "outline" })}>Cancel</button>
          <button type="button" disabled={submitting || !disputeReason.trim()} onClick={handleOpenDispute} className={pageBtn({ look: "danger" })}>
            {submitting ? <Spinner size={14} style={{ color: "#DC2626" }} /> : "Open dispute"}
          </button>
        </div>
      </BareModal>

      {/* Submit Evidence */}
      <BareModal open={evidenceOpen} onOpenChange={(o) => { if (!o) setEvidenceOpen(false); }} maxW="444px">
        <div className={dlgHeadCss}>
          <p className={dlgTitleCss}>Submit evidence</p>
          <p className={dlgSubCss}>Add files and context to support your side of the dispute.</p>
        </div>
        <div className={dlgBodyCss}>
          <p className={fieldLabelCss}>Your statement</p>
          <PageTextArea minRows={3} placeholder="Explain your side of the dispute…" value={evidenceStatement} onChange={setEvidenceStatement} />
          <p className={`${fieldLabelCss} ${css({ mt: "16px" })}`}>Supporting files (optional)</p>
          <DialogDropzone onFiles={(fl) => handleFileUpload(fl, setEvidenceFiles, evidenceFiles)} files={evidenceFiles} onRemove={(i) => setEvidenceFiles((p) => p.filter((_, j) => j !== i))} uploading={uploading} />
        </div>
        <div className={dlgFootCss}>
          <button type="button" onClick={() => { setEvidenceOpen(false); setEvidenceFiles([]); setEvidenceStatement(""); }} className={pageBtn({ look: "outline" })}>Cancel</button>
          <button type="button" disabled={submitting || (!evidenceFiles.length && !evidenceStatement.trim())} onClick={handleSubmitEvidence} className={pageBtn({ look: "primary" })}>
            {submitting ? <Spinner size={14} /> : "Submit evidence"}
          </button>
        </div>
      </BareModal>

    </div>
  );
}
