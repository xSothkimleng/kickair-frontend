// app/freelancers/page.tsx or pages/freelancers.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Button,
  Typography,
  Checkbox,
  FormControlLabel,
  Slider,
  TextField,
  Select,
  MenuItem,
  Chip,
  Fab,
  InputAdornment,
  SelectChangeEvent,
} from "@mui/material";
import { ChevronLeft, TuneOutlined, Search as SearchIcon, KeyboardArrowUp, KeyboardArrowDown, Close } from "@mui/icons-material";

import { serviceCategories, freelancers, regions, languages } from "../../data/mockdata";
import { FreelancerCard } from "@/components/layout/card/FreelancerCard";

interface FindFreelancersPageProps {
  onNavigate?: (page: string, data?: any) => void;
  initialCategory?: string;
  searchQuery?: string;
}

export default function FindFreelancersPage({ onNavigate, initialCategory, searchQuery }: FindFreelancersPageProps) {
  // Calculate the maximum price from all freelancers dynamically
  const maxPrice = Math.max(
    ...freelancers.flatMap(f => f.tiers.map(t => t.price)),
    1000, // Minimum cap of 1000
  );

  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCategory ? [initialCategory] : []);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [budgetRange, setBudgetRange] = useState<number[]>([0, maxPrice]);
  const [showFilters, setShowFilters] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [sortBy, setSortBy] = useState("relevant");

  // Search states for filters
  const [categorySearch, setCategorySearch] = useState("");
  const [regionSearch, setRegionSearch] = useState("");
  const [languageSearch, setLanguageSearch] = useState("");

  // Scroll detection for scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Toggle functions for multi-select
  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => (prev.includes(categoryId) ? prev.filter(c => c !== categoryId) : [...prev, categoryId]));
  };

  const toggleRegion = (region: string) => {
    setSelectedRegions(prev => (prev.includes(region) ? prev.filter(r => r !== region) : [...prev, region]));
  };

  const toggleLanguage = (language: string) => {
    setSelectedLanguages(prev => (prev.includes(language) ? prev.filter(l => l !== language) : [...prev, language]));
  };

  // Filter freelancers based on all criteria
  let filteredFreelancers = freelancers;

  // Apply category filter
  if (selectedCategories.length > 0) {
    filteredFreelancers = filteredFreelancers.filter(f => selectedCategories.includes(f.category));
  }

  // Apply region filter
  if (selectedRegions.length > 0) {
    filteredFreelancers = filteredFreelancers.filter(f => f.region && selectedRegions.includes(f.region));
  }

  // Apply language filter
  if (selectedLanguages.length > 0) {
    filteredFreelancers = filteredFreelancers.filter(f => f.languages?.some(lang => selectedLanguages.includes(lang)));
  }

  // Apply budget filter
  filteredFreelancers = filteredFreelancers.filter(f => {
    const basicPrice = f.tiers.find(t => t.name === "Basic")?.price || 0;
    return basicPrice >= budgetRange[0] && basicPrice <= budgetRange[1];
  });

  // Apply search filter if search query exists
  if (searchQuery && searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filteredFreelancers = filteredFreelancers.filter(freelancer => {
      return (
        freelancer.name.toLowerCase().includes(query) ||
        freelancer.title.toLowerCase().includes(query) ||
        freelancer.bio.toLowerCase().includes(query) ||
        freelancer.category.toLowerCase().includes(query) ||
        freelancer.skills.some(skill => skill.toLowerCase().includes(query))
      );
    });
  }

  // Apply sorting
  const sortedFreelancers = [...filteredFreelancers].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        const aPriceLow = a.tiers.find(t => t.name === "Basic")?.price || 0;
        const bPriceLow = b.tiers.find(t => t.name === "Basic")?.price || 0;
        return aPriceLow - bPriceLow;
      case "price-high":
        const aPriceHigh = a.tiers.find(t => t.name === "Basic")?.price || 0;
        const bPriceHigh = b.tiers.find(t => t.name === "Basic")?.price || 0;
        return bPriceHigh - aPriceHigh;
      case "rating":
        return b.rating - a.rating;
      case "reviews":
        return b.reviewCount - a.reviewCount;
      case "relevant":
      default:
        return 0;
    }
  });

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedRegions([]);
    setSelectedLanguages([]);
    setBudgetRange([0, maxPrice]);
  };

  const activeFiltersCount = selectedCategories.length + selectedRegions.length + selectedLanguages.length;

  const handleSortChange = (event: SelectChangeEvent) => {
    setSortBy(event.target.value);
  };

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
            {searchQuery ? `Search Results for "${searchQuery}"` : "Find Freelancers"}
          </Typography>
          <Typography sx={{ fontSize: 17, color: "rgba(0, 0, 0, 0.6)" }}>
            {searchQuery
              ? `Found ${filteredFreelancers.length} result${filteredFreelancers.length !== 1 ? "s" : ""}`
              : "Discover talented professionals ready to bring your project to life"}
          </Typography>
        </Box>

        {/* Filter Toggle - Mobile */}
        <Box sx={{ display: { xs: "flex", lg: "none" }, justifyContent: "center", mb: 3 }}>
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant='outlined'
            startIcon={<TuneOutlined />}
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
            Filters
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
            <Box
              sx={{
                bgcolor: "white",
                border: "1px solid rgba(0, 0, 0, 0.08)",
                borderRadius: 2,
                position: { lg: "sticky" },
                top: { lg: 96 },
                maxHeight: { lg: "calc(100vh - 7rem)" },
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}>
              {/* Header */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: 3,
                  pb: 2,
                }}>
                <Typography sx={{ fontSize: 17, fontWeight: 600 }}>Filters</Typography>
                {activeFiltersCount > 0 && (
                  <Button
                    onClick={clearAllFilters}
                    sx={{
                      fontSize: 12,
                      color: "#0071e3",
                      textTransform: "none",
                      minWidth: "auto",
                      p: 0,
                      "&:hover": {
                        bgcolor: "transparent",
                        textDecoration: "underline",
                      },
                    }}>
                    Clear all
                  </Button>
                )}
              </Box>

              {/* Scrollable Content */}
              <Box sx={{ overflow: "auto", px: 3, pb: 3 }}>
                {/* Category Filter */}
                <Box sx={{ mb: 3 }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 1.5 }}>Category</Typography>

                  <TextField
                    fullWidth
                    placeholder='Search categories...'
                    value={categorySearch}
                    onChange={e => setCategorySearch(e.target.value)}
                    size='small'
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <SearchIcon sx={{ fontSize: 14, color: "rgba(0, 0, 0, 0.4)" }} />
                        </InputAdornment>
                      ),
                      sx: {
                        fontSize: 12,
                        bgcolor: "rgba(0, 0, 0, 0.05)",
                        "& fieldset": { border: "none" },
                        "&:hover": { bgcolor: "white" },
                        "&.Mui-focused": {
                          bgcolor: "white",
                          "& fieldset": { borderColor: "#0071e3" },
                        },
                      },
                    }}
                    sx={{ mb: 1 }}
                  />

                  <Box sx={{ maxHeight: 192, overflow: "auto" }}>
                    {serviceCategories
                      .filter(category => category.name.toLowerCase().includes(categorySearch.toLowerCase()))
                      .map(category => (
                        <FormControlLabel
                          key={category.id}
                          control={
                            <Checkbox
                              checked={selectedCategories.includes(category.id)}
                              onChange={() => toggleCategory(category.id)}
                              size='small'
                              sx={{ "&.Mui-checked": { color: "#0071e3" } }}
                            />
                          }
                          label={<Typography sx={{ fontSize: 13 }}>{category.name}</Typography>}
                          sx={{
                            display: "flex",
                            m: 0,
                            px: 1.5,
                            py: 1,
                            borderRadius: 1,
                            "&:hover": { bgcolor: "rgba(0, 0, 0, 0.04)" },
                          }}
                        />
                      ))}
                    {serviceCategories.filter(category => category.name.toLowerCase().includes(categorySearch.toLowerCase()))
                      .length === 0 && (
                      <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)", px: 1.5, py: 1 }}>
                        No categories found
                      </Typography>
                    )}
                  </Box>
                </Box>

                {/* Budget Filter */}
                <Box sx={{ pt: 3, borderTop: "1px solid rgba(0, 0, 0, 0.08)", mb: 3 }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 2 }}>Budget Range</Typography>

                  <Slider
                    value={budgetRange}
                    onChange={(_, newValue) => setBudgetRange(newValue as number[])}
                    min={0}
                    max={maxPrice}
                    step={10}
                    valueLabelDisplay='auto'
                    valueLabelFormat={value => `$${value}`}
                    sx={{
                      color: "#0071e3",
                      "& .MuiSlider-thumb": {
                        width: 16,
                        height: 16,
                      },
                    }}
                  />

                  <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", mt: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)", mb: 0.5 }}>Min</Typography>
                      <TextField
                        type='number'
                        value={budgetRange[0]}
                        onChange={e => {
                          const value = Math.max(0, Math.min(parseInt(e.target.value) || 0, budgetRange[1]));
                          setBudgetRange([value, budgetRange[1]]);
                        }}
                        size='small'
                        InputProps={{
                          startAdornment: <InputAdornment position='start'>$</InputAdornment>,
                          sx: { fontSize: 12 },
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            bgcolor: "rgba(0, 0, 0, 0.05)",
                            "& fieldset": { border: "none" },
                            "&:hover": { bgcolor: "white" },
                            "&.Mui-focused": {
                              bgcolor: "white",
                              "& fieldset": { borderColor: "#0071e3" },
                            },
                          },
                        }}
                      />
                    </Box>

                    <Typography sx={{ color: "rgba(0, 0, 0, 0.6)", mt: 2.5 }}>-</Typography>

                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)", mb: 0.5 }}>Max</Typography>
                      <TextField
                        type='number'
                        value={budgetRange[1]}
                        onChange={e => {
                          const value = Math.max(budgetRange[0], parseInt(e.target.value) || 0);
                          setBudgetRange([budgetRange[0], value]);
                        }}
                        size='small'
                        InputProps={{
                          startAdornment: <InputAdornment position='start'>$</InputAdornment>,
                          sx: { fontSize: 12 },
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            bgcolor: "rgba(0, 0, 0, 0.05)",
                            "& fieldset": { border: "none" },
                            "&:hover": { bgcolor: "white" },
                            "&.Mui-focused": {
                              bgcolor: "white",
                              "& fieldset": { borderColor: "#0071e3" },
                            },
                          },
                        }}
                      />
                    </Box>
                  </Box>
                </Box>

                {/* Region Filter */}
                <Box sx={{ pt: 3, borderTop: "1px solid rgba(0, 0, 0, 0.08)", mb: 3 }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 1.5 }}>Region</Typography>

                  <TextField
                    fullWidth
                    placeholder='Search regions...'
                    value={regionSearch}
                    onChange={e => setRegionSearch(e.target.value)}
                    size='small'
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <SearchIcon sx={{ fontSize: 14, color: "rgba(0, 0, 0, 0.4)" }} />
                        </InputAdornment>
                      ),
                      sx: {
                        fontSize: 12,
                        bgcolor: "rgba(0, 0, 0, 0.05)",
                        "& fieldset": { border: "none" },
                        "&:hover": { bgcolor: "white" },
                        "&.Mui-focused": {
                          bgcolor: "white",
                          "& fieldset": { borderColor: "#0071e3" },
                        },
                      },
                    }}
                    sx={{ mb: 1 }}
                  />

                  <Box sx={{ maxHeight: 192, overflow: "auto" }}>
                    {regions
                      .filter(region => region.toLowerCase().includes(regionSearch.toLowerCase()))
                      .map(region => (
                        <FormControlLabel
                          key={region}
                          control={
                            <Checkbox
                              checked={selectedRegions.includes(region)}
                              onChange={() => toggleRegion(region)}
                              size='small'
                              sx={{ "&.Mui-checked": { color: "#0071e3" } }}
                            />
                          }
                          label={<Typography sx={{ fontSize: 13 }}>{region}</Typography>}
                          sx={{
                            display: "flex",
                            m: 0,
                            px: 1.5,
                            py: 1,
                            borderRadius: 1,
                            "&:hover": { bgcolor: "rgba(0, 0, 0, 0.04)" },
                          }}
                        />
                      ))}
                    {regions.filter(region => region.toLowerCase().includes(regionSearch.toLowerCase())).length === 0 && (
                      <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)", px: 1.5, py: 1 }}>No regions found</Typography>
                    )}
                  </Box>
                </Box>

                {/* Language Filter */}
                <Box sx={{ pt: 3, borderTop: "1px solid rgba(0, 0, 0, 0.08)" }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 1.5 }}>Language</Typography>

                  <TextField
                    fullWidth
                    placeholder='Search languages...'
                    value={languageSearch}
                    onChange={e => setLanguageSearch(e.target.value)}
                    size='small'
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <SearchIcon sx={{ fontSize: 14, color: "rgba(0, 0, 0, 0.4)" }} />
                        </InputAdornment>
                      ),
                      sx: {
                        fontSize: 12,
                        bgcolor: "rgba(0, 0, 0, 0.05)",
                        "& fieldset": { border: "none" },
                        "&:hover": { bgcolor: "white" },
                        "&.Mui-focused": {
                          bgcolor: "white",
                          "& fieldset": { borderColor: "#0071e3" },
                        },
                      },
                    }}
                    sx={{ mb: 1 }}
                  />

                  <Box sx={{ maxHeight: 192, overflow: "auto" }}>
                    {languages
                      .filter(language => language.toLowerCase().includes(languageSearch.toLowerCase()))
                      .map(language => (
                        <FormControlLabel
                          key={language}
                          control={
                            <Checkbox
                              checked={selectedLanguages.includes(language)}
                              onChange={() => toggleLanguage(language)}
                              size='small'
                              sx={{ "&.Mui-checked": { color: "#0071e3" } }}
                            />
                          }
                          label={<Typography sx={{ fontSize: 13 }}>{language}</Typography>}
                          sx={{
                            display: "flex",
                            m: 0,
                            px: 1.5,
                            py: 1,
                            borderRadius: 1,
                            "&:hover": { bgcolor: "rgba(0, 0, 0, 0.04)" },
                          }}
                        />
                      ))}
                    {languages.filter(language => language.toLowerCase().includes(languageSearch.toLowerCase())).length === 0 && (
                      <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)", px: 1.5, py: 1 }}>
                        No languages found
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Freelancers Grid */}
          <Box>
            {/* Results Count and Sort Bar */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                pb: 2,
                mb: 3,
                borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
              }}>
              <Typography sx={{ fontSize: 13, color: "rgba(0, 0, 0, 0.6)" }}>
                Showing {filteredFreelancers.length} freelancer{filteredFreelancers.length !== 1 ? "s" : ""}
              </Typography>

              <Select
                value={sortBy}
                onChange={handleSortChange}
                IconComponent={KeyboardArrowDown}
                sx={{
                  fontSize: 13,
                  bgcolor: "white",
                  border: "1px solid rgba(0, 0, 0, 0.1)",
                  borderRadius: 1,
                  height: 36,
                  "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                  "&:hover": {
                    border: "1px solid rgba(0, 0, 0, 0.2)",
                  },
                  "&.Mui-focused": {
                    border: "1px solid #0071e3",
                  },
                }}>
                <MenuItem value='relevant' sx={{ fontSize: 13 }}>
                  Most Relevant
                </MenuItem>
                <MenuItem value='rating' sx={{ fontSize: 13 }}>
                  Highest Rated
                </MenuItem>
                <MenuItem value='reviews' sx={{ fontSize: 13 }}>
                  Most Reviews
                </MenuItem>
                <MenuItem value='price-low' sx={{ fontSize: 13 }}>
                  Price: Low to High
                </MenuItem>
                <MenuItem value='price-high' sx={{ fontSize: 13 }}>
                  Price: High to Low
                </MenuItem>
              </Select>
            </Box>

            {/* Active Filters Display */}
            {(selectedRegions.length > 0 || selectedLanguages.length > 0) && (
              <Box sx={{ mb: 3, display: "flex", flexWrap: "wrap", gap: 1 }}>
                {selectedRegions.map(region => (
                  <Chip
                    key={region}
                    label={`Region: ${region}`}
                    onDelete={() => toggleRegion(region)}
                    deleteIcon={<Close />}
                    sx={{
                      bgcolor: "rgba(0, 113, 227, 0.1)",
                      color: "#0071e3",
                      fontSize: 12,
                      height: 28,
                      "& .MuiChip-deleteIcon": {
                        color: "#0071e3",
                        fontSize: 16,
                        "&:hover": { color: "#0071e3", opacity: 0.7 },
                      },
                    }}
                  />
                ))}
                {selectedLanguages.map(language => (
                  <Chip
                    key={language}
                    label={`Language: ${language}`}
                    onDelete={() => toggleLanguage(language)}
                    deleteIcon={<Close />}
                    sx={{
                      bgcolor: "rgba(0, 113, 227, 0.1)",
                      color: "#0071e3",
                      fontSize: 12,
                      height: 28,
                      "& .MuiChip-deleteIcon": {
                        color: "#0071e3",
                        fontSize: 16,
                        "&:hover": { color: "#0071e3", opacity: 0.7 },
                      },
                    }}
                  />
                ))}
              </Box>
            )}

            {/* Results Container */}
            <Box sx={{ minHeight: 800 }}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                    lg: "repeat(3, 1fr)",
                  },
                  gap: 3,
                }}>
                {sortedFreelancers.map(freelancer => (
                  <FreelancerCard
                    key={freelancer.id}
                    freelancer={freelancer}
                    // onClick={() => onNavigate?.("profile", { freelancerId: freelancer.id })}
                  />
                ))}
              </Box>

              {filteredFreelancers.length === 0 && (
                <Box sx={{ textAlign: "center", py: 10 }}>
                  <Typography sx={{ fontSize: 15, color: "rgba(0, 0, 0, 0.6)", mb: 2 }}>
                    {searchQuery ? `No results found for "${searchQuery}".` : "No freelancers found matching your filters."}
                  </Typography>
                  <Button
                    onClick={clearAllFilters}
                    variant='outlined'
                    sx={{
                      px: 3,
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
                    Clear Filters
                  </Button>
                </Box>
              )}
            </Box>
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
            zIndex: 50,
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
