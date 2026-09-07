"use client";

import { useState } from "react";
import Link from "next/link";
import { css, cx } from "styled-system/css";
import { CheckCircle2, ExternalLink, ShieldCheck } from "lucide-react";
import { api } from "@/lib/api";
import type { AdminKycSubmission } from "@/types/user";
import { useAdminAction, useAdminStats, useKycQueue } from "./queries";
import { useToast } from "./toast";
import { Avatar, Btn, Drawer, EmptyState, ErrorState, Field, Loading, Pager, Panel, Pill, Segmented, Textarea, divider, kvList, page, PageHeader, row, stack, table, text } from "./ui";
import { ago, dateTime, errorMessage, waiting } from "./format";
import { docTypeLabel } from "./labels";

type Filter = "pending" | "approved" | "rejected";

const docTile = css({
  display: "block", position: "relative", aspectRatio: "1.6", borderRadius: "12px", overflow: "hidden", bg: "var(--td-hover)", borderWidth: "1px", borderStyle: "solid", borderColor: "var(--td-line)",
  "& img": { w: "100%", h: "100%", objectFit: "cover", display: "block" },
  "& span": { position: "absolute", left: "10px", bottom: "10px", px: "8px", h: "22px", display: "inline-flex", alignItems: "center", gap: "5px", borderRadius: "999px", bg: "rgba(21,23,28,0.72)", color: "#fff", fontSize: "11.5px", fontWeight: 600, backdropFilter: "blur(4px)" },
  _hover: { borderColor: "var(--td-line-2)" },
});

/** The document images on file for a submission, in review order. */
export function kycDocuments(k: Pick<AdminKycSubmission, "document_type" | "id_document_url" | "id_document_back_url" | "selfie_url">) {
  const docs: { label: string; url: string }[] = [];
  if (k.id_document_url) docs.push({ label: k.document_type === "passport" ? "Passport" : "ID · front", url: k.id_document_url });
  if (k.id_document_back_url) docs.push({ label: "ID · back", url: k.id_document_back_url });
  if (k.selfie_url) docs.push({ label: "Live selfie", url: k.selfie_url });
  return docs;
}

export function DocumentGrid({ docs }: { docs: { label: string; url: string }[] }) {
  if (docs.length === 0) return <p className={text({ size: "sm", tone: 3 })}>No documents on file.</p>;
  return (
    <div className={css({ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" })}>
      {docs.map((d) => (
        <a key={d.url} href={d.url} target="_blank" rel="noreferrer" className={docTile} title="Open full size">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={d.url} alt={d.label} />
          <span>{d.label} <ExternalLink size={11} /></span>
        </a>
      ))}
    </div>
  );
}

export default function VerificationsPage() {
  const toast = useToast();
  const [filter, setFilter] = useState<Filter>("pending");
  const [pageNo, setPageNo] = useState(1);
  const [openId, setOpenId] = useState<number | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");

  const stats = useAdminStats();
  const queue = useKycQueue(filter, pageNo);
  const approve = useAdminAction((id: number) => api.approveKyc(id));
  const reject = useAdminAction(({ id, note }: { id: number; note: string }) => api.rejectKyc(id, note));

  const list = queue.data?.data ?? [];
  // Oldest first for the review queue; newest first for history.
  const rows = [...list].sort((a, b) => (filter === "pending" ? +new Date(a.submitted_at) - +new Date(b.submitted_at) : +new Date(b.reviewed_at ?? b.submitted_at) - +new Date(a.reviewed_at ?? a.submitted_at)));
  const current = list.find((k) => k.id === openId);
  const pendingCount = stats.data?.kyc.pending_count;

  const changeFilter = (f: Filter) => { setFilter(f); setPageNo(1); };
  const close = () => { setOpenId(null); setRejecting(false); setReason(""); };
  const doApprove = async () => {
    if (!current) return;
    try { await approve.mutateAsync(current.id); toast(`${current.user.name} is now verified.`); close(); }
    catch (err) { toast(errorMessage(err), "error"); }
  };
  const doReject = async () => {
    if (!current) return;
    try { await reject.mutateAsync({ id: current.id, note: reason.trim() }); toast(`Verification for ${current.user.name} rejected.`); close(); }
    catch (err) { toast(errorMessage(err), "error"); }
  };
  const busy = approve.isPending || reject.isPending;

  return (
    <div className={page}>
      <PageHeader title="Verifications" description="Identity documents submitted by users. Approving marks the account as verified across the marketplace." />
      <div className={cx(row({ between: true }), css({ mb: "14px" }))}>
        <Segmented value={filter} onChange={changeFilter} items={[{ value: "pending", label: "To review", count: pendingCount }, { value: "approved", label: "Approved" }, { value: "rejected", label: "Rejected" }]} />
        {filter === "pending" && rows.length ? <span className={text({ size: "sm", tone: 3 })}>Oldest first</span> : null}
      </div>

      <Panel>
        {queue.isLoading ? <Loading /> : queue.isError ? <ErrorState onRetry={() => queue.refetch()} /> : rows.length === 0 ? (
          <EmptyState icon={<ShieldCheck size={20} />} title={filter === "pending" ? "Nothing to review" : `No ${filter} verifications`} body={filter === "pending" ? "New submissions show up here the moment someone uploads a document." : undefined} />
        ) : (
          <table className={table}>
            <thead>
              <tr>
                <th>Person</th><th>Document</th><th>{filter === "pending" ? "Waiting" : "Reviewed"}</th>{filter !== "pending" ? <th>Outcome</th> : null}<th />
              </tr>
            </thead>
            <tbody>
              {rows.map((k) => (
                <tr key={k.id} data-clickable onClick={() => setOpenId(k.id)}>
                  <td>
                    <div className={row({ gap: 3 })}>
                      <Avatar name={k.user.name ?? "?"} size="sm" seed={k.user.id} src={k.user.avatar_url} />
                      <div>
                        <p className={text({ weight: 600 })}>{k.user.name}</p>
                        <p className={text({ size: "sm", tone: 3 })}>{k.user.email ?? k.user.telephone ?? ""}</p>
                      </div>
                    </div>
                  </td>
                  <td><p>{docTypeLabel[k.document_type ?? ""] ?? "Document"}</p><p className={text({ size: "sm", tone: 3 })}>{kycDocuments(k).length} files</p></td>
                  <td>
                    {filter === "pending" ? <><p className={text({ weight: 500 })}>{waiting(k.submitted_at)}</p><p className={text({ size: "sm", tone: 3 })}>{dateTime(k.submitted_at)}</p></> : <p className={text({ tone: 2 })}>{k.reviewed_at ? ago(k.reviewed_at) : "—"}</p>}
                  </td>
                  {filter !== "pending" ? <td><Pill tone={k.status === "approved" ? "green" : "red"}>{k.status === "approved" ? "Approved" : "Rejected"}</Pill></td> : null}
                  <td className="actions"><Btn size="sm" onClick={(e) => { e.stopPropagation(); setOpenId(k.id); }}>{filter === "pending" ? "Review" : "View"}</Btn></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <Pager meta={queue.data?.meta} onPage={setPageNo} noun="submissions" />
      </Panel>

      <Drawer
        open={!!current}
        onClose={close}
        title={current?.user.name ?? ""}
        subtitle={current ? <>{docTypeLabel[current.document_type ?? ""] ?? "Document"} · submitted {ago(current.submitted_at)}</> : null}
        footer={current?.status === "pending" ? (
          rejecting ? (
            <>
              <Btn variant="ghost" onClick={() => { setRejecting(false); setReason(""); }} disabled={busy}>Back</Btn>
              <Btn variant="danger" disabled={!reason.trim() || busy} onClick={doReject}>{reject.isPending ? "Rejecting…" : "Reject verification"}</Btn>
            </>
          ) : (
            <>
              <Btn variant="dangerSoft" onClick={() => setRejecting(true)} disabled={busy}>Reject…</Btn>
              <Btn variant="success" onClick={doApprove} disabled={busy}><CheckCircle2 size={15} /> {approve.isPending ? "Approving…" : "Approve"}</Btn>
            </>
          )
        ) : current ? <Btn onClick={close}>Close</Btn> : null}
      >
        {current ? <ReviewBody k={current} rejecting={rejecting} reason={reason} setReason={setReason} /> : null}
      </Drawer>
    </div>
  );
}

function ReviewBody({ k, rejecting, reason, setReason }: { k: AdminKycSubmission; rejecting: boolean; reason: string; setReason: (v: string) => void }) {
  return (
    <div className={stack({ gap: 4 })}>
      {k.status !== "pending" ? (
        <div className={row({ gap: 2 })}>
          <Pill tone={k.status === "approved" ? "green" : "red"}>{k.status === "approved" ? "Approved" : "Rejected"}</Pill>
          <span className={text({ size: "sm", tone: 3 })}>{k.reviewed_at ? dateTime(k.reviewed_at) : ""}</span>
        </div>
      ) : null}
      {k.admin_note ? <div className={cx(text({ size: "sm" }), css({ p: "12px", bg: "var(--td-red-soft)", color: "var(--td-red)", borderRadius: "10px" }))}>{k.admin_note}</div> : null}

      <DocumentGrid docs={kycDocuments(k)} />
      <p className={text({ size: "xs", tone: 3 })}>Click a document to open it full size. Check that the photo is sharp, the document is valid, and the selfie matches it.</p>

      <dl className={kvList}>
        <dt>Document</dt><dd>{docTypeLabel[k.document_type ?? ""] ?? "Document"}</dd>
        <dt>Submitted</dt><dd>{dateTime(k.submitted_at)}</dd>
        {k.reviewed_at ? <><dt>Reviewed</dt><dd>{dateTime(k.reviewed_at)}</dd></> : null}
        <dt>Account name</dt><dd>{k.user.name}</dd>
        <dt>Email</dt><dd>{k.user.email ?? "—"}</dd>
        <dt>Phone</dt><dd>{k.user.telephone ?? "—"}</dd>
        <dt>Roles</dt><dd>{[k.user.is_freelancer ? "Freelancer" : null, k.user.is_client ? "Client" : null].filter(Boolean).join(", ") || "—"}</dd>
        <dt>Account</dt><dd><Link href={`/admin/people/${k.user.id}`} className={text({ tone: "accent", weight: 500 })}>Open profile</Link></dd>
      </dl>

      {rejecting ? (
        <>
          <hr className={divider} />
          <Field label="Why is this being rejected?" hint="They see this message and can submit again.">
            <Textarea autoFocus value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. The photo is blurred, please upload a sharper scan of the front side." />
          </Field>
        </>
      ) : null}
    </div>
  );
}
