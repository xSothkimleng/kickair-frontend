"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import RichTextEditor from "@/components/ui/RichTextEditor";
import {
  MapPin, Globe, Plus, X, Share2, Trash2, Pencil,
  GraduationCap, Award, LayoutGrid, Shield, IdCard, Phone,
  Mail, Sparkles, Image as ImageIcon, Link2, ExternalLink, Check,
} from "lucide-react";
import { css, cx } from "styled-system/css";
import { Dialog, Progress, Skeleton, Spinner, Alert, toast } from "@/components/ds";
import { BareModal } from "@/components/ds/BareModal";
import { TextInput, TextArea, SelectInput, MultiAutocompleteInput, DatePicker, FileUpload, AutocompleteInput } from "@/components/ui/inputs";
import { useAuth } from "@/components/context/AuthContext";
import { useFreelancerDashboard } from "@/hooks/useFreelancerDashboard";
import { api } from "@/lib/api";
import { SEED_SCHOOLS, SEED_DEGREES, SEED_CERT_ISSUERS, SEED_CERT_NAMES, mergeSuggestions } from "@/data/profileSuggestions";
import { Education, Certificate, Language, Expertise, FreelancerProfileRequest, LanguageWithProficiency, PortfolioItem, PortfolioImage } from "@/types/user";
import LevelDialog from "@/components/profile/LevelDialog";
import {
  ProfileAvatar, Stars5, LevelBadge, SectionCard, Field, LockedField, LangChip, VerifyRow, EntryRow, Empty, AddPill, RoundIconBtn,
} from "@/components/profile/profileKit";

const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const portfolioYear = (iso: string | null) => (iso ? new Date(iso).getFullYear() : null);

const PROFICIENCY_OPTIONS = [
  { value: "basic", label: "Basic" },
  { value: "conversational", label: "Conversational" },
  { value: "fluent", label: "Fluent" },
  { value: "native", label: "Native / Bilingual" },
] as const;

type ProficiencyLevel = "basic" | "conversational" | "fluent" | "native";

/* ── Dialog shell matching the design (eyebrow + title + sub + body + footer) ──
   On ds `BareModal` (Ark Dialog). The panel overrides hang off `[data-part=content]`
   so they beat BareModal's own atomic classes by specificity. */
const pfPanel = css({
  "&[data-part=content]": {
    borderRadius: "20px",
    boxShadow: "0 24px 80px rgba(0,0,0,0.28), 0 0 0 1px rgba(0,0,0,0.04)",
    // Dialog paper: margin 16px + max-height calc(100% - 64px); the positioner already
    // takes 32px, so 32 more here.
    maxH: "calc(100% - 32px)",
    overflow: "hidden",
  },
});
const pfBackdrop = css({ bg: "rgba(0, 0, 0, 0.5)" });
const pfHead = css({ position: "relative", p: "24px 26px 6px", flex: "none" });
const pfClose = css({
  position: "absolute", top: "14px", right: "14px",
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  w: "32px", h: "32px", p: 0, border: "none", borderRadius: "50%",
  bg: "rgba(0,0,0,0.05)", color: "ink2", cursor: "pointer", _hover: { bg: "rgba(0,0,0,0.1)", color: "ink" },
  "& svg": { display: "block" },
});
const pfEyebrow = css({ textStyle: "eyebrow", fontWeight: 600, color: "accent" });
const pfTitle = css({ textStyle: "title", fontWeight: 600, color: "ink" });
const pfSub = css({ textStyle: "ui", color: "ink2" });
const pfBody = css({ display: "flex", flexDirection: "column", gap: "18px", p: "18px 26px 4px", overflowY: "auto", flex: 1, minH: 0 });
// The dialog actions add an 8px margin-left on top of the 12px `gap` → 20px apart.
const pfActions = css({ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "20px", p: "18px 26px 24px", flex: "none" });

function PfDialog({ open, onClose, eyebrow, title, sub, width = 460, children, footer }: {
  open: boolean; onClose: () => void; eyebrow: string; title: string; sub?: string; width?: number; children: React.ReactNode; footer: React.ReactNode;
}) {
  return (
    <BareModal
      open={open}
      onOpenChange={o => { if (!o) onClose(); }}
      maxW={`${width}px`}
      className={pfPanel}
      backdropClassName={pfBackdrop}>
      <div className={pfHead}>
        <Dialog.CloseTrigger className={pfClose} aria-label="Close">
          <X size={17} />
        </Dialog.CloseTrigger>
        <p className={pfEyebrow}>{eyebrow}</p>
        <Dialog.Title className={pfTitle}>{title}</Dialog.Title>
        {sub && <Dialog.Description className={pfSub}>{sub}</Dialog.Description>}
      </div>
      <div className={pfBody}>{children}</div>
      <div className={pfActions}>{footer}</div>
    </BareModal>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

// Variants are merged through `css.raw` rather than `cx`-ing a second class:
// two atomic classes for the same property resolve by stylesheet order, not cx order.
const ghostBtnRaw = css.raw({
  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px",
  h: "40px", px: "16px", borderRadius: "999px", border: "none", bg: "transparent",
  color: "ink2", textStyle: "body", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
  _hover: { bg: "surface2" },
  _disabled: { color: "rgba(0,0,0,0.26)", cursor: "default", pointerEvents: "none" },
  "& svg": { display: "block" },
});
const primaryBtnRaw = css.raw({
  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px",
  h: "40px", px: "26px", borderRadius: "999px", border: "none", boxShadow: "none",
  bg: "#000", color: "#fff", textStyle: "body", fontWeight: 600,
  cursor: "pointer", whiteSpace: "nowrap",
  _hover: { bg: "rgba(0,0,0,0.8)", boxShadow: "none" },
  _disabled: { bg: "rgba(0,0,0,0.25)", color: "#fff", cursor: "default", pointerEvents: "none" },
  "& svg": { display: "block" },
});
const ghostBtn = css(ghostBtnRaw);
const primaryBtn = css(primaryBtnRaw);
const saveBtn = css(primaryBtnRaw, { h: "38px" });
const shareBtn = css(ghostBtnRaw, { h: "38px", display: { base: "none", sm: "inline-flex" } });

const pageStack = css({ display: "flex", flexDirection: "column", gap: "18px" });
const skeletonCard = css({
  bg: "surface", borderWidth: "1px", borderStyle: "solid", borderColor: "hairline",
  borderRadius: "card", p: "24px",
});
const skeletonTitle = css({ mb: "16px" });

const headRow = css({ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" });
const headTitle = css({ textStyle: { base: "heading", md: "stat" }, fontWeight: 600 });
const headSub = css({ textStyle: "ui", color: "ink2" });
const previewBtn = css({
  alignItems: "center", justifyContent: "center", gap: "8px",
  h: "38px", pl: "12px", pr: "16px", borderRadius: "999px",
  borderWidth: "1px", borderStyle: "solid", borderColor: "hairlineStrong",
  bg: "transparent", color: "ink", textStyle: "ui", fontWeight: 600,
  cursor: "pointer", flexShrink: 0, whiteSpace: "nowrap",
  display: { base: "none", sm: "inline-flex" },
  _hover: { bg: "surface2" },
  "& svg": { display: "block" },
});

const strengthCard = css({
  bg: "surface", borderWidth: "1px", borderStyle: "solid", borderColor: "hairline",
  borderRadius: "card", p: "20px 22px",
});
const strengthHead = css({ display: "flex", justifyContent: "space-between", alignItems: "center", mb: "13px" });
const strengthTitleWrap = css({ display: "flex", alignItems: "center", gap: "9px" });
const strengthTitle = css({ textStyle: "body", fontWeight: 600 });
const strengthRight = css({ display: "flex", alignItems: "center", gap: "12px" });
const stepsBtn = css({
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  h: "28px", px: "12px", borderRadius: "999px", border: "none",
  bg: "rgba(0,0,0,0.05)", color: "ink", textStyle: "meta", fontWeight: 600,
  cursor: "pointer", whiteSpace: "nowrap",
  _hover: { bg: "rgba(0,0,0,0.09)" },
});
const strengthPctCss = css({ textStyle: "body", fontWeight: 600, fontVariantNumeric: "tabular-nums", color: "accent" });
const strengthPctDone = css({ textStyle: "body", fontWeight: 600, fontVariantNumeric: "tabular-nums", color: "success" });
const strengthBar = css({ h: "8px", borderRadius: "999px", bg: "rgba(0,0,0,0.06)", "& > div": { borderRadius: "999px" } });
const strengthBarAccent = css({ "& > div": { background: "var(--colors-accent)" } });
const strengthBarDone = css({ "& > div": { background: "var(--colors-success)" } });
const leftBlock = css({ mt: "14px" });
const leftLabel = css({ textStyle: "eyebrow", fontWeight: 600, color: "ink3" });
const leftRow = css({ display: "flex", alignItems: "center", gap: "10px", py: "8px", textStyle: "ui" });
const leftDot = css({ w: "18px", h: "18px", borderRadius: "50%", borderWidth: "1.5px", borderStyle: "solid", borderColor: "hairlineStrong", flex: "none" });
const leftText = css({ textStyle: "ui", color: "ink2" });
const completeText = css({ textStyle: "ui", color: "successText", display: "flex", alignItems: "center", gap: "7px" });

const identityCard = css({
  bg: "surface", borderWidth: "1px", borderStyle: "solid", borderColor: "hairline",
  borderRadius: "card", p: { base: "18px", md: "22px" },
});
const identityRow = css({
  display: "flex",
  flexDirection: { base: "column", sm: "row" },
  alignItems: { base: "flex-start", sm: "center" },
  gap: { base: "16px", sm: "20px" },
});
const avatarWrap = css({ position: "relative" });
const uploadingOverlay = css({
  position: "absolute", inset: 0, borderRadius: "50%", bg: "rgba(0,0,0,0.5)",
  display: "flex", alignItems: "center", justifyContent: "center",
});
const identityNameRow = css({ display: "flex", alignItems: "center", gap: "9px", flexWrap: "wrap" });
const identityName = css({ textStyle: { base: "title", md: "heading" }, fontWeight: 600 });
const levelBtn = css({ display: "inline-flex", p: 0, border: "none", bg: "transparent", color: "inherit", cursor: "pointer" });
const ratingRow = css({ display: "flex", alignItems: "center", gap: "8px", mt: "6px", flexWrap: "wrap" });
const ratingValue = css({ textStyle: "ui", fontWeight: 600, fontVariantNumeric: "tabular-nums" });
const ratingMeta = css({ textStyle: "ui", color: "ink2", fontVariantNumeric: "tabular-nums" });
const ratingDot = css({ w: "3px", h: "3px", borderRadius: "50%", bg: "ink3" });
const noReviews = css({ textStyle: "ui", color: "ink3" });
const lockedGrid = css({ display: "grid", gridTemplateColumns: { base: "1fr", sm: "1fr 1fr" }, gap: "14px", mt: "18px" });

const fieldStack = css({ display: "flex", flexDirection: "column", gap: "16px" });
const chipWrap = css({ display: "flex", flexWrap: "wrap", gap: "9px" });
const iconInk3 = css({ color: "ink3" });

const portfolioGrid = css({
  display: "grid", gap: "14px",
  gridTemplateColumns: { base: "1fr 1fr", md: "1fr 1fr 1fr" },
});
const portfolioCard = css({
  borderWidth: "1px", borderStyle: "solid", borderColor: "hairline",
  borderRadius: "12px", overflow: "hidden", bg: "surface",
});
const portfolioCover = css({ position: "relative", aspectRatio: "16 / 10", bg: "rgba(0,0,0,0.04)", maxW: "100%" });
const portfolioImg = css({ w: "100%", h: "100%", objectFit: "cover", display: "block" });
const portfolioPlaceholder = css({ w: "100%", h: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "ink3" });
const portfolioCount = css({
  position: "absolute", top: "8px", right: "8px", display: "inline-flex", alignItems: "center", gap: "4px",
  h: "24px", px: "8px", borderRadius: "999px", bg: "rgba(0,0,0,0.6)", color: "#fff",
  textStyle: "micro", fontWeight: 600,
  "& svg": { display: "block" },
});
const portfolioBody = css({ p: "12px 13px" });
const portfolioTitle = css({ textStyle: "ui", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" });
const portfolioFoot = css({ display: "flex", justifyContent: "space-between", alignItems: "center", mt: "7px" });
const portfolioYearCss = css({ textStyle: "micro", color: "ink3", fontVariantNumeric: "tabular-nums" });
const portfolioActions = css({ display: "flex", gap: "2px" });
const portfolioIconBtn = css({
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  w: "28px", h: "28px", p: 0, border: "none", borderRadius: "7px", bg: "transparent",
  color: "ink2", cursor: "pointer", _hover: { bg: "rgba(0,0,0,0.05)", color: "ink" },
  _disabled: { opacity: 0.5, cursor: "default", pointerEvents: "none" },
  "& svg": { display: "block" },
});
const portfolioDeleteBtn = css({
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  w: "28px", h: "28px", p: 0, border: "none", borderRadius: "7px", bg: "transparent",
  color: "ink2", cursor: "pointer", _hover: { bg: "errorTint", color: "errorText" },
  _disabled: { opacity: 0.5, cursor: "default", pointerEvents: "none" },
  "& svg": { display: "block" },
});
const addProjectBtn = css({
  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px",
  h: "34px", pl: "10px", pr: "14px", borderRadius: "999px",
  borderWidth: "1px", borderStyle: "solid", borderColor: "hairlineStrong",
  bg: "transparent", color: "ink", textStyle: "ui", fontWeight: 600,
  cursor: "pointer", whiteSpace: "nowrap",
  _hover: { bg: "surface2" },
  "& svg": { display: "block" },
});
const firstProjectBtn = css(primaryBtnRaw, { h: "38px", mt: "4px" });

const saveBar = css({
  position: "sticky", bottom: "8px", zIndex: 8,
  display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px",
  bg: "rgba(255,255,255,0.82)", backdropFilter: "saturate(1.4) blur(16px)",
  borderWidth: "1px", borderStyle: "solid", borderColor: "hairline", borderRadius: "999px",
  p: "10px 10px 10px 22px", boxShadow: "0 8px 30px rgba(0,0,0,0.10), 0 1px 2px rgba(0,0,0,0.04)",
});
const saveBarLeft = css({ display: "flex", alignItems: "center", gap: "10px", minW: 0 });
const saveBarDot = css({ w: "8px", h: "8px", borderRadius: "50%", bg: "pending", flex: "none" });
const saveBarText = css({ textStyle: "ui", fontWeight: 500 });
const saveBarActions = css({ display: "flex", gap: "9px", flex: "none" });
const tailSpacer = css({ h: "4px" });

const certLabel = css({ textStyle: "ui", fontWeight: 500, color: "#334155", mb: "7px" });
const certOptional = css({ color: "ink3" });
const certFileRow = css({
  display: "flex", alignItems: "center", gap: "8px", p: "8px 12px",
  borderWidth: "1px", borderStyle: "solid", borderColor: "hairline", borderRadius: "8px",
});
// globals.css `a { color: inherit }` is unlayered, so the accent needs !important.
const certFileLink = css({
  flex: 1, textStyle: "ui", color: "var(--colors-accent) !important",
  textDecoration: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
  _hover: { textDecoration: "underline" },
});
const certRemoveBtn = css({
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  minW: 0, px: "8px", py: "6px", border: "none", borderRadius: "4px", bg: "transparent",
  color: "ink2", textStyle: "meta", fontWeight: 500, cursor: "pointer",
  _hover: { bg: "rgba(0,0,0,0.04)" },
});
const certUploadLabel = css({
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  h: "38px", px: "16px", borderRadius: "8px",
  borderWidth: "1px", borderStyle: "dashed", borderColor: "hairlineStrong",
  bg: "transparent", color: "ink2", textStyle: "ui", fontWeight: 600,
  cursor: "pointer", whiteSpace: "nowrap",
  _hover: { bg: "surface2" },
  "&[data-busy]": { opacity: 0.5, pointerEvents: "none" },
});
const pfFieldGrid = css({ display: "grid", gridTemplateColumns: { base: "1fr", sm: "1fr 1fr" }, gap: "16px" });
const pfImageRow = css({ display: "flex", flexWrap: "wrap", gap: "8px" });
const pfImageBox = css({ position: "relative", w: "72px", h: "72px" });
const pfImage = css({ w: "100%", h: "100%", objectFit: "cover", borderRadius: "8px", borderWidth: "1px", borderStyle: "solid", borderColor: "hairline" });
const pfImageRemove = css({
  position: "absolute", top: "-8px", right: "-8px",
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  w: "22px", h: "22px", p: 0, borderRadius: "50%",
  borderWidth: "1px", borderStyle: "solid", borderColor: "hairlineStrong",
  bg: "white", color: "ink2", cursor: "pointer", _hover: { bg: "#fdecec" },
  "& svg": { display: "block" },
});

export default function ProfileContent() {
  const { user, refreshUser, loading: authLoading } = useAuth();
  const { data: dashboardData, refetch: refetchDashboard } = useFreelancerDashboard();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({ tagline: "", about: "", location: "" });
  const [educations, setEducations] = useState<Education[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<{ language_id: number; name: string; proficiency: ProficiencyLevel }[]>([]);
  const [selectedExpertiseIds, setSelectedExpertiseIds] = useState<number[]>([]);

  const [languages, setLanguages] = useState<Language[]>([]);
  const [expertises, setExpertises] = useState<Expertise[]>([]);
  const [suggest, setSuggest] = useState<{ schools: string[]; degrees: string[]; cert_names: string[]; cert_issuers: string[] }>({ schools: [], degrees: [], cert_names: [], cert_issuers: [] });
  const [loadingReferenceData, setLoadingReferenceData] = useState(true);

  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [educationDialog, setEducationDialog] = useState<{ open: boolean; editIndex: number | null; data: Education }>({ open: false, editIndex: null, data: { facility: "", studies: "" } });
  const [certificateDialog, setCertificateDialog] = useState<{ open: boolean; editIndex: number | null; data: Certificate }>({ open: false, editIndex: null, data: { title: "", source: "" } });
  const [certFileUploading, setCertFileUploading] = useState(false);
  const [languageDialog, setLanguageDialog] = useState<{ open: boolean; selectedLanguage: Language | null; proficiency: ProficiencyLevel }>({ open: false, selectedLanguage: null, proficiency: "conversational" });

  // Portfolio (own endpoints — images, so not part of the JSON profile save)
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [levelOpen, setLevelOpen] = useState(false);
  const [portfolioDialog, setPortfolioDialog] = useState<{ open: boolean; editing: PortfolioItem | null }>({ open: false, editing: null });
  const [pf, setPf] = useState<{ title: string; description: string; projectUrl: string; date: Date | null }>({ title: "", description: "", projectUrl: "", date: null });
  const [pfExisting, setPfExisting] = useState<PortfolioImage[]>([]);
  const [pfRemovedIds, setPfRemovedIds] = useState<number[]>([]);
  const [pfNewFiles, setPfNewFiles] = useState<File[]>([]);
  const [pfSaving, setPfSaving] = useState(false);
  const [pfDeletingId, setPfDeletingId] = useState<number | null>(null);

  useEffect(() => {
    const loadReferenceData = async () => {
      try {
        const [languagesData, expertisesData, suggestData] = await Promise.all([
          api.getLanguages(),
          api.getExpertises(),
          api.getProfileSuggestions().catch(() => ({ schools: [], degrees: [], cert_names: [], cert_issuers: [] })),
        ]);
        setLanguages(languagesData);
        setExpertises(expertisesData);
        setSuggest(suggestData);
      } catch (error) {
        console.error("Failed to load reference data:", error);
      } finally {
        setLoadingReferenceData(false);
      }
    };
    loadReferenceData();
  }, []);

  useEffect(() => {
    if (user?.freelancer_profile) {
      const profile = user.freelancer_profile;
      setFormData({ tagline: profile.tagline || "", about: profile.about || "", location: profile.location || "" });
      setEducations(profile.educations || []);
      setCertificates(profile.certificates || []);
      if (profile.languages) {
        setSelectedLanguages(profile.languages.map((lang: LanguageWithProficiency) => ({ language_id: lang.id, name: lang.name, proficiency: lang.proficiency })));
      }
      if (profile.expertises) {
        setSelectedExpertiseIds(profile.expertises.map((exp: Expertise) => exp.id));
      }
    }
  }, [user?.freelancer_profile]);

  useEffect(() => {
    const pid = user?.freelancer_profile?.id;
    if (!pid) return;
    let active = true;
    api.getFreelancerProfile(pid).then(p => { if (active) setPortfolioItems(p.portfolio_items ?? []); }).catch(() => {});
    return () => { active = false; };
  }, [user?.freelancer_profile?.id]);

  const refetchPortfolio = async () => {
    const pid = user?.freelancer_profile?.id;
    if (!pid) return;
    try {
      const p = await api.getFreelancerProfile(pid);
      setPortfolioItems(p.portfolio_items ?? []);
    } catch { /* ignore */ }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const handleSaveChanges = async () => {
    if (!user?.freelancer_profile) return;
    setSaving(true);
    try {
      const requestData: FreelancerProfileRequest = {
        tagline: formData.tagline || undefined,
        about: formData.about || undefined,
        location: formData.location || undefined,
        educations: educations.length > 0 ? educations : [],
        certificates: certificates.length > 0 ? certificates : [],
        expertise_ids: selectedExpertiseIds.length > 0 ? selectedExpertiseIds : undefined,
        languages: selectedLanguages.length > 0 ? selectedLanguages.map(lang => ({ language_id: lang.language_id, proficiency: lang.proficiency })) : undefined,
      };
      await api.updateFreelancerProfile(user.freelancer_profile.id, requestData);
      await refreshUser();
      setHasUnsavedChanges(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update profile";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid file type. Please upload JPG, PNG, GIF, or WebP.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB.");
      return;
    }
    setUploadingImage(true);
    try {
      await api.uploadProfileImage(file);
      await Promise.all([refreshUser(), refetchDashboard()]);
      toast.success("Profile picture updated!");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to upload image";
      toast.error(message);
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Education handlers
  const handleOpenEducationDialog = (index: number | null = null) => {
    if (index !== null && educations[index]) {
      setEducationDialog({ open: true, editIndex: index, data: { ...educations[index] } });
    } else {
      setEducationDialog({ open: true, editIndex: null, data: { facility: "", studies: "" } });
    }
  };
  const handleSaveEducation = () => {
    if (!educationDialog.data.facility || !educationDialog.data.studies) return;
    if (educationDialog.editIndex !== null) {
      const updated = [...educations];
      updated[educationDialog.editIndex] = educationDialog.data;
      setEducations(updated);
    } else {
      setEducations([...educations, educationDialog.data]);
    }
    setEducationDialog({ open: false, editIndex: null, data: { facility: "", studies: "" } });
    setHasUnsavedChanges(true);
  };
  const handleRemoveEducation = (index: number) => {
    setEducations(educations.filter((_, i) => i !== index));
    setHasUnsavedChanges(true);
  };

  // Certificate handlers
  const handleOpenCertificateDialog = (index: number | null = null) => {
    if (index !== null && certificates[index]) {
      setCertificateDialog({ open: true, editIndex: index, data: { ...certificates[index] } });
    } else {
      setCertificateDialog({ open: true, editIndex: null, data: { title: "", source: "" } });
    }
  };
  const handleSaveCertificate = () => {
    if (!certificateDialog.data.title || !certificateDialog.data.source) return;
    if (certificateDialog.editIndex !== null) {
      const updated = [...certificates];
      updated[certificateDialog.editIndex] = certificateDialog.data;
      setCertificates(updated);
    } else {
      setCertificates([...certificates, certificateDialog.data]);
    }
    setCertificateDialog({ open: false, editIndex: null, data: { title: "", source: "" } });
    setHasUnsavedChanges(true);
  };
  const handleRemoveCertificate = (index: number) => {
    setCertificates(certificates.filter((_, i) => i !== index));
    setHasUnsavedChanges(true);
  };
  const handleCertificateFileUpload = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    setCertFileUploading(true);
    try {
      const token = await api.getUploadToken();
      const res = await api.uploadFormData("/api/temporary-uploads", file, { upload_token: token });
      setCertificateDialog(prev => ({ ...prev, data: { ...prev.data, file_url: res.data.file_url, file_name: res.data.file_name } }));
    } catch {
      toast.error("Failed to upload the certificate file.");
    } finally {
      setCertFileUploading(false);
    }
  };

  // Skill (expertise) creation — the typeahead's `Add "xyz"` option lands here.
  const handleCreateExpertise = async (name: string) => {
    const trimmed = name.trim().replace(/\s+/g, " ").slice(0, 80);
    if (!trimmed) return;
    const existing = expertises.find(e => e.expertise_name.toLowerCase() === trimmed.toLowerCase());
    if (existing) {
      setSelectedExpertiseIds(prev => (prev.includes(existing.id) ? prev : [...prev, existing.id]));
      setHasUnsavedChanges(true);
      return;
    }
    try {
      const created = await api.createExpertise(trimmed);
      setExpertises(prev => (prev.some(e => e.id === created.id) ? prev : [...prev, created]));
      setSelectedExpertiseIds(prev => (prev.includes(created.id) ? prev : [...prev, created.id]));
      setHasUnsavedChanges(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to add skill";
      toast.error(message);
    }
  };

  // Language handlers
  const handleOpenLanguageDialog = () => {
    setLanguageDialog({ open: false, selectedLanguage: null, proficiency: "conversational" });
    setTimeout(() => setLanguageDialog(prev => ({ ...prev, open: true })), 0);
  };
  const handleSaveLanguage = () => {
    if (!languageDialog.selectedLanguage) return;
    const exists = selectedLanguages.some(l => l.language_id === languageDialog.selectedLanguage!.id);
    if (exists) {
      toast.error("This language is already added.");
      return;
    }
    setSelectedLanguages([...selectedLanguages, { language_id: languageDialog.selectedLanguage.id, name: languageDialog.selectedLanguage.name, proficiency: languageDialog.proficiency }]);
    setLanguageDialog({ open: false, selectedLanguage: null, proficiency: "conversational" });
    setHasUnsavedChanges(true);
  };
  const handleRemoveLanguage = (languageId: number) => {
    setSelectedLanguages(selectedLanguages.filter(l => l.language_id !== languageId));
    setHasUnsavedChanges(true);
  };

  // Portfolio handlers
  const openPortfolioDialog = (item: PortfolioItem | null = null) => {
    setPf({ title: item?.title ?? "", description: item?.description ?? "", projectUrl: item?.project_url ?? "", date: item?.completed_on ? new Date(item.completed_on) : null });
    setPfExisting(item?.images ?? []);
    setPfRemovedIds([]);
    setPfNewFiles([]);
    setPortfolioDialog({ open: true, editing: item });
  };
  const removeExistingPortfolioImage = (id: number) => {
    setPfExisting(prev => prev.filter(img => img.id !== id));
    setPfRemovedIds(prev => [...prev, id]);
  };
  const handleSavePortfolio = async () => {
    if (!pf.title.trim()) return;
    setPfSaving(true);
    try {
      const fd = new FormData();
      fd.append("title", pf.title.trim());
      fd.append("description", pf.description.trim());
      const projectUrl = pf.projectUrl.trim();
      // Always send the field — an empty value must reach the API so a cleared
      // link is actually removed (the backend turns "" into null).
      fd.append("project_url", projectUrl && !/^[a-z][a-z0-9+.-]*:\/\//i.test(projectUrl) ? `https://${projectUrl}` : projectUrl);
      if (pf.date) fd.append("completed_on", ymd(pf.date));
      pfNewFiles.forEach(f => fd.append("images[]", f));
      const editing = portfolioDialog.editing;
      if (editing) {
        pfRemovedIds.forEach(id => fd.append("removed_image_ids[]", String(id)));
        await api.updatePortfolioItem(editing.id, fd);
      } else {
        await api.createPortfolioItem(fd);
      }
      await refetchPortfolio();
      setPortfolioDialog({ open: false, editing: null });
      toast.success(editing ? "Project updated!" : "Project added to your portfolio!");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save project";
      toast.error(message);
    } finally {
      setPfSaving(false);
    }
  };
  const handleDeletePortfolio = async (id: number) => {
    if (!confirm("Delete this project from your portfolio?")) return;
    setPfDeletingId(id);
    try {
      await api.deletePortfolioItem(id);
      await refetchPortfolio();
      toast.success("Project removed.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete project";
      toast.error(message);
    } finally {
      setPfDeletingId(null);
    }
  };

  const schoolOptions = mergeSuggestions(SEED_SCHOOLS, suggest.schools);
  const degreeOptions = mergeSuggestions(SEED_DEGREES, suggest.degrees);
  const certNameOptions = mergeSuggestions(SEED_CERT_NAMES, suggest.cert_names);
  const certIssuerOptions = mergeSuggestions(SEED_CERT_ISSUERS, suggest.cert_issuers);

  if (authLoading || loadingReferenceData) {
    return (
      <div className={pageStack}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} className={skeletonCard}>
            <Skeleton variant="text" width={160} height={22} className={skeletonTitle} />
            <Skeleton variant="rect" height={i === 1 ? 96 : 44} style={{ borderRadius: "10px" }} />
          </div>
        ))}
      </div>
    );
  }

  if (!user) {
    return <div><Alert tone="warning">Please log in to view your profile.</Alert></div>;
  }

  const profile = user.freelancer_profile;
  const avatarUrl = dashboardData?.profile.avatarUrl ?? user.avatar_url ?? undefined;
  const ratingNum = dashboardData?.profile.rating ? parseFloat(dashboardData.profile.rating) : 0;
  const reviewCount = dashboardData?.profile.totalReviews ?? profile?.rating_count ?? 0;
  const orders = profile?.completed_orders_count ?? 0;
  const level = profile?.level;
  const previewHref = profile ? `/find-freelancer/${profile.id}` : "/dashboard/freelancer";

  // Profile-strength tasks
  const strengthTasks = [
    { label: "Add a profile photo", done: !!avatarUrl },
    { label: "Write your bio", done: !!formData.about },
    { label: "Add at least 3 skills", done: selectedExpertiseIds.length >= 3 },
    { label: "Add education", done: educations.length > 0 },
    { label: "Add 2 portfolio projects", done: portfolioItems.length >= 2 },
    { label: "Verify your ID", done: !!user.is_verified_id },
  ];
  const doneCount = strengthTasks.filter(t => t.done).length;
  const strengthPct = Math.round((doneCount / strengthTasks.length) * 100);
  const remainingTasks = strengthTasks.filter(t => !t.done);

  return (
    <div className={pageStack}>
      {/* Page heading */}
      <div className={headRow}>
        <div>
          <p className={headTitle}>Edit profile</p>
          <p className={headSub}>This is what clients see when they view your profile.</p>
        </div>
        <button type="button" onClick={() => router.push(previewHref)} className={previewBtn}>
          <ExternalLink size={15} />
          Preview
        </button>
      </div>

      {/* Profile strength — drops away once every task is done */}
      {strengthPct < 100 && (
        <div className={strengthCard}>
          <div className={strengthHead}>
            <div className={strengthTitleWrap}>
              <Sparkles size={18} className={css({ color: "accent" })} />
              <p className={strengthTitle}>Profile strength</p>
            </div>
            <div className={strengthRight}>
              <button type="button" onClick={() => setLevelOpen(true)} className={stepsBtn}>
                View all steps
              </button>
              <p className={strengthPct === 100 ? strengthPctDone : strengthPctCss}>{strengthPct}%</p>
            </div>
          </div>
          <Progress value={strengthPct} className={cx(strengthBar, strengthPct === 100 ? strengthBarDone : strengthBarAccent)} />
          {remainingTasks.length > 0 ? (
            <div className={leftBlock}>
              <p className={leftLabel}>What&rsquo;s left</p>
              {remainingTasks.slice(0, 3).map((t, i) => (
                <div key={i} className={leftRow}>
                  <span className={leftDot} />
                  <p className={leftText}>{t.label}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className={completeText}>
              <Check size={15} /> Your profile is complete — nice work.
            </p>
          )}
        </div>
      )}

      <LevelDialog open={levelOpen} onClose={() => setLevelOpen(false)} />

      {/* Identity card */}
      <div className={identityCard}>
        <div className={identityRow}>
          <div className={avatarWrap}>
            <ProfileAvatar name={user.name} src={avatarUrl} size={84} editable onEdit={() => fileInputRef.current?.click()} />
            {uploadingImage && (
              <div className={uploadingOverlay}>
                <Spinner size={22} style={{ color: "white" }} />
              </div>
            )}
            <input type="file" ref={fileInputRef} accept="image/jpeg,image/jpg,image/png,image/gif,image/webp" style={{ display: "none" }} onChange={handleImageUpload} />
          </div>
          <div className={css({ flex: 1, minW: 0 })}>
            <div className={identityNameRow}>
              <p className={identityName}>{user.name}</p>
              {level && (
                <button type="button" onClick={() => setLevelOpen(true)} className={levelBtn} aria-label="View your level">
                  <LevelBadge level={level} small />
                </button>
              )}
            </div>
            <div className={ratingRow}>
              {reviewCount > 0 ? (
                <>
                  <Stars5 rating={ratingNum} size={15} />
                  <span className={ratingValue}>{ratingNum.toFixed(1)}</span>
                  <span className={ratingMeta}>({reviewCount} reviews)</span>
                  <span className={ratingDot} />
                  <span className={ratingMeta}>{orders} orders</span>
                </>
              ) : (
                <p className={noReviews}>No reviews yet — your rating shows here once you complete orders.</p>
              )}
            </div>
          </div>
        </div>
        <div className={lockedGrid}>
          <LockedField label="Full name" value={user.name} note="Managed in account settings" />
          <LockedField label="Email" value={user.email || "—"} icon={<Mail size={16} />} note="Managed in account settings" />
        </div>
      </div>

      {/* Headline */}
      <SectionCard icon={<Sparkles size={19} />} title="Headline">
        <div className={fieldStack}>
          <Field label="Professional tagline" hint="A short line that sums up what you do — shown under your name.">
            <TextInput value={formData.tagline} onChange={v => handleInputChange("tagline", v.slice(0, 255))} placeholder="e.g. Brand & logo designer for cafés and startups" />
          </Field>
          <Field label="Location">
            <TextInput value={formData.location} onChange={v => handleInputChange("location", v.slice(0, 255))} placeholder="City, Country" startIcon={<MapPin size={16} className={iconInk3} />} />
          </Field>
        </div>
      </SectionCard>

      {/* About */}
      <SectionCard icon={<Pencil size={19} />} title="About you">
        <Field label="Bio" hint="Tell clients about your experience, your style and how you work.">
          <RichTextEditor value={formData.about} onChange={html => handleInputChange("about", html)} placeholder="Write a few sentences about yourself…" minHeight={120} />
        </Field>
      </SectionCard>

      {/* Languages */}
      <SectionCard icon={<Globe size={19} />} title="Languages"
        action={<AddPill onClick={handleOpenLanguageDialog}><Plus size={15} />Add language</AddPill>}>
        {selectedLanguages.length > 0 ? (
          <div className={chipWrap}>
            {selectedLanguages.map(lang => <LangChip key={lang.language_id} name={lang.name} proficiency={lang.proficiency} onRemove={() => handleRemoveLanguage(lang.language_id)} />)}
          </div>
        ) : (
          <Empty icon={<Globe size={24} />} title="No languages added yet" sub="Let clients know which languages you can work in." />
        )}
      </SectionCard>

      {/* Skills */}
      <SectionCard icon={<Sparkles size={19} />} title="Skills & expertise" hint="These power search and recommendations.">
        <MultiAutocompleteInput
          value={selectedExpertiseIds}
          onChange={ids => { setSelectedExpertiseIds(ids as number[]); setHasUnsavedChanges(true); }}
          options={expertises.map(exp => ({ value: exp.id, label: exp.expertise_name }))}
          placeholder="Search skills — or type a new one and press Enter"
          onCreate={handleCreateExpertise}
        />
      </SectionCard>

      {/* Education */}
      <SectionCard icon={<GraduationCap size={19} />} title="Education"
        action={<RoundIconBtn title="Add education" onClick={() => handleOpenEducationDialog()}><Plus size={16} /></RoundIconBtn>}>
        {educations.length > 0 ? (
          <div>
            {educations.map((e, i) => (
              <EntryRow key={i} icon={<GraduationCap size={19} />} title={e.studies} sub={e.facility} onEdit={() => handleOpenEducationDialog(i)} onDelete={() => handleRemoveEducation(i)} />
            ))}
          </div>
        ) : (
          <Empty icon={<GraduationCap size={24} />} title="No education added yet" sub="Schools and degrees help build trust." action={<AddPill onClick={() => handleOpenEducationDialog()}><Plus size={15} />Add education</AddPill>} />
        )}
      </SectionCard>

      {/* Certifications */}
      <SectionCard icon={<Award size={19} />} title="Certifications"
        action={<RoundIconBtn title="Add certification" onClick={() => handleOpenCertificateDialog()}><Plus size={16} /></RoundIconBtn>}>
        {certificates.length > 0 ? (
          <div>
            {certificates.map((c, i) => (
              <EntryRow key={i} icon={<Award size={19} />} title={c.title}
                sub={c.file_url ? `${c.source} · has certificate file` : c.source}
                onEdit={() => handleOpenCertificateDialog(i)} onDelete={() => handleRemoveCertificate(i)} />
            ))}
          </div>
        ) : (
          <Empty icon={<Award size={24} />} title="No certifications added yet" sub="Add courses and credentials you've earned." action={<AddPill onClick={() => handleOpenCertificateDialog()}><Plus size={15} />Add certification</AddPill>} />
        )}
      </SectionCard>

      {/* Portfolio */}
      <SectionCard icon={<LayoutGrid size={19} />} title="Portfolio"
        action={
          <button type="button" onClick={() => openPortfolioDialog()} className={addProjectBtn}>
            <Plus size={15} />
            Add project
          </button>
        }>
        {portfolioItems.length > 0 ? (
          <div className={portfolioGrid}>
            {portfolioItems.map(item => {
              const cover = item.images[0]?.file_url;
              const year = portfolioYear(item.completed_on);
              return (
                <div key={item.id} className={portfolioCard}>
                  <div className={portfolioCover}>
                    {cover
                      // eslint-disable-next-line @next/next/no-img-element -- remote portfolio images from many hosts
                      ? <img src={cover} alt={item.title} className={portfolioImg} />
                      : <div className={portfolioPlaceholder}><ImageIcon size={26} /></div>}
                    {item.images.length > 1 && (
                      <span className={portfolioCount}>
                        <ImageIcon size={12} />{item.images.length}
                      </span>
                    )}
                  </div>
                  <div className={portfolioBody}>
                    <p className={portfolioTitle}>{item.title}</p>
                    <div className={portfolioFoot}>
                      <span className={portfolioYearCss}>{year || ""}</span>
                      <div className={portfolioActions}>
                        <button type="button" onClick={() => openPortfolioDialog(item)} aria-label="Edit project" className={portfolioIconBtn}><Pencil size={15} /></button>
                        <button type="button" onClick={() => handleDeletePortfolio(item.id)} disabled={pfDeletingId === item.id} aria-label="Delete project" className={portfolioDeleteBtn}>
                          {pfDeletingId === item.id ? <Spinner size={14} /> : <Trash2 size={15} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <Empty icon={<LayoutGrid size={24} />} title="No projects yet" sub="Show your best work — projects with multiple images convert browsers into clients."
            action={
              <button type="button" onClick={() => openPortfolioDialog()} className={firstProjectBtn}>
                <Plus size={15} />
                Add your first project
              </button>
            } />
        )}
      </SectionCard>

      {/* Verification */}
      <SectionCard icon={<Shield size={19} />} title="Verification" hint="Verified freelancers rank higher and earn more trust.">
        <VerifyRow icon={<IdCard size={20} />} title="Identity (ID)" sub={user.is_verified_id ? "Government ID confirmed" : "Upload a government ID to get verified"} verified={!!user.is_verified_id} onVerify={() => router.push("/dashboard/kyc")} />
        <VerifyRow icon={<Phone size={20} />} title="Phone number" sub={user.is_verified_phone ? user.telephone || "Phone verified" : "Confirm your phone number"} verified={!!user.is_verified_phone} onVerify={() => router.push("/settings")} />
      </SectionCard>

      {/* Sticky save bar */}
      {hasUnsavedChanges && (
        <div className={saveBar}>
          <div className={saveBarLeft}>
            <span className={saveBarDot} />
            <p className={saveBarText}>You have unsaved changes</p>
          </div>
          <div className={saveBarActions}>
            <button type="button" onClick={() => router.push(previewHref)} className={shareBtn}>
              <Share2 size={15} />
              Share profile
            </button>
            <button type="button" onClick={handleSaveChanges} disabled={saving} className={saveBtn}>
              {saving ? <Spinner size={18} style={{ color: "white" }} /> : "Save changes"}
            </button>
          </div>
        </div>
      )}
      {!hasUnsavedChanges && <div className={tailSpacer} />}

      {/* Education Dialog */}
      <PfDialog open={educationDialog.open} onClose={() => setEducationDialog(prev => ({ ...prev, open: false }))}
        eyebrow={educationDialog.editIndex !== null ? "Edit education" : "Add education"}
        title={educationDialog.editIndex !== null ? "Edit education" : "Add education"}
        sub="List a degree or course you've completed. Start typing to pick from known schools, or add your own."
        footer={<>
          <button type="button" onClick={() => setEducationDialog(prev => ({ ...prev, open: false }))} className={ghostBtn}>Cancel</button>
          <button type="button" onClick={handleSaveEducation} disabled={!educationDialog.data.studies || !educationDialog.data.facility} className={primaryBtn}>{educationDialog.editIndex !== null ? "Save changes" : "Add education"}</button>
        </>}>
        <AutocompleteInput label="Degree / Field of study" freeSolo options={degreeOptions} value={educationDialog.data.studies}
          onChange={v => setEducationDialog(prev => ({ ...prev, data: { ...prev.data, studies: (v ?? "").slice(0, 255) } }))} placeholder="e.g. BFA, Graphic Design" />
        <AutocompleteInput label="School / Institution" freeSolo options={schoolOptions} value={educationDialog.data.facility}
          onChange={v => setEducationDialog(prev => ({ ...prev, data: { ...prev.data, facility: (v ?? "").slice(0, 255) } }))} placeholder="e.g. Royal University of Fine Arts" />
      </PfDialog>

      {/* Certificate Dialog */}
      <PfDialog open={certificateDialog.open} onClose={() => setCertificateDialog(prev => ({ ...prev, open: false }))}
        eyebrow={certificateDialog.editIndex !== null ? "Edit certification" : "Add certification"}
        title={certificateDialog.editIndex !== null ? "Edit certification" : "Add certification"}
        sub="Add a credential you've earned. Suggestions appear as you type — you can still enter a custom one."
        footer={<>
          <button type="button" onClick={() => setCertificateDialog(prev => ({ ...prev, open: false }))} className={ghostBtn}>Cancel</button>
          <button type="button" onClick={handleSaveCertificate} disabled={!certificateDialog.data.title || !certificateDialog.data.source} className={primaryBtn}>{certificateDialog.editIndex !== null ? "Save changes" : "Add certification"}</button>
        </>}>
        <AutocompleteInput label="Certificate name" freeSolo options={certNameOptions} value={certificateDialog.data.title}
          onChange={v => setCertificateDialog(prev => ({ ...prev, data: { ...prev.data, title: (v ?? "").slice(0, 255) } }))} placeholder="e.g. Google UX Design Certificate" />
        <AutocompleteInput label="Issuing organization" freeSolo options={certIssuerOptions} value={certificateDialog.data.source}
          onChange={v => setCertificateDialog(prev => ({ ...prev, data: { ...prev.data, source: (v ?? "").slice(0, 255) } }))} placeholder="e.g. Google" />

        {/* Optional proof file (PDF or image) */}
        <div>
          <p className={certLabel}>
            Certificate file <span className={certOptional}>(optional · PDF or image)</span>
          </p>
          {certificateDialog.data.file_url ? (
            <div className={certFileRow}>
              <Award size={16} className={iconInk3} />
              <a href={certificateDialog.data.file_url} target="_blank" rel="noopener noreferrer" className={certFileLink}>
                {certificateDialog.data.file_name || "Attached file"}
              </a>
              <button type="button" onClick={() => setCertificateDialog(prev => ({ ...prev, data: { ...prev.data, file_url: null, file_name: null } }))} className={certRemoveBtn}>
                Remove
              </button>
            </div>
          ) : (
            <label className={certUploadLabel} data-busy={certFileUploading ? "" : undefined}>
              {certFileUploading ? "Uploading…" : "Upload certificate (PDF/JPG/PNG)"}
              <input type="file" hidden accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={e => handleCertificateFileUpload(e.target.files)} />
            </label>
          )}
        </div>
      </PfDialog>

      {/* Portfolio Dialog */}
      <PfDialog open={portfolioDialog.open} onClose={() => !pfSaving && setPortfolioDialog(prev => ({ ...prev, open: false }))} width={560}
        eyebrow={portfolioDialog.editing ? "Edit project" : "Add portfolio project"}
        title={portfolioDialog.editing ? "Edit project" : "Add portfolio project"}
        sub="Showcase a piece of work. Add several images — clients can page through them in a gallery."
        footer={<>
          <button type="button" onClick={() => setPortfolioDialog(prev => ({ ...prev, open: false }))} disabled={pfSaving} className={ghostBtn}>Cancel</button>
          <button type="button" onClick={handleSavePortfolio} disabled={!pf.title.trim() || pfSaving} className={primaryBtn}>{pfSaving ? <Spinner size={18} style={{ color: "white" }} /> : portfolioDialog.editing ? "Save project" : "Add project"}</button>
        </>}>
        <Field label="Project title"><TextInput value={pf.title} onChange={v => setPf(p => ({ ...p, title: v.slice(0, 255) }))} placeholder="e.g. Sombai Coffee — full rebrand" /></Field>
        <Field label="Description"><TextArea minRows={3} value={pf.description} onChange={v => setPf(p => ({ ...p, description: v }))} placeholder="What was the brief, and what did you deliver?" /></Field>
        <div className={pfFieldGrid}>
          <Field label="Project link" optional><TextInput value={pf.projectUrl} onChange={v => setPf(p => ({ ...p, projectUrl: v }))} placeholder="https://…" startIcon={<Link2 size={16} className={iconInk3} />} /></Field>
          <Field label="Completed date"><DatePicker value={pf.date} onChange={d => setPf(p => ({ ...p, date: d }))} maxDate={new Date()} placeholder="Select month" /></Field>
        </div>
        {pfExisting.length > 0 && (
          <Field label="Current images">
            <div className={pfImageRow}>
              {pfExisting.map(img => (
                <div key={img.id} className={pfImageBox}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- remote portfolio images from many hosts */}
                  <img src={img.file_url} alt="" className={pfImage} />
                  <button type="button" onClick={() => removeExistingPortfolioImage(img.id)} aria-label="Remove image" className={pfImageRemove}><X size={13} /></button>
                </div>
              ))}
            </div>
          </Field>
        )}
        <Field label={pfExisting.length > 0 ? "Add more images" : "Images"}>
          <FileUpload key={portfolioDialog.editing?.id ?? "new"} multiple accept="image/*" hint="PNG, JPG, GIF or WebP · up to 5MB each · max 10" onFiles={setPfNewFiles} />
        </Field>
      </PfDialog>

      {/* Language Dialog */}
      <PfDialog open={languageDialog.open} onClose={() => setLanguageDialog(prev => ({ ...prev, open: false }))}
        eyebrow="Add language" title="Add language" sub="Pick a language and how well you speak it."
        footer={<>
          <button type="button" onClick={() => setLanguageDialog(prev => ({ ...prev, open: false }))} className={ghostBtn}>Cancel</button>
          <button type="button" onClick={handleSaveLanguage} disabled={!languageDialog.selectedLanguage} className={primaryBtn}>Add language</button>
        </>}>
        <SelectInput label="Language" value={languageDialog.selectedLanguage?.id ?? ""}
          onChange={v => setLanguageDialog(prev => ({ ...prev, selectedLanguage: languages.find(l => l.id === Number(v)) ?? null }))}
          options={languages.filter(l => !selectedLanguages.some(sl => sl.language_id === l.id)).map(l => ({ value: l.id, label: l.name }))} />
        <SelectInput label="Proficiency" value={languageDialog.proficiency}
          onChange={v => setLanguageDialog(prev => ({ ...prev, proficiency: v as ProficiencyLevel }))}
          options={PROFICIENCY_OPTIONS.map(o => ({ value: o.value, label: o.label }))} />
      </PfDialog>
    </div>
  );
}
