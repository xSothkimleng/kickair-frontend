"use client";

import { useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { FileText, Sparkles } from "lucide-react";
import { css, cva, cx } from "styled-system/css";
import { Pager, Spinner } from "@/components/ds";
import { qk } from "@/lib/queryKeys";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { ProposalStatus } from "@/types/job";

type Filter = "all" | ProposalStatus;

const STATUS_CLASS: Record<ProposalStatus, string> = {
  pending: css({ bg: "rgba(234,88,12,0.1)", color: "pendingText" }),
  accepted: css({ bg: "rgba(22,163,74,0.1)", color: "successText" }),
  rejected: css({ bg: "rgba(239,68,68,0.1)", color: "errorText" }),
  withdrawn: css({ bg: "rgba(0,0,0,0.06)", color: "rgba(0,0,0,0.5)" }),
};

function statusLabel(status: ProposalStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatCurrency(value: string) {
  const num = parseFloat(value);
  if (isNaN(num)) return value;
  return num.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
  { value: "withdrawn", label: "Withdrawn" },
];

/* ── static styles ── */
const page = css({ display: "flex", flexDirection: "column", gap: "24px" });
const pageTitle = css({ lineHeight: 1.5, fontSize: "28px", fontWeight: 600, color: "ink" });
const pageSub = css({ lineHeight: 1.5, fontSize: "13px", color: "ink2" });
const filterRow = css({ display: "flex", gap: "8px", flexWrap: "wrap" });
const filterPill = cva({
  base: {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    boxSizing: "border-box", m: 0, px: "16px", h: "32px", minW: "64px",
    border: "none", borderRadius: "40px",
    fontFamily: "inherit", fontSize: "12px", fontWeight: 500, lineHeight: 1.75,
    cursor: "pointer", transition: "background-color .25s, color .25s",
    _focusVisible: { outline: "none", boxShadow: "focusRing" },
  },
  variants: {
    active: {
      true: { bg: "ink", color: "white", _hover: { bg: "ink" } },
      false: { bg: "rgba(0,0,0,0.05)", color: "ink2", _hover: { bg: "rgba(0,0,0,0.1)" } },
    },
  },
});
const panel = css({
  bg: "surface", borderRadius: "card",
  borderWidth: "1px", borderStyle: "solid", borderColor: "hairline",
  p: "24px",
});
const centreBlock = css({ textAlign: "center", py: "48px" });
const errorText = css({ lineHeight: 1.5, fontSize: "13px", color: "rgba(239,68,68,0.8)" });
const retryBtn = css({
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  boxSizing: "border-box", m: 0, p: "6px 8px", minW: "64px", border: "none", borderRadius: "4px",
  bg: "transparent", color: "ink", fontFamily: "inherit", fontSize: "12px", fontWeight: 500, lineHeight: 1.75,
  cursor: "pointer", transition: "background-color .25s",
  _hover: { bg: "rgba(0, 0, 0, 0.04)" },
  _focusVisible: { outline: "none", boxShadow: "focusRing" },
});
const emptyIcon = css({ display: "inline-block", color: "rgba(0,0,0,0.2)", mb: "16px" });
const emptyText = css({ lineHeight: 1.5, fontSize: "13px", color: "ink2" });
const cardList = css({ display: "flex", flexDirection: "column", gap: "12px" });
const proposalCard = css({
  display: "block", w: "100%", boxSizing: "border-box", m: 0, p: "20px", textAlign: "left",
  borderRadius: "cardSm",
  borderWidth: "1px", borderStyle: "solid", borderColor: "rgba(0,0,0,0.07)",
  bg: "surface", fontFamily: "inherit", cursor: "pointer",
  transition: "border-color .15s, box-shadow .15s, background-color .15s",
  _hover: {
    borderColor: "rgba(0,0,0,0.2)",
    bg: "rgba(0,0,0,0.02)",
    boxShadow: "0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)",
  },
  _focusVisible: { outline: "none", boxShadow: "focusRing" },
});
const cardRow = css({ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" });
const cardMain = css({ display: "flex", gap: "12px", alignItems: "flex-start", flex: 1, minW: 0 });
const avatarBox = css({
  w: "36px", h: "36px", mt: "2px", flexShrink: 0, borderRadius: "50%",
  bg: "rgba(0,113,227,0.1)", color: "accent",
  display: "flex", alignItems: "center", justifyContent: "center",
});
const cardText = css({ flex: 1, minW: 0 });
const titleRow = css({ display: "flex", alignItems: "center", gap: "8px", mb: "2px" });
const jobTitle = css({ lineHeight: 1.5, fontSize: "14px", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", minW: 0 });
const updatedChip = css({
  display: "inline-flex", alignItems: "center", gap: "4px", flexShrink: 0,
  h: "20px", px: "8px", borderRadius: "pill",
  fontSize: "10px", bg: "rgba(37,99,235,0.1)", color: "#1e40af",
});
const submitted = css({ lineHeight: 1.5, fontSize: "12px", color: "ink2" });
const cardAside = css({ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px", flexShrink: 0 });
const priceText = css({ lineHeight: 1.5, fontSize: "14px", fontWeight: 600, color: "successText" });
const statusChip = css({ display: "inline-flex", alignItems: "center", h: "22px", px: "8px", borderRadius: "pill", fontSize: "11px" });
const pagerRow = css({ display: "flex", justifyContent: "center", mt: "24px" });

export default function ProposalsContent() {
  const router = useRouter();
  const [page_, setPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState<Filter>("all");

  const { data, isLoading: loading, error: queryError, refetch } = useQuery({
    queryKey: qk.proposals.list({ page: page_ }),
    queryFn: () => api.getFreelancerProposals(page_),
    placeholderData: keepPreviousData,
  });
  const proposals = data?.data ?? [];
  const lastPage = data?.meta?.last_page ?? 1;
  const error = queryError ? (queryError instanceof Error ? queryError.message : "Failed to fetch proposals.") : null;
  const fetchProposals = () => refetch();

  const filtered =
    activeFilter === "all" ? proposals : proposals.filter(p => p.status === activeFilter);

  return (
    <div className={page}>
      {/* Header */}
      <div>
        <p className={pageTitle}>My Proposals</p>
        <p className={pageSub}>
          Track all your submitted proposals
        </p>
      </div>

      {/* Filter pills */}
      <div className={filterRow}>
        {FILTERS.map(f => (
          <button
            key={f.value}
            type="button"
            onClick={() => setActiveFilter(f.value)}
            className={filterPill({ active: activeFilter === f.value })}>
            {f.label}
          </button>
        ))}
      </div>

      <div className={panel}>
        {loading ? (
          <div className={centreBlock}>
            <Spinner size={32} className={css({ color: "rgba(0,0,0,0.4)" })} />
          </div>
        ) : error ? (
          <div className={centreBlock}>
            <p className={errorText}>{error}</p>
            <button type="button" onClick={() => fetchProposals()} className={retryBtn}>
              Try again
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className={centreBlock}>
            <FileText size={48} className={emptyIcon} />
            <p className={emptyText}>
              {activeFilter === "all" ? "No proposals yet" : `No ${activeFilter} proposals`}
            </p>
          </div>
        ) : (
          <div className={cardList}>
            {filtered.map(proposal => (
              <button
                key={proposal.id}
                type="button"
                onClick={() => router.push(`/proposals/${proposal.id}`)}
                className={proposalCard}>
                <div className={cardRow}>
                  <div className={cardMain}>
                    <span className={avatarBox}>
                      <FileText size={18} />
                    </span>
                    <div className={cardText}>
                      <div className={titleRow}>
                        <p className={jobTitle}>
                          {proposal.job_post?.title ?? "Job Post"}
                        </p>
                        {proposal.is_updated && (
                          <span className={updatedChip}>
                            <Sparkles size={12} />
                            Updated
                          </span>
                        )}
                      </div>
                      <p className={submitted}>
                        Submitted {formatDate(proposal.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className={cardAside}>
                    <p className={priceText}>
                      {formatCurrency(proposal.price)}
                    </p>
                    <span className={cx(statusChip, STATUS_CLASS[proposal.status])}>
                      {statusLabel(proposal.status)}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {lastPage > 1 && !loading && (
          <div className={pagerRow}>
            <Pager count={lastPage} page={page_} onChange={(p) => setPage(p)} />
          </div>
        )}
      </div>
    </div>
  );
}
