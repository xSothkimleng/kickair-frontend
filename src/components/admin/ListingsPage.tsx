"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { css, cx } from "styled-system/css";
import { Check, Store, Tag } from "lucide-react";
import { api } from "@/lib/api";
import type { Service } from "@/types/service";
import type { JobPost } from "@/types/job";
import RichTextDisplay from "@/components/ui/RichTextDisplay";
import { useAdminAction, useAdminStats, useCategories, useJobPosts, useServices } from "./queries";
import { useToast } from "./toast";
import { Avatar, Btn, Drawer, EmptyState, ErrorState, Field, Input, Loading, Modal, Pager, Panel, Pill, Segmented, Select, Tabs, Textarea, kvList, page, PageHeader, row, stack, table, text } from "./ui";
import { ago, errorMessage, money, waiting } from "./format";
import { listingLabel, type ListingStatus } from "./labels";

type Kind = "service" | "job";

/** One row shape for both services and job posts. */
interface Listing {
  id: number; kind: Kind; title: string; status: ListingStatus; submitted: string;
  owner: { id: number | null; name: string; avatar: string | null; sub: string | null };
  category: string | null; categoryId: number | null; suggested: string | null; suggestedParentId: number | null;
  price?: number; budget?: string; tiers?: number; delivery?: string; proposals?: number; deadline?: string;
  cover: string | null; reason: string | null; description: string | null;
}

const API_STATUS: Record<Kind, Record<ListingStatus, string>> = {
  service: { pending: "pending_review", live: "active", rejected: "rejected", disabled: "disabled" },
  job: { pending: "pending_review", live: "open", rejected: "rejected", disabled: "disabled" },
};
function serviceStatus(s: Service["status"]): ListingStatus {
  return s === "active" ? "live" : s === "rejected" ? "rejected" : s === "disabled" ? "disabled" : "pending";
}
function jobStatus(s: JobPost["status"]): ListingStatus {
  return s === "rejected" ? "rejected" : s === "pending_review" || s === "draft" ? "pending" : "live";
}
function fromService(s: Service): Listing {
  const u = s.freelancer_profile?.user;
  const opts = (s.pricing_options ?? []).map((p) => ({ price: Number(p.price_raw), delivery: String(p.delivery_time) })).filter((p) => p.price > 0).sort((a, b) => a.price - b.price);
  return {
    id: s.id, kind: "service", title: s.title, status: serviceStatus(s.status), submitted: s.updated_at ?? s.created_at,
    owner: { id: u?.id ?? null, name: u?.name ?? "Unknown", avatar: u?.avatar_url ?? null, sub: s.freelancer_profile?.tagline ?? u?.email ?? null },
    category: s.category?.category_name ?? null, categoryId: s.category_id, suggested: s.requested_category ?? null, suggestedParentId: s.requested_parent_id ?? null,
    price: opts[0]?.price, tiers: s.pricing_options?.length ?? 0, delivery: opts[0]?.delivery ? `${opts[0].delivery}${/^\d+$/.test(opts[0].delivery) ? " days" : ""}` : undefined,
    cover: s.feature_image?.file_url ?? s.media?.find((m) => m.file_type === "image")?.file_url ?? null, reason: s.rejection_reason ?? null, description: s.description,
  };
}
function fromJob(j: JobPost): Listing {
  const u = j.client_profile?.user;
  const min = Number(j.budget_min), max = Number(j.budget_max);
  return {
    id: j.id, kind: "job", title: j.title, status: jobStatus(j.status), submitted: j.updated_at ?? j.created_at,
    owner: { id: u?.id ?? null, name: j.client_profile?.company_name || u?.name || "Unknown", avatar: u?.avatar_url ?? null, sub: j.client_profile?.company_name ? u?.name ?? null : u?.email ?? null },
    category: j.category?.category_name ?? null, categoryId: j.category_id ?? j.category?.id ?? null, suggested: j.requested_category ?? null, suggestedParentId: j.requested_parent_id ?? null,
    budget: min && max && min !== max ? `${money(min)} – ${money(max)}` : money(max || min), proposals: j.proposal_count, deadline: j.deadline,
    cover: j.media?.find((m) => m.file_type === "image")?.file_url ?? null, reason: j.rejection_reason ?? null, description: j.description,
  };
}

const cover = css({ w: "44px", h: "32px", borderRadius: "7px", flexShrink: 0, objectFit: "cover", display: "block", "&[data-lg=true]": { w: "100%", h: "180px", borderRadius: "12px" } });
const suggest = css({ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12.5px", color: "var(--td-amber)", fontWeight: 500 });
const linkBtn = css({ bg: "none", border: "none", p: 0, cursor: "pointer", fontSize: "12.5px", fontWeight: 600, color: "var(--td-accent)", _hover: { textDecoration: "underline" } });
const desc = css({ fontSize: "13px", color: "var(--td-ink-2)", lineHeight: 1.55, whiteSpace: "pre-wrap", "& p": { margin: "0 0 8px" }, "& ul, & ol": { paddingLeft: "18px", margin: "0 0 8px" } });

function Cover({ src, id, lg }: { src: string | null; id: number; lg?: boolean }) {
  const hue = (id * 47) % 360;
  // eslint-disable-next-line @next/next/no-img-element
  if (src) return <img src={src} alt="" className={cover} data-lg={lg} />;
  return <div className={cover} data-lg={lg} style={{ background: `linear-gradient(135deg, hsl(${hue} 55% 78%), hsl(${(hue + 40) % 360} 50% 58%))` }} />;
}

export default function ListingsPage() {
  const toast = useToast();
  const params = useSearchParams();
  const [kind, setKind] = useState<Kind>(params.get("kind") === "job" ? "job" : "service");
  const [status, setStatus] = useState<ListingStatus>("pending");
  const [pageNo, setPageNo] = useState(1);
  const [preview, setPreview] = useState<number | null>(null);
  const [reject, setReject] = useState<{ id: number; reason: string } | null>(null);
  const [disable, setDisable] = useState<{ id: number; reason: string } | null>(null);
  const [assign, setAssign] = useState<{ id: number; thenApprove: boolean; categoryId: string; newName: string; parentId: string } | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  useEffect(() => { if (params.get("kind") === "job") setKind("job"); }, [params]);

  const stats = useAdminStats();
  const categories = useCategories();
  const services = useServices(API_STATUS.service[status], pageNo, kind === "service");
  const jobs = useJobPosts(API_STATUS.job[status], pageNo, kind === "job");
  const query = kind === "service" ? services : jobs;

  const rows = useMemo<Listing[]>(() => {
    const list = kind === "service" ? (services.data?.data ?? []).map(fromService) : (jobs.data?.data ?? []).map(fromJob);
    return status === "pending" ? list.sort((a, b) => +new Date(a.submitted) - +new Date(b.submitted)) : list;
  }, [kind, status, services.data, jobs.data]);
  const current = rows.find((l) => l.id === preview);
  const cats = categories.data ?? [];
  const parents = cats.filter((c) => c.parent_id === null);
  const pendingServices = stats.data?.listings.pending_services;
  const pendingJobs = stats.data?.listings.pending_jobs;
  const pendingCount = kind === "service" ? pendingServices : pendingJobs;

  const act = useAdminAction(async ({ fn }: { fn: () => Promise<unknown> }) => fn());
  const run = async (id: number, fn: () => Promise<unknown>, ok: string) => {
    setBusyId(id);
    try { await act.mutateAsync({ fn }); toast(ok); return true; }
    catch (err) { toast(errorMessage(err), "error"); return false; }
    finally { setBusyId(null); }
  };
  const approveCall = (l: Listing) => (l.kind === "service" ? api.approveService(l.id) : api.approveJobPost(l.id));
  const openAssign = (l: Listing, thenApprove: boolean) => setAssign({ id: l.id, thenApprove, categoryId: "", newName: "", parentId: String(l.suggestedParentId ?? parents[0]?.id ?? "") });

  const approve = async (l: Listing) => {
    if (!l.categoryId) { openAssign(l, true); return; }
    if (await run(l.id, () => approveCall(l), `“${l.title}” is now live.`)) setPreview(null);
  };
  const confirmReject = async () => {
    if (!reject) return;
    const l = rows.find((x) => x.id === reject.id); if (!l) return;
    const reason = reject.reason.trim();
    if (await run(l.id, () => (l.kind === "service" ? api.rejectService(l.id, reason) : api.rejectJobPost(l.id, reason)), "Listing rejected. The owner has been notified.")) { setReject(null); setPreview(null); }
  };
  const confirmDisable = async () => {
    if (!disable) return;
    if (await run(disable.id, () => api.disableService(disable.id, disable.reason.trim()), "Service disabled.")) { setDisable(null); setPreview(null); }
  };
  const enable = async (l: Listing) => {
    if (await run(l.id, () => api.enableService(l.id), `“${l.title}” is live again.`)) setPreview(null);
  };
  const useSuggestion = () => {
    if (!assign) return;
    const l = rows.find((x) => x.id === assign.id); if (!l?.suggested) return;
    const existing = cats.find((c) => c.category_name.toLowerCase() === l.suggested!.toLowerCase() && c.parent_id !== null);
    if (existing) setAssign({ ...assign, categoryId: String(existing.id), newName: "" });
    else setAssign({ ...assign, categoryId: "", newName: l.suggested });
  };
  const confirmAssign = async () => {
    if (!assign) return;
    const l = rows.find((x) => x.id === assign.id); if (!l) return;
    setBusyId(l.id);
    try {
      let categoryId = Number(assign.categoryId);
      let name = cats.find((c) => c.id === categoryId)?.category_name;
      if (assign.newName.trim()) {
        const created = await api.createAdminCategory(assign.newName.trim(), Number(assign.parentId) || null);
        categoryId = created.id; name = created.category_name;
      }
      if (!categoryId) return;
      await (l.kind === "service" ? api.setServiceCategory(l.id, categoryId) : api.setJobPostCategory(l.id, categoryId));
      if (assign.thenApprove) await approveCall(l);
      await act.mutateAsync({ fn: async () => undefined });
      toast(assign.thenApprove ? `Filed under ${name} and published.` : `Category set to ${name}.`);
      setAssign(null); setPreview(null);
    } catch (err) {
      toast(errorMessage(err), "error");
    } finally {
      setBusyId(null);
    }
  };

  const actionsFor = (l: Listing, size: "sm" | "md" = "sm") => {
    const busy = busyId === l.id;
    return (
      <>
        {l.status === "pending" ? <><Btn size={size} variant="dangerSoft" disabled={busy} onClick={(e) => { e.stopPropagation(); setReject({ id: l.id, reason: "" }); }}>Reject</Btn><Btn size={size} variant="success" disabled={busy} onClick={(e) => { e.stopPropagation(); approve(l); }}><Check size={14} /> {busy ? "Working…" : "Approve"}</Btn></> : null}
        {l.status === "live" && l.kind === "service" ? <Btn size={size} disabled={busy} onClick={(e) => { e.stopPropagation(); setDisable({ id: l.id, reason: "" }); }}>Disable</Btn> : null}
        {l.status === "disabled" ? <Btn size={size} variant="success" disabled={busy} onClick={(e) => { e.stopPropagation(); enable(l); }}>Enable</Btn> : null}
        {l.status === "rejected" ? <Btn size={size} variant="ghost" disabled={busy} onClick={(e) => { e.stopPropagation(); approve(l); }}>Approve anyway</Btn> : null}
      </>
    );
  };

  const statusItems: { value: ListingStatus; label: string; count?: number }[] = [
    { value: "pending", label: "Needs review", count: pendingCount }, { value: "live", label: "Live" }, { value: "rejected", label: "Rejected" }, ...(kind === "service" ? [{ value: "disabled" as const, label: "Disabled" }] : []),
  ];
  const changeKind = (k: Kind) => { setKind(k); setStatus("pending"); setPageNo(1); };
  const changeStatus = (s: ListingStatus) => { setStatus(s); setPageNo(1); };
  const catLabel = (l: Listing) => (l.status === "pending" ? "Submitted" : l.status === "live" ? "Published" : "Updated");

  return (
    <div className={page}>
      <PageHeader title="Listings" description="Services and job posts go live after a review. When the owner didn't pick a category, file it before approving." />
      <div className={css({ mb: "16px" })}>
        <Tabs value={kind} onChange={changeKind} items={[{ value: "service", label: `Services${pendingServices != null ? ` (${pendingServices} to review)` : ""}` }, { value: "job", label: `Job posts${pendingJobs != null ? ` (${pendingJobs} to review)` : ""}` }]} />
      </div>
      <div className={cx(row({ between: true }), css({ mb: "14px" }))}>
        <Segmented value={status} onChange={changeStatus} items={statusItems} />
        {status === "pending" && rows.length ? <span className={text({ size: "sm", tone: 3 })}>Oldest first</span> : null}
      </div>

      <Panel>
        {query.isLoading ? <Loading /> : query.isError ? <ErrorState onRetry={() => query.refetch()} /> : rows.length === 0 ? <EmptyState icon={<Store size={20} />} title={status === "pending" ? "Nothing to review" : `No ${listingLabel[status].label.toLowerCase()} ${kind === "service" ? "services" : "job posts"}`} /> : (
          <table className={table}>
            <thead><tr><th>{kind === "service" ? "Service" : "Job post"}</th><th>Category</th><th className="num">{kind === "service" ? "From" : "Budget"}</th><th>{status === "pending" ? "Waiting" : catLabel(rows[0]!)}</th><th /></tr></thead>
            <tbody>
              {rows.map((l) => (
                <tr key={l.id} data-clickable onClick={() => setPreview(l.id)}>
                  <td>
                    <div className={row({ gap: 3 })}>
                      <Cover src={l.cover} id={l.id} />
                      <div className={css({ minW: 0 })}>
                        <p className={cx(text({ weight: 600, truncate: true }), css({ maxW: "440px" }))}>{l.title}</p>
                        <p className={text({ size: "sm", tone: 3 })}>{l.owner.name}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    {l.category ? <Pill outline>{l.category}</Pill> : (
                      <div className={cx(stack({ gap: 1 }), css({ alignItems: "flex-start" }))}>
                        {l.suggested ? <span className={suggest}><Tag size={12} /> Suggested: {l.suggested}</span> : null}
                        <button className={linkBtn} onClick={(e) => { e.stopPropagation(); openAssign(l, false); }}>Assign category</button>
                      </div>
                    )}
                  </td>
                  <td className="num"><span className={text({ weight: 600, mono: true })}>{l.price != null ? money(l.price) : l.budget ?? "—"}</span></td>
                  <td>{status === "pending" ? <><p className={text({ weight: 500 })}>{waiting(l.submitted)}</p><p className={text({ size: "sm", tone: 3 })}>{ago(l.submitted)}</p></> : <p className={text({ tone: 2 })}>{ago(l.submitted)}</p>}</td>
                  <td className="actions"><span className={row({ gap: 2 })}>{actionsFor(l)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <Pager meta={query.data?.meta} onPage={setPageNo} noun={kind === "service" ? "services" : "job posts"} />
      </Panel>

      <Drawer open={!!current} onClose={() => setPreview(null)} title={current?.title ?? ""} subtitle={current ? <>{current.kind === "service" ? "Service" : "Job post"} · {catLabel(current).toLowerCase()} {ago(current.submitted)}</> : null}
        footer={current ? <><Btn variant="ghost" onClick={() => setPreview(null)}>Close</Btn>{actionsFor(current, "md")}</> : null}>
        {current ? (
          <div className={stack({ gap: 4 })}>
            <Cover src={current.cover} id={current.id} lg />
            <div className={row({ gap: 2 })}>
              <Pill tone={listingLabel[current.status].tone} dot>{listingLabel[current.status].label}</Pill>
              {current.category ? <Pill outline>{current.category}</Pill> : <Pill tone="amber">No category</Pill>}
            </div>
            {current.reason ? <div className={cx(text({ size: "sm" }), css({ p: "12px", bg: "var(--td-red-soft)", color: "var(--td-red)", borderRadius: "10px" }))}>{current.reason}</div> : null}
            <Link href={current.owner.id ? `/admin/people/${current.owner.id}` : "#"} className={cx(row({ gap: 3 }), css({ p: "12px", borderRadius: "10px", border: "1px solid var(--td-line)", _hover: { bg: "var(--td-surface-2)" } }))}>
              <Avatar name={current.owner.name} seed={current.owner.id ?? current.id} src={current.owner.avatar} />
              <div className={css({ minW: 0 })}>
                <p className={text({ weight: 600 })}>{current.owner.name}</p>
                {current.owner.sub ? <p className={text({ size: "sm", tone: 3, truncate: true })}>{current.owner.sub}</p> : null}
              </div>
            </Link>
            <dl className={kvList}>
              {current.kind === "service" ? (
                <><dt>Starting at</dt><dd className={text({ mono: true })}>{current.price != null ? money(current.price) : "—"}</dd><dt>Packages</dt><dd>{current.tiers} {current.tiers === 1 ? "tier" : "tiers"}</dd><dt>Delivery</dt><dd>{current.delivery ?? "—"}</dd></>
              ) : (
                <><dt>Budget</dt><dd>{current.budget}</dd><dt>Deadline</dt><dd>{current.deadline ? ago(current.deadline).replace(" ago", "") : "—"}</dd><dt>Proposals</dt><dd>{current.status === "live" ? `${current.proposals ?? 0} received` : "Not open yet"}</dd></>
              )}
              {current.suggested && !current.category ? <><dt>Owner suggested</dt><dd>{current.suggested}</dd></> : null}
            </dl>
            <div>
              <p className={cx(text({ size: "sm", weight: 600, tone: 2 }), css({ mb: "6px" }))}>Description</p>
              {current.description ? (current.kind === "service" ? <RichTextDisplay value={current.description} className={desc} /> : <p className={desc}>{current.description}</p>) : <p className={text({ size: "sm", tone: 3 })}>No description.</p>}
            </div>
            {!current.category ? <Btn onClick={() => openAssign(current, false)}><Tag size={14} /> Assign a category</Btn> : null}
          </div>
        ) : null}
      </Drawer>

      <Modal open={!!reject} onClose={() => setReject(null)} title="Reject this listing" description="The owner sees your reason and can edit and resubmit." size="sm"
        footer={<><Btn variant="ghost" onClick={() => setReject(null)}>Cancel</Btn><Btn variant="danger" disabled={!reject?.reason.trim() || busyId != null} onClick={confirmReject}>Reject</Btn></>}>
        <Field label="Reason"><Textarea autoFocus value={reject?.reason ?? ""} onChange={(e) => setReject(reject && { ...reject, reason: e.target.value })} placeholder="e.g. Title makes a guarantee we don't allow." /></Field>
      </Modal>

      <Modal open={!!disable} onClose={() => setDisable(null)} title="Disable this service" description="It disappears from search and the seller can't receive new orders. Existing orders continue." size="sm"
        footer={<><Btn variant="ghost" onClick={() => setDisable(null)}>Cancel</Btn><Btn variant="primary" disabled={!disable?.reason.trim() || busyId != null} onClick={confirmDisable}>Disable</Btn></>}>
        <Field label="Reason shown to the seller"><Textarea autoFocus value={disable?.reason ?? ""} onChange={(e) => setDisable(disable && { ...disable, reason: e.target.value })} /></Field>
      </Modal>

      <Modal open={!!assign} onClose={() => setAssign(null)} title={assign?.thenApprove ? "Pick a category, then publish" : "Assign a category"} description="Pick an existing subcategory or create a new one under a top-level group." size="sm"
        footer={<><Btn variant="ghost" onClick={() => setAssign(null)}>Cancel</Btn><Btn variant="primary" disabled={!assign || (!assign.categoryId && !assign.newName.trim()) || busyId != null} onClick={confirmAssign}>{busyId != null ? "Saving…" : assign?.thenApprove ? "Save and publish" : "Save"}</Btn></>}>
        {assign ? (
          <div className={stack({ gap: 4 })}>
            {rows.find((l) => l.id === assign.id)?.suggested ? (
              <div className={cx(row({ between: true }), css({ p: "10px 12px", borderRadius: "10px", bg: "var(--td-amber-soft)" }))}>
                <span className={cx(text({ size: "sm" }), css({ color: "var(--td-amber)" }))}>Owner suggested <b>{rows.find((l) => l.id === assign.id)?.suggested}</b></span>
                <Btn size="xs" onClick={useSuggestion}>Use it</Btn>
              </div>
            ) : null}
            <Field label="Existing category">
              <Select value={assign.categoryId} onChange={(e) => setAssign({ ...assign, categoryId: e.target.value, newName: "" })}>
                <option value="">Choose…</option>
                {parents.map((p) => (
                  <optgroup key={p.id} label={p.category_name}>{cats.filter((c) => c.parent_id === p.id && c.is_active).map((c) => <option key={c.id} value={c.id}>{c.category_name}</option>)}</optgroup>
                ))}
              </Select>
            </Field>
            <div className={cx(row({ gap: 3 }), css({ color: "var(--td-ink-3)", fontSize: "12px", "&::before, &::after": { content: '""', flex: 1, h: "1px", bg: "var(--td-line)" } }))}>or create new</div>
            <div className={css({ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" })}>
              <Field label="New subcategory"><Input value={assign.newName} onChange={(e) => setAssign({ ...assign, newName: e.target.value, categoryId: "" })} placeholder="e.g. Podcast editing" /></Field>
              <Field label="Under"><Select value={assign.parentId} onChange={(e) => setAssign({ ...assign, parentId: e.target.value })}>{parents.map((p) => <option key={p.id} value={p.id}>{p.category_name}</option>)}</Select></Field>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
