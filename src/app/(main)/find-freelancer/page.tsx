"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Container,
  Button,
  Typography,
  Checkbox,
  FormControlLabel,
  TextField,
  Select,
  MenuItem,
  Chip,
  Fab,
  InputAdornment,
  SelectChangeEvent,
  CircularProgress,
  Alert,
  Pagination,
  Grid,
} from "@mui/material";
import { TuneOutlined, Search as SearchIcon, KeyboardArrowUp, KeyboardArrowDown, Close } from "@mui/icons-material";
import { FreelancerCard } from "@/components/layout/card/FreelancerCard";
import { api } from "@/lib/api";
import { FreelancerProfile } from "@/types/user";

export default function FindFreelancersPage() {
  // API state
  const [profiles, setProfiles] = useState<FreelancerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Filter state
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedExpertises, setSelectedExpertises] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [sortBy, setSortBy] = useState("relevant");

  // Search states for filter panels
  const [locationSearch, setLocationSearch] = useState("");
  const [languageSearch, setLanguageSearch] = useState("");
  const [expertiseSearch, setExpertiseSearch] = useState("");

  const fetchProfiles = useCallback(async (page: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getFreelancerProfiles(page);
      const data = Array.isArray(response.data) ? response.data : [];
      setProfiles(data);
      setLastPage(response.meta?.last_page ?? 1);
      setTotal(response.meta?.total ?? data.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load freelancers");
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfiles(currentPage);
  }, [currentPage, fetchProfiles]);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Derive unique filter options from loaded profiles
  const allLocations = [...new Set(profiles.map(p => p.location).filter(Boolean) as string[])].sort();
  const allLanguages = [...new Set(profiles.flatMap(p => p.languages?.map(l => l.name) ?? []))].sort();
  const allExpertises = [...new Set(profiles.flatMap(p => p.expertises?.map(e => e.expertise_name) ?? []))].sort();

  // Client-side filtering on loaded page data
  let filtered = [...profiles];

  if (selectedLocations.length > 0) {
    filtered = filtered.filter(p => p.location && selectedLocations.includes(p.location));
  }
  if (selectedLanguages.length > 0) {
    filtered = filtered.filter(p => p.languages?.some(l => selectedLanguages.includes(l.name)));
  }
  if (selectedExpertises.length > 0) {
    filtered = filtered.filter(p => p.expertises?.some(e => selectedExpertises.includes(e.expertise_name)));
  }

  // Sorting
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "name-asc") return (a.user?.name || "").localeCompare(b.user?.name || "");
    if (sortBy === "name-desc") return (b.user?.name || "").localeCompare(a.user?.name || "");
    return 0; // "relevant" — keep API order
  });

  const clearAllFilters = () => {
    setSelectedLocations([]);
    setSelectedLanguages([]);
    setSelectedExpertises([]);
  };

  const toggleFilter = (setter: React.Dispatch<React.SetStateAction<string[]>>, value: string) => {
    setter(prev => (prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]));
  };

  const activeFiltersCount = selectedLocations.length + selectedLanguages.length + selectedExpertises.length;

  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#F5F5F7" }}>
      <Container maxWidth='xl' sx={{ px: { xs: 3, md: 6 }, py: { xs: 6, md: 10 } }}>
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
            Find Freelancers
          </Typography>
          <Typography sx={{ fontSize: 17, color: "rgba(0, 0, 0, 0.6)" }}>
            Discover talented professionals ready to bring your project to life
          </Typography>
        </Box>

        {/* Filter Toggle — Mobile */}
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
              "&:hover": { border: "1px solid rgba(0, 0, 0, 0.2)", bgcolor: "white" },
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

        {/* Error state */}
        {error && (
          <Alert
            severity='error'
            sx={{ mb: 3 }}
            action={
              <Button color='inherit' size='small' onClick={() => fetchProfiles(currentPage)}>
                Retry
              </Button>
            }>
            {error}
          </Alert>
        )}

        {/* Main Grid */}
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
              {/* Sidebar Header */}
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 3, pb: 2 }}>
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
                      "&:hover": { bgcolor: "transparent", textDecoration: "underline" },
                    }}>
                    Clear all
                  </Button>
                )}
              </Box>

              <Box sx={{ overflow: "auto", px: 3, pb: 3 }}>
                {/* Expertise Filter */}
                <Box sx={{ mb: 3 }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 1.5 }}>Expertise</Typography>
                  <TextField
                    fullWidth
                    placeholder='Search expertise...'
                    value={expertiseSearch}
                    onChange={e => setExpertiseSearch(e.target.value)}
                    size='small'
                    slotProps={{
                      input: {
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
                          "&.Mui-focused": { bgcolor: "white", "& fieldset": { borderColor: "#0071e3" } },
                        },
                      },
                    }}
                    sx={{ mb: 1 }}
                  />
                  <Box sx={{ maxHeight: 192, overflow: "auto" }}>
                    {allExpertises
                      .filter(e => e.toLowerCase().includes(expertiseSearch.toLowerCase()))
                      .map(expertise => (
                        <FormControlLabel
                          key={expertise}
                          control={
                            <Checkbox
                              checked={selectedExpertises.includes(expertise)}
                              onChange={() => toggleFilter(setSelectedExpertises, expertise)}
                              size='small'
                              sx={{ "&.Mui-checked": { color: "#0071e3" } }}
                            />
                          }
                          label={<Typography sx={{ fontSize: 13 }}>{expertise}</Typography>}
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
                    {allExpertises.filter(e => e.toLowerCase().includes(expertiseSearch.toLowerCase())).length === 0 && (
                      <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)", px: 1.5, py: 1 }}>
                        {loading ? "Loading..." : "No expertise options available"}
                      </Typography>
                    )}
                  </Box>
                </Box>

                {/* Location Filter */}
                <Box sx={{ pt: 3, borderTop: "1px solid rgba(0, 0, 0, 0.08)", mb: 3 }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 1.5 }}>Location</Typography>
                  <TextField
                    fullWidth
                    placeholder='Search locations...'
                    value={locationSearch}
                    onChange={e => setLocationSearch(e.target.value)}
                    size='small'
                    slotProps={{
                      input: {
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
                          "&.Mui-focused": { bgcolor: "white", "& fieldset": { borderColor: "#0071e3" } },
                        },
                      },
                    }}
                    sx={{ mb: 1 }}
                  />
                  <Box sx={{ maxHeight: 192, overflow: "auto" }}>
                    {allLocations
                      .filter(l => l.toLowerCase().includes(locationSearch.toLowerCase()))
                      .map(location => (
                        <FormControlLabel
                          key={location}
                          control={
                            <Checkbox
                              checked={selectedLocations.includes(location)}
                              onChange={() => toggleFilter(setSelectedLocations, location)}
                              size='small'
                              sx={{ "&.Mui-checked": { color: "#0071e3" } }}
                            />
                          }
                          label={<Typography sx={{ fontSize: 13 }}>{location}</Typography>}
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
                    {allLocations.filter(l => l.toLowerCase().includes(locationSearch.toLowerCase())).length === 0 && (
                      <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)", px: 1.5, py: 1 }}>
                        {loading ? "Loading..." : "No locations available"}
                      </Typography>
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
                    slotProps={{
                      input: {
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
                          "&.Mui-focused": { bgcolor: "white", "& fieldset": { borderColor: "#0071e3" } },
                        },
                      },
                    }}
                    sx={{ mb: 1 }}
                  />
                  <Box sx={{ maxHeight: 192, overflow: "auto" }}>
                    {allLanguages
                      .filter(l => l.toLowerCase().includes(languageSearch.toLowerCase()))
                      .map(language => (
                        <FormControlLabel
                          key={language}
                          control={
                            <Checkbox
                              checked={selectedLanguages.includes(language)}
                              onChange={() => toggleFilter(setSelectedLanguages, language)}
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
                    {allLanguages.filter(l => l.toLowerCase().includes(languageSearch.toLowerCase())).length === 0 && (
                      <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)", px: 1.5, py: 1 }}>
                        {loading ? "Loading..." : "No languages available"}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Results */}
          <Box>
            {/* Sort Bar */}
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
                {loading ? "Loading..." : `Showing ${sorted.length} of ${total} freelancer${total !== 1 ? "s" : ""}`}
              </Typography>

              <Select
                value={sortBy}
                onChange={(e: SelectChangeEvent) => setSortBy(e.target.value)}
                IconComponent={KeyboardArrowDown}
                sx={{
                  fontSize: 13,
                  bgcolor: "white",
                  border: "1px solid rgba(0, 0, 0, 0.1)",
                  borderRadius: 1,
                  height: 36,
                  "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                  "&:hover": { border: "1px solid rgba(0, 0, 0, 0.2)" },
                  "&.Mui-focused": { border: "1px solid #0071e3" },
                }}>
                <MenuItem value='relevant' sx={{ fontSize: 13 }}>
                  Most Relevant
                </MenuItem>
                <MenuItem value='name-asc' sx={{ fontSize: 13 }}>
                  Name: A–Z
                </MenuItem>
                <MenuItem value='name-desc' sx={{ fontSize: 13 }}>
                  Name: Z–A
                </MenuItem>
              </Select>
            </Box>

            {/* Active filter chips */}
            {(selectedLocations.length > 0 || selectedLanguages.length > 0 || selectedExpertises.length > 0) && (
              <Box sx={{ mb: 3, display: "flex", flexWrap: "wrap", gap: 1 }}>
                {selectedLocations.map(loc => (
                  <Chip
                    key={loc}
                    label={`Location: ${loc}`}
                    onDelete={() => toggleFilter(setSelectedLocations, loc)}
                    deleteIcon={<Close />}
                    sx={{
                      bgcolor: "rgba(0, 113, 227, 0.1)",
                      color: "#0071e3",
                      fontSize: 12,
                      height: 28,
                      "& .MuiChip-deleteIcon": { color: "#0071e3", fontSize: 16, "&:hover": { opacity: 0.7 } },
                    }}
                  />
                ))}
                {selectedLanguages.map(lang => (
                  <Chip
                    key={lang}
                    label={`Language: ${lang}`}
                    onDelete={() => toggleFilter(setSelectedLanguages, lang)}
                    deleteIcon={<Close />}
                    sx={{
                      bgcolor: "rgba(0, 113, 227, 0.1)",
                      color: "#0071e3",
                      fontSize: 12,
                      height: 28,
                      "& .MuiChip-deleteIcon": { color: "#0071e3", fontSize: 16, "&:hover": { opacity: 0.7 } },
                    }}
                  />
                ))}
                {selectedExpertises.map(exp => (
                  <Chip
                    key={exp}
                    label={`Expertise: ${exp}`}
                    onDelete={() => toggleFilter(setSelectedExpertises, exp)}
                    deleteIcon={<Close />}
                    sx={{
                      bgcolor: "rgba(0, 113, 227, 0.1)",
                      color: "#0071e3",
                      fontSize: 12,
                      height: 28,
                      "& .MuiChip-deleteIcon": { color: "#0071e3", fontSize: 16, "&:hover": { opacity: 0.7 } },
                    }}
                  />
                ))}
              </Box>
            )}

            {/* Loading */}
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
                <CircularProgress sx={{ color: "#0071e3" }} />
              </Box>
            ) : (
              <>
                <Grid container spacing={3}>
                  {sorted.map(profile => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={profile.id}>
                      <FreelancerCard profile={profile} />
                    </Grid>
                  ))}
                </Grid>

                {sorted.length === 0 && !loading && (
                  <Box sx={{ textAlign: "center", py: 10 }}>
                    <Typography sx={{ fontSize: 15, color: "rgba(0, 0, 0, 0.6)", mb: 2 }}>
                      No freelancers found matching your filters.
                    </Typography>
                    {activeFiltersCount > 0 && (
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
                          "&:hover": { border: "1px solid rgba(0, 0, 0, 0.2)", bgcolor: "white" },
                        }}>
                        Clear Filters
                      </Button>
                    )}
                  </Box>
                )}

                {/* Pagination */}
                {lastPage > 1 && (
                  <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
                    <Pagination
                      count={lastPage}
                      page={currentPage}
                      onChange={handlePageChange}
                      color='primary'
                      size='large'
                      sx={{
                        "& .MuiPaginationItem-root": {
                          fontSize: 14,
                          "&.Mui-selected": {
                            bgcolor: "#0071e3",
                            color: "white",
                            "&:hover": { bgcolor: "#0062c4" },
                          },
                        },
                      }}
                    />
                  </Box>
                )}
              </>
            )}
          </Box>
        </Box>
      </Container>

      {/* Scroll to top */}
      {showScrollTop && (
        <Fab
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          sx={{
            position: "fixed",
            bottom: 32,
            right: 32,
            bgcolor: "black",
            color: "white",
            "&:hover": { bgcolor: "black", transform: "scale(1.1)" },
            transition: "all 0.3s",
          }}
          aria-label='Scroll to top'>
          <KeyboardArrowUp />
        </Fab>
      )}
    </Box>
  );
}
