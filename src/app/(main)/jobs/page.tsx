"use client";

import { useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { SlidersHorizontal, Search, X } from "lucide-react";
import { css, cx } from "styled-system/css";
import { Alert, Pager, Skeleton } from "@/components/ds";
import { BottomSheet } from "@/components/ds/BottomSheet";
import { api } from "@/lib/api";
import { qk } from "@/lib/queryKeys";
import { useMarketplaceLive } from "@/hooks/useMarketplaceLive";
import { JobPostFilters } from "@/types/job";
import JobCard from "@/components/jobs/JobCard";
import JobFilters from "@/components/jobs/JobFilters";

/* ── static styles ── */
const pageRoot = css({ minH: "100vh", bg: "canvas" });
const container = css({
  w: "100%", boxSizing: "border-box", maxW: "1180px", mx: "auto",
  px: { base: "16px", sm: "24px" }, py: { base: "24px", md: "32px" },
});
const errorAlert = css({ mb: "24px" });
const retryBtn = css({
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  boxSizing: "border-box", m: 0, p: "4px 5px", minW: "64px", border: "none", borderRadius: "4px",
  bg: "transparent", color: "inherit", textStyle: "ui", fontWeight: 500, cursor: "pointer", transition: "background-color .25s",
  _hover: { bg: "rgba(0,0,0,0.06)" },
  _focusVisible: { outline: "none", boxShadow: "focusRing" },
});
const column = css({ display: "flex", flexDirection: "column", gap: "24px" });
const header = css({ display: "flex", flexDirection: "column", gap: { base: "14px", md: "18px" } });
const pageTitle = css({ textStyle: "stat", fontWeight: 600 });
const pageSub = css({ textStyle: "body", color: "ink2", maxW: "560px" });
const countRow = css({ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" });
const countText = css({ textStyle: "ui", fontWeight: 500, color: "ink2" });
const countStrong = css({ color: "ink", fontWeight: 600 });
const filtersBtn = css({
  display: { base: "inline-flex", md: "none" }, alignItems: "center", justifyContent: "center", gap: "8px",
  boxSizing: "border-box", m: 0, h: "40px", px: "14px", minW: "64px",
  borderWidth: "1px", borderStyle: "solid", borderColor: "hairlineStrong", borderRadius: "input",
  bg: "surface", color: "ink", textStyle: "ui", fontWeight: 500, cursor: "pointer", transition: "background-color .25s",
  _hover: { bg: "surface2" },
  _focusVisible: { outline: "none", boxShadow: "focusRing" },
  "& svg": { flexShrink: 0 },
});
const boardGrid = css({
  display: "grid",
  gridTemplateColumns: { base: "1fr", md: "280px minmax(0,1fr)" },
  gap: "24px",
  alignItems: "start",
});
const sidebar = css({
  display: { base: "none", md: "block" },
  position: "sticky", top: "24px",
  bg: "surface", borderWidth: "1px", borderStyle: "solid", borderColor: "hairline", borderRadius: "card",
  p: "22px",
});
const cardList = css({ display: "flex", flexDirection: "column", gap: "14px" });
const pagerRow = css({ display: "flex", justifyContent: "center", mt: "24px" });

const skeletonCard = css({
  bg: "surface", borderWidth: "1px", borderStyle: "solid", borderColor: "hairline", borderRadius: "card",
  p: "24px", display: "flex", flexDirection: "column", gap: "14px",
});
const skelTopRow = css({ display: "flex", justifyContent: "space-between" });
const skelChipRow = css({ display: "flex", gap: "7px" });
const skelFooterRow = css({ display: "flex", gap: "18px" });
const skelHairline = css({ h: "1px", bg: "hairline" });
const roundedSkel = css({ borderRadius: "4px" });
const pillSkel = css({ borderRadius: "pill" });

const emptyCard = css({
  bg: "surface", borderWidth: "1px", borderStyle: "solid", borderColor: "hairline", borderRadius: "card",
  p: { base: "48px", md: "72px" },
  display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "16px",
});
const emptyIconWrap = css({
  w: "76px", h: "76px", borderRadius: "50%", bg: "canvas",
  borderWidth: "1px", borderStyle: "solid", borderColor: "hairline",
  display: "flex", alignItems: "center", justifyContent: "center", color: "ink3",
});
const emptyTextWrap = css({ maxW: "380px" });
const emptyTitle = css({ textStyle: "title", fontWeight: 600 });
const emptyBody = css({ textStyle: "body", color: "ink2" });
const pillBtn = css({
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  boxSizing: "border-box", m: 0, h: "38px", px: "16px", minW: "64px", border: "none", borderRadius: "pill",
  bg: "rgba(0,0,0,0.05)", color: "#000", textStyle: "ui", fontWeight: 500, cursor: "pointer", transition: "background-color .25s",
  _hover: { bg: "rgba(0,0,0,0.1)" },
  _focusVisible: { outline: "none", boxShadow: "focusRing" },
});

/* ── mobile filter sheet ── */
const sheetHead = css({
  display: "flex", justifyContent: "space-between", alignItems: "center",
  p: "16px 18px", borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "hairline",
  flex: "none",
});
const sheetTitle = css({ textStyle: "lead", fontWeight: 600 });
const sheetClose = css({
  w: "34px", h: "34px", p: 0, m: 0, borderRadius: "50%", border: "none",
  bg: "rgba(0,0,0,0.05)", color: "ink2", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flex: "none",
  _focusVisible: { outline: "none", boxShadow: "focusRing" },
  "& svg": { display: "block" },
});
const sheetBody = css({ p: "18px", overflowY: "auto" });
const sheetFoot = css({
  display: "flex", gap: "10px", p: "14px 18px",
  borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "hairline",
  flex: "none",
});
const sheetBtn = css({
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  boxSizing: "border-box", m: 0, w: "100%", h: "44px", minW: "64px", border: "none", borderRadius: "pill",
  textStyle: "body", fontWeight: 500, cursor: "pointer", transition: "background-color .25s",
  _focusVisible: { outline: "none", boxShadow: "focusRing" },
});
const sheetClear = css({ bg: "rgba(0,0,0,0.05)", color: "#000" });
const sheetApply = css({ bg: "#000", color: "#fff", _hover: { bg: "rgba(0,0,0,0.8)" } });

function JobCardSkeleton() {
  return (
    <div className={skeletonCard}>
      <div className={skelTopRow}><Skeleton variant="rect" width={150} height={20} className={roundedSkel} /><Skeleton variant="text" width={90} height={24} /></div>
      <Skeleton variant="text" width="62%" height={26} />
      <Skeleton variant="text" width="100%" /><Skeleton variant="text" width="80%" />
      <div className={skelChipRow}>{[70, 88, 64].map((w, i) => <Skeleton key={i} variant="rect" width={w} height={28} className={pillSkel} />)}</div>
      <div className={skelHairline} />
      <div className={skelFooterRow}>{[110, 90, 100].map((w, i) => <Skeleton key={i} variant="text" width={w} />)}</div>
    </div>
  );
}

function EmptyBoard({ onClear }: { onClear: () => void }) {
  return (
    <div className={emptyCard}>
      <div className={emptyIconWrap}>
        <Search size={30} />
      </div>
      <div className={emptyTextWrap}>
        <p className={emptyTitle}>No jobs match your filters</p>
        <p className={emptyBody}>Try widening your budget range, removing a skill, or choosing a different category.</p>
      </div>
      <button type="button" onClick={onClear} className={pillBtn}>Clear all filters</button>
    </div>
  );
}

export default function JobBoardPage() {
  const [filters, setFilters] = useState<JobPostFilters>({ page: 1 });
  const [sheet, setSheet] = useState(false);

  useMarketplaceLive("job");

  const { data: refData } = useQuery({
    queryKey: ["job-reference-data"],
    queryFn: async () => {
      const [categories, expertises] = await Promise.all([api.getCategoryTree(), api.getExpertises()]);
      return { categories, expertises };
    },
    staleTime: 5 * 60_000,
  });
  const categories = refData?.categories ?? [];
  const expertises = refData?.expertises ?? [];

  const { data: jobsResp, isLoading, error, refetch } = useQuery({
    queryKey: qk.jobs.explore(filters as Record<string, unknown>),
    queryFn: () => api.getJobPosts(filters),
    placeholderData: keepPreviousData,
  });
  const jobs = jobsResp?.data ?? [];
  const lastPage = jobsResp?.meta?.last_page ?? 1;
  const total = jobsResp?.meta?.total ?? jobs.length;
  const errMsg = error ? (error instanceof Error ? error.message : "Failed to load jobs.") : null;

  const clear = () => setFilters({ page: 1 });
  const activeCount = (filters.category_id ? 1 : 0) + (filters.budget_min || filters.budget_max ? 1 : 0) + (filters.skill_ids?.length ?? 0);

  const results = isLoading ? (
    <div className={cardList}>{[0, 1, 2, 3].map(i => <JobCardSkeleton key={i} />)}</div>
  ) : jobs.length === 0 ? (
    <EmptyBoard onClear={clear} />
  ) : (
    <div className={cardList}>
      {jobs.map(j => <JobCard key={j.id} job={j} />)}
      {lastPage > 1 && (
        <div className={pagerRow}>
          <Pager count={lastPage} page={filters.page ?? 1} onChange={(p) => { setFilters(f => ({ ...f, page: p })); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
        </div>
      )}
    </div>
  );

  const header_ = (
    <div className={header}>
      <div>
        <p className={pageTitle}>Job Board</p>
        <p className={pageSub}>
          Browse open projects from clients across Cambodia. Find work that fits, then submit a proposal.
        </p>
      </div>
      <div className={countRow}>
        <p className={countText}>
          {isLoading ? "Loading jobs…" : <><span className={countStrong}>{total}</span> {total === 1 ? "job" : "jobs"} found</>}
        </p>
        <button type="button" onClick={() => setSheet(true)} className={filtersBtn}>
          <SlidersHorizontal size={16} />
          Filters{activeCount > 0 ? ` · ${activeCount}` : ""}
        </button>
      </div>
    </div>
  );

  return (
    <div className={pageRoot}>
      <div className={container}>
        {errMsg && (
          <Alert tone="error" className={errorAlert} action={<button type="button" className={retryBtn} onClick={() => refetch()}>Retry</button>}>{errMsg}</Alert>
        )}

        <div className={column}>
          {header_}
          <div className={boardGrid}>
            <div className={sidebar}>
              <JobFilters categories={categories} expertises={expertises} filters={filters} onChange={setFilters} />
            </div>
            {results}
          </div>
        </div>
      </div>

      {/* Mobile filter sheet */}
      <BottomSheet open={sheet} onOpenChange={(o) => setSheet(o)} maxH="88%">
        <div className={sheetHead}>
          <p className={sheetTitle}>Filters</p>
          <button type="button" onClick={() => setSheet(false)} aria-label="Close filters" className={sheetClose}>
            <X size={17} />
          </button>
        </div>
        <div className={sheetBody}>
          <JobFilters categories={categories} expertises={expertises} filters={filters} onChange={setFilters} />
        </div>
        <div className={sheetFoot}>
          <button type="button" onClick={clear} className={cx(sheetBtn, sheetClear)}>Clear all</button>
          <button type="button" onClick={() => setSheet(false)} className={cx(sheetBtn, sheetApply)}>Show {total} jobs</button>
        </div>
      </BottomSheet>
    </div>
  );
}
