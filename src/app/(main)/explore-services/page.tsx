"use client";

import { useState, useEffect, useCallback } from "react";
import { Box, Container, Button, Typography, Fab, CircularProgress, Pagination, Alert } from "@mui/material";
import { ChevronLeft, KeyboardArrowUp } from "@mui/icons-material";
import FiltersSidebar from "./FiltersSidebar";
import SortBar from "./SortBar";
import ServiceGrid from "./ServiceGrid";
import { serviceCategories } from "../../data/mockdata";
import { api } from "@/lib/api";
import { Service, ServicesListResponse, PaginationMeta } from "@/types/service";
import Link from "next/link";

interface ServicesPageProps {
  initialCategory?: string;
  searchQuery?: string;
}

export default function ServicesPage({ initialCategory, searchQuery }: ServicesPageProps) {
  // API state
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter state
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCategory ? [initialCategory] : []);
  const [budgetRange, setBudgetRange] = useState<number[]>([0, 10000]);
  const [deliveryTime, setDeliveryTime] = useState<string>("any");
  const [showFilters, setShowFilters] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [sortBy, setSortBy] = useState("relevant");

  // Fetch services from API
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

  useEffect(() => {
    fetchServices(currentPage);
  }, [currentPage, fetchServices]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => (prev.includes(categoryId) ? prev.filter(c => c !== categoryId) : [...prev, categoryId]));
  };

  // Calculate max price from loaded services
  const maxPrice =
    services.length > 0 ? Math.max(...services.flatMap(s => s.pricing_options?.map(p => p.price_raw) || [0]), 10000) : 10000;

  // Filter services client-side
  let filteredServices = [...services];

  // Filter by category
  if (selectedCategories.length > 0) {
    filteredServices = filteredServices.filter(s => s.category && selectedCategories.includes(s.category.slug));
  }

  // Filter by budget
  filteredServices = filteredServices.filter(s => {
    const lowestPrice = s.pricing_options?.length ? Math.min(...s.pricing_options.map(p => p.price_raw)) : 0;
    return lowestPrice >= budgetRange[0] && lowestPrice <= budgetRange[1];
  });

  // Filter by delivery time
  if (deliveryTime !== "any") {
    const maxDays = parseInt(deliveryTime);
    filteredServices = filteredServices.filter(s => {
      const fastestDelivery = s.pricing_options?.length ? Math.min(...s.pricing_options.map(p => p.delivery_time)) : 0;
      return fastestDelivery <= maxDays;
    });
  }

  // Filter by search query
  if (searchQuery && searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filteredServices = filteredServices.filter(
      service =>
        service.title.toLowerCase().includes(query) ||
        service.freelancer_profile?.user?.name?.toLowerCase().includes(query) ||
        service.search_tags?.some(tag => tag.toLowerCase().includes(query)),
    );
  }

  // Apply sorting
  const sortedServices = [...filteredServices].sort((a, b) => {
    const aPrice = a.pricing_options?.length ? Math.min(...a.pricing_options.map(p => p.price_raw)) : 0;
    const bPrice = b.pricing_options?.length ? Math.min(...b.pricing_options.map(p => p.price_raw)) : 0;

    switch (sortBy) {
      case "price-low":
        return aPrice - bPrice;
      case "price-high":
        return bPrice - aPrice;
      case "popular":
        return b.orders_count - a.orders_count;
      case "newest":
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case "relevant":
      default:
        return b.orders_count - a.orders_count;
    }
  });

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setBudgetRange([0, maxPrice]);
    setDeliveryTime("any");
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const activeFiltersCount = selectedCategories.length + (deliveryTime !== "any" ? 1 : 0);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#F5F5F7" }}>
      <Box sx={{ bgcolor: "#fff", borderBottom: "1px solid rgba(0, 0, 0, 0.08)", mb: 4, py: 2 }}>
        <Container>
          {/* Back Button */}
          <Link href='/' passHref>
            <Button
              startIcon={<ChevronLeft />}
              sx={{
                fontSize: 12,
                color: "rgba(0, 0, 0, 0.6)",
                textTransform: "none",
                "&:hover": {
                  color: "rgba(0, 0, 0, 1)",
                  bgcolor: "transparent",
                },
              }}>
              Back to Home
            </Button>
          </Link>

          {/* Header */}
          <Box sx={{ textAlign: "center", mb: 4, py: 2 }}>
            <Typography
              variant='h1'
              sx={{
                fontSize: { xs: 32, md: 48 },
                fontWeight: 600,
                color: "black",
                letterSpacing: "-0.02em",
                mb: 2,
              }}>
              {searchQuery ? `Search Results for "${searchQuery}"` : "Explore Services"}
            </Typography>
            <Typography sx={{ fontSize: 17, color: "rgba(0, 0, 0, 0.6)" }}>
              {searchQuery
                ? `Found ${filteredServices.length} result${filteredServices.length !== 1 ? "s" : ""}`
                : "Browse ready-to-buy services from talented freelancers"}
            </Typography>
          </Box>
        </Container>
      </Box>
      <Container>
        {/* Filter Toggle - Mobile */}
        <Box sx={{ display: { xs: "flex", lg: "none" }, justifyContent: "center", mb: 3 }}>
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant='outlined'
            sx={{
              px: 2,
              height: 40,
              fontSize: 13,
              color: "black",
              bgcolor: "white",
              border: "1px solid rgba(0, 0, 0, 0.1)",
              borderRadius: 25,
              textTransform: "none",
              "&:hover": {
                border: "1px solid rgba(0, 0, 0, 0.2)",
                bgcolor: "white",
              },
            }}>
            <Box component='span' sx={{ mr: 1 }}>
              Filters
            </Box>
            {activeFiltersCount > 0 && (
              <Box
                component='span'
                sx={{
                  ml: 1,
                  px: 1,
                  py: 0.5,
                  bgcolor: "#0071e3",
                  color: "white",
                  borderRadius: 25,
                  fontSize: 11,
                  fontWeight: 500,
                }}>
                {activeFiltersCount}
              </Box>
            )}
          </Button>
        </Box>

        {/* Error State */}
        {error && (
          <Alert
            severity='error'
            sx={{ mb: 3 }}
            action={
              <Button color='inherit' size='small' onClick={() => fetchServices(currentPage)}>
                Retry
              </Button>
            }>
            {error}
          </Alert>
        )}

        {/* Main Content Grid */}
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 3fr" }, gap: 4, pb: 4 }}>
          {/* Filters Sidebar */}
          <Box sx={{ display: { xs: showFilters ? "block" : "none", lg: "block" } }}>
            <FiltersSidebar
              selectedCategories={selectedCategories}
              toggleCategory={toggleCategory}
              budgetRange={budgetRange}
              setBudgetRange={setBudgetRange}
              maxPrice={maxPrice}
              deliveryTime={deliveryTime}
              setDeliveryTime={setDeliveryTime}
              activeFiltersCount={activeFiltersCount}
              clearAllFilters={clearAllFilters}
              serviceCategories={serviceCategories}
            />
          </Box>

          {/* Services Grid */}
          <Box>
            <SortBar filteredCount={filteredServices.length} sortBy={sortBy} setSortBy={setSortBy} />

            {/* Loading State */}
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
                <CircularProgress sx={{ color: "#0071e3" }} />
              </Box>
            ) : (
              <>
                <ServiceGrid services={sortedServices} searchQuery={searchQuery} clearAllFilters={clearAllFilters} />

                {/* Pagination */}
                {pagination && pagination.last_page > 1 && (
                  <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
                    <Pagination
                      count={pagination.last_page}
                      page={pagination.current_page}
                      onChange={handlePageChange}
                      color='primary'
                      size='large'
                      sx={{
                        "& .MuiPaginationItem-root": {
                          fontSize: 14,
                          "&.Mui-selected": {
                            bgcolor: "#0071e3",
                            color: "white",
                            "&:hover": {
                              bgcolor: "#0062c4",
                            },
                          },
                        },
                      }}
                    />
                  </Box>
                )}

                {/* Pagination Info */}
                {pagination && (
                  <Typography
                    sx={{
                      textAlign: "center",
                      mt: 2,
                      fontSize: 13,
                      color: "rgba(0, 0, 0, 0.6)",
                    }}>
                    Showing {pagination.from || 0} - {pagination.to || 0} of {pagination.total} services
                  </Typography>
                )}
              </>
            )}
          </Box>
        </Box>
      </Container>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <Fab
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          sx={{
            position: "fixed",
            bottom: 32,
            right: 32,
            bgcolor: "black",
            color: "white",
            "&:hover": {
              bgcolor: "black",
              transform: "scale(1.1)",
            },
            transition: "all 0.3s",
          }}
          aria-label='Scroll to top'>
          <KeyboardArrowUp />
        </Fab>
      )}
    </Box>
  );
}
