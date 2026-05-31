"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  Stack,
  Collapse,
  Divider,
  ToggleButtonGroup,
  ToggleButton,
  Badge,
} from "@mui/material";
import {
  TuneOutlined,
  Search as SearchIcon,
  KeyboardArrowUp,
  KeyboardArrowDown,
  Close as CloseIcon,
  GridView as GridViewIcon,
  ViewList as ViewListIcon,
} from "@mui/icons-material";
import { FreelancerCard } from "@/components/layout/card/FreelancerCard";
import { FreelancerListCard } from "@/components/layout/card/FreelancerListCard";
import { api } from "@/lib/api";
import { FreelancerProfile } from "@/types/user";

// ─── shared tokens ────────────────────────────────────────────────────────────

const inputSx = {
  "& .MuiOutlinedInput-root": {
    height: 36,
    fontSize: 13,
    borderRadius: "8px",
    backgroundColor: "#FFFFFF",
    "& fieldset": { borderColor: "#E2E8F0" },
    "&:hover fieldset": { borderColor: "#CBD5E1" },
    "&.Mui-focused fieldset": { borderColor: "#0F172A", borderWidth: "1px" },
    "&.Mui-focused": { boxShadow: "0 0 0 3px rgba(15,23,42,0.06)" },
  },
  "& .MuiOutlinedInput-input": {
    padding: "0 12px",
    color: "#0F172A",
    "&::placeholder": { color: "#94A3B8", opacity: 1 },
  },
};

const activeChipSx = {
  height: 26,
  borderRadius: "999px",
  backgroundColor: "#F1F5F9",
  color: "#0F172A",
  fontSize: 12,
  fontWeight: 500,
  "& .MuiChip-label": { px: 1.25 },
  "& .MuiChip-deleteIcon": {
    fontSize: 14,
    color: "#94A3B8",
    mr: 0.5,
    "&:hover": { color: "#0F172A" },
  },
};

// ─── FilterSection ─────────────────────────────────────────────────────────────

function FilterSection({
  title,
  meta,
  open,
  onToggle,
  children,
}: {
  title: string;
  meta?: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <Box sx={{ py: 0.5 }}>
      <Box
        role="button"
        onClick={onToggle}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          py: 0.75,
          userSelect: "none",
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography sx={{ fontSize: 13, fontWeight: 600, letterSpacing: "-0.005em" }}>
            {title}
          </Typography>
          {meta && (
            <Typography sx={{ fontSize: 12, color: "text.disabled" }}>{meta}</Typography>
          )}
        </Stack>
        <KeyboardArrowDown
          sx={{
            fontSize: 18,
            color: "text.disabled",
            transform: open ? "rotate(0deg)" : "rotate(-90deg)",
            transition: "transform 0.2s ease",
          }}
        />
      </Box>
      <Collapse in={open}>
        <Box sx={{ pt: 1 }}>{children}</Box>
      </Collapse>
    </Box>
  );
}

// ─── CheckboxFacet ─────────────────────────────────────────────────────────────

function CheckboxFacet({
  options,
  selected,
  onToggle,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  loading,
  emptyText,
}: {
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
  searchValue: string;
  onSearchChange: (v: string) => void;
  searchPlaceholder: string;
  loading: boolean;
  emptyText: string;
}) {
  const filtered = options.filter((o) =>
    o.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <>
      <TextField
        placeholder={searchPlaceholder}
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        fullWidth
        size="small"
        sx={{ ...inputSx, mb: 1 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 16, color: "text.disabled" }} />
              </InputAdornment>
            ),
          },
        }}
      />
      <Box
        sx={{
          maxHeight: 200,
          overflowY: "auto",
          mx: -1,
          px: 1,
          "&::-webkit-scrollbar": { width: 6 },
          "&::-webkit-scrollbar-thumb": { backgroundColor: "#E2E8F0", borderRadius: 4 },
        }}
      >
        {filtered.length === 0 ? (
          <Typography sx={{ fontSize: 12, color: "text.disabled", px: 1, py: 1 }}>
            {loading ? "Loading…" : emptyText}
          </Typography>
        ) : (
          filtered.map((o) => {
            const checked = selected.includes(o);
            return (
              <FormControlLabel
                key={o}
                onClick={(e) => {
                  e.preventDefault();
                  onToggle(o);
                }}
                control={
                  <Checkbox
                    checked={checked}
                    disableRipple
                    sx={{
                      p: 0,
                      mr: 1.25,
                      color: "#CBD5E1",
                      "&.Mui-checked": { color: "#0F172A" },
                      "& .MuiSvgIcon-root": { fontSize: 18 },
                    }}
                  />
                }
                label={
                  <Typography
                    sx={{
                      fontSize: 13,
                      color: checked ? "text.primary" : "text.secondary",
                      fontWeight: checked ? 500 : 400,
                    }}
                  >
                    {o}
                  </Typography>
                }
                sx={{
                  display: "flex",
                  m: 0,
                  py: 0.875,
                  px: 1,
                  borderRadius: "6px",
                  cursor: "pointer",
                  "&:hover": { backgroundColor: "#F1F5F9" },
                }}
              />
            );
          })
        )}
      </Box>
    </>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

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
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");

  // Sidebar section open/close
  const [expertiseOpen, setExpertiseOpen] = useState(true);
  const [locationOpen, setLocationOpen] = useState(true);
  const [languageOpen, setLanguageOpen] = useState(true);

  // Search states for filter panels
  const [locationSearch, setLocationSearch] = useState("");
  const [languageSearch, setLanguageSearch] = useState("");
  const [expertiseSearch, setExpertiseSearch] = useState("");

  const searchRef = useRef<HTMLInputElement>(null);

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

  // ⌘K / Ctrl+K focuses the search bar
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Derive unique filter options from loaded profiles
  const allLocations = [
    ...new Set(profiles.map((p) => p.location).filter(Boolean) as string[]),
  ].sort();
  const allLanguages = [
    ...new Set(profiles.flatMap((p) => p.languages?.map((l) => l.name) ?? [])),
  ].sort();
  const allExpertises = [
    ...new Set(
      profiles.flatMap((p) => p.expertises?.map((e) => e.expertise_name) ?? [])
    ),
  ].sort();

  // Client-side filtering
  let filtered = [...profiles];

  if (query) {
    const q = query.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        (p.user?.name || "").toLowerCase().includes(q) ||
        (p.tagline || "").toLowerCase().includes(q) ||
        (p.expertises?.some((e) =>
          e.expertise_name.toLowerCase().includes(q)
        ) ?? false)
    );
  }
  if (selectedLocations.length > 0) {
    filtered = filtered.filter(
      (p) => p.location && selectedLocations.includes(p.location)
    );
  }
  if (selectedLanguages.length > 0) {
    filtered = filtered.filter((p) =>
      p.languages?.some((l) => selectedLanguages.includes(l.name))
    );
  }
  if (selectedExpertises.length > 0) {
    filtered = filtered.filter((p) =>
      p.expertises?.some((e) => selectedExpertises.includes(e.expertise_name))
    );
  }

  // Sorting
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "name-asc")
      return (a.user?.name || "").localeCompare(b.user?.name || "");
    if (sortBy === "name-desc")
      return (b.user?.name || "").localeCompare(a.user?.name || "");
    return 0;
  });

  const clearAllFilters = () => {
    setSelectedLocations([]);
    setSelectedLanguages([]);
    setSelectedExpertises([]);
    setQuery("");
  };

  const toggleFilter = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    value: string
  ) => {
    setter((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const activeFiltersCount =
    selectedLocations.length +
    selectedLanguages.length +
    selectedExpertises.length;

  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#F8FAFC" }}>
      {/* Hero */}
      <Box
        sx={{
          textAlign: "center",
          bgcolor: "#fff",
          borderBottom: "1px solid rgba(15,23,42,0.08)",
          py: 5,
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: 32, md: 48 },
              fontWeight: 600,
              color: "#0F172A",
              letterSpacing: "-0.02em",
              mb: 1.5,
            }}
          >
            Find Freelancers
          </Typography>
          <Typography sx={{ fontSize: 17, color: "#64748B" }}>
            Discover talented professionals ready to bring your project to life
          </Typography>
        </Container>
      </Box>

      <Container sx={{ py: { xs: 4, md: 5 } }}>
        {/* Mobile filter toggle */}
        <Box
          sx={{
            display: { xs: "flex", lg: "none" },
            justifyContent: "center",
            mb: 3,
          }}
        >
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outlined"
            startIcon={<TuneOutlined />}
            sx={{
              px: 2.5,
              height: 40,
              fontSize: 13,
              fontWeight: 500,
              color: "#0F172A",
              bgcolor: "white",
              border: "1px solid #E2E8F0",
              borderRadius: "999px",
              textTransform: "none",
              "&:hover": { border: "1px solid #CBD5E1", bgcolor: "white" },
            }}
          >
            Filters
            {activeFiltersCount > 0 && (
              <Box
                component="span"
                sx={{
                  ml: 1,
                  px: 0.875,
                  height: 18,
                  display: "inline-flex",
                  alignItems: "center",
                  bgcolor: "#0F172A",
                  color: "white",
                  borderRadius: "999px",
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                {activeFiltersCount}
              </Box>
            )}
          </Button>
        </Box>

        {/* Error */}
        {error && (
          <Alert
            severity="error"
            sx={{ mb: 3 }}
            action={
              <Button
                color="inherit"
                size="small"
                onClick={() => fetchProfiles(currentPage)}
              >
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {/* Main grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "280px 1fr" },
            gap: 4,
            pb: 4,
          }}
        >
          {/* ── Sidebar ── */}
          <Box sx={{ display: { xs: showFilters ? "block" : "none", lg: "block" } }}>
            <Box
              component="aside"
              sx={{
                position: { lg: "sticky" },
                top: { lg: 96 },
                backgroundColor: "#FFFFFF",
                border: "1px solid #E2E8F0",
                borderRadius: "14px",
                boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  maxHeight: { lg: "calc(100vh - 128px)" },
                  overflowY: "auto",
                  p: "20px 20px 24px",
                  "&::-webkit-scrollbar": { width: 6 },
                  "&::-webkit-scrollbar-thumb": {
                    backgroundColor: "#E2E8F0",
                    borderRadius: 4,
                  },
                }}
              >
                {/* Sidebar header */}
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ mb: 2 }}
                >
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography
                      sx={{
                        fontSize: 15,
                        fontWeight: 600,
                        letterSpacing: "-0.01em",
                      }}
                    >
                      Filters
                    </Typography>
                    {activeFiltersCount > 0 && (
                      <Badge
                        badgeContent={activeFiltersCount}
                        sx={{
                          "& .MuiBadge-badge": {
                            position: "static",
                            transform: "none",
                            backgroundColor: "#0F172A",
                            color: "#FFF",
                            fontSize: 11,
                            fontWeight: 600,
                            height: 18,
                            minWidth: 18,
                            borderRadius: "999px",
                            px: 0.75,
                          },
                        }}
                      />
                    )}
                  </Stack>
                  {activeFiltersCount > 0 && (
                    <Button
                      onClick={clearAllFilters}
                      variant="text"
                      size="small"
                      sx={{
                        textTransform: "none",
                        fontSize: 13,
                        fontWeight: 500,
                        color: "text.secondary",
                        minWidth: 0,
                        p: "2px 4px",
                        "&:hover": {
                          color: "text.primary",
                          backgroundColor: "transparent",
                        },
                      }}
                    >
                      Reset
                    </Button>
                  )}
                </Stack>

                {/* Active filter chips */}
                {activeFiltersCount > 0 && (
                  <Box
                    sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mb: 2.5 }}
                  >
                    {selectedExpertises.map((v) => (
                      <Chip
                        key={`e-${v}`}
                        label={v}
                        onDelete={() => toggleFilter(setSelectedExpertises, v)}
                        deleteIcon={<CloseIcon />}
                        sx={activeChipSx}
                      />
                    ))}
                    {selectedLocations.map((v) => (
                      <Chip
                        key={`l-${v}`}
                        label={v}
                        onDelete={() => toggleFilter(setSelectedLocations, v)}
                        deleteIcon={<CloseIcon />}
                        sx={activeChipSx}
                      />
                    ))}
                    {selectedLanguages.map((v) => (
                      <Chip
                        key={`g-${v}`}
                        label={v}
                        onDelete={() => toggleFilter(setSelectedLanguages, v)}
                        deleteIcon={<CloseIcon />}
                        sx={activeChipSx}
                      />
                    ))}
                  </Box>
                )}

                {/* Expertise */}
                <FilterSection
                  title="Expertise"
                  meta={
                    selectedExpertises.length
                      ? `${selectedExpertises.length} selected`
                      : undefined
                  }
                  open={expertiseOpen}
                  onToggle={() => setExpertiseOpen((v) => !v)}
                >
                  <CheckboxFacet
                    options={allExpertises}
                    selected={selectedExpertises}
                    onToggle={(v) => toggleFilter(setSelectedExpertises, v)}
                    searchValue={expertiseSearch}
                    onSearchChange={setExpertiseSearch}
                    searchPlaceholder="Search expertise"
                    loading={loading}
                    emptyText="No expertise options available"
                  />
                </FilterSection>

                <Divider sx={{ my: 1.5, borderColor: "#F1F5F9" }} />

                {/* Location */}
                <FilterSection
                  title="Location"
                  meta={
                    selectedLocations.length
                      ? `${selectedLocations.length} selected`
                      : undefined
                  }
                  open={locationOpen}
                  onToggle={() => setLocationOpen((v) => !v)}
                >
                  <CheckboxFacet
                    options={allLocations}
                    selected={selectedLocations}
                    onToggle={(v) => toggleFilter(setSelectedLocations, v)}
                    searchValue={locationSearch}
                    onSearchChange={setLocationSearch}
                    searchPlaceholder="Search locations"
                    loading={loading}
                    emptyText="No locations available"
                  />
                </FilterSection>

                <Divider sx={{ my: 1.5, borderColor: "#F1F5F9" }} />

                {/* Language */}
                <FilterSection
                  title="Language"
                  meta={
                    selectedLanguages.length
                      ? `${selectedLanguages.length} selected`
                      : undefined
                  }
                  open={languageOpen}
                  onToggle={() => setLanguageOpen((v) => !v)}
                >
                  <CheckboxFacet
                    options={allLanguages}
                    selected={selectedLanguages}
                    onToggle={(v) => toggleFilter(setSelectedLanguages, v)}
                    searchValue={languageSearch}
                    onSearchChange={setLanguageSearch}
                    searchPlaceholder="Search languages"
                    loading={loading}
                    emptyText="No languages available"
                  />
                </FilterSection>
              </Box>
            </Box>
          </Box>

          {/* ── Results ── */}
          <Box>
            {/* Results toolbar */}
            <Stack direction="row" spacing={1.5} sx={{ mb: 2 }}>
              {/* Keyword search */}
              <TextField
                inputRef={searchRef}
                fullWidth
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search freelancers by name, skill, or expertise…"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ fontSize: 18, color: "text.disabled" }} />
                      </InputAdornment>
                    ),
                    endAdornment: query ? (
                      <InputAdornment position="end">
                        <CloseIcon
                          sx={{ fontSize: 16, color: "text.disabled", cursor: "pointer", "&:hover": { color: "text.primary" } }}
                          onClick={() => setQuery("")}
                        />
                      </InputAdornment>
                    ) : undefined,
                  },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    height: 44,
                    fontSize: 14,
                    borderRadius: "10px",
                    backgroundColor: "#FFFFFF",
                    boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
                    "& fieldset": { borderColor: "#E2E8F0" },
                    "&:hover fieldset": { borderColor: "#CBD5E1" },
                    "&.Mui-focused fieldset": {
                      borderColor: "#0F172A",
                      borderWidth: "1px",
                    },
                    "&.Mui-focused": {
                      boxShadow: "0 0 0 3px rgba(15,23,42,0.06)",
                    },
                  },
                  "& .MuiOutlinedInput-input": {
                    color: "#0F172A",
                    "&::placeholder": { color: "#94A3B8", opacity: 1 },
                  },
                }}
              />

              {/* Sort */}
              <Select
                value={sortBy}
                onChange={(e: SelectChangeEvent) => setSortBy(e.target.value)}
                sx={{
                  height: 44,
                  minWidth: 180,
                  borderRadius: "10px",
                  backgroundColor: "#FFFFFF",
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#0F172A",
                  boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#E2E8F0",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#CBD5E1",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#0F172A",
                    borderWidth: "1px",
                  },
                }}
              >
                <MenuItem value="relevant" sx={{ fontSize: 13 }}>
                  Most Relevant
                </MenuItem>
                <MenuItem value="name-asc" sx={{ fontSize: 13 }}>
                  Name: A–Z
                </MenuItem>
                <MenuItem value="name-desc" sx={{ fontSize: 13 }}>
                  Name: Z–A
                </MenuItem>
              </Select>
            </Stack>

            {/* Count + view toggle row */}
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mb: 2.5 }}
            >
              <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                {loading ? (
                  "Loading…"
                ) : (
                  <>
                    Showing{" "}
                    <Box
                      component="span"
                      sx={{ color: "text.primary", fontWeight: 600 }}
                    >
                      {sorted.length}
                    </Box>{" "}
                    of {total.toLocaleString()}{" "}
                    {total === 1 ? "freelancer" : "freelancers"}
                  </>
                )}
              </Typography>

              <ToggleButtonGroup
                value={view}
                exclusive
                onChange={(_, v) => v && setView(v)}
                sx={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  borderRadius: "8px",
                  "& .MuiToggleButton-root": {
                    border: "none",
                    width: 32,
                    height: 32,
                    p: 0,
                    color: "#94A3B8",
                    "&.Mui-selected": {
                      backgroundColor: "#F1F5F9",
                      color: "#0F172A",
                      "&:hover": { backgroundColor: "#F1F5F9" },
                    },
                  },
                }}
              >
                <ToggleButton value="grid">
                  <GridViewIcon sx={{ fontSize: 16 }} />
                </ToggleButton>
                <ToggleButton value="list">
                  <ViewListIcon sx={{ fontSize: 16 }} />
                </ToggleButton>
              </ToggleButtonGroup>
            </Stack>

            {/* Active filter chips above results */}
            {(selectedLocations.length > 0 ||
              selectedLanguages.length > 0 ||
              selectedExpertises.length > 0) && (
              <Box
                sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mb: 2.5 }}
              >
                {selectedExpertises.map((v) => (
                  <Chip
                    key={`e-${v}`}
                    label={v}
                    onDelete={() => toggleFilter(setSelectedExpertises, v)}
                    deleteIcon={<CloseIcon />}
                    sx={activeChipSx}
                  />
                ))}
                {selectedLocations.map((v) => (
                  <Chip
                    key={`l-${v}`}
                    label={v}
                    onDelete={() => toggleFilter(setSelectedLocations, v)}
                    deleteIcon={<CloseIcon />}
                    sx={activeChipSx}
                  />
                ))}
                {selectedLanguages.map((v) => (
                  <Chip
                    key={`g-${v}`}
                    label={v}
                    onDelete={() => toggleFilter(setSelectedLanguages, v)}
                    deleteIcon={<CloseIcon />}
                    sx={activeChipSx}
                  />
                ))}
              </Box>
            )}

            {/* Loading */}
            {loading ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: 400,
                }}
              >
                <CircularProgress sx={{ color: "#0F172A" }} />
              </Box>
            ) : (
              <>
                {view === "list" ? (
                  <Stack spacing={1.5}>
                    {sorted.map((profile) => (
                      <FreelancerListCard key={profile.id} profile={profile} />
                    ))}
                  </Stack>
                ) : (
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
                      }}
                    >
                      {sorted.map((profile) => (
                        <FreelancerCard key={profile.id} profile={profile} />
                      ))}
                    </Box>
                  </Box>
                )}

                {sorted.length === 0 && (
                  <Box sx={{ textAlign: "center", py: 10 }}>
                    <Typography
                      sx={{ fontSize: 15, color: "text.secondary", mb: 2 }}
                    >
                      No freelancers found matching your filters.
                    </Typography>
                    {(activeFiltersCount > 0 || query) && (
                      <Button
                        onClick={clearAllFilters}
                        variant="outlined"
                        sx={{
                          px: 3,
                          height: 40,
                          fontSize: 13,
                          color: "#0F172A",
                          bgcolor: "white",
                          border: "1px solid #E2E8F0",
                          borderRadius: "999px",
                          textTransform: "none",
                          "&:hover": {
                            border: "1px solid #CBD5E1",
                            bgcolor: "white",
                          },
                        }}
                      >
                        Clear Filters
                      </Button>
                    )}
                  </Box>
                )}

                {/* Pagination */}
                {lastPage > 1 && (
                  <Box
                    sx={{ display: "flex", justifyContent: "center", mt: 6 }}
                  >
                    <Pagination
                      count={lastPage}
                      page={currentPage}
                      onChange={handlePageChange}
                      size="large"
                      sx={{
                        "& .MuiPaginationItem-root": {
                          fontSize: 14,
                          "&.Mui-selected": {
                            bgcolor: "#0F172A",
                            color: "white",
                            "&:hover": { bgcolor: "#1E293B" },
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
            bgcolor: "#0F172A",
            color: "white",
            "&:hover": { bgcolor: "#1E293B", transform: "scale(1.08)" },
            transition: "all 0.2s",
          }}
          aria-label="Scroll to top"
        >
          <KeyboardArrowUp />
        </Fab>
      )}
    </Box>
  );
}
