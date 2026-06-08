"use client";

import { useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { Box, Container, Typography, CircularProgress, Pagination, Alert, Skeleton, Drawer, Button } from "@mui/material";
import { TuneOutlined, SearchOutlined, CloseOutlined } from "@mui/icons-material";
import { api } from "@/lib/api";
import { qk } from "@/lib/queryKeys";
import { useMarketplaceLive } from "@/hooks/useMarketplaceLive";
import { JobPostFilters } from "@/types/job";
import { tokens } from "@/theme";
import JobCard from "@/components/jobs/JobCard";
import JobFilters from "@/components/jobs/JobFilters";

function JobCardSkeleton() {
  return (
    <Box sx={{ bgcolor: tokens.surface, border: `1px solid ${tokens.border}`, borderRadius: `${tokens.radius.card}px`, p: 3, display: "flex", flexDirection: "column", gap: 1.75 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between" }}><Skeleton variant="rounded" width={150} height={20} /><Skeleton variant="text" width={90} height={24} /></Box>
      <Skeleton variant="text" width="62%" height={26} />
      <Skeleton variant="text" width="100%" /><Skeleton variant="text" width="80%" />
      <Box sx={{ display: "flex", gap: 0.875 }}>{[70, 88, 64].map((w, i) => <Skeleton key={i} variant="rounded" width={w} height={28} sx={{ borderRadius: "999px" }} />)}</Box>
      <Box sx={{ height: "1px", bgcolor: tokens.border }} />
      <Box sx={{ display: "flex", gap: 2.25 }}>{[110, 90, 100].map((w, i) => <Skeleton key={i} variant="text" width={w} />)}</Box>
    </Box>
  );
}

function EmptyBoard({ onClear }: { onClear: () => void }) {
  return (
    <Box sx={{ bgcolor: tokens.surface, border: `1px solid ${tokens.border}`, borderRadius: `${tokens.radius.card}px`, p: { xs: 6, md: 9 }, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 2 }}>
      <Box sx={{ width: 76, height: 76, borderRadius: "50%", bgcolor: tokens.canvas, border: `1px solid ${tokens.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <SearchOutlined sx={{ fontSize: 30, color: tokens.text3 }} />
      </Box>
      <Box sx={{ maxWidth: 380 }}>
        <Typography sx={{ fontSize: 19, fontWeight: 600, letterSpacing: "-0.015em" }}>No jobs match your filters</Typography>
        <Typography sx={{ fontSize: 14, lineHeight: 1.55, color: tokens.text2, mt: 0.875 }}>Try widening your budget range, removing a skill, or choosing a different category.</Typography>
      </Box>
      <Button onClick={onClear} sx={{ height: 38, px: 2, borderRadius: "999px", bgcolor: "rgba(0,0,0,0.05)", color: "#000", textTransform: "none", fontSize: 13, fontWeight: 500, "&:hover": { bgcolor: "rgba(0,0,0,0.1)" } }}>Clear all filters</Button>
    </Box>
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
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.75 }}>{[0, 1, 2, 3].map(i => <JobCardSkeleton key={i} />)}</Box>
  ) : jobs.length === 0 ? (
    <EmptyBoard onClear={clear} />
  ) : (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.75 }}>
      {jobs.map(j => <JobCard key={j.id} job={j} />)}
      {lastPage > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Pagination count={lastPage} page={filters.page ?? 1} onChange={(_, p) => { setFilters(f => ({ ...f, page: p })); window.scrollTo({ top: 0, behavior: "smooth" }); }} shape="rounded" />
        </Box>
      )}
    </Box>
  );

  const header = (
    <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 1.75, md: 2.25 } }}>
      <Box>
        <Typography sx={{ fontSize: { xs: 28, md: 36 }, fontWeight: 600, letterSpacing: "-0.025em" }}>Job Board</Typography>
        <Typography sx={{ fontSize: { xs: 14, md: 15 }, color: tokens.text2, maxWidth: 560, mt: 0.75 }}>
          Browse open projects from clients across Cambodia. Find work that fits, then submit a proposal.
        </Typography>
      </Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
        <Typography sx={{ fontSize: 13.5, fontWeight: 500, color: tokens.text2 }}>
          {isLoading ? "Loading jobs…" : <><Box component="span" sx={{ color: tokens.text, fontWeight: 600 }}>{total}</Box> {total === 1 ? "job" : "jobs"} found</>}
        </Typography>
        <Button onClick={() => setSheet(true)} startIcon={<TuneOutlined sx={{ fontSize: 16 }} />}
          sx={{ display: { xs: "inline-flex", md: "none" }, height: 40, px: 1.75, borderRadius: `${tokens.radius.input}px`, border: `1px solid ${tokens.borderStrong}`, bgcolor: tokens.surface, color: tokens.text, textTransform: "none", fontSize: 13.5, fontWeight: 500 }}>
          Filters{activeCount > 0 ? ` · ${activeCount}` : ""}
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: tokens.canvas }}>
      <Container sx={{ py: { xs: 3, md: 4 }, maxWidth: "1180px !important" }}>
        {errMsg && (
          <Alert severity="error" sx={{ mb: 3 }} action={<Button color="inherit" size="small" onClick={() => refetch()}>Retry</Button>}>{errMsg}</Alert>
        )}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {header}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "280px minmax(0,1fr)" }, gap: 3, alignItems: "start" }}>
            <Box sx={{ display: { xs: "none", md: "block" }, position: "sticky", top: 24, bgcolor: tokens.surface, border: `1px solid ${tokens.border}`, borderRadius: `${tokens.radius.card}px`, p: 2.75 }}>
              <JobFilters categories={categories} expertises={expertises} filters={filters} onChange={setFilters} />
            </Box>
            {results}
          </Box>
        </Box>
      </Container>

      {/* Mobile filter sheet */}
      <Drawer anchor="bottom" open={sheet} onClose={() => setSheet(false)} PaperProps={{ sx: { borderRadius: "20px 20px 0 0", maxHeight: "88%" } }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: "16px 18px", borderBottom: `1px solid ${tokens.border}` }}>
          <Typography sx={{ fontSize: 17, fontWeight: 600 }}>Filters</Typography>
          <Box component="button" onClick={() => setSheet(false)} sx={{ width: 34, height: 34, borderRadius: "50%", border: 0, bgcolor: "rgba(0,0,0,0.05)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CloseOutlined sx={{ fontSize: 17, color: tokens.text2 }} />
          </Box>
        </Box>
        <Box sx={{ p: 2.25, overflowY: "auto" }}>
          <JobFilters categories={categories} expertises={expertises} filters={filters} onChange={setFilters} />
        </Box>
        <Box sx={{ display: "flex", gap: 1.25, p: "14px 18px", borderTop: `1px solid ${tokens.border}` }}>
          <Button fullWidth onClick={clear} sx={{ height: 44, borderRadius: "999px", bgcolor: "rgba(0,0,0,0.05)", color: "#000", textTransform: "none", fontSize: 14 }}>Clear all</Button>
          <Button fullWidth onClick={() => setSheet(false)} sx={{ height: 44, borderRadius: "999px", bgcolor: "#000", color: "#fff", textTransform: "none", fontSize: 14, "&:hover": { bgcolor: "rgba(0,0,0,0.8)" } }}>Show {total} jobs</Button>
        </Box>
      </Drawer>
    </Box>
  );
}
