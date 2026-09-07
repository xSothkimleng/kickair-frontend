"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { css, cx } from "styled-system/css";
import { Search, Star, Users } from "lucide-react";
import { useUsers } from "./queries";
import { Avatar, EmptyState, ErrorState, Input, Loading, Pager, Panel, Pill, Select, page, PageHeader, row, searchWrap, table, text } from "./ui";
import { shortDate } from "./format";
import { accountLabel, accountState, kycLabel, kycState, roleLabels } from "./labels";

type RoleF = "" | "freelancer" | "client" | "both";
type KycF = "" | "approved" | "pending" | "rejected" | "none";
type StatusF = "" | "active" | "suspended" | "banned";
type SortF = "joined-desc" | "joined-asc" | "name-asc" | "rating-desc";

export default function PeoplePage() {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [search, setSearch] = useState(params.get("q") ?? "");
  const [role, setRole] = useState<RoleF>("");
  const [kyc, setKyc] = useState<KycF>("");
  const [status, setStatus] = useState<StatusF>("");
  const [sort, setSort] = useState<SortF>("joined-desc");
  const [pageNo, setPageNo] = useState(1);

  // The topbar search lands here with ?q=; adopt a new value when the URL changes.
  const paramQ = params.get("q") ?? "";
  const [seenParamQ, setSeenParamQ] = useState(paramQ);
  if (paramQ !== seenParamQ) { setSeenParamQ(paramQ); setQ(paramQ); setSearch(paramQ); setPageNo(1); }
  // Debounce typing so every keystroke doesn't hit the API.
  useEffect(() => { const t = setTimeout(() => { setSearch(q.trim()); setPageNo(1); }, 300); return () => clearTimeout(t); }, [q]);

  const [sortKey, dir] = sort.split("-") as [string, "asc" | "desc"];
  const users = useUsers({ page: pageNo, search: search || undefined, role: role || undefined, kyc: kyc || undefined, status: status || undefined, sort: sortKey, dir });
  const rows = users.data?.data ?? [];
  const pick = <T,>(set: (v: T) => void) => (v: T) => { set(v); setPageNo(1); };

  return (
    <div className={page}>
      <PageHeader title="People" description="Every client and freelancer account. Open a profile to verify, email, suspend or ban." />
      <div className={cx(row({ gap: 2, wrap: true }), css({ mb: "14px" }))}>
        <div className={cx(searchWrap, css({ w: "300px" }))}>
          <Search size={15} />
          <Input placeholder="Search by name, email or phone" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Select value={role} onChange={(e) => pick(setRole)(e.target.value as RoleF)} className={css({ w: "150px" })}>
          <option value="">All roles</option><option value="freelancer">Freelancers</option><option value="client">Clients</option><option value="both">Both roles</option>
        </Select>
        <Select value={kyc} onChange={(e) => pick(setKyc)(e.target.value as KycF)} className={css({ w: "170px" })}>
          <option value="">Any verification</option><option value="approved">Verified</option><option value="pending">Awaiting review</option><option value="rejected">Rejected</option><option value="none">Not verified</option>
        </Select>
        <Select value={status} onChange={(e) => pick(setStatus)(e.target.value as StatusF)} className={css({ w: "150px" })}>
          <option value="">Any status</option><option value="active">Active</option><option value="suspended">Suspended</option><option value="banned">Banned</option>
        </Select>
        <div className={css({ ml: "auto" })} />
        <Select value={sort} onChange={(e) => pick(setSort)(e.target.value as SortF)} className={css({ w: "170px" })}>
          <option value="joined-desc">Newest first</option><option value="joined-asc">Oldest first</option><option value="name-asc">Name A–Z</option><option value="rating-desc">Top rated</option>
        </Select>
      </div>

      <Panel>
        {users.isLoading ? <Loading /> : users.isError ? <ErrorState onRetry={() => users.refetch()} /> : rows.length === 0 ? <EmptyState icon={<Users size={20} />} title="No one matches" body="Try a different name, or clear a filter." /> : (
          <table className={table}>
            <thead><tr><th>Person</th><th>Roles</th><th>Verification</th><th>Status</th><th>Track record</th><th>Joined</th></tr></thead>
            <tbody>
              {rows.map((u) => {
                const st = accountState(u);
                const k = kycState(u.kyc_status);
                return (
                  <tr key={u.id} data-clickable onClick={() => router.push(`/admin/people/${u.id}`)}>
                    <td>
                      <div className={row({ gap: 3 })}>
                        <Avatar name={u.name} size="sm" seed={u.id} src={u.avatar_url} />
                        <div className={css({ minW: 0 })}>
                          <p className={text({ weight: 600 })}>{u.name}</p>
                          <p className={text({ size: "sm", tone: 3, truncate: true })}>{[u.email, u.telephone].filter(Boolean).join(" · ") || "No contact details"}</p>
                        </div>
                      </div>
                    </td>
                    <td><span className={row({ gap: 1 })}>{roleLabels(u).map((r) => <Pill key={r} outline>{r}</Pill>)}</span></td>
                    <td>{u.is_freelancer || k !== "none" ? <Pill tone={kycLabel[k].tone}>{kycLabel[k].label}</Pill> : <span className={text({ size: "sm", tone: 3 })}>—</span>}</td>
                    <td><Pill tone={accountLabel[st].tone} dot>{accountLabel[st].label}</Pill></td>
                    <td>
                      {u.is_freelancer ? <p className={cx(row({ gap: 1 }), text({ size: "sm", tone: 2 }))}><Star size={12} /> {u.freelancer_rating ? Number(u.freelancer_rating).toFixed(1) : "—"} · {u.completed_orders ?? 0} completed</p> : <span className={text({ size: "sm", tone: 3 })}>—</span>}
                    </td>
                    <td><span className={text({ tone: 2 })}>{shortDate(u.created_at)}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        <Pager meta={users.data?.meta} onPage={setPageNo} noun="people" />
      </Panel>
    </div>
  );
}
