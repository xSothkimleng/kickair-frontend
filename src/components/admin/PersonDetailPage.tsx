"use client";

import { useState } from "react";
import Link from "next/link";
import { css, cx } from "styled-system/css";
import { ArrowLeft, Ban, Check, ExternalLink, Mail, MapPin, PauseCircle, PlayCircle, Star } from "lucide-react";
import { api } from "@/lib/api";
import RichTextDisplay from "@/components/ui/RichTextDisplay";
import { useAdminAction, useUser } from "./queries";
import { useToast } from "./toast";
import { Avatar, Btn, ErrorState, Field, Input, Loading, Modal, Panel, PanelHead, Pill, Tabs, Textarea, grid, kvList, page, row, stack, text } from "./ui";
import { ago, dateTime, errorMessage, longDate, money, shortDate } from "./format";
import { accountLabel, accountState, kycLabel, kycState } from "./labels";

const back = css({ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 500, color: "var(--td-ink-2) !important", mb: "14px", _hover: { color: "var(--td-ink) !important" } });
const banner = css({ display: "flex", alignItems: "center", gap: "12px", p: "12px 16px", borderRadius: "12px", mb: "20px", bg: "var(--td-amber-soft)", color: "var(--td-amber)", "&[data-kind=banned]": { bg: "var(--td-red-soft)", color: "var(--td-red)" } });
const chip = css({ display: "inline-flex", h: "26px", px: "10px", alignItems: "center", borderRadius: "999px", bg: "var(--td-hover)", fontSize: "12.5px", fontWeight: 500 });
const statBox = css({ p: "14px 16px", borderRadius: "10px", bg: "var(--td-surface-2)", border: "1px solid var(--td-line)" });
const statNum = css({ fontSize: "20px", fontWeight: 600, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums", mt: "2px" });
const prose = css({ fontSize: "13.5px", color: "var(--td-ink-2)", lineHeight: 1.55, "& p": { margin: "0 0 8px" }, "& ul, & ol": { paddingLeft: "18px", margin: "0 0 8px" } });
const docTile = css({
  display: "block", position: "relative", aspectRatio: "1.6", borderRadius: "12px", overflow: "hidden", bg: "var(--td-hover)", borderWidth: "1px", borderStyle: "solid", borderColor: "var(--td-line)",
  "& img": { w: "100%", h: "100%", objectFit: "cover", display: "block" },
  "& span": { position: "absolute", left: "10px", bottom: "10px", px: "8px", h: "22px", display: "inline-flex", alignItems: "center", gap: "5px", borderRadius: "999px", bg: "rgba(21,23,28,0.72)", color: "#fff", fontSize: "11.5px", fontWeight: 600 },
});

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return <div className={statBox}><p className={text({ size: "sm", tone: 2 })}>{label}</p><p className={statNum}>{value}</p></div>;
}

export default function PersonDetailPage({ id }: { id: number }) {
  const toast = useToast();
  const user = useUser(id);
  const p = user.data;
  const [tab, setTab] = useState<"profile" | "verification">("profile");
  const [modal, setModal] = useState<"email" | "suspend" | "ban" | null>(null);
  const [reason, setReason] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [kycReason, setKycReason] = useState("");
  const [kycRejecting, setKycRejecting] = useState(false);

  const invalidate = [["admin", "user", String(id)]];
  const suspend = useAdminAction((r: string) => api.suspendAdminUser(id, r), { invalidate });
  const unsuspend = useAdminAction<void>(() => api.unsuspendAdminUser(id), { invalidate });
  const ban = useAdminAction((r: string) => api.banAdminUser(id, r), { invalidate });
  const unban = useAdminAction<void>(() => api.unbanAdminUser(id), { invalidate });
  const email = useAdminAction(({ s, m }: { s: string; m: string }) => api.sendAdminUserEmail(id, s, m), { invalidate });
  const approveKyc = useAdminAction((kycId: number) => api.approveKyc(kycId), { invalidate });
  const rejectKyc = useAdminAction(({ kycId, note }: { kycId: number; note: string }) => api.rejectKyc(kycId, note), { invalidate });
  const busy = suspend.isPending || unsuspend.isPending || ban.isPending || unban.isPending || email.isPending || approveKyc.isPending || rejectKyc.isPending;

  if (user.isLoading) return <div className={page}><Loading tall /></div>;
  if (user.isError || !p) {
    return (
      <div className={page}>
        <Link href="/admin/people" className={back}><ArrowLeft size={14} /> People</Link>
        <Panel><ErrorState title="Person not found" body="They may have been removed, or the link is wrong." onRetry={() => user.refetch()} /></Panel>
      </div>
    );
  }

  const status = accountState(p.account_status);
  const statusReason = status === "banned" ? p.account_status.ban_reason : status === "suspended" ? p.account_status.suspension_reason : null;
  const fp = p.freelancer_profile;
  const cp = p.client_profile;
  const kyc = p.kyc;
  const k = kycState(kyc?.status ?? (p.is_verified_id ? "approved" : null));
  const roles = [p.is_freelancer ? "Freelancer" : null, p.is_client ? "Client" : null].filter(Boolean) as string[];
  const showVerification = p.is_freelancer || !!kyc;

  const close = () => { setModal(null); setReason(""); setSubject(""); setBody(""); };
  const guard = async (fn: () => Promise<unknown>, ok: string) => {
    try { await fn(); toast(ok); return true; } catch (err) { toast(errorMessage(err), "error"); return false; }
  };
  const doSuspend = async () => { if (await guard(() => suspend.mutateAsync(reason.trim()), `${p.name} suspended.`)) close(); };
  const doBan = async () => { if (await guard(() => ban.mutateAsync(reason.trim()), `${p.name} banned.`)) close(); };
  const doReinstate = () => guard(() => (status === "banned" ? unban.mutateAsync() : unsuspend.mutateAsync()), `${p.name} is active again.`);
  const doEmail = async () => { if (await guard(() => email.mutateAsync({ s: subject.trim(), m: body.trim() }), `Email sent to ${p.email}.`)) close(); };

  return (
    <div className={page}>
      <Link href="/admin/people" className={back}><ArrowLeft size={14} /> People</Link>

      <header className={cx(row({ between: true, top: true, gap: 4 }), css({ mb: "20px" }))}>
        <div className={row({ gap: 4, top: true })}>
          <Avatar name={p.name} size="xl" seed={p.id} src={p.avatar_url} />
          <div className={stack({ gap: 2 })}>
            <div className={row({ gap: 3 })}>
              <h1 className={text({ size: "2xl", weight: 600 })}>{p.name}</h1>
              <Pill tone={accountLabel[status].tone} dot>{accountLabel[status].label}</Pill>
              {showVerification ? <Pill tone={kycLabel[k].tone}>{kycLabel[k].label}</Pill> : null}
            </div>
            <p className={text({ tone: 2 })}>{roles.join(" and ") || "No role yet"}{fp?.tagline ? ` · ${fp.tagline}` : cp?.company_name ? ` · ${cp.company_name}` : ""}</p>
            <div className={cx(row({ gap: 4, wrap: true }), text({ size: "sm", tone: 3 }))}>
              {p.email ? <span>{p.email}</span> : null}{p.telephone ? <span>{p.telephone}</span> : null}{p.location ? <span className={row({ gap: 1 })}><MapPin size={12} /> {p.location}</span> : null}
              <span>Joined {shortDate(p.created_at)}</span><span>Active {p.last_active_at ? ago(p.last_active_at) : "never"}</span>
            </div>
          </div>
        </div>
        <div className={row({ gap: 2 })}>
          <Btn onClick={() => setModal("email")} disabled={busy || !p.email}><Mail size={15} /> Email</Btn>
          {status === "active" ? <><Btn onClick={() => setModal("suspend")} disabled={busy}><PauseCircle size={15} /> Suspend</Btn><Btn variant="dangerSoft" onClick={() => setModal("ban")} disabled={busy}><Ban size={15} /> Ban</Btn></> : <Btn variant="primary" onClick={doReinstate} disabled={busy}><PlayCircle size={15} /> {busy ? "Working…" : status === "banned" ? "Unban" : "Reinstate"}</Btn>}
        </div>
      </header>

      {status !== "active" ? (
        <div className={banner} data-kind={status}>
          {status === "banned" ? <Ban size={16} /> : <PauseCircle size={16} />}
          <div className={css({ flex: 1 })}>
            <p className={text({ weight: 600, size: "sm" })}>{status === "banned" ? `Banned ${p.account_status.banned_at ? ago(p.account_status.banned_at) : ""}. They cannot sign in.` : `Suspended ${p.account_status.suspended_at ? ago(p.account_status.suspended_at) : ""}. They cannot sign in or act until reinstated.`}</p>
            {statusReason ? <p className={text({ size: "sm" })}>{statusReason}</p> : null}
          </div>
        </div>
      ) : null}

      <div className={cx(grid({ cols: "main" }), css({ gap: "20px", alignItems: "start" }))}>
        <div className={stack({ gap: 4 })}>
          <Tabs value={tab} onChange={setTab} items={[{ value: "profile", label: "Profile" }, ...(showVerification ? [{ value: "verification" as const, label: "Verification" }] : [])]} />

          {tab === "profile" ? (
            <>
              {fp ? (
                <Panel>
                  <PanelHead title="Freelancer profile" meta={fp.level} />
                  <div className={cx(stack({ gap: 4 }), css({ p: "20px" }))}>
                    <div className={grid({ cols: 4 })}>
                      <Stat label="Rating" value={<span className={row({ gap: 1 })}><Star size={16} /> {fp.rating != null ? fp.rating.toFixed(1) : "—"} <span className={text({ size: "sm", tone: 3, weight: 400 })}>({fp.rating_count})</span></span>} />
                      <Stat label="Completed orders" value={fp.completed_orders} />
                      <Stat label="Services" value={p.activity.services ?? 0} />
                      <Stat label="Earned" value={money(p.activity.total_earned ?? 0)} />
                    </div>
                    <dl className={kvList}>
                      <dt>Tagline</dt><dd>{fp.tagline ?? "—"}</dd>
                      <dt>Location</dt><dd>{fp.location ?? "—"}</dd>
                      <dt>Skills</dt><dd>{fp.skills.length ? <span className={row({ gap: 1, wrap: true })}>{fp.skills.map((s) => <span key={s} className={chip}>{s}</span>)}</span> : "—"}</dd>
                      <dt>Languages</dt><dd>{fp.languages.length ? fp.languages.map((l) => `${l.name} (${l.proficiency})`).join(", ") : "—"}</dd>
                      <dt>About</dt><dd>{fp.about ? <RichTextDisplay value={fp.about} className={prose} /> : <span className={text({ tone: 3 })}>Nothing written yet.</span>}</dd>
                    </dl>
                  </div>
                </Panel>
              ) : null}
              {cp ? (
                <Panel>
                  <PanelHead title="Client profile" />
                  <div className={cx(stack({ gap: 4 }), css({ p: "20px" }))}>
                    <div className={grid({ cols: 4 })}>
                      <Stat label="Orders placed" value={p.activity.orders_placed ?? 0} />
                      <Stat label="Completed" value={p.activity.orders_completed_as_client ?? 0} />
                      <Stat label="Job posts" value={p.activity.job_posts ?? 0} />
                      <Stat label="Spent" value={money(p.activity.total_spent ?? 0)} />
                    </div>
                    <dl className={kvList}>
                      <dt>Company</dt><dd>{cp.company_name ?? "—"}</dd>
                      <dt>Industry</dt><dd>{cp.industry ?? "—"}</dd>
                      <dt>Website</dt><dd>{cp.website ? <a href={cp.website} target="_blank" rel="noreferrer" className={cx(text({ tone: "accent", weight: 500 }), row({ gap: 1 }))}>{cp.website} <ExternalLink size={12} /></a> : "—"}</dd>
                      <dt>Location</dt><dd>{cp.location ?? "—"}</dd>
                      <dt>About</dt><dd>{cp.about ? <span className={css({ whiteSpace: "pre-wrap" })}>{cp.about}</span> : <span className={text({ tone: 3 })}>Nothing written yet.</span>}</dd>
                    </dl>
                  </div>
                </Panel>
              ) : null}
              {!fp && !cp ? <Panel><p className={cx(text({ size: "sm", tone: 3 }), css({ p: "20px" }))}>This account hasn&apos;t set up a profile yet.</p></Panel> : null}
            </>
          ) : null}

          {tab === "verification" ? (
            <Panel>
              <PanelHead title="Identity verification" meta={kyc ? kyc.document_type ?? "Document" : "nothing submitted"} />
              {!kyc ? <div className={cx(text({ size: "sm", tone: 3 }), css({ p: "20px" }))}>{"They haven't uploaded a document yet."}</div> : (
                <div className={cx(stack({ gap: 4 }), css({ p: "20px" }))}>
                  <div className={row({ gap: 2 })}>
                    <Pill tone={kyc.status === "approved" ? "green" : kyc.status === "rejected" ? "red" : "amber"} dot>{kyc.status === "approved" ? "Approved" : kyc.status === "rejected" ? "Rejected" : "Awaiting review"}</Pill>
                    <span className={text({ size: "sm", tone: 3 })}>submitted {ago(kyc.submitted_at)}{kyc.reviewed_at ? ` · reviewed ${ago(kyc.reviewed_at)}${kyc.reviewer ? ` by ${kyc.reviewer}` : ""}` : ""}</span>
                  </div>
                  {kyc.admin_note ? <div className={cx(text({ size: "sm" }), css({ p: "12px", bg: "var(--td-red-soft)", color: "var(--td-red)", borderRadius: "10px" }))}>{kyc.admin_note}</div> : null}
                  {kyc.documents.length ? (
                    <div className={css({ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" })}>
                      {kyc.documents.map((d) => (
                        <a key={d.url} href={d.url} target="_blank" rel="noreferrer" className={docTile} title="Open full size">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={d.url} alt={d.label} />
                          <span>{d.label} <ExternalLink size={11} /></span>
                        </a>
                      ))}
                    </div>
                  ) : <p className={text({ size: "sm", tone: 3 })}>No documents on file.</p>}
                  {kyc.status === "pending" ? (
                    <div className={stack({ gap: 3 })}>
                      {kycRejecting ? <Field label="Reason for rejecting" hint="They see this message and can submit again."><Textarea autoFocus value={kycReason} onChange={(e) => setKycReason(e.target.value)} /></Field> : null}
                      <div className={row({ gap: 2 })}>
                        {kycRejecting ? <><Btn variant="ghost" disabled={busy} onClick={() => { setKycRejecting(false); setKycReason(""); }}>Back</Btn><Btn variant="danger" disabled={!kycReason.trim() || busy} onClick={async () => { if (await guard(() => rejectKyc.mutateAsync({ kycId: kyc.id, note: kycReason.trim() }), "Verification rejected.")) { setKycRejecting(false); setKycReason(""); } }}>Reject</Btn></>
                          : <><Btn variant="dangerSoft" disabled={busy} onClick={() => setKycRejecting(true)}>Reject…</Btn><Btn variant="success" disabled={busy} onClick={() => guard(() => approveKyc.mutateAsync(kyc.id), `${p.name} is now verified.`)}><Check size={15} /> Approve</Btn></>}
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </Panel>
          ) : null}
        </div>

        <div className={stack({ gap: 4 })}>
          <Panel>
            <PanelHead title="Account" />
            <div className={css({ p: "16px" })}>
              <dl className={kvList}>
                <dt>User ID</dt><dd className={text({ mono: true })}>#{p.id}</dd>
                <dt>Email</dt><dd>{p.email ? <>{p.email} {p.email_verified_at ? <Pill tone="green" outline>verified</Pill> : <Pill tone="amber" outline>unverified</Pill>}</> : "—"}</dd>
                <dt>Phone</dt><dd>{p.telephone ? <>{p.telephone} {p.is_verified_phone ? <Pill tone="green" outline>verified</Pill> : <Pill tone="amber" outline>unverified</Pill>}</> : "—"}</dd>
                <dt>Roles</dt><dd>{roles.join(", ") || "—"}</dd>
                <dt>Joined</dt><dd>{longDate(p.created_at)}</dd>
                <dt>Last active</dt><dd>{p.last_active_at ? dateTime(p.last_active_at) : "Never"}</dd>
              </dl>
            </div>
          </Panel>
        </div>
      </div>

      <Modal open={modal === "email"} onClose={close} title={`Email ${p.name}`} description={`Sent from the KickAir admin address to ${p.email}.`}
        footer={<><Btn variant="ghost" onClick={close}>Cancel</Btn><Btn variant="primary" disabled={!subject.trim() || !body.trim() || busy} onClick={doEmail}><Mail size={14} /> {email.isPending ? "Sending…" : "Send"}</Btn></>}>
        <div className={stack({ gap: 3 })}>
          <Field label="Subject"><Input autoFocus value={subject} onChange={(e) => setSubject(e.target.value)} /></Field>
          <Field label="Message"><Textarea value={body} onChange={(e) => setBody(e.target.value)} className={css({ minH: "140px" })} /></Field>
        </div>
      </Modal>
      <Modal open={modal === "suspend"} onClose={close} title={`Suspend ${p.name}`} description="They are signed out everywhere and cannot sign in until reinstated. Their listings stay as they are." size="sm"
        footer={<><Btn variant="ghost" onClick={close}>Cancel</Btn><Btn variant="primary" disabled={!reason.trim() || busy} onClick={doSuspend}>{suspend.isPending ? "Suspending…" : "Suspend"}</Btn></>}>
        <Field label="Reason" hint="Kept on their record."><Textarea autoFocus value={reason} onChange={(e) => setReason(e.target.value)} /></Field>
      </Modal>
      <Modal open={modal === "ban"} onClose={close} title={`Ban ${p.name}`} description="They are signed out everywhere and cannot sign in again. This can be undone." size="sm"
        footer={<><Btn variant="ghost" onClick={close}>Cancel</Btn><Btn variant="danger" disabled={!reason.trim() || busy} onClick={doBan}>{ban.isPending ? "Banning…" : "Ban account"}</Btn></>}>
        <Field label="Reason" hint="Kept on their record."><Textarea autoFocus value={reason} onChange={(e) => setReason(e.target.value)} /></Field>
      </Modal>
    </div>
  );
}
