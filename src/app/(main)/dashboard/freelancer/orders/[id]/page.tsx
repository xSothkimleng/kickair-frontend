"use client";

import { useState, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/queryKeys";
import { useParams, useRouter } from "next/navigation";
import { css } from "styled-system/css";
import {
  ChevronLeft,
  FileText as FileIcon,
  Image as ImageIcon,
  Paperclip as AttachFileIcon,
  Download as DownloadIcon,
  CheckCircle2 as CheckIcon,
  Upload as UploadIcon,
  Star,
  AlertCircle as ErrorIcon,
  X as CloseIcon,
} from "lucide-react";
import { Spinner } from "@/components/ds";
import { BareModal } from "@/components/ds/BareModal";
import {
  PageTextArea, backBtnCss, bannerCss, bannerGlyphCss, bodyMutedCss, bodyTextCss, cardCss,
  cardTitleCss, catChipCss, centerPageCss, centerPageColCss, colStackCss, containerCss,
  descClamp2Css, dlgBodyCss, dlgFootCss, dlgHeadCss, dlgSubCss, dlgTitleCss, dropIconCss,
  dropItemCss, dropItemNameCss, dropListCss, dropRemoveCss, dropTextCss, dropWrapCss,
  dropZoneCss, evidencePartyCss, evidenceRowCss, fieldLabelCss, fileDownloadCss, fileNameCss,
  fileNameWrapCss, fileRowCss, fileTileCss, headWrapCss, infoGridCss, mb225, mutedSmallCss,
  notFoundTextCss, outcomeBoxCss, pageBtn, pageCss, pageTitleCss, partyAvatarCss,
  partyAvatarImgCss, partyMeta16Css, partyMetaCss, partyNameCss, partyRowCss, placedCss,
  reviewBoxCss, reviewHeadCss, reviewerCss, secLabelCss, stack1Css, starRowCss, startIconCss,
  statGridCss, statusBadgeCss, statusDotCss, tileCss, tileLabelCss,
  tileValCss, titleRowCss, topAlertActionCss,
  topAlertCloseCss, topAlertCss, topAlertIconCss, topAlertMsgCss, totalRowCss,
} from "@/components/dashboard/orderPageKit";
import { api } from "@/lib/api";
import { downloadOrderAttachment } from "@/lib/downloadFile";
import { useCommissionRate } from "@/hooks/useCommissionRate";
import { Order, OrderStatus, Dispute, EvidenceFile } from "@/types/order";
import OrderRecord from "@/components/dashboard/OrderRecord";

// ─── Design tokens (same as client page) ─────────────────────────────────────
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

export default function FreelancerOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = Number(params.id);
  const commissionRate = useCommissionRate();

  const [actionError, setActionError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Dialog open states
  const [deliveryOpen, setDeliveryOpen] = useState(false);
  const [resubmitOpen, setResubmitOpen] = useState(false);
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [evidenceOpen, setEvidenceOpen] = useState(false);

  // Form values
  const [deliveryNote, setDeliveryNote] = useState("");
  const [resubmitNote, setResubmitNote] = useState("");
  const [disputeReason, setDisputeReason] = useState("");

  // File upload
  const [deliveryFiles, setDeliveryFiles] = useState<UploadedFile[]>([]);
  const [resubmitFiles, setResubmitFiles] = useState<UploadedFile[]>([]);
  const [disputeFiles, setDisputeFiles] = useState<UploadedFile[]>([]);
  const [evidenceFiles, setEvidenceFiles] = useState<UploadedFile[]>([]);
  const [evidenceStatement, setEvidenceStatement] = useState("");
  const [uploadToken, setUploadToken] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const queryClient = useQueryClient();
  const { data: order = null, isLoading: loading, error: queryError } = useQuery({
    queryKey: qk.orders.detail(orderId, "freelancer"),
    queryFn: async () => {
      const response = await api.get("/api/freelancer-orders");
      const found = response.data.find((o: Order) => o.id === orderId);
      if (!found) throw new Error("Order not found.");
      return found as Order;
    },
    enabled: Number.isFinite(orderId),
  });
  const error = queryError ? (queryError instanceof Error ? queryError.message : "Failed to load order.") : null;

  // After an action, refresh this order + the lists, wallet, and dashboard that also reflect it.
  const fetchOrder = async () => {
    await queryClient.invalidateQueries({ queryKey: qk.orders.all() });
    queryClient.invalidateQueries({ queryKey: qk.wallet() });
    queryClient.invalidateQueries({ queryKey: qk.dashboard.freelancer() });
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

  const handleAccept = async () => {
    setSubmitting(true); setActionError(null);
    try { await api.post(`/api/orders/${orderId}/accept`, {}); await fetchOrder(); }
    catch { setActionError("Failed to accept order."); }
    finally { setSubmitting(false); }
  };

  const handleDecline = async () => {
    setSubmitting(true); setActionError(null);
    try { await api.post(`/api/orders/${orderId}/cancel`, {}); await fetchOrder(); }
    catch { setActionError("Failed to decline order."); }
    finally { setSubmitting(false); }
  };

  const handleDeliver = async () => {
    setSubmitting(true); setActionError(null);
    try {
      await api.deliverOrder(orderId, deliveryNote || undefined, deliveryFiles.length ? deliveryFiles : undefined);
      setDeliveryNote(""); setDeliveryFiles([]); setDeliveryOpen(false);
      await fetchOrder();
    } catch { setActionError("Failed to submit delivery."); }
    finally { setSubmitting(false); }
  };

  const handleResubmit = async () => {
    setSubmitting(true); setActionError(null);
    try {
      await api.resubmitOrder(orderId, resubmitNote || undefined, resubmitFiles.length ? resubmitFiles : undefined);
      setResubmitNote(""); setResubmitFiles([]); setResubmitOpen(false);
      await fetchOrder();
    } catch { setActionError("Failed to resubmit work."); }
    finally { setSubmitting(false); }
  };

  const handleOpenDispute = async () => {
    if (!disputeReason.trim()) return;
    setSubmitting(true); setActionError(null);
    try {
      await api.openDispute(orderId, disputeReason, disputeFiles.length ? disputeFiles : undefined);
      setDisputeReason(""); setDisputeFiles([]); setDisputeOpen(false);
      await fetchOrder();
    } catch { setActionError("Failed to open dispute."); }
    finally { setSubmitting(false); }
  };

  const handleSubmitEvidence = async () => {
    if (!evidenceFiles.length && !evidenceStatement.trim()) return;
    setSubmitting(true); setActionError(null);
    try {
      await api.submitDisputeEvidence(orderId, evidenceFiles, evidenceStatement.trim() || undefined);
      setEvidenceFiles([]); setEvidenceStatement(""); setEvidenceOpen(false);
      await fetchOrder();
    } catch { setActionError("Failed to submit evidence."); }
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
  const service = order.service || order.pricing_option?.service;
  const client = order.client_profile;
  const pricingOption = order.pricing_option;
  const deliveryDays = isCustom
    ? order.custom_order?.delivery_days ?? undefined
    : isJobBased
      ? order.proposal?.timeline_days
      : parseInt(String(pricingOption?.delivery_time ?? ""));
  const revisions = Number((isCustom ? order.custom_order?.revisions : pricingOption?.revisions) ?? 0);

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
          <p className={placedCss}>Received on {formatDate(order.created_at)}</p>
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

            {/* Client */}
            <div className={cardCss}>
              <p className={secLabelCss}>Client</p>
              <div className={partyRowCss}>
                <span className={partyAvatarCss}>
                  {client?.user?.avatar_url
                    /* eslint-disable-next-line @next/next/no-img-element -- remote avatars from many hosts */
                    ? <img src={client.user.avatar_url} alt={client?.user?.name ?? ""} className={partyAvatarImgCss} />
                    : (client?.user?.name?.slice(0, 2).toUpperCase() ?? "?")}
                </span>
                <div>
                  <p className={partyNameCss}>{client?.user?.name ?? "Unknown"}</p>
                  {client?.user?.email && <p className={partyMeta16Css}>{client.user.email}</p>}
                  {client?.user?.telephone && <p className={partyMetaCss}>{client.user.telephone}</p>}
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
              <p className={css({ textStyle: "ui", color: "#64748B" })}>{pricingOption.description}</p>
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
              <div>
                <p className={tileLabelCss}>Your earnings</p>
                {commissionRate != null && (
                  <p className={css({ textStyle: "micro", color: "#94A3B8" })}>after the {Math.round(commissionRate * 100)}% platform fee</p>
                )}
              </div>
              <p className={css({ textStyle: "title", fontWeight: 700, color: "#10B981" })}>
                ${(parseFloat(String(pricingOption?.price ?? order.price ?? "0")) * (1 - (commissionRate ?? 0))).toFixed(2)}
              </p>
            </div>
          </div>

          {/* ── Section 4: Order record — events, deliveries & revisions in one timeline ── */}
          <OrderRecord
            orderId={orderId}
            createdAt={order.created_at}
            deliveryHistory={order.delivery_history}
            revisionHistory={order.revision_history}
            preEvents={isCustom && order.custom_order ? [
              ...(order.custom_order.requested_at ? [{ id: -101, event_type: "request_sent", description: "The custom request was opened.", actor_role: "client" as const, created_at: order.custom_order.requested_at }] : []),
              ...(order.custom_order.offered_at ? [{ id: -102, event_type: "offer_sent", description: "You sent a custom offer to the client.", actor_role: "freelancer" as const, created_at: order.custom_order.offered_at }] : []),
            ] : undefined}
          />

          {/* ── Section 5: Status card ── */}

          {/* Revision requested */}
          {order.status === "revision_requested" && (
            <div className={cardCss}>
              <div className={`${bannerCss({ tone: "warning" })} ${mb225}`}>
                <span className={bannerGlyphCss}>↺</span>
                Revision requested by client.
              </div>
              {order.revision_note && (
                <>
                  <p className={fieldLabelCss}>Client feedback</p>
                  <p className={bodyTextCss}>{order.revision_note}</p>
                </>
              )}
            </div>
          )}

          {/* Disputed */}
          {/* Open dispute, or the one that ended the order. A "continue" resolution
              lives on in the order record instead, so the card doesn't linger. */}
          {order.dispute && (order.dispute.status === "open" || order.dispute.outcome !== "continue") && (
            <DisputeBlock dispute={order.dispute} orderId={order.id} />
          )}

          {/* Completed */}
          {order.status === "completed" && (
            <div className={cardCss}>
              <div className={bannerCss({ tone: "success" })}>
                <span className={bannerGlyphCss}><CheckIcon size={16} /></span>
                Order completed.
              </div>

              {order.review && (
                <>
                  <p className={fieldLabelCss}>Client&apos;s review</p>
                  <div className={reviewBoxCss}>
                    <div className={reviewHeadCss}>
                      <div className={starRowCss}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} size={16} fill="currentColor" style={{ color: s <= order.review!.rating ? "#F59E0B" : "#E2E8F0" }} />
                        ))}
                      </div>
                      <p className={reviewerCss}>{order.review.rating.toFixed(1)}</p>
                    </div>
                    {order.review.comment && (
                      <p className={bodyTextCss}>{order.review.comment}</p>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── Section 6: Actions ── */}
          <div className={cardCss}>
            {/* pending */}
            {order.status === "pending" && (
              <div className={css({ display: "flex", justifyContent: "flex-end", "& > :not(style) ~ :not(style)": { marginLeft: "10px" } })}>
                <button type="button" disabled={submitting} onClick={handleDecline} className={pageBtn({ look: "danger" })}>Decline</button>
                <button type="button" disabled={submitting} onClick={handleAccept} className={pageBtn({ look: "primary" })}>
                  <span className={startIconCss}>{submitting ? <Spinner size={14} /> : <CheckIcon size={20} />}</span>
                  Accept Order
                </button>
              </div>
            )}

            {/* active */}
            {order.status === "active" && (
              <div className={css({ display: "flex", justifyContent: "flex-end", "& > :not(style) ~ :not(style)": { marginLeft: "10px" } })}>
                <button type="button" onClick={() => setDisputeOpen(true)} className={pageBtn({ look: "danger" })}>Open Dispute</button>
                <button type="button" onClick={() => setDeliveryOpen(true)} className={pageBtn({ look: "primary" })}>
                  <span className={startIconCss}><UploadIcon size={20} /></span>
                  Submit Delivery
                </button>
              </div>
            )}

            {/* revision_requested */}
            {order.status === "revision_requested" && (
              <div className={css({ display: "flex", justifyContent: "flex-end" })}>
                <button type="button" onClick={() => setResubmitOpen(true)} className={pageBtn({ look: "primary" })}>
                  Resubmit Work
                </button>
              </div>
            )}

            {/* disputed — submit evidence */}
            {order.status === "disputed" && order.dispute?.status === "open" && !order.dispute.freelancer_evidence?.length && !order.dispute.freelancer_statement && (
              <div className={css({ display: "flex", justifyContent: "flex-end" })}>
                <button type="button" onClick={() => setEvidenceOpen(true)} className={pageBtn({ look: "outline" })}>Submit Evidence</button>
              </div>
            )}

            {/* completed */}
            {order.status === "completed" && (
              <div className={css({ display: "flex", justifyContent: "flex-end", alignItems: "center", "& > :not(style) ~ :not(style)": { marginLeft: "8px" } })}>
                <CheckIcon size={15} style={{ color: "#94A3B8", flexShrink: 0 }} />
                <p className={css({ textStyle: "ui", fontWeight: 600, color: "#94A3B8" })}>Order Completed</p>
              </div>
            )}

            {/* cancelled / delivered (no further action) */}
            {(order.status === "cancelled" || order.status === "delivered") && (
              <p className={css({ textStyle: "ui", color: "#94A3B8", textAlign: "right" })}>
                {order.status === "cancelled" ? "Order Cancelled" : "Awaiting client review"}
              </p>
            )}
          </div>

        </div>
      </div>

      {/* ── Dialogs ── */}

      {/* Submit Delivery */}
      <BareModal open={deliveryOpen} onOpenChange={(o) => { if (!o) setDeliveryOpen(false); }} maxW="444px">
        <div className={dlgHeadCss}>
          <p className={dlgTitleCss}>Submit delivery</p>
          <p className={dlgSubCss}>Add a note for the client and attach your final files.</p>
        </div>
        <div className={dlgBodyCss}>
          <p className={fieldLabelCss}>Delivery note</p>
          <PageTextArea minRows={3} placeholder="Let the client know what you've delivered…" value={deliveryNote} onChange={setDeliveryNote} />
          <DialogDropzone onFiles={(fl) => handleFileUpload(fl, setDeliveryFiles, deliveryFiles)} files={deliveryFiles} onRemove={(i) => setDeliveryFiles((p) => p.filter((_, j) => j !== i))} uploading={uploading} />
        </div>
        <div className={dlgFootCss}>
          <button type="button" onClick={() => { setDeliveryOpen(false); setDeliveryNote(""); setDeliveryFiles([]); }} className={pageBtn({ look: "outline" })}>Cancel</button>
          <button type="button" disabled={submitting || uploading} onClick={handleDeliver} className={pageBtn({ look: "primary" })}>
            {submitting ? <Spinner size={14} /> : "Submit delivery"}
          </button>
        </div>
      </BareModal>

      {/* Resubmit Work */}
      <BareModal open={resubmitOpen} onOpenChange={(o) => { if (!o) setResubmitOpen(false); }} maxW="444px">
        <div className={dlgHeadCss}>
          <p className={dlgTitleCss}>Resubmit work</p>
          <p className={dlgSubCss}>Describe what you changed and attach updated files.</p>
        </div>
        <div className={dlgBodyCss}>
          <p className={fieldLabelCss}>What changed</p>
          <PageTextArea minRows={3} placeholder="Describe the changes made based on feedback…" value={resubmitNote} onChange={setResubmitNote} />
          <DialogDropzone onFiles={(fl) => handleFileUpload(fl, setResubmitFiles, resubmitFiles)} files={resubmitFiles} onRemove={(i) => setResubmitFiles((p) => p.filter((_, j) => j !== i))} uploading={uploading} />
        </div>
        <div className={dlgFootCss}>
          <button type="button" onClick={() => { setResubmitOpen(false); setResubmitNote(""); setResubmitFiles([]); }} className={pageBtn({ look: "outline" })}>Cancel</button>
          <button type="button" disabled={submitting || uploading} onClick={handleResubmit} className={pageBtn({ look: "primary" })}>
            {submitting ? <Spinner size={14} /> : "Resubmit work"}
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
          <button type="button" disabled={submitting || uploading || !disputeReason.trim()} onClick={handleOpenDispute} className={pageBtn({ look: "danger" })}>
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
          <button type="button" disabled={submitting || uploading || (!evidenceFiles.length && !evidenceStatement.trim())} onClick={handleSubmitEvidence} className={pageBtn({ look: "primary" })}>
            {submitting ? <Spinner size={14} /> : "Submit evidence"}
          </button>
        </div>
      </BareModal>

    </div>
  );
}
