"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import RichTextEditor from "@/components/ui/RichTextEditor";
import {
  Box, Typography, Button, IconButton, CircularProgress, Alert, Snackbar, Skeleton, Stack,
  Dialog, DialogContent, DialogActions, LinearProgress,
} from "@mui/material";
import {
  RoomOutlined, PublicOutlined, AddOutlined, CloseOutlined, ShareOutlined, DeleteOutline, EditOutlined,
  SchoolOutlined, WorkspacePremiumOutlined, GridViewOutlined, ShieldOutlined, BadgeOutlined, PhoneOutlined,
  MailOutline, AutoAwesomeOutlined, ImageOutlined, LinkOutlined, OpenInNewOutlined, CheckRounded,
} from "@mui/icons-material";
import { TextInput, TextArea, SelectInput, MultiSelectInput, DatePicker, FileUpload, AutocompleteInput } from "@/components/ui/inputs";
import { useAuth } from "@/components/context/AuthContext";
import { useFreelancerDashboard } from "@/hooks/useFreelancerDashboard";
import { api } from "@/lib/api";
import { tokens } from "@/theme";
import { SEED_SCHOOLS, SEED_DEGREES, SEED_CERT_ISSUERS, SEED_CERT_NAMES, mergeSuggestions } from "@/data/profileSuggestions";
import { Education, Certificate, Language, Expertise, FreelancerProfileRequest, LanguageWithProficiency, PortfolioItem, PortfolioImage } from "@/types/user";
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

const dialogPaperSx = { borderRadius: "20px", boxShadow: "0 24px 80px rgba(0,0,0,0.28), 0 0 0 1px rgba(0,0,0,0.04)" };

/* Dialog shell matching the design (eyebrow + title + sub + body + footer) */
function PfDialog({ open, onClose, eyebrow, title, sub, width = 460, children, footer }: {
  open: boolean; onClose: () => void; eyebrow: string; title: string; sub?: string; width?: number; children: React.ReactNode; footer: React.ReactNode;
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth={false} slotProps={{ paper: { sx: { ...dialogPaperSx, width: "100%", maxWidth: width, m: 2 } } }}>
      <Box sx={{ position: "relative", p: "24px 26px 6px" }}>
        <IconButton onClick={onClose} sx={{ position: "absolute", top: 14, right: 14, width: 32, height: 32, bgcolor: "rgba(0,0,0,0.05)", color: tokens.text2, "&:hover": { bgcolor: "rgba(0,0,0,0.1)", color: tokens.text } }}>
          <CloseOutlined sx={{ fontSize: 17 }} />
        </IconButton>
        <Typography sx={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: tokens.accent }}>{eyebrow}</Typography>
        <Typography sx={{ fontSize: 21, fontWeight: 600, letterSpacing: "-0.02em", mt: "7px", mb: "5px" }}>{title}</Typography>
        {sub && <Typography sx={{ fontSize: 13.5, color: tokens.text2, lineHeight: 1.45 }}>{sub}</Typography>}
      </Box>
      <DialogContent sx={{ p: "18px 26px 4px !important" }}>
        <Stack spacing={2.25}>{children}</Stack>
      </DialogContent>
      <DialogActions sx={{ p: "18px 26px 24px", gap: 1.5 }}>{footer}</DialogActions>
    </Dialog>
  );
}

const ghostBtnSx = { height: 40, px: 2, borderRadius: "999px", textTransform: "none", fontSize: 14, fontWeight: 600, color: tokens.text2, "&:hover": { bgcolor: tokens.surface2 } } as const;
const primaryBtnSx = { height: 40, px: 3.25, borderRadius: "999px", textTransform: "none", fontSize: 14, fontWeight: 600, bgcolor: "#000", color: "#fff", boxShadow: "none", "&:hover": { bgcolor: "rgba(0,0,0,0.8)", boxShadow: "none" }, "&.Mui-disabled": { bgcolor: "rgba(0,0,0,0.25)", color: "#fff" } } as const;

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
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({ open: false, message: "", severity: "success" });

  const [educationDialog, setEducationDialog] = useState<{ open: boolean; editIndex: number | null; data: Education }>({ open: false, editIndex: null, data: { facility: "", studies: "" } });
  const [certificateDialog, setCertificateDialog] = useState<{ open: boolean; editIndex: number | null; data: Certificate }>({ open: false, editIndex: null, data: { title: "", source: "" } });
  const [languageDialog, setLanguageDialog] = useState<{ open: boolean; selectedLanguage: Language | null; proficiency: ProficiencyLevel }>({ open: false, selectedLanguage: null, proficiency: "conversational" });

  // Portfolio (own endpoints — images, so not part of the JSON profile save)
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
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
      setSnackbar({ open: true, message: "Profile updated successfully!", severity: "success" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update profile";
      setSnackbar({ open: true, message, severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setSnackbar({ open: true, message: "Invalid file type. Please upload JPG, PNG, GIF, or WebP.", severity: "error" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setSnackbar({ open: true, message: "File size must be less than 5MB.", severity: "error" });
      return;
    }
    setUploadingImage(true);
    try {
      await api.uploadProfileImage(file);
      await Promise.all([refreshUser(), refetchDashboard()]);
      setSnackbar({ open: true, message: "Profile picture updated!", severity: "success" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to upload image";
      setSnackbar({ open: true, message, severity: "error" });
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

  // Language handlers
  const handleOpenLanguageDialog = () => {
    setLanguageDialog({ open: false, selectedLanguage: null, proficiency: "conversational" });
    setTimeout(() => setLanguageDialog(prev => ({ ...prev, open: true })), 0);
  };
  const handleSaveLanguage = () => {
    if (!languageDialog.selectedLanguage) return;
    const exists = selectedLanguages.some(l => l.language_id === languageDialog.selectedLanguage!.id);
    if (exists) {
      setSnackbar({ open: true, message: "This language is already added.", severity: "error" });
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
      if (pf.projectUrl.trim()) fd.append("project_url", pf.projectUrl.trim());
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
      setSnackbar({ open: true, message: editing ? "Project updated!" : "Project added to your portfolio!", severity: "success" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save project";
      setSnackbar({ open: true, message, severity: "error" });
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
      setSnackbar({ open: true, message: "Project removed.", severity: "success" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete project";
      setSnackbar({ open: true, message, severity: "error" });
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
      <Box sx={{ maxWidth: 760, mx: "auto", display: "flex", flexDirection: "column", gap: 2.25 }}>
        {[0, 1, 2, 3].map(i => (
          <Box key={i} sx={{ bgcolor: tokens.surface, border: `1px solid ${tokens.border}`, borderRadius: `${tokens.radius.card}px`, p: 3 }}>
            <Skeleton variant="text" width={160} height={22} sx={{ mb: 2 }} />
            <Skeleton variant="rounded" height={i === 1 ? 96 : 44} sx={{ borderRadius: "10px" }} />
          </Box>
        ))}
      </Box>
    );
  }

  if (!user) {
    return <Box sx={{ maxWidth: 760, mx: "auto" }}><Alert severity="warning">Please log in to view your profile.</Alert></Box>;
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
    <Box sx={{ maxWidth: 760, mx: "auto", display: "flex", flexDirection: "column", gap: 2.25 }}>
      {/* Page heading */}
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1.5 }}>
        <Box>
          <Typography sx={{ fontSize: { xs: 24, md: 28 }, fontWeight: 600, letterSpacing: "-0.025em" }}>Edit profile</Typography>
          <Typography sx={{ fontSize: 13.5, color: tokens.text2, mt: 0.5 }}>This is what clients see when they view your profile.</Typography>
        </Box>
        <Button onClick={() => router.push(previewHref)} startIcon={<OpenInNewOutlined sx={{ fontSize: 15 }} />}
          sx={{ display: { xs: "none", sm: "inline-flex" }, height: 38, px: 2, borderRadius: "999px", textTransform: "none", fontSize: 13, fontWeight: 600, border: `1px solid ${tokens.borderStrong}`, color: tokens.text, flexShrink: 0, "&:hover": { bgcolor: tokens.surface2 } }}>
          Preview
        </Button>
      </Box>

      {/* Profile strength */}
      <Box sx={{ bgcolor: tokens.surface, border: `1px solid ${tokens.border}`, borderRadius: `${tokens.radius.card}px`, p: "20px 22px" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.625 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.125 }}>
            <AutoAwesomeOutlined sx={{ fontSize: 18, color: tokens.accent }} />
            <Typography sx={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em" }}>Profile strength</Typography>
          </Box>
          <Typography sx={{ fontSize: 15, fontWeight: 600, fontFamily: tokens.mono, color: strengthPct === 100 ? tokens.success : tokens.accent }}>{strengthPct}%</Typography>
        </Box>
        <LinearProgress variant="determinate" value={strengthPct} sx={{ height: 8, borderRadius: "999px", bgcolor: "rgba(0,0,0,0.06)", "& .MuiLinearProgress-bar": { borderRadius: "999px", bgcolor: strengthPct === 100 ? tokens.success : tokens.accent } }} />
        {remainingTasks.length > 0 ? (
          <Box sx={{ mt: 1.75 }}>
            <Typography sx={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: tokens.text3, mb: 0.5 }}>What&rsquo;s left</Typography>
            {remainingTasks.slice(0, 3).map((t, i) => (
              <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1.25, py: 1, fontSize: 13 }}>
                <Box sx={{ width: 18, height: 18, borderRadius: "50%", border: `1.5px solid ${tokens.borderStrong}`, flex: "none" }} />
                <Typography sx={{ fontSize: 13, color: tokens.text2 }}>{t.label}</Typography>
              </Box>
            ))}
          </Box>
        ) : (
          <Typography sx={{ fontSize: 13, color: tokens.successText, mt: 1.625, display: "flex", alignItems: "center", gap: 0.875 }}>
            <CheckRounded sx={{ fontSize: 15 }} /> Your profile is complete — nice work.
          </Typography>
        )}
      </Box>

      {/* Identity card */}
      <Box sx={{ bgcolor: tokens.surface, border: `1px solid ${tokens.border}`, borderRadius: `${tokens.radius.card}px`, p: { xs: 2.25, md: 2.75 } }}>
        <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: { xs: "flex-start", sm: "center" }, gap: { xs: 2, sm: 2.5 } }}>
          <Box sx={{ position: "relative" }}>
            <ProfileAvatar name={user.name} src={avatarUrl} size={84} editable onEdit={() => fileInputRef.current?.click()} />
            {uploadingImage && (
              <Box sx={{ position: "absolute", inset: 0, borderRadius: "50%", bgcolor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CircularProgress size={22} sx={{ color: "white" }} />
              </Box>
            )}
            <input type="file" ref={fileInputRef} accept="image/jpeg,image/jpg,image/png,image/gif,image/webp" style={{ display: "none" }} onChange={handleImageUpload} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.125, flexWrap: "wrap" }}>
              <Typography sx={{ fontSize: { xs: 20, md: 23 }, fontWeight: 600, letterSpacing: "-0.02em" }}>{user.name}</Typography>
              {level && <LevelBadge level={level} small />}
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.75, flexWrap: "wrap" }}>
              {reviewCount > 0 ? (
                <>
                  <Stars5 rating={ratingNum} size={15} />
                  <Typography sx={{ fontSize: 13.5, fontWeight: 600, fontFamily: tokens.mono }}>{ratingNum.toFixed(1)}</Typography>
                  <Typography sx={{ fontSize: 13, color: tokens.text2, fontFamily: tokens.mono }}>({reviewCount} reviews)</Typography>
                  <Box sx={{ width: 3, height: 3, borderRadius: "50%", bgcolor: tokens.text3 }} />
                  <Typography sx={{ fontSize: 13, color: tokens.text2, fontFamily: tokens.mono }}>{orders} orders</Typography>
                </>
              ) : (
                <Typography sx={{ fontSize: 13, color: tokens.text3 }}>No reviews yet — your rating shows here once you complete orders.</Typography>
              )}
            </Box>
          </Box>
        </Box>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.75, mt: 2.25 }}>
          <LockedField label="Full name" value={user.name} note="Managed in account settings" />
          <LockedField label="Email" value={user.email || "—"} icon={<MailOutline sx={{ fontSize: 16 }} />} note="Managed in account settings" />
        </Box>
      </Box>

      {/* Headline */}
      <SectionCard icon={<AutoAwesomeOutlined sx={{ fontSize: 19 }} />} title="Headline">
        <Stack spacing={2}>
          <Field label="Professional tagline" hint="A short line that sums up what you do — shown under your name.">
            <TextInput value={formData.tagline} onChange={v => handleInputChange("tagline", v.slice(0, 255))} placeholder="e.g. Brand & logo designer for cafés and startups" />
          </Field>
          <Field label="Location">
            <TextInput value={formData.location} onChange={v => handleInputChange("location", v.slice(0, 255))} placeholder="City, Country" startIcon={<RoomOutlined sx={{ fontSize: 16, color: tokens.text3 }} />} />
          </Field>
        </Stack>
      </SectionCard>

      {/* About */}
      <SectionCard icon={<EditOutlined sx={{ fontSize: 19 }} />} title="About you">
        <Field label="Bio" hint="Tell clients about your experience, your style and how you work.">
          <RichTextEditor value={formData.about} onChange={html => handleInputChange("about", html)} placeholder="Write a few sentences about yourself…" minHeight={120} />
        </Field>
      </SectionCard>

      {/* Languages */}
      <SectionCard icon={<PublicOutlined sx={{ fontSize: 19 }} />} title="Languages"
        action={<AddPill onClick={handleOpenLanguageDialog}><AddOutlined sx={{ fontSize: 15 }} />Add language</AddPill>}>
        {selectedLanguages.length > 0 ? (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.125 }}>
            {selectedLanguages.map(lang => <LangChip key={lang.language_id} name={lang.name} proficiency={lang.proficiency} onRemove={() => handleRemoveLanguage(lang.language_id)} />)}
          </Box>
        ) : (
          <Empty icon={<PublicOutlined sx={{ fontSize: 24 }} />} title="No languages added yet" sub="Let clients know which languages you can work in." />
        )}
      </SectionCard>

      {/* Skills */}
      <SectionCard icon={<AutoAwesomeOutlined sx={{ fontSize: 19 }} />} title="Skills & expertise" hint="These power search and recommendations.">
        <MultiSelectInput
          value={selectedExpertiseIds}
          onChange={ids => { setSelectedExpertiseIds(ids as number[]); setHasUnsavedChanges(true); }}
          options={expertises.map(exp => ({ value: exp.id, label: exp.expertise_name }))}
          placeholder="Select your skills and expertise"
        />
      </SectionCard>

      {/* Education */}
      <SectionCard icon={<SchoolOutlined sx={{ fontSize: 19 }} />} title="Education"
        action={<RoundIconBtn title="Add education" onClick={() => handleOpenEducationDialog()}><AddOutlined sx={{ fontSize: 16 }} /></RoundIconBtn>}>
        {educations.length > 0 ? (
          <Box>
            {educations.map((e, i) => (
              <EntryRow key={i} icon={<SchoolOutlined sx={{ fontSize: 19 }} />} title={e.studies} sub={e.facility} onEdit={() => handleOpenEducationDialog(i)} onDelete={() => handleRemoveEducation(i)} />
            ))}
          </Box>
        ) : (
          <Empty icon={<SchoolOutlined sx={{ fontSize: 24 }} />} title="No education added yet" sub="Schools and degrees help build trust." action={<AddPill onClick={() => handleOpenEducationDialog()}><AddOutlined sx={{ fontSize: 15 }} />Add education</AddPill>} />
        )}
      </SectionCard>

      {/* Certifications */}
      <SectionCard icon={<WorkspacePremiumOutlined sx={{ fontSize: 19 }} />} title="Certifications"
        action={<RoundIconBtn title="Add certification" onClick={() => handleOpenCertificateDialog()}><AddOutlined sx={{ fontSize: 16 }} /></RoundIconBtn>}>
        {certificates.length > 0 ? (
          <Box>
            {certificates.map((c, i) => (
              <EntryRow key={i} icon={<WorkspacePremiumOutlined sx={{ fontSize: 19 }} />} title={c.title} sub={c.source} onEdit={() => handleOpenCertificateDialog(i)} onDelete={() => handleRemoveCertificate(i)} />
            ))}
          </Box>
        ) : (
          <Empty icon={<WorkspacePremiumOutlined sx={{ fontSize: 24 }} />} title="No certifications added yet" sub="Add courses and credentials you've earned." action={<AddPill onClick={() => handleOpenCertificateDialog()}><AddOutlined sx={{ fontSize: 15 }} />Add certification</AddPill>} />
        )}
      </SectionCard>

      {/* Portfolio */}
      <SectionCard icon={<GridViewOutlined sx={{ fontSize: 19 }} />} title="Portfolio"
        action={
          <Button onClick={() => openPortfolioDialog()} startIcon={<AddOutlined sx={{ fontSize: 15 }} />}
            sx={{ height: 34, px: 1.75, borderRadius: "999px", textTransform: "none", fontSize: 13, fontWeight: 600, border: `1px solid ${tokens.borderStrong}`, color: tokens.text, "&:hover": { bgcolor: tokens.surface2 } }}>
            Add project
          </Button>
        }>
        {portfolioItems.length > 0 ? (
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "1fr 1fr 1fr" }, gap: 1.75 }}>
            {portfolioItems.map(item => {
              const cover = item.images[0]?.file_url;
              const year = portfolioYear(item.completed_on);
              return (
                <Box key={item.id} sx={{ border: `1px solid ${tokens.border}`, borderRadius: "12px", overflow: "hidden", bgcolor: tokens.surface }}>
                  <Box sx={{ position: "relative", aspectRatio: "16 / 10", bgcolor: "rgba(0,0,0,0.04)" }}>
                    {cover ? <Box component="img" src={cover} alt={item.title} sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                      : <Box sx={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: tokens.text3 }}><ImageOutlined sx={{ fontSize: 26 }} /></Box>}
                    {item.images.length > 1 && (
                      <Box sx={{ position: "absolute", top: 8, right: 8, display: "inline-flex", alignItems: "center", gap: 0.5, height: 24, px: 1, borderRadius: "999px", bgcolor: "rgba(0,0,0,0.6)", color: "#fff", fontSize: 11, fontWeight: 600 }}>
                        <ImageOutlined sx={{ fontSize: 12 }} />{item.images.length}
                      </Box>
                    )}
                  </Box>
                  <Box sx={{ p: "12px 13px" }}>
                    <Typography sx={{ fontSize: 13.5, fontWeight: 600, letterSpacing: "-0.01em", lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.title}</Typography>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 0.875 }}>
                      <Typography sx={{ fontSize: 11.5, color: tokens.text3, fontFamily: tokens.mono }}>{year || ""}</Typography>
                      <Box sx={{ display: "flex", gap: 0.25 }}>
                        <IconButton onClick={() => openPortfolioDialog(item)} sx={{ width: 28, height: 28, borderRadius: "7px", color: tokens.text2, "&:hover": { bgcolor: "rgba(0,0,0,0.05)", color: tokens.text } }}><EditOutlined sx={{ fontSize: 15 }} /></IconButton>
                        <IconButton onClick={() => handleDeletePortfolio(item.id)} disabled={pfDeletingId === item.id} sx={{ width: 28, height: 28, borderRadius: "7px", color: tokens.text2, "&:hover": { bgcolor: tokens.errorTint, color: tokens.errorText } }}>
                          {pfDeletingId === item.id ? <CircularProgress size={14} /> : <DeleteOutline sx={{ fontSize: 15 }} />}
                        </IconButton>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
        ) : (
          <Empty icon={<GridViewOutlined sx={{ fontSize: 24 }} />} title="No projects yet" sub="Show your best work — projects with multiple images convert browsers into buyers."
            action={<Button onClick={() => openPortfolioDialog()} startIcon={<AddOutlined sx={{ fontSize: 15 }} />} sx={{ ...primaryBtnSx, height: 38, mt: 0.5 }}>Add your first project</Button>} />
        )}
      </SectionCard>

      {/* Verification */}
      <SectionCard icon={<ShieldOutlined sx={{ fontSize: 19 }} />} title="Verification" hint="Verified freelancers rank higher and earn more trust.">
        <VerifyRow icon={<BadgeOutlined sx={{ fontSize: 20 }} />} title="Identity (ID)" sub={user.is_verified_id ? "Government ID confirmed" : "Upload a government ID to get verified"} verified={!!user.is_verified_id} onVerify={() => router.push("/dashboard/kyc")} />
        <VerifyRow icon={<PhoneOutlined sx={{ fontSize: 20 }} />} title="Phone number" sub={user.is_verified_phone ? user.telephone || "Phone verified" : "Confirm your phone number"} verified={!!user.is_verified_phone} onVerify={() => router.push("/settings")} />
      </SectionCard>

      {/* Sticky save bar */}
      {hasUnsavedChanges && (
        <Box sx={{ position: "sticky", bottom: 8, zIndex: 8, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, bgcolor: "rgba(255,255,255,0.82)", backdropFilter: "saturate(1.4) blur(16px)", border: `1px solid ${tokens.border}`, borderRadius: "999px", p: "10px 10px 10px 22px", boxShadow: "0 8px 30px rgba(0,0,0,0.10), 0 1px 2px rgba(0,0,0,0.04)" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, minWidth: 0 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: tokens.pending, flex: "none" }} />
            <Typography sx={{ fontSize: 13.5, fontWeight: 500 }}>You have unsaved changes</Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1.125, flex: "none" }}>
            <Button onClick={() => router.push(previewHref)} startIcon={<ShareOutlined sx={{ fontSize: 15 }} />} sx={{ ...ghostBtnSx, height: 38, display: { xs: "none", sm: "inline-flex" } }}>Share profile</Button>
            <Button onClick={handleSaveChanges} disabled={saving} sx={{ ...primaryBtnSx, height: 38 }}>{saving ? <CircularProgress size={18} sx={{ color: "white" }} /> : "Save changes"}</Button>
          </Box>
        </Box>
      )}
      {!hasUnsavedChanges && <Box sx={{ height: 4 }} />}

      {/* Education Dialog */}
      <PfDialog open={educationDialog.open} onClose={() => setEducationDialog(prev => ({ ...prev, open: false }))}
        eyebrow={educationDialog.editIndex !== null ? "Edit education" : "Add education"}
        title={educationDialog.editIndex !== null ? "Edit education" : "Add education"}
        sub="List a degree or course you've completed. Start typing to pick from known schools, or add your own."
        footer={<>
          <Button onClick={() => setEducationDialog(prev => ({ ...prev, open: false }))} sx={ghostBtnSx}>Cancel</Button>
          <Button onClick={handleSaveEducation} disabled={!educationDialog.data.studies || !educationDialog.data.facility} sx={primaryBtnSx}>{educationDialog.editIndex !== null ? "Save changes" : "Add education"}</Button>
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
          <Button onClick={() => setCertificateDialog(prev => ({ ...prev, open: false }))} sx={ghostBtnSx}>Cancel</Button>
          <Button onClick={handleSaveCertificate} disabled={!certificateDialog.data.title || !certificateDialog.data.source} sx={primaryBtnSx}>{certificateDialog.editIndex !== null ? "Save changes" : "Add certification"}</Button>
        </>}>
        <AutocompleteInput label="Certificate name" freeSolo options={certNameOptions} value={certificateDialog.data.title}
          onChange={v => setCertificateDialog(prev => ({ ...prev, data: { ...prev.data, title: (v ?? "").slice(0, 255) } }))} placeholder="e.g. Google UX Design Certificate" />
        <AutocompleteInput label="Issuing organization" freeSolo options={certIssuerOptions} value={certificateDialog.data.source}
          onChange={v => setCertificateDialog(prev => ({ ...prev, data: { ...prev.data, source: (v ?? "").slice(0, 255) } }))} placeholder="e.g. Google" />
      </PfDialog>

      {/* Portfolio Dialog */}
      <PfDialog open={portfolioDialog.open} onClose={() => !pfSaving && setPortfolioDialog(prev => ({ ...prev, open: false }))} width={560}
        eyebrow={portfolioDialog.editing ? "Edit project" : "Add portfolio project"}
        title={portfolioDialog.editing ? "Edit project" : "Add portfolio project"}
        sub="Showcase a piece of work. Add several images — buyers can page through them in a gallery."
        footer={<>
          <Button onClick={() => setPortfolioDialog(prev => ({ ...prev, open: false }))} disabled={pfSaving} sx={ghostBtnSx}>Cancel</Button>
          <Button onClick={handleSavePortfolio} disabled={!pf.title.trim() || pfSaving} sx={primaryBtnSx}>{pfSaving ? <CircularProgress size={18} sx={{ color: "white" }} /> : portfolioDialog.editing ? "Save project" : "Add project"}</Button>
        </>}>
        <Field label="Project title"><TextInput value={pf.title} onChange={v => setPf(p => ({ ...p, title: v.slice(0, 255) }))} placeholder="e.g. Sombai Coffee — full rebrand" /></Field>
        <Field label="Description"><TextArea minRows={3} value={pf.description} onChange={v => setPf(p => ({ ...p, description: v }))} placeholder="What was the brief, and what did you deliver?" /></Field>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
          <Field label="Project link" optional><TextInput value={pf.projectUrl} onChange={v => setPf(p => ({ ...p, projectUrl: v }))} placeholder="https://…" startIcon={<LinkOutlined sx={{ fontSize: 16, color: tokens.text3 }} />} /></Field>
          <Field label="Completed date"><DatePicker value={pf.date} onChange={d => setPf(p => ({ ...p, date: d }))} maxDate={new Date()} placeholder="Select month" /></Field>
        </Box>
        {pfExisting.length > 0 && (
          <Field label="Current images">
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {pfExisting.map(img => (
                <Box key={img.id} sx={{ position: "relative", width: 72, height: 72 }}>
                  <Box component="img" src={img.file_url} alt="" sx={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 2, border: `1px solid ${tokens.border}` }} />
                  <IconButton size="small" onClick={() => removeExistingPortfolioImage(img.id)} sx={{ position: "absolute", top: -8, right: -8, bgcolor: "white", border: `1px solid ${tokens.borderStrong}`, width: 22, height: 22, "&:hover": { bgcolor: "#fdecec" } }}><CloseOutlined sx={{ fontSize: 13 }} /></IconButton>
                </Box>
              ))}
            </Box>
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
          <Button onClick={() => setLanguageDialog(prev => ({ ...prev, open: false }))} sx={ghostBtnSx}>Cancel</Button>
          <Button onClick={handleSaveLanguage} disabled={!languageDialog.selectedLanguage} sx={primaryBtnSx}>Add language</Button>
        </>}>
        <SelectInput label="Language" value={languageDialog.selectedLanguage?.id ?? ""}
          onChange={v => setLanguageDialog(prev => ({ ...prev, selectedLanguage: languages.find(l => l.id === Number(v)) ?? null }))}
          options={languages.filter(l => !selectedLanguages.some(sl => sl.language_id === l.id)).map(l => ({ value: l.id, label: l.name }))} />
        <SelectInput label="Proficiency" value={languageDialog.proficiency}
          onChange={v => setLanguageDialog(prev => ({ ...prev, proficiency: v as ProficiencyLevel }))}
          options={PROFICIENCY_OPTIONS.map(o => ({ value: o.value, label: o.label }))} />
      </PfDialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Alert onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} severity={snackbar.severity} sx={{ width: "100%" }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
