"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  List as ListIcon,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { css, cva } from "styled-system/css";
import { Alert, Pager, Spinner } from "@/components/ds";
import { FreelancerCard } from "@/components/layout/card/FreelancerCard";
import { FreelancerListCard } from "@/components/layout/card/FreelancerListCard";
import { api } from "@/lib/api";
import { FreelancerProfile } from "@/types/user";
import { Checkbox, SearchInput, SelectInput } from "@/components/ui/inputs";

// ─── shared tokens ────────────────────────────────────────────────────────────

const SORT_OPTIONS = [
  { value: "relevant", label: "Most Relevant" },
  { value: "name-asc", label: "Name: A–Z" },
  { value: "name-desc", label: "Name: Z–A" },
];

// Chip with a delete icon: 26px pill, 10px label padding, the delete glyph
// pulled 6px left (the default) and 4px off the right edge.
const activeChip = css({
  display: "inline-flex",
  alignItems: "center",
  h: "26px",
  pl: "10px",
  pr: "4px",
  borderRadius: "999px",
  bg: "#F1F5F9",
  color: "#0F172A",
  textStyle: "meta",
  fontWeight: 500,
  maxW: "100%",
  boxSizing: "border-box",
});
const activeChipLabel = css({
  pr: "10px",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});
const activeChipRemove = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  p: 0,
  border: "none",
  bg: "transparent",
  color: "#94A3B8",
  cursor: "pointer",
  ml: "-6px",
  _hover: { color: "#0F172A" },
  _focusVisible: { outline: "none", boxShadow: "focusRing", borderRadius: "999px" },
  "& svg": { display: "block" },
});
const chipRow = css({ display: "flex", flexWrap: "wrap", gap: "6px", mb: "20px" });

// ─── FilterSection ─────────────────────────────────────────────────────────────

const sectionWrap = css({ py: "4px" });
const sectionHeader = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  cursor: "pointer",
  py: "6px",
  userSelect: "none",
});
// The old stack spacing put a margin-left on the meta <p>, which globals.css's
// unlayered `p { margin: 0 }` already suppressed — so there is no gap here.
const sectionTitleRow = css({ display: "flex", alignItems: "center", minW: 0 });
const sectionTitle = css({
  textStyle: "ui",
  fontWeight: 600,
  color: "ink",
});
const sectionMeta = css({ textStyle: "meta", color: "ink3" });
const sectionChevron = css({
  color: "ink3",
  flexShrink: 0,
  transition: "transform 0.2s ease",
  transform: "rotate(-90deg)",
  "&[data-open]": { transform: "rotate(0deg)" },
});
// Pure-CSS collapse (0fr → 1fr) so the section still animates like a collapse.
const collapse = css({
  display: "grid",
  gridTemplateRows: "0fr",
  transition: "grid-template-rows 0.3s ease",
  "&[data-open]": { gridTemplateRows: "1fr" },
});
const collapseInner = css({ overflow: "hidden", minH: 0 });
const collapseBody = css({ pt: "8px" });

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
    <div className={sectionWrap}>
      <div role="button" onClick={onToggle} className={sectionHeader}>
        <div className={sectionTitleRow}>
          <p className={sectionTitle}>{title}</p>
          {meta && <p className={sectionMeta}>{meta}</p>}
        </div>
        <ChevronDown size={18} className={sectionChevron} data-open={open ? "" : undefined} />
      </div>
      <div className={collapse} data-open={open ? "" : undefined}>
        <div className={collapseInner}>
          <div className={collapseBody}>{children}</div>
        </div>
      </div>
    </div>
  );
}

// ─── CheckboxFacet ─────────────────────────────────────────────────────────────

const facetSearchWrap = css({ mb: "8px" });
const facetScroll = css({
  maxH: "200px",
  overflowY: "auto",
  mx: "-8px",
  px: "8px",
  "&::-webkit-scrollbar": { width: "6px" },
  "&::-webkit-scrollbar-thumb": { backgroundColor: "#E2E8F0", borderRadius: "4px" },
});
const facetEmpty = css({
  textStyle: "meta",
  color: "ink3",
  px: "8px",
  py: "8px",
});
// The row look (padding / radius / hover) and the ink-coloured tick live on the
// wrapper: the kit Checkbox has no className, so the label is stretched from here.
const facetRow = css({
  borderRadius: "6px",
  _hover: { bg: "#F1F5F9" },
  "& > label": { py: "7px", px: "8px", borderRadius: "6px", textStyle: "ui" },
  "& [data-part=control]": { mt: 0 },
  "& [data-part=control][data-state=checked]": { bg: "#0F172A", borderColor: "#0F172A" },
  // The kit label is 14.5px; the facet rows are 13px like the original.
  "& [data-part=label]": { textStyle: "ui" },
});
const facetLabel = css({ textStyle: "ui", color: "ink2", fontWeight: 400 });
const facetLabelOn = css({ textStyle: "ui", color: "ink", fontWeight: 500 });

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
      <div className={facetSearchWrap}>
        <SearchInput
          size="sm"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={onSearchChange}
        />
      </div>
      <div className={facetScroll}>
        {filtered.length === 0 ? (
          <p className={facetEmpty}>{loading ? "Loading…" : emptyText}</p>
        ) : (
          filtered.map((o) => {
            const checked = selected.includes(o);
            return (
              <div key={o} className={facetRow}>
                <Checkbox
                  checked={checked}
                  onChange={() => onToggle(o)}
                  label={<span className={checked ? facetLabelOn : facetLabel}>{o}</span>}
                />
              </div>
            );
          })
        )}
      </div>
    </>
  );
}

// ─── Page chrome ───────────────────────────────────────────────────────────────

const page = css({ minH: "100vh", bg: "#F8FAFC" });
const hero = css({
  textAlign: "center",
  bg: "#fff",
  borderBottomWidth: "1px",
  borderBottomStyle: "solid",
  borderBottomColor: "rgba(15,23,42,0.08)",
  py: "40px",
});
const heroInner = css({ maxW: "900px", mx: "auto", w: "100%", px: { base: "16px", sm: "24px" }, boxSizing: "border-box" });
// The h1's `mb` never applied (globals.css `h1 { margin: 0 }` is unlayered).
const heroTitle = css({
  textStyle: { base: "stat", md: "display" },
  fontWeight: 600,
  color: "#0F172A",
});
const heroSub = css({ textStyle: "lead", color: "#64748B" });

const container = css({
  maxW: "1200px",
  mx: "auto",
  w: "100%",
  px: { base: "16px", sm: "24px" },
  py: { base: "32px", md: "40px" },
  boxSizing: "border-box",
});

const mobileFilterRow = css({ display: { base: "flex", lg: "none" }, justifyContent: "center", mb: "24px" });
const pillButton = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  h: "40px",
  px: "20px",
  minW: "64px",
  textStyle: "ui",
  fontWeight: 500,
  color: "#0F172A",
  bg: "white",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "#E2E8F0",
  borderRadius: "999px",
  cursor: "pointer",
  boxSizing: "border-box",
  whiteSpace: "nowrap",
  _hover: { borderColor: "#CBD5E1", bg: "white" },
  _focusVisible: { outline: "none", boxShadow: "focusRing" },
  "& svg": { display: "block" },
});
// Button start-icon metrics for a medium button.
const startIcon = css({ ml: "-4px", mr: "8px", flexShrink: 0 });
const countBubble = css({
  ml: "8px",
  px: "7px",
  h: "18px",
  display: "inline-flex",
  alignItems: "center",
  bg: "#0F172A",
  color: "white",
  borderRadius: "999px",
  textStyle: "micro",
  fontWeight: 600,
});
const errorWrap = css({ mb: "24px" });
const retryBtn = css({
  textStyle: "ui",
  fontWeight: 500,
  color: "inherit",
  bg: "transparent",
  border: "none",
  borderRadius: "4px",
  px: "5px",
  py: "4px",
  minW: "64px",
  cursor: "pointer",
  flexShrink: 0,
  _hover: { bg: "rgba(0,0,0,0.06)" },
  _focusVisible: { outline: "none", boxShadow: "focusRing" },
});

const mainGrid = css({
  display: "grid",
  gridTemplateColumns: { base: "1fr", lg: "280px 1fr" },
  gap: "32px",
  pb: "32px",
});
const sidebarHidden = css({ display: "none", lg: { display: "block" } });
const sidebarShown = css({ display: "block" });
const asideCss = css({
  position: { lg: "sticky" },
  top: { lg: "96px" },
  bg: "#FFFFFF",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "#E2E8F0",
  borderRadius: "14px",
  boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
  overflow: "hidden",
});
const asideScroll = css({
  maxH: { lg: "calc(100vh - 128px)" },
  overflowY: "auto",
  p: "20px 20px 24px",
  "&::-webkit-scrollbar": { width: "6px" },
  "&::-webkit-scrollbar-thumb": { backgroundColor: "#E2E8F0", borderRadius: "4px" },
});
const sidebarHead = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  mb: "16px",
});
const sidebarHeadLeft = css({ display: "flex", alignItems: "center", gap: "8px" });
const sidebarTitle = css({ textStyle: "body", fontWeight: 600, color: "ink" });
const sidebarCount = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  h: "18px",
  minW: "18px",
  px: "6px",
  bg: "#0F172A",
  color: "#FFF",
  textStyle: "micro",
  fontWeight: 600,
  borderRadius: "999px",
  boxSizing: "border-box",
});
const resetBtn = css({
  textStyle: "ui",
  fontWeight: 500,
  color: "ink2",
  bg: "transparent",
  border: "none",
  borderRadius: "4px",
  minW: 0,
  p: "2px 4px",
  cursor: "pointer",
  _hover: { color: "ink", bg: "transparent" },
  _focusVisible: { outline: "none", boxShadow: "focusRing" },
});
const facetDivider = css({ my: "12px", h: "1px", bg: "#F1F5F9", border: "none" });

const toolbar = css({ display: "flex", gap: "12px", mb: "16px" });
const sortWrap = css({ minW: "180px" });
const countRow = css({ display: "flex", alignItems: "center", justifyContent: "space-between", mb: "20px" });
const countText = css({ textStyle: "ui", color: "ink2" });
const countStrong = css({ color: "ink", fontWeight: 600 });

const viewGroup = css({
  display: "flex",
  bg: "#FFFFFF",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "#E2E8F0",
  borderRadius: "8px",
  flexShrink: 0,
});
const viewBtn = cva({
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    w: "32px",
    h: "32px",
    p: 0,
    border: "none",
    bg: "transparent",
    color: "#94A3B8",
    cursor: "pointer",
    transition: "background-color .15s, color .15s",
    _hover: { bg: "rgba(0, 0, 0, 0.04)" },
    _focusVisible: { outline: "none", boxShadow: "focusRing" },
    "& svg": { display: "block" },
  },
  variants: {
    side: {
      left: { borderRadius: "4px 0 0 4px" },
      right: { borderRadius: "0 4px 4px 0" },
    },
    active: {
      true: { bg: "#F1F5F9", color: "#0F172A", _hover: { bg: "#F1F5F9" } },
    },
  },
});

const loadingWrap = css({ display: "flex", justifyContent: "center", alignItems: "center", minH: "400px" });
const spinnerInk = css({ color: "#0F172A" });
const listWrap = css({ display: "flex", flexDirection: "column", gap: "12px" });
const gridMin = css({ minH: "800px" });
const cardsGrid = css({
  display: "grid",
  gridTemplateColumns: { base: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" },
  gap: "24px",
});
const emptyWrap = css({ textAlign: "center", py: "80px" });
const emptyText = css({ textStyle: "body", color: "ink2" });
const clearBtn = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  h: "40px",
  px: "24px",
  minW: "64px",
  textStyle: "ui",
  fontWeight: 500,
  color: "#0F172A",
  bg: "white",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "#E2E8F0",
  borderRadius: "999px",
  cursor: "pointer",
  boxSizing: "border-box",
  _hover: { borderColor: "#CBD5E1", bg: "white" },
  _focusVisible: { outline: "none", boxShadow: "focusRing" },
});
// Large pagination: 40px circular items with the selected pill in ink.
const pagerWrap = css({
  display: "flex",
  justifyContent: "center",
  mt: "48px",
  "& button": { minW: "40px", h: "40px", borderRadius: "999px", textStyle: "body" },
  "& [aria-current=page]": {
    bg: "#0F172A",
    color: "white",
    _hover: { bg: "#1E293B", color: "white" },
  },
});
const fab = css({
  position: "fixed",
  bottom: "32px",
  right: "32px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  w: "56px",
  h: "56px",
  p: 0,
  border: "none",
  borderRadius: "50%",
  bg: "#0F172A",
  color: "white",
  cursor: "pointer",
  boxShadow: "0px 3px 5px -1px rgba(0,0,0,0.2), 0px 6px 10px 0px rgba(0,0,0,0.14), 0px 1px 18px 0px rgba(0,0,0,0.12)",
  transition: "all 0.2s",
  _hover: { bg: "#1E293B", transform: "scale(1.08)" },
  _focusVisible: { outline: "none", boxShadow: "focusRing" },
  "& svg": { display: "block" },
});

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
        document.getElementById("find-freelancer-search")?.focus();
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderChips = () => (
    <>
      {selectedExpertises.map((v) => (
        <span key={`e-${v}`} className={activeChip}>
          <span className={activeChipLabel}>{v}</span>
          <button
            type="button"
            aria-label={`Remove ${v} filter`}
            onClick={() => toggleFilter(setSelectedExpertises, v)}
            className={activeChipRemove}
          >
            <X size={14} />
          </button>
        </span>
      ))}
      {selectedLocations.map((v) => (
        <span key={`l-${v}`} className={activeChip}>
          <span className={activeChipLabel}>{v}</span>
          <button
            type="button"
            aria-label={`Remove ${v} filter`}
            onClick={() => toggleFilter(setSelectedLocations, v)}
            className={activeChipRemove}
          >
            <X size={14} />
          </button>
        </span>
      ))}
      {selectedLanguages.map((v) => (
        <span key={`g-${v}`} className={activeChip}>
          <span className={activeChipLabel}>{v}</span>
          <button
            type="button"
            aria-label={`Remove ${v} filter`}
            onClick={() => toggleFilter(setSelectedLanguages, v)}
            className={activeChipRemove}
          >
            <X size={14} />
          </button>
        </span>
      ))}
    </>
  );

  return (
    <div className={page}>
      {/* Hero */}
      <div className={hero}>
        <div className={heroInner}>
          <h1 className={heroTitle}>Find Freelancers</h1>
          <p className={heroSub}>
            Discover talented professionals ready to bring your project to life
          </p>
        </div>
      </div>

      <div className={container}>
        {/* Mobile filter toggle */}
        <div className={mobileFilterRow}>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={pillButton}
          >
            <SlidersHorizontal size={20} className={startIcon} />
            Filters
            {activeFiltersCount > 0 && (
              <span className={countBubble}>{activeFiltersCount}</span>
            )}
          </button>
        </div>

        {/* Error */}
        {error && (
          <Alert
            tone="error"
            className={errorWrap}
            action={
              <button
                type="button"
                className={retryBtn}
                onClick={() => fetchProfiles(currentPage)}
              >
                Retry
              </button>
            }
          >
            {error}
          </Alert>
        )}

        {/* Main grid */}
        <div className={mainGrid}>
          {/* ── Sidebar ── */}
          <div className={showFilters ? sidebarShown : sidebarHidden}>
            <aside className={asideCss}>
              <div className={asideScroll}>
                {/* Sidebar header */}
                <div className={sidebarHead}>
                  <div className={sidebarHeadLeft}>
                    <p className={sidebarTitle}>Filters</p>
                    {activeFiltersCount > 0 && (
                      <span className={sidebarCount}>{activeFiltersCount}</span>
                    )}
                  </div>
                  {activeFiltersCount > 0 && (
                    <button type="button" onClick={clearAllFilters} className={resetBtn}>
                      Reset
                    </button>
                  )}
                </div>

                {/* Active filter chips */}
                {activeFiltersCount > 0 && <div className={chipRow}>{renderChips()}</div>}

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

                <hr className={facetDivider} />

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

                <hr className={facetDivider} />

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
              </div>
            </aside>
          </div>

          {/* ── Results ── */}
          <div>
            {/* Results toolbar */}
            <div className={toolbar}>
              {/* Keyword search */}
              <SearchInput
                id="find-freelancer-search"
                value={query}
                onChange={setQuery}
                placeholder="Search freelancers by name, skill, or expertise…"
              />

              {/* Sort */}
              <div className={sortWrap}>
                <SelectInput
                  value={sortBy}
                  onChange={(v) => setSortBy(String(v))}
                  options={SORT_OPTIONS}
                />
              </div>
            </div>

            {/* Count + view toggle row */}
            <div className={countRow}>
              <p className={countText}>
                {loading ? (
                  "Loading…"
                ) : (
                  <>
                    Showing{" "}
                    <span className={countStrong}>{sorted.length}</span> of{" "}
                    {total.toLocaleString()}{" "}
                    {total === 1 ? "freelancer" : "freelancers"}
                  </>
                )}
              </p>

              <div className={viewGroup}>
                <button
                  type="button"
                  value="grid"
                  aria-label="Grid view"
                  aria-pressed={view === "grid"}
                  onClick={() => setView("grid")}
                  className={viewBtn({ side: "left", active: view === "grid" })}
                >
                  <LayoutGrid size={16} />
                </button>
                <button
                  type="button"
                  value="list"
                  aria-label="List view"
                  aria-pressed={view === "list"}
                  onClick={() => setView("list")}
                  className={viewBtn({ side: "right", active: view === "list" })}
                >
                  <ListIcon size={16} />
                </button>
              </div>
            </div>

            {/* Active filter chips above results */}
            {(selectedLocations.length > 0 ||
              selectedLanguages.length > 0 ||
              selectedExpertises.length > 0) && (
              <div className={chipRow}>{renderChips()}</div>
            )}

            {/* Loading */}
            {loading ? (
              <div className={loadingWrap}>
                <Spinner size={40} className={spinnerInk} />
              </div>
            ) : (
              <>
                {view === "list" ? (
                  <div className={listWrap}>
                    {sorted.map((profile) => (
                      <FreelancerListCard key={profile.id} profile={profile} />
                    ))}
                  </div>
                ) : (
                  <div className={gridMin}>
                    <div className={cardsGrid}>
                      {sorted.map((profile) => (
                        <FreelancerCard key={profile.id} profile={profile} />
                      ))}
                    </div>
                  </div>
                )}

                {sorted.length === 0 && (
                  <div className={emptyWrap}>
                    <p className={emptyText}>
                      No freelancers found matching your filters.
                    </p>
                    {(activeFiltersCount > 0 || query) && (
                      <button type="button" onClick={clearAllFilters} className={clearBtn}>
                        Clear Filters
                      </button>
                    )}
                  </div>
                )}

                {/* Pagination */}
                {lastPage > 1 && (
                  <div className={pagerWrap}>
                    <Pager count={lastPage} page={currentPage} onChange={handlePageChange} />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Scroll to top */}
      {showScrollTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className={fab}
          aria-label="Scroll to top"
        >
          <ChevronUp size={24} />
        </button>
      )}
    </div>
  );
}
