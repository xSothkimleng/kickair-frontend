"use client";

import { useState, useEffect } from "react";
import { Box, Container, Button, Typography, Fab } from "@mui/material";
import { ChevronLeft, KeyboardArrowUp } from "@mui/icons-material";
import { serviceListings } from "./serviceListings";
import FiltersSidebar from "./FiltersSidebar";
import SortBar from "./SortBar";
import ServiceGrid from "./ServiceGrid";
import { serviceCategories } from "../data/mockdata";

interface ServicesPageProps {
  onNavigate?: (page: string, data?: any) => void;
  initialCategory?: string;
  searchQuery?: string;
}

export default function ServicesPage({ onNavigate, initialCategory, searchQuery }: ServicesPageProps) {
  const maxPrice = Math.max(...serviceListings.map(s => s.price), 1000);

  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCategory ? [initialCategory] : []);
  const [budgetRange, setBudgetRange] = useState<number[]>([0, maxPrice]);
  const [deliveryTime, setDeliveryTime] = useState<string>("any");
  const [showFilters, setShowFilters] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [sortBy, setSortBy] = useState("relevant");

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

  // Filter services
  let filteredServices = serviceListings;

  if (selectedCategories.length > 0) {
    filteredServices = filteredServices.filter(s => selectedCategories.includes(s.category));
  }

  filteredServices = filteredServices.filter(s => s.price >= budgetRange[0] && s.price <= budgetRange[1]);

  if (deliveryTime !== "any") {
    const maxDays = parseInt(deliveryTime);
    filteredServices = filteredServices.filter(s => s.deliveryDays <= maxDays);
  }

  if (searchQuery && searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filteredServices = filteredServices.filter(
      service => service.title.toLowerCase().includes(query) || service.freelancerName.toLowerCase().includes(query),
    );
  }

  // Apply sorting
  const sortedServices = [...filteredServices].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "rating":
        return b.rating - a.rating;
      case "popular":
        return b.reviewCount - a.reviewCount;
      case "relevant":
      default:
        return b.featured ? 1 : -1;
    }
  });

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setBudgetRange([0, maxPrice]);
    setDeliveryTime("any");
  };

  const activeFiltersCount = selectedCategories.length + (deliveryTime !== "any" ? 1 : 0);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#F5F5F7" }}>
      <Container maxWidth='xl' sx={{ px: { xs: 3, md: 6 }, py: { xs: 6, md: 10 } }}>
        {/* Back Button */}
        <Button
          onClick={() => onNavigate?.("home")}
          startIcon={<ChevronLeft />}
          sx={{
            fontSize: 12,
            color: "rgba(0, 0, 0, 0.6)",
            textTransform: "none",
            mb: 4,
            "&:hover": {
              color: "rgba(0, 0, 0, 1)",
              bgcolor: "transparent",
            },
          }}>
          Back to Home
        </Button>

        {/* Header */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
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

        {/* Main Content Grid */}
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 3fr" }, gap: 4 }}>
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

            <ServiceGrid services={sortedServices} searchQuery={searchQuery} clearAllFilters={clearAllFilters} />
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
