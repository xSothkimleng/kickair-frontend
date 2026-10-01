"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
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
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
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
  textStyle: "meta",
  fontWeight: 500,
  textDecoration: "none",
  transition: "color .25s",
  _hover: { color: "black", bg: "transparent" },
  "& svg": { display: "block", flexShrink: 0 },
});
const heroCss = css({ textAlign: "center", mb: "32px", py: "16px" });
const heroTitleCss = css({
  textStyle: { base: "stat", md: "display" },
  fontWeight: 600,
  color: "black",
});
const heroSubCss = css({ textStyle: "lead", color: "ink2" });
const alertWrapCss = css({ mb: "24px" });
const retryBtnCss = css({
  boxSizing: "border-box",
  minW: "64px",
  p: "4px 5px",
  border: "none",
  borderRadius: "4px",
  bg: "transparent",
  color: "inherit",
  textStyle: "ui",
  fontWeight: 500,
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
  cursor: "pointer",
  boxShadow: "0px 3px 5px -1px rgba(0,0,0,0.2), 0px 6px 10px 0px rgba(0,0,0,0.14), 0px 1px 18px 0px rgba(0,0,0,0.12)",
  transition: "all 0.3s",
  _hover: { bg: "black", transform: "scale(1.1)" },
  "& svg": { display: "block" },
});

// What the URL can pre-set: `?q=` (the homepage search box) and `?category=` (a
// homepage category card, by group id).
function filtersFromUrl(params: URLSearchParams): Filters {
  const category = params.get("category");
  return {
    ...defaultFilters(DEFAULT_BUDGET_MAX),
    query: params.get("q") ?? "",
    categories: category && /^\d+$/.test(category) ? [category] : [],
  };
}

// Search, filters and sorting run on the API, so they cover every live service and
// not only the page on screen. This turns the sidebar state into the query string.
function toApiQuery(filters: Filters, sort: SortValue, page: number): string {
  const params = new URLSearchParams({ page: String(page), sort });
  const search = filters.query.trim();
  if (search) params.set("search", search);
  for (const id of filters.categories) params.append("category_ids[]", id);
  // A range typed the wrong way round (min above max) still means that range.
  const low = Math.min(...filters.budget);
  const high = Math.max(...filters.budget);
  if (low > 0) params.set("min_price", String(low));
  if (high < DEFAULT_BUDGET_MAX) params.set("max_price", String(high));
  if (filters.delivery !== "any") params.set("max_delivery_days", filters.delivery);
  if (filters.rating !== "any") params.set("min_rating", filters.rating);
  return params.toString();
}

export default function ServicesPage() {
  // useSearchParams needs a Suspense boundary for the static build.
  return (
    <Suspense fallback={null}>
      <ServicesPageInner />
    </Suspense>
  );
}

function ServicesPageInner() {
  const searchParams = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [filters, setFiltersState] = useState<Filters>(() => filtersFromUrl(searchParams));
  const [sort, setSortState] = useState<SortValue>("relevant");
  const [view, setView] = useState<"grid" | "list">("grid");

  // Any change to what is being asked for starts again from page 1.
  const setFilters = (next: Filters | ((f: Filters) => Filters)) => {
    setFiltersState(next);
    setCurrentPage(1);
  };
  const setSort = (next: SortValue) => {
    setSortState(next);
    setCurrentPage(1);
  };

  // Typing and dragging the budget slider change `filters` many times a second; the
  // request follows a moment later.
  const appliedFilters = useDebouncedValue(filters, 300);
  const apiQuery = toApiQuery(appliedFilters, sort, currentPage);

  const { data, isLoading: loading, error: queryError, refetch } = useQuery({
    queryKey: qk.services.explore({ query: apiQuery }),
    queryFn: async () => {
      const response: ServicesListResponse = await api.get(`/api/services?${apiQuery}`);
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

  const budgetMax = DEFAULT_BUDGET_MAX;

  // The sidebar lists groups only; "Something else" is left out (its listings are found by search).
  // A ticked group matches listings on the group itself and on any of its subcategories (the API expands it).
  const sidebarCategories: FilterCategory[] = apiCategories.filter(c => !c.is_catch_all).map(c => ({
    id: c.id.toString(),
    label: c.category_name,
  }));

  // The API returns the page already filtered and sorted.
  const sorted = services;

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
