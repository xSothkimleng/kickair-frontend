"use client";

import { useState } from "react";
import Link from "next/link";
import { css, cx } from "styled-system/css";
import { History } from "lucide-react";
import type { AdminActivityEntry } from "@/lib/api";
import { useActivity } from "./queries";
import { Avatar, EmptyState, ErrorState, Loading, Pager, Panel, Pill, Select, page, PageHeader, row, table, text } from "./ui";
import { ago, dateTime } from "./format";
import { areaLabel } from "./labels";

/** Where a log row opens: the person, dispute or order it names, else its section of the console. */
function entryHref(e: AdminActivityEntry): string {
  if (e.subject_id) {
    if (e.subject_type === "user") return `/admin/people/${e.subject_id}`;
    if (e.subject_type === "dispute") return `/admin/disputes/${e.subject_id}`;
    if (e.subject_type === "order") return `/admin/orders/${e.subject_id}`;
  }
  return (areaLabel[e.area] ?? areaLabel.other!).href;
}

export default function ActivityPage() {
  const [area, setArea] = useState("");
  const [pageNo, setPageNo] = useState(1);
  const activity = useActivity(area, pageNo);
  const rows = activity.data?.data ?? [];

  return (
    <div className={page}>
      <PageHeader title="Activity" description="Every change made from this console: who did it, when, and to what. Entries are written automatically and cannot be edited." />
      <div className={cx(row({ between: true }), css({ mb: "14px" }))}>
        <div className={row({ gap: 2 })}>
          <span className={text({ size: "meta", tone: 2 })}>Section</span>
          <Select value={area} onChange={(e) => { setArea(e.target.value); setPageNo(1); }} className={css({ w: "180px" })}>
            <option value="">All sections</option>
            {Object.keys(areaLabel).filter((a) => a !== "other").map((a) => <option key={a} value={a}>{areaLabel[a]!.label}</option>)}
          </Select>
        </div>
        {activity.data ? <span className={text({ size: "meta", tone: 3 })}>{activity.data.meta.total.toLocaleString("en-US")} {activity.data.meta.total === 1 ? "entry" : "entries"}</span> : null}
      </div>

      <Panel>
        {activity.isLoading ? <Loading /> : activity.isError ? <ErrorState onRetry={() => activity.refetch()} /> : rows.length === 0 ? <EmptyState icon={<History size={20} />} title="Nothing recorded yet" body="Approvals, rejections, payouts, bans and dispute decisions appear here as they happen." /> : (
          <table className={table}>
            <thead><tr><th>When</th><th>Admin</th><th>What happened</th><th>Section</th></tr></thead>
            <tbody>
              {rows.map((e) => {
                const a = areaLabel[e.area] ?? areaLabel.other!;
                return (
                  <tr key={e.id}>
                    <td className={css({ whiteSpace: "nowrap" })}><p className={text({ weight: 500 })}>{dateTime(e.created_at)}</p><p className={text({ size: "micro", tone: 3 })}>{ago(e.created_at)}</p></td>
                    <td><span className={cx(row({ gap: 2 }), css({ whiteSpace: "nowrap" }))}><Avatar name={e.admin.name} size="xs" seed={e.admin.id ?? 0} /> {e.admin.name}</span></td>
                    <td><Link href={entryHref(e)} className={css({ _hover: { textDecoration: "underline" } })}>{e.summary}</Link></td>
                    <td><Pill tone={a.tone}>{a.label}</Pill></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        <Pager meta={activity.data?.meta} onPage={setPageNo} noun="entries" />
      </Panel>
    </div>
  );
}
