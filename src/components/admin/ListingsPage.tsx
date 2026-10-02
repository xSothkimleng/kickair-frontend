"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { css, cx } from "styled-system/css";
import { Check, ExternalLink, Paperclip, Store, Tag } from "lucide-react";
import { api } from "@/lib/api";
import type { Service } from "@/types/service";
import type { JobPost } from "@/types/job";
import RichTextDisplay from "@/components/ui/RichTextDisplay";
import { useAdminAction, useAdminStats, useCategories, useJobPosts, useServices } from "./queries";
import { useToast } from "./toast";
import { categoryLine } from "@/lib/categoryLine";
import { Avatar, Btn, Drawer, EmptyState, ErrorState, Field, Loading, Modal, Pager, Panel, Pill, Segmented, Select, Tabs, Textarea, button, kvList, page, PageHeader, row, stack, table, text } from "./ui";
import { ago, errorMessage, money, shortDate, waiting } from "./format";
import { listingLabel, type ListingStatus } from "./labels";

type Kind = "service" | "job";

/** One row shape for both services and job posts. */
interface Listing {
  id: number; kind: Kind; title: string; status: ListingStatus; submitted: string;
  owner: { id: number | null; name: string; avatar: string | null; sub: string | null };
  /** "Web Development › Podcast editing" when the owner typed their own label, else the category name. */
  category: string | null; categoryId: number | null; label: string | null;
  price?: number; budget?: string; tiers?: number; delivery?: string; proposals?: number; deadline?: string;
  cover: string | null; reason: string | null; description: string | null;
  /** Everything the owner uploaded, the cover included. */
  media: { id: number; url: string; type: string; name: string }[];
  packages?: { id: number; title: string; price: number; delivery: string; revisions: string; description: string | null }[];
  faqs?: { question: string; answer: string }[]; tags?: string[]; location?: string | null; skills?: string[];
  custom?: { minBudget: number | null; hourlyRate: number | null; instructions: string | null } | null;
  /** The public page as buyers see it. The API lets an admin open it before the listing is live. */
  href: string;
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
const days = (d: string) => `${d}${/^\d+$/.test(d) ? " days" : ""}`;
function fromService(s: Service): Listing {
  const u = s.freelancer_profile?.user;
  const opts = (s.pricing_options ?? []).map((p) => ({ price: Number(p.price_raw), delivery: String(p.delivery_time) })).filter((p) => p.price > 0).sort((a, b) => a.price - b.price);
  return {
    id: s.id, kind: "service", title: s.title, status: serviceStatus(s.status), submitted: s.updated_at ?? s.created_at,
    owner: { id: u?.id ?? null, name: u?.name ?? "Unknown", avatar: u?.avatar_url ?? null, sub: s.freelancer_profile?.tagline ?? u?.email ?? null },
    category: s.category ? categoryLine(s.category, s.category_label) : null, categoryId: s.category_id, label: s.category_label ?? null,
    price: opts[0]?.price, tiers: s.pricing_options?.length ?? 0, delivery: opts[0]?.delivery ? days(opts[0].delivery) : undefined,
    cover: s.feature_image?.file_url ?? s.media?.find((m) => m.file_type === "image")?.file_url ?? null, reason: s.rejection_reason ?? null, description: s.description,
    media: (s.media ?? []).map((m) => ({ id: m.id, url: m.file_url, type: m.file_type, name: m.file_name })),
    packages: (s.pricing_options ?? []).map((p) => ({ id: p.id, title: p.title, price: Number(p.price_raw), delivery: days(String(p.delivery_time)), revisions: String(p.revisions), description: p.description })).sort((a, b) => a.price - b.price),
    faqs: (s.faqs ?? []).filter((f) => f.question?.trim() || f.answer?.trim()), tags: (s.search_tags ?? []).filter((t) => t.trim()), location: s.location,
    custom: s.custom_orders_enabled ? { minBudget: s.custom_min_budget ?? null, hourlyRate: s.custom_hourly_rate ?? null, instructions: s.custom_instructions ?? null } : null,
    href: `/explore-services/${s.id}`,
  };
}
function fromJob(j: JobPost): Listing {
  const u = j.client_profile?.user;
  const min = Number(j.budget_min), max = Number(j.budget_max);
  return {
    id: j.id, kind: "job", title: j.title, status: jobStatus(j.status), submitted: j.updated_at ?? j.created_at,
    owner: { id: u?.id ?? null, name: j.client_profile?.company_name || u?.name || "Unknown", avatar: u?.avatar_url ?? null, sub: j.client_profile?.company_name ? u?.name ?? null : u?.email ?? null },
    category: j.category ? categoryLine(j.category, j.category_label) : null, categoryId: j.category_id ?? j.category?.id ?? null, label: j.category_label ?? null,
    budget: min && max && min !== max ? `${money(min)} – ${money(max)}` : money(max || min), proposals: j.proposal_count, deadline: j.deadline,
    cover: j.media?.find((m) => m.file_type === "image")?.file_url ?? null, reason: j.rejection_reason ?? null, description: j.description,
    media: (j.media ?? []).map((m) => ({ id: m.id, url: m.file_url, type: m.file_type, name: m.file_name })),
    skills: (j.skills ?? []).map((k) => k.expertise_name), href: `/jobs/${j.id}`,
  };
}

const cover = css({ w: "44px", h: "32px", borderRadius: "7px", flexShrink: 0, objectFit: "cover", display: "block", "&[data-lg=true]": { w: "100%", h: "180px", borderRadius: "12px" } });
const linkBtn = css({ bg: "none", border: "none", p: 0, cursor: "pointer", textStyle: "meta", fontWeight: 600, color: "var(--td-accent)", _hover: { textDecoration: "underline" } });
const desc = css({ textStyle: "ui", color: "var(--td-ink-2)", whiteSpace: "pre-wrap", "& p": { margin: "0 0 8px" }, "& ul, & ol": { paddingLeft: "18px", margin: "0 0 8px" } });
const gallery = css({ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" });
const galleryTile = css({ display: "block", aspectRatio: "4 / 3", borderRadius: "10px", overflow: "hidden", border: "1px solid var(--td-line)", "& img": { w: "100%", h: "100%", objectFit: "cover", display: "block" } });
const galleryVideo = css({ gridColumn: "1 / -1", w: "100%", maxH: "260px", borderRadius: "10px", bg: "black", display: "block" });
const fileChip = css({ display: "inline-flex", alignItems: "center", gap: "6px", h: "26px", px: "8px", borderRadius: "7px", bg: "var(--td-hover)", textStyle: "meta", fontWeight: 500, color: "var(--td-ink-2) !important", maxW: "100%", "& span": { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, _hover: { bg: "var(--td-line)" } });
const boxed = css({ p: "12px", borderRadius: "10px", border: "1px solid var(--td-line)" });
const sectionHead = cx(text({ size: "meta", weight: 600, tone: 2 }), css({ mb: "6px" }));

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div><p className={sectionHead}>{title}</p>{children}</div>;
}

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
  const [assign, setAssign] = useState<{ id: number; thenApprove: boolean; categoryId: string } | null>(null);
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
  const openAssign = (l: Listing, thenApprove: boolean) => setAssign({ id: l.id, thenApprove, categoryId: "" });

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
  const confirmAssign = async () => {
    if (!assign) return;
    const l = rows.find((x) => x.id === assign.id); if (!l) return;
    const categoryId = Number(assign.categoryId);
    const name = cats.find((c) => c.id === categoryId)?.category_name;
    if (!categoryId) return;
    setBusyId(l.id);
    try {
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
      <PageHeader title="Listings" description="Services and job posts go live after a review. A listing filed with the owner's own words can be sorted here one at a time, or by label in Catalog." />
      <div className={css({ mb: "16px" })}>
        <Tabs value={kind} onChange={changeKind} items={[{ value: "service", label: `Services${pendingServices != null ? ` (${pendingServices} to review)` : ""}` }, { value: "job", label: `Job posts${pendingJobs != null ? ` (${pendingJobs} to review)` : ""}` }]} />
      </div>
      <div className={cx(row({ between: true }), css({ mb: "14px" }))}>
        <Segmented value={status} onChange={changeStatus} items={statusItems} />
        {status === "pending" && rows.length ? <span className={text({ size: "meta", tone: 3 })}>Oldest first</span> : null}
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
                        <p className={text({ size: "meta", tone: 3 })}>{l.owner.name}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    {l.category ? (
                      <div className={cx(stack({ gap: 1 }), css({ alignItems: "flex-start" }))}>
                        <Pill outline>{l.category}</Pill>
                        {l.label ? <button className={linkBtn} onClick={(e) => { e.stopPropagation(); openAssign(l, false); }}>Owner&apos;s own words · file under…</button> : null}
                      </div>
                    ) : (
                      <button className={linkBtn} onClick={(e) => { e.stopPropagation(); openAssign(l, false); }}>Assign category</button>
                    )}
                  </td>
                  <td className="num"><span className={text({ weight: 600, mono: true })}>{l.price != null ? money(l.price) : l.budget ?? "—"}</span></td>
                  <td>{status === "pending" ? <><p className={text({ weight: 500 })}>{waiting(l.submitted)}</p><p className={text({ size: "meta", tone: 3 })}>{ago(l.submitted)}</p></> : <p className={text({ tone: 2 })}>{ago(l.submitted)}</p>}</td>
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
            {current.media.length > 1 || current.media.some((m) => m.type !== "image") ? (
              <Section title={`Everything uploaded (${current.media.length})`}>
                <div className={gallery}>
                  {current.media.filter((m) => m.type === "image").map((m) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <a key={m.id} href={m.url} target="_blank" rel="noreferrer" className={galleryTile} title="Open full size"><img src={m.url} alt={m.name} /></a>
                  ))}
                  {current.media.filter((m) => m.type === "video").map((m) => <video key={m.id} src={m.url} controls preload="metadata" className={galleryVideo} />)}
                </div>
                {current.media.some((m) => m.type !== "image" && m.type !== "video") ? (
                  <div className={cx(row({ gap: 2, wrap: true }), css({ mt: "8px" }))}>
                    {current.media.filter((m) => m.type !== "image" && m.type !== "video").map((m) => (
                      <a key={m.id} href={m.url} target="_blank" rel="noreferrer" className={fileChip}><Paperclip size={12} /> <span>{m.name}</span></a>
                    ))}
                  </div>
                ) : null}
              </Section>
            ) : null}
            <div className={row({ gap: 2, between: true })}>
              <div className={row({ gap: 2 })}>
                <Pill tone={listingLabel[current.status].tone} dot>{listingLabel[current.status].label}</Pill>
                {current.category ? <Pill outline>{current.category}</Pill> : <Pill tone="amber">No category</Pill>}
              </div>
              <a href={current.href} target="_blank" rel="noreferrer" className={button({ variant: "secondary", size: "sm" })}><ExternalLink size={14} /> Open full preview</a>
            </div>
            {current.reason ? <div className={cx(text({ size: "meta" }), css({ p: "12px", bg: "var(--td-red-soft)", color: "var(--td-red)", borderRadius: "10px" }))}>{current.reason}</div> : null}
            <Link href={current.owner.id ? `/admin/people/${current.owner.id}` : "#"} className={cx(row({ gap: 3 }), css({ p: "12px", borderRadius: "10px", border: "1px solid var(--td-line)", _hover: { bg: "var(--td-surface-2)" } }))}>
              <Avatar name={current.owner.name} seed={current.owner.id ?? current.id} src={current.owner.avatar} />
              <div className={css({ minW: 0 })}>
                <p className={text({ weight: 600 })}>{current.owner.name}</p>
                {current.owner.sub ? <p className={text({ size: "meta", tone: 3, truncate: true })}>{current.owner.sub}</p> : null}
              </div>
            </Link>
            <dl className={kvList}>
              {current.kind === "service" ? (
                <><dt>Starting at</dt><dd className={text({ mono: true })}>{current.price != null ? money(current.price) : "—"}</dd><dt>Packages</dt><dd>{current.tiers} {current.tiers === 1 ? "tier" : "tiers"}</dd><dt>Delivery</dt><dd>{current.delivery ?? "—"}</dd></>
              ) : (
                <><dt>Budget</dt><dd>{current.budget}</dd><dt>Deadline</dt><dd>{current.deadline ? shortDate(current.deadline) : "—"}</dd><dt>Proposals</dt><dd>{current.status === "live" ? `${current.proposals ?? 0} received` : "Not open yet"}</dd></>
              )}
              {current.label ? <><dt>Owner wrote</dt><dd>{current.label}</dd></> : null}
              {current.location ? <><dt>Location</dt><dd>{current.location}</dd></> : null}
            </dl>
            {current.packages?.length ? (
              <Section title="Packages">
                <div className={stack({ gap: 2 })}>
                  {current.packages.map((p) => (
                    <div key={p.id} className={boxed}>
                      <div className={row({ gap: 2, between: true })}>
                        <p className={text({ weight: 600 })}>{p.title}</p>
                        <p className={text({ weight: 600, mono: true })}>{money(p.price)}</p>
                      </div>
                      <p className={text({ size: "meta", tone: 3 })}>Delivery {p.delivery} · Revisions {p.revisions}</p>
                      {p.description ? <RichTextDisplay value={p.description} className={cx(desc, css({ mt: "8px" }))} /> : null}
                    </div>
                  ))}
                </div>
              </Section>
            ) : null}
            <Section title="Description">
              {current.description ? <RichTextDisplay value={current.description} className={desc} /> : <p className={text({ size: "meta", tone: 3 })}>No description.</p>}
            </Section>
            {current.faqs?.length ? (
              <Section title="FAQs">
                <div className={stack({ gap: 2 })}>
                  {current.faqs.map((f, i) => (
                    <div key={i} className={boxed}>
                      <p className={text({ weight: 600 })}>{f.question}</p>
                      <p className={cx(desc, css({ mt: "4px" }))}>{f.answer}</p>
                    </div>
                  ))}
                </div>
              </Section>
            ) : null}
            {current.custom ? (
              <Section title="Custom orders">
                <dl className={kvList}>
                  <dt>Minimum budget</dt><dd className={text({ mono: true })}>{current.custom.minBudget != null ? money(current.custom.minBudget) : "—"}</dd>
                  <dt>Hourly rate</dt><dd className={text({ mono: true })}>{current.custom.hourlyRate != null ? money(current.custom.hourlyRate) : "—"}</dd>
                  {current.custom.instructions ? <><dt>Instructions</dt><dd>{current.custom.instructions}</dd></> : null}
                </dl>
              </Section>
            ) : null}
            {current.tags?.length ? <Section title="Search tags"><div className={row({ gap: 2, wrap: true })}>{current.tags.map((t) => <Pill key={t} outline>{t}</Pill>)}</div></Section> : null}
            {current.skills?.length ? <Section title="Skills wanted"><div className={row({ gap: 2, wrap: true })}>{current.skills.map((k) => <Pill key={k} outline>{k}</Pill>)}</div></Section> : null}
            {!current.category || current.label ? <Btn onClick={() => openAssign(current, false)}><Tag size={14} /> {current.label ? "File under a subcategory" : "Assign a category"}</Btn> : null}
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

      <Modal open={!!assign} onClose={() => setAssign(null)} title={assign?.thenApprove ? "Pick a category, then publish" : "File under a subcategory"} description="The owner is told where it went. To turn their words into a new subcategory, use Catalog." size="sm"
        footer={<><Btn variant="ghost" onClick={() => setAssign(null)}>Cancel</Btn><Btn variant="primary" disabled={!assign?.categoryId || busyId != null} onClick={confirmAssign}>{busyId != null ? "Saving…" : assign?.thenApprove ? "Save and publish" : "Save"}</Btn></>}>
        {assign ? (
          <div className={stack({ gap: 4 })}>
            {rows.find((l) => l.id === assign.id)?.label ? <p className={text({ size: "meta", tone: 2 })}>Owner wrote: <b>{rows.find((l) => l.id === assign.id)?.label}</b></p> : null}
            <Field label="Subcategory">
              <Select autoFocus value={assign.categoryId} onChange={(e) => setAssign({ ...assign, categoryId: e.target.value })}>
                <option value="">Choose…</option>
                {parents.filter((p) => !p.is_catch_all).map((p) => (
                  <optgroup key={p.id} label={p.category_name}>{cats.filter((c) => c.parent_id === p.id && c.is_active).map((c) => <option key={c.id} value={c.id}>{c.category_name}</option>)}</optgroup>
                ))}
              </Select>
            </Field>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
