"use client";

import { useState, useEffect } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { ChevronLeft, ChevronUp } from "lucide-react";
import { css } from "styled-system/css";
import { Alert, Pager, Spinner } from "@/components/ds";
import FiltersSidebar, { Filters, FilterCategory } from "./FiltersSidebar";
import ResultsToolbar, { SortValue } from "./ResultsToolbar";
import ServiceGrid from "./ServiceGrid";
import { api } from "@/lib/api";
import { qk } from "@/lib/queryKeys";
import { useMarketplaceLive } from "@/hooks/useMarketplaceLive";
import { Service, ServicesListResponse } from "@/types/service";
import Link from "next/link";

const DEFAULT_BUDGET_MAX = 10000;

const defaultFilters = (budgetMax: number): Filters => ({
  query: "",
  categories: [],
  budget: [0, budgetMax],
  delivery: "any",
  rating: "any",
});

const pageCss = css({ minH: "100vh", bg: "page" });
const topBarCss = css({
  bg: "#fff",
  borderBottomWidth: "1px",
  borderBottomStyle: "solid",
  borderBottomColor: "hairline",
  mb: "32px",
  py: "16px",
});
const containerCss = css({
  w: "100%",
  boxSizing: "border-box",
  maxW: "1200px",
  mx: "auto",
  px: { base: "16px", sm: "24px" },
});
const backLinkCss = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  boxSizing: "border-box",
  minW: "64px",
  p: "6px 8px",
  ml: "-4px",
  borderRadius: "4px",
  color: "ink2",
  fontSize: "12px",
  fontWeight: 500,
  lineHeight: 1.75,
  letterSpacing: "0.02857em",
  textDecoration: "none",
  transition: "color .25s",
  _hover: { color: "black", bg: "transparent" },
  "& svg": { display: "block", flexShrink: 0 },
});
const heroCss = css({ textAlign: "center", mb: "32px", py: "16px" });
const heroTitleCss = css({
  fontSize: { base: "32px", md: "48px" },
  fontWeight: 600,
  lineHeight: 1.167,
  color: "black",
  letterSpacing: "-0.02em",
});
const heroSubCss = css({ fontSize: "17px", lineHeight: 1.5, color: "ink2" });
const alertWrapCss = css({ mb: "24px" });
const retryBtnCss = css({
  boxSizing: "border-box",
  minW: "64px",
  p: "4px 5px",
  border: "none",
  borderRadius: "4px",
  bg: "transparent",
  color: "inherit",
  fontFamily: "inherit",
  fontSize: "13px",
  fontWeight: 500,
  lineHeight: 1.75,
  letterSpacing: "0.02857em",
  cursor: "pointer",
  _hover: { bg: "rgba(0,0,0,0.04)" },
});
const layoutCss = css({
  display: "grid",
  gridTemplateColumns: { base: "1fr", lg: "280px 1fr" },
  gap: "32px",
  pb: "32px",
});
const loadingCss = css({ display: "flex", justifyContent: "center", alignItems: "center", minH: "400px", color: "accent" });
const pagerWrapCss = css({ display: "flex", justifyContent: "center", mt: "48px" });
const fabCss = css({
  position: "fixed",
  bottom: "32px",
  right: "32px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  boxSizing: "border-box",
  w: "56px",
  h: "56px",
  p: 0,
  m: 0,
  border: "none",
  borderRadius: "50%",
  bg: "black",
  color: "white",
  fontFamily: "inherit",
  cursor: "pointer",
  boxShadow: "0px 3px 5px -1px rgba(0,0,0,0.2), 0px 6px 10px 0px rgba(0,0,0,0.14), 0px 1px 18px 0px rgba(0,0,0,0.12)",
  transition: "all 0.3s",
  _hover: { bg: "black", transform: "scale(1.1)" },
  "& svg": { display: "block" },
});

export default function ServicesPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [filters, setFilters] = useState<Filters>(defaultFilters(DEFAULT_BUDGET_MAX));
  const [sort, setSort] = useState<SortValue>("relevant");
  const [view, setView] = useState<"grid" | "list">("grid");

  const { data, isLoading: loading, error: queryError, refetch } = useQuery({
    queryKey: qk.services.explore({ page: currentPage }),
    queryFn: async () => {
      const response: ServicesListResponse = await api.get(`/api/services?page=${currentPage}`);
      return response;
    },
    placeholderData: keepPreviousData,
  });
  const services: Service[] = data?.data ?? [];
  const pagination = data?.meta ?? null;
  const error = queryError ? (queryError instanceof Error ? queryError.message : "Failed to load services") : null;
  const fetchServices = () => refetch();

  const { data: apiCategories = [] } = useQuery({
    queryKey: ["service-categories"],
    queryFn: () => api.getServiceCategories(),
    staleTime: 5 * 60_000,
  });

  // Live: a newly approved service appears without a reload.
  useMarketplaceLive("service");

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
    label: c.category_name,
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className={pageCss}>
      {/* Top bar */}
      <div className={topBarCss}>
        <div className={containerCss}>
          <Link href="/" className={backLinkCss}>
            <ChevronLeft size={20} />
            Back to Home
          </Link>
          <div className={heroCss}>
            <h1 className={heroTitleCss}>Explore Services</h1>
            <p className={heroSubCss}>Browse ready-to-buy services from talented freelancers</p>
          </div>
        </div>
      </div>

      <div className={containerCss}>
        {error && (
          <div className={alertWrapCss}>
            <Alert
              tone='error'
              action={<button type='button' className={retryBtnCss} onClick={() => fetchServices()}>Retry</button>}>
              {error}
            </Alert>
          </div>
        )}

        <div className={layoutCss}>
          {/* Sidebar */}
          <FiltersSidebar
            filters={filters}
            onChange={setFilters}
            categories={sidebarCategories}
            budgetMax={budgetMax}
          />

          {/* Results */}
          <div>
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
              <div className={loadingCss}>
                <Spinner size={40} />
              </div>
            ) : (
              <>
                <ServiceGrid services={sorted} searchQuery={filters.query} clearAllFilters={() => setFilters(defaultFilters(budgetMax))} view={view} />

                {pagination && pagination.last_page > 1 && (
                  <div className={pagerWrapCss}>
                    <Pager
                      count={pagination.last_page}
                      page={pagination.current_page}
                      onChange={handlePageChange}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {showScrollTop && (
        <button
          type='button'
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className={fabCss}
          aria-label="Scroll to top">
          <ChevronUp size={24} />
        </button>
      )}
    </div>
  );
}
