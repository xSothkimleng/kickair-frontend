"use client";

import { useState, useEffect, useCallback } from "react";
import { Box, Container, Typography, CircularProgress, Pagination, Button, Alert } from "@mui/material";
import { TuneOutlined } from "@mui/icons-material";
import { api } from "@/lib/api";
import { JobPost, JobPostFilters } from "@/types/job";
import { ServiceCategory } from "@/types/service";
import { Expertise } from "@/types/user";
import JobCard from "@/components/jobs/JobCard";
import JobFilters from "@/components/jobs/JobFilters";

export default function JobBoardPage() {
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [expertises, setExpertises] = useState<Expertise[]>([]);

  const [filters, setFilters] = useState<JobPostFilters>({ page: 1 });
  const [showFilters, setShowFilters] = useState(false);

  // Load reference data once
  useEffect(() => {
    Promise.all([api.getServiceCategories(), api.getExpertises()])
      .then(([cats, exps]) => {
        setCategories(cats);
        setExpertises(exps);
      })
      .catch(() => {});
  }, []);

  const fetchJobs = useCallback(async (f: JobPostFilters) => {
    setLoading(true);
    setError(null);
    try {
      const resp = await api.getJobPosts(f);
      setJobs(resp.data);
      setLastPage(resp.meta?.last_page ?? 1);
      setTotal(resp.meta?.total ?? resp.data.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load job posts.");
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs(filters);
  }, [filters, fetchJobs]);

  const handleFiltersChange = (newFilters: JobPostFilters) => {
    setFilters(newFilters);
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    setFilters(prev => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#F5F5F7" }}>
      {/* Page Header */}
      <Box sx={{ bgcolor: "#fff", borderBottom: "1px solid rgba(0,0,0,0.08)", mb: 4, py: 3 }}>
        <Container>
          <Box sx={{ textAlign: "center", py: 2 }}>
            <Typography
              variant='h1'
              sx={{
                fontSize: { xs: 28, md: 44 },
                fontWeight: 600,
                color: "black",
                letterSpacing: "-0.02em",
                mb: 1.5,
              }}>
              Job Board
            </Typography>
            <Typography sx={{ fontSize: 16, color: "rgba(0,0,0,0.55)" }}>
              Browse open projects and submit your proposals
            </Typography>
          </Box>
        </Container>
      </Box>

      <Container>
        {/* Mobile filter toggle */}
        <Box sx={{ display: { xs: "flex", lg: "none" }, justifyContent: "flex-start", mb: 3 }}>
          <Button
            onClick={() => setShowFilters(v => !v)}
            variant='outlined'
            startIcon={<TuneOutlined />}
            sx={{
              fontSize: 13,
              textTransform: "none",
              borderRadius: 25,
              color: "black",
              borderColor: "rgba(0,0,0,0.15)",
              bgcolor: "white",
              "&:hover": { borderColor: "rgba(0,0,0,0.3)", bgcolor: "white" },
            }}>
            Filters
          </Button>
        </Box>

        {error && (
          <Alert
            severity='error'
            sx={{ mb: 3 }}
            action={
              <Button color='inherit' size='small' onClick={() => fetchJobs(filters)}>
                Retry
              </Button>
            }>
            {error}
          </Alert>
        )}

        {/* Main layout */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "minmax(0,260px) minmax(0,1fr)" },
            gap: 4,
            pb: 6,
            alignItems: "start",
          }}>
          {/* Sidebar */}
          <Box
            sx={{
              display: { xs: showFilters ? "block" : "none", lg: "block" },
              position: { lg: "sticky" },
              top: { lg: 24 },
            }}>
            <Box
              sx={{
                bgcolor: "white",
                borderRadius: 3,
                border: "1px solid rgba(0,0,0,0.08)",
                p: 3,
              }}>
              <JobFilters categories={categories} expertises={expertises} filters={filters} onChange={handleFiltersChange} />
            </Box>
          </Box>

          {/* Job List */}
          <Box>
            {/* Results count */}
            <Typography sx={{ fontSize: 13, color: "text.secondary", mb: 2 }}>
              {loading ? "Loading..." : `${total} open job${total !== 1 ? "s" : ""} found`}
            </Typography>

            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 300 }}>
                <CircularProgress sx={{ color: "#0071e3" }} />
              </Box>
            ) : jobs.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 8 }}>
                <Typography sx={{ fontSize: 15, color: "text.secondary", mb: 1 }}>No jobs found</Typography>
                <Typography variant='caption' color='text.secondary'>
                  Try adjusting your filters
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {jobs.map(job => (
                  <JobCard key={job.id} job={job} />
                ))}
              </Box>
            )}

            {lastPage > 1 && !loading && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
                <Pagination
                  count={lastPage}
                  page={filters.page ?? 1}
                  onChange={handlePageChange}
                  color='primary'
                  size='large'
                  shape='rounded'
                />
              </Box>
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
