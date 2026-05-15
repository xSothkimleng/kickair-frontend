"use client";

import { useState, useEffect, useCallback } from "react";
import { Box, Container, Button, Typography, Fab, CircularProgress, Pagination, Alert } from "@mui/material";
import { ChevronLeft, KeyboardArrowUp } from "@mui/icons-material";
import FiltersSidebar, { Filters, FilterCategory } from "./FiltersSidebar";
import ResultsToolbar, { SortValue } from "./ResultsToolbar";
import ServiceGrid from "./ServiceGrid";
import { api } from "@/lib/api";
import { Service, ServiceCategory, ServicesListResponse, PaginationMeta } from "@/types/service";
import Link from "next/link";

const DEFAULT_BUDGET_MAX = 10000;

const defaultFilters = (budgetMax: number): Filters => ({
  query: "",
  categories: [],
  budget: [0, budgetMax],
  delivery: "any",
  rating: "any",
});

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [apiCategories, setApiCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [filters, setFilters] = useState<Filters>(defaultFilters(DEFAULT_BUDGET_MAX));
  const [sort, setSort] = useState<SortValue>("relevant");
  const [view, setView] = useState<"grid" | "list">("grid");

  const fetchServices = useCallback(async (page: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response: ServicesListResponse = await api.get(`/api/services?page=${page}`);
      setServices(response.data);
      setPagination(response.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load services");
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchServices(currentPage); }, [currentPage, fetchServices]);

  useEffect(() => { api.getServiceCategories().then(setApiCategories).catch(() => {}); }, []);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const budgetMax = services.length > 0
    ? Math.max(...services.flatMap(s => s.pricing_options?.map(p => Number(p.price_raw)) || [0]), DEFAULT_BUDGET_MAX)
    : DEFAULT_BUDGET_MAX;

  const sidebarCategories: FilterCategory[] = apiCategories.map(c => ({
    id: c.id.toString(),
    label: c.name,
  }));

  // --- Client-side filtering ---
  let filtered = [...services];

  if (filters.categories.length > 0) {
    filtered = filtered.filter(s => s.category_id && filters.categories.includes(s.category_id.toString()));
  }

  filtered = filtered.filter(s => {
    const lowest = s.pricing_options?.length ? Math.min(...s.pricing_options.map(p => Number(p.price_raw))) : 0;
    return lowest >= filters.budget[0] && lowest <= filters.budget[1];
  });

  if (filters.delivery !== "any") {
    const maxDays = parseInt(filters.delivery);
    filtered = filtered.filter(s => {
      const fastest = s.pricing_options?.length ? Math.min(...s.pricing_options.map(p => parseInt(String(p.delivery_time)))) : 0;
      return fastest <= maxDays;
    });
  }

  if (filters.rating !== "any") {
    const minRating = parseFloat(filters.rating);
    filtered = filtered.filter(s => s.rating_count > 0 && parseFloat(s.rating_average ?? "0") >= minRating);
  }

  if (filters.query.trim()) {
    const q = filters.query.toLowerCase();
    filtered = filtered.filter(s =>
      s.title.toLowerCase().includes(q) ||
      s.freelancer_profile?.user?.name?.toLowerCase().includes(q) ||
      s.search_tags?.some(tag => tag.toLowerCase().includes(q)),
    );
  }

  // --- Sorting ---
  const sorted = [...filtered].sort((a, b) => {
    const aPrice = a.pricing_options?.length ? Math.min(...a.pricing_options.map(p => Number(p.price_raw))) : 0;
    const bPrice = b.pricing_options?.length ? Math.min(...b.pricing_options.map(p => Number(p.price_raw))) : 0;
    const aRating = parseFloat(a.rating_average ?? "0");
    const bRating = parseFloat(b.rating_average ?? "0");
    switch (sort) {
      case "price_asc": return aPrice - bPrice;
      case "price_desc": return bPrice - aPrice;
      case "rating": return bRating - aRating;
      case "newest": return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      default: return b.orders_count - a.orders_count;
    }
  });

  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#F5F5F7" }}>
      {/* Top bar */}
      <Box sx={{ bgcolor: "#fff", borderBottom: "1px solid rgba(0,0,0,0.08)", mb: 4, py: 2 }}>
        <Container>
          <Link href="/" passHref>
            <Button startIcon={<ChevronLeft />} sx={{ fontSize: 12, color: "rgba(0,0,0,0.6)", textTransform: "none", "&:hover": { color: "black", bgcolor: "transparent" } }}>
              Back to Home
            </Button>
          </Link>
          <Box sx={{ textAlign: "center", mb: 4, py: 2 }}>
            <Typography variant="h1" sx={{ fontSize: { xs: 32, md: 48 }, fontWeight: 600, color: "black", letterSpacing: "-0.02em", mb: 2 }}>
              Explore Services
            </Typography>
            <Typography sx={{ fontSize: 17, color: "rgba(0,0,0,0.6)" }}>
              Browse ready-to-buy services from talented freelancers
            </Typography>
          </Box>
        </Container>
      </Box>

      <Container>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} action={<Button color="inherit" size="small" onClick={() => fetchServices(currentPage)}>Retry</Button>}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "280px 1fr" }, gap: 4, pb: 4 }}>
          {/* Sidebar */}
          <FiltersSidebar
            filters={filters}
            onChange={setFilters}
            categories={sidebarCategories}
            budgetMax={budgetMax}
          />

          {/* Results */}
          <Box>
            <ResultsToolbar
              query={filters.query}
              onQueryChange={q => setFilters(f => ({ ...f, query: q }))}
              sort={sort}
              onSortChange={setSort}
              view={view}
              onViewChange={setView}
              totalShown={sorted.length}
              totalAll={pagination?.total ?? services.length}
            />

            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
                <CircularProgress sx={{ color: "#0071e3" }} />
              </Box>
            ) : (
              <>
                <ServiceGrid services={sorted} searchQuery={filters.query} clearAllFilters={() => setFilters(defaultFilters(budgetMax))} view={view} />

                {pagination && pagination.last_page > 1 && (
                  <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
                    <Pagination
                      count={pagination.last_page}
                      page={pagination.current_page}
                      onChange={handlePageChange}
                      color="primary"
                      size="large"
                      sx={{ "& .MuiPaginationItem-root": { fontSize: 14, "&.Mui-selected": { bgcolor: "#0071e3", color: "white" } } }}
                    />
                  </Box>
                )}
              </>
            )}
          </Box>
        </Box>
      </Container>

      {showScrollTop && (
        <Fab
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          sx={{ position: "fixed", bottom: 32, right: 32, bgcolor: "black", color: "white", "&:hover": { bgcolor: "black", transform: "scale(1.1)" }, transition: "all 0.3s" }}
          aria-label="Scroll to top">
          <KeyboardArrowUp />
        </Fab>
      )}
    </Box>
  );
}
