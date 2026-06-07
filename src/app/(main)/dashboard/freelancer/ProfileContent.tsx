"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import RichTextEditor from "@/components/ui/RichTextEditor";
import {
  Box,
  Paper,
  Typography,
  Button,
  Avatar,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Snackbar,
  Skeleton,
  Stack,
  Dialog,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  FileUploadOutlined,
  RoomOutlined,
  PublicOutlined,
  AddOutlined,
  CloseOutlined,
  ShareOutlined,
  VerifiedUserOutlined,
  PhoneOutlined,
  DeleteOutline,
  EditOutlined,
  StarRounded,
} from "@mui/icons-material";
import { TextInput, SelectInput, MultiSelectInput } from "@/components/ui/inputs";
import { useAuth } from "@/components/context/AuthContext";
import { useFreelancerDashboard } from "@/hooks/useFreelancerDashboard";
import { api } from "@/lib/api";
import { Education, Certificate, Language, Expertise, FreelancerProfileRequest, LanguageWithProficiency } from "@/types/user";

const PROFICIENCY_OPTIONS = [
  { value: "basic", label: "Basic" },
  { value: "conversational", label: "Conversational" },
  { value: "fluent", label: "Fluent" },
  { value: "native", label: "Native / Bilingual" },
] as const;

type ProficiencyLevel = "basic" | "conversational" | "fluent" | "native";

export default function ProfileContent() {
  const { user, refreshUser, loading: authLoading } = useAuth();
  const { data: dashboardData, refetch: refetchDashboard } = useFreelancerDashboard();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    tagline: "",
    about: "",
    location: "",
  });
  const [educations, setEducations] = useState<Education[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<
    { language_id: number; name: string; proficiency: ProficiencyLevel }[]
  >([]);
  const [selectedExpertiseIds, setSelectedExpertiseIds] = useState<number[]>([]);

  // Reference data
  const [languages, setLanguages] = useState<Language[]>([]);
  const [expertises, setExpertises] = useState<Expertise[]>([]);
  const [loadingReferenceData, setLoadingReferenceData] = useState(true);

  // UI state
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  // Dialog states
  const [educationDialog, setEducationDialog] = useState<{
    open: boolean;
    editIndex: number | null;
    data: Education;
  }>({
    open: false,
    editIndex: null,
    data: { facility: "", studies: "" },
  });

  const [certificateDialog, setCertificateDialog] = useState<{
    open: boolean;
    editIndex: number | null;
    data: Certificate;
  }>({
    open: false,
    editIndex: null,
    data: { title: "", source: "" },
  });

  const [languageDialog, setLanguageDialog] = useState<{
    open: boolean;
    selectedLanguage: Language | null;
    proficiency: ProficiencyLevel;
  }>({
    open: false,
    selectedLanguage: null,
    proficiency: "conversational",
  });

  // Load reference data on mount
  useEffect(() => {
    const loadReferenceData = async () => {
      try {
        const [languagesData, expertisesData] = await Promise.all([api.getLanguages(), api.getExpertises()]);
        setLanguages(languagesData);
        setExpertises(expertisesData);
      } catch (error) {
        console.error("Failed to load reference data:", error);
      } finally {
        setLoadingReferenceData(false);
      }
    };
    loadReferenceData();
  }, []);

  // Populate form with existing profile data
  useEffect(() => {
    if (user?.freelancer_profile) {
      const profile = user.freelancer_profile;
      setFormData({
        tagline: profile.tagline || "",
        about: profile.about || "",
        location: profile.location || "",
      });
      setEducations(profile.educations || []);
      setCertificates(profile.certificates || []);

      // Map languages with proficiency
      if (profile.languages) {
        setSelectedLanguages(
          profile.languages.map((lang: LanguageWithProficiency) => ({
            language_id: lang.id,
            name: lang.name,
            proficiency: lang.proficiency,
          })),
        );
      }

      // Map expertise IDs
      if (profile.expertises) {
        setSelectedExpertiseIds(profile.expertises.map((exp: Expertise) => exp.id));
      }
    }
  }, [user?.freelancer_profile]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
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
        // TODO: re-enable when Education & Certifications feature is ready
        // educations: educations.length > 0 ? educations : undefined,
        // certificates: certificates.length > 0 ? certificates : undefined,
        expertise_ids: selectedExpertiseIds.length > 0 ? selectedExpertiseIds : undefined,
        languages:
          selectedLanguages.length > 0
            ? selectedLanguages.map(lang => ({
                language_id: lang.language_id,
                proficiency: lang.proficiency,
              }))
            : undefined,
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
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Education handlers
  const handleOpenEducationDialog = (index: number | null = null) => {
    if (index !== null && educations[index]) {
      setEducationDialog({
        open: true,
        editIndex: index,
        data: { ...educations[index] },
      });
    } else {
      setEducationDialog({
        open: true,
        editIndex: null,
        data: { facility: "", studies: "" },
      });
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
      setCertificateDialog({
        open: true,
        editIndex: index,
        data: { ...certificates[index] },
      });
    } else {
      setCertificateDialog({
        open: true,
        editIndex: null,
        data: { title: "", source: "" },
      });
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
    setLanguageDialog({
      open: false,
      selectedLanguage: null,
      proficiency: "conversational",
    });
    // Delay to ensure state is reset
    setTimeout(() => {
      setLanguageDialog(prev => ({ ...prev, open: true }));
    }, 0);
  };

  const handleSaveLanguage = () => {
    if (!languageDialog.selectedLanguage) return;

    // Check if language already exists
    const exists = selectedLanguages.some(l => l.language_id === languageDialog.selectedLanguage!.id);
    if (exists) {
      setSnackbar({ open: true, message: "This language is already added.", severity: "error" });
      return;
    }

    setSelectedLanguages([
      ...selectedLanguages,
      {
        language_id: languageDialog.selectedLanguage.id,
        name: languageDialog.selectedLanguage.name,
        proficiency: languageDialog.proficiency,
      },
    ]);
    setLanguageDialog({ open: false, selectedLanguage: null, proficiency: "conversational" });
    setHasUnsavedChanges(true);
  };

  const handleRemoveLanguage = (languageId: number) => {
    setSelectedLanguages(selectedLanguages.filter(l => l.language_id !== languageId));
    setHasUnsavedChanges(true);
  };

  if (authLoading || loadingReferenceData) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(0, 0, 0, 0.08)", p: 4 }}>
          <Skeleton variant='text' width={200} height={32} sx={{ mb: 3 }} />
          <Stack direction='row' spacing={3} alignItems='center' mb={3}>
            <Skeleton variant='circular' width={120} height={120} />
            <Box flex={1}>
              <Skeleton variant='rectangular' height={44} sx={{ borderRadius: 3, mb: 2 }} />
              <Skeleton variant='rectangular' height={44} sx={{ borderRadius: 3 }} />
            </Box>
          </Stack>
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} variant='rectangular' height={44} sx={{ borderRadius: 3, mb: 2 }} />
          ))}
        </Paper>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ maxWidth: 896 }}>
        <Alert severity='warning'>Please log in to view your profile.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Profile Picture & Basic Info */}
      <Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(0, 0, 0, 0.08)", p: 4 }}>
        <Typography sx={{ fontSize: 17, fontWeight: 600, color: "black", mb: "18px !important" }}>Basic Information</Typography>

        <Box sx={{ display: "flex", alignItems: "start", gap: 3, mb: 3 }}>
          <Box sx={{ position: "relative" }}>
            <Avatar src={dashboardData?.profile.avatarUrl ?? undefined} alt={user.name} sx={{ width: 160, height: 160 }}>
              {user.name?.charAt(0).toUpperCase()}
            </Avatar>
            {uploadingImage && (
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "rgba(0,0,0,0.5)",
                  borderRadius: "50%",
                }}>
                <CircularProgress size={24} sx={{ color: "white" }} />
              </Box>
            )}
            <input
              type='file'
              ref={fileInputRef}
              accept='image/jpeg,image/jpg,image/png,image/gif,image/webp'
              style={{ display: "none" }}
              onChange={handleImageUpload}
            />
            <IconButton
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImage}
              sx={{
                position: "absolute",
                bottom: 0,
                right: 0,
                bgcolor: "black",
                color: "white",
                width: 36,
                height: 36,
                "&:hover": {
                  bgcolor: "rgba(0, 0, 0, 0.8)",
                },
              }}>
              <FileUploadOutlined sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>

          <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
            <Box>
              <Typography sx={{ fontSize: 12, color: "rgba(0, 0, 0, 0.6)" }}>Name</Typography>
              <TextInput value={user.name} disabled helper='Name is managed in account settings' />
            </Box>

            <Box>
              <Typography sx={{ fontSize: 12, color: "rgba(0, 0, 0, 0.6)", mb: 1 }}>Email</Typography>
              <TextInput value={user.email} disabled />
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                py: 1,
                px: 1.5,
                bgcolor: "rgba(0,0,0,0.02)",
                borderRadius: 2,
              }}>
              <StarRounded sx={{ fontSize: 16, color: dashboardData?.profile.totalReviews ? "#f59e0b" : "rgba(0,0,0,0.2)" }} />
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: "black" }}>
                {dashboardData?.profile.rating ? parseFloat(dashboardData.profile.rating).toFixed(1) : "—"}
              </Typography>
              <Typography sx={{ fontSize: 12, color: "rgba(0,0,0,0.5)" }}>
                · {dashboardData?.profile.totalReviews ?? 0} {dashboardData?.profile.totalReviews === 1 ? "review" : "reviews"}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Box>
            <Typography sx={{ fontSize: 12, color: "rgba(0, 0, 0, 0.6)", mb: 1 }}>Short Tagline (max 255 characters)</Typography>
            <TextInput
              value={formData.tagline}
              onChange={v => handleInputChange("tagline", v.slice(0, 255))}
              placeholder='e.g., Creative Designer Specializing in Branding'
            />
          </Box>

          <Box>
            <Typography
              sx={{ fontSize: 12, color: "rgba(0, 0, 0, 0.6)", mb: 1, display: "flex", alignItems: "center", gap: 0.5 }}>
              <RoomOutlined sx={{ fontSize: 14 }} />
              Location
            </Typography>
            <TextInput
              value={formData.location}
              onChange={v => handleInputChange("location", v.slice(0, 255))}
              placeholder='City, Country'
            />
          </Box>

          <Box>
            <Typography sx={{ fontSize: 12, color: "rgba(0, 0, 0, 0.6)", mb: 1 }}>Bio - About Me</Typography>
            <RichTextEditor
              value={formData.about}
              onChange={html => handleInputChange("about", html)}
              placeholder='Tell clients about your background, expertise, and what makes you unique...'
              minHeight={120}
            />
          </Box>
        </Box>
      </Paper>

      {/* Languages */}
      <Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(0, 0, 0, 0.08)", p: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <PublicOutlined sx={{ fontSize: 18 }} />
            <Typography sx={{ fontSize: 17, fontWeight: 600, color: "black" }}>Languages</Typography>
          </Box>
          <Button
            startIcon={<AddOutlined sx={{ fontSize: 14 }} />}
            onClick={handleOpenLanguageDialog}
            sx={{
              fontSize: 12,
              color: "rgba(0, 0, 0, 0.6)",
              textTransform: "none",
              "&:hover": { color: "black", bgcolor: "transparent" },
            }}>
            Add Language
          </Button>
        </Box>

        {selectedLanguages.length > 0 ? (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {selectedLanguages.map(lang => (
              <Chip
                key={lang.language_id}
                label={`${lang.name} (${PROFICIENCY_OPTIONS.find(p => p.value === lang.proficiency)?.label || lang.proficiency})`}
                onDelete={() => handleRemoveLanguage(lang.language_id)}
                deleteIcon={<CloseOutlined sx={{ fontSize: 12 }} />}
                sx={{
                  height: 28,
                  bgcolor: "rgba(0, 0, 0, 0.05)",
                  fontSize: 12,
                  color: "black",
                  "& .MuiChip-deleteIcon": {
                    color: "rgba(0, 0, 0, 0.6)",
                    "&:hover": { color: "#ef4444" },
                  },
                }}
              />
            ))}
          </Box>
        ) : (
          <Typography sx={{ fontSize: 13, color: "rgba(0, 0, 0, 0.4)" }}>No languages added yet</Typography>
        )}
      </Paper>

      {/* Skills & Expertise */}
      <Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(0, 0, 0, 0.08)", p: 4 }}>
        <Typography sx={{ fontSize: 17, fontWeight: 600, color: "black", mb: 3 }}>Skills & Expertise</Typography>

        <MultiSelectInput
          value={selectedExpertiseIds}
          onChange={ids => {
            setSelectedExpertiseIds(ids as number[]);
            setHasUnsavedChanges(true);
          }}
          options={expertises.map(exp => ({ value: exp.id, label: exp.expertise_name }))}
          placeholder='Select your skills and expertise'
        />
      </Paper>

      {/* TODO: re-enable Education & Certifications sections when feature is ready */}
      {/* Education */}
      {/* <Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(0, 0, 0, 0.08)", p: 4 }}>
        ...
      </Paper> */}

      {/* Certifications */}
      {/* <Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(0, 0, 0, 0.08)", p: 4 }}>
        ...
      </Paper> */}

      {/* Verification */}
      <Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(0, 0, 0, 0.08)", p: 4 }}>
        <Typography sx={{ fontSize: 17, fontWeight: 600, color: "black", mb: 1 }}>Verification</Typography>
        <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)", mb: 3 }}>
          Verification is required to accept service requests from clients
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "start",
              justifyContent: "space-between",
              p: 2,
              bgcolor: user.is_verified_id ? "rgba(34, 197, 94, 0.05)" : "rgba(0, 0, 0, 0.02)",
              borderRadius: 3,
            }}>
            <Box sx={{ display: "flex", alignItems: "start", gap: 1.5 }}>
              <VerifiedUserOutlined sx={{ fontSize: 20, color: user.is_verified_id ? "#16a34a" : "rgba(0,0,0,0.3)", mt: 0.25 }} />
              <Box>
                <Typography
                  sx={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: user.is_verified_id ? "rgb(21, 128, 61)" : "rgba(0,0,0,0.6)",
                    mb: 0.5,
                  }}>
                  Identity Verification
                </Typography>
                <Typography sx={{ fontSize: 11, color: user.is_verified_id ? "#16a34a" : "rgba(0,0,0,0.4)" }}>
                  {user.is_verified_id ? "Your ID has been verified" : "Verify your identity to accept orders"}
                </Typography>
              </Box>
            </Box>
            {user.is_verified_id ? (
              <Chip label='VERIFIED' sx={{ height: 24, bgcolor: "#16a34a", color: "white", fontSize: 10, fontWeight: 500 }} />
            ) : (
              <Button
                size='small'
                onClick={() => router.push("/dashboard/kyc")}
                sx={{
                  fontSize: 11,
                  textTransform: "none",
                  bgcolor: "#0071e3",
                  color: "white",
                  borderRadius: 2,
                  "&:hover": { bgcolor: "#0077ED" },
                }}>
                Verify Now
              </Button>
            )}
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "start",
              justifyContent: "space-between",
              p: 2,
              bgcolor: user.is_verified_phone ? "rgba(34, 197, 94, 0.05)" : "rgba(0, 0, 0, 0.02)",
              borderRadius: 3,
            }}>
            <Box sx={{ display: "flex", alignItems: "start", gap: 1.5 }}>
              <PhoneOutlined sx={{ fontSize: 20, color: user.is_verified_phone ? "#16a34a" : "rgba(0,0,0,0.3)", mt: 0.25 }} />
              <Box>
                <Typography
                  sx={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: user.is_verified_phone ? "rgb(21, 128, 61)" : "rgba(0,0,0,0.6)",
                    mb: 0.5,
                  }}>
                  Phone Verification
                </Typography>
                <Typography sx={{ fontSize: 11, color: user.is_verified_phone ? "#16a34a" : "rgba(0,0,0,0.4)" }}>
                  {user.is_verified_phone ? user.telephone || "Phone verified" : "Verify your phone number"}
                </Typography>
              </Box>
            </Box>
            {user.is_verified_phone ? (
              <Chip label='VERIFIED' sx={{ height: 24, bgcolor: "#16a34a", color: "white", fontSize: 10, fontWeight: 500 }} />
            ) : (
              <Button
                size='small'
                onClick={() => router.push("/settings")}
                sx={{
                  fontSize: 11,
                  textTransform: "none",
                  bgcolor: "#0071e3",
                  color: "white",
                  borderRadius: 2,
                  "&:hover": { bgcolor: "#0077ED" },
                }}>
                Verify Now
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Action Buttons */}
      <Paper
        elevation={0}
        sx={{
          position: "sticky",
          bottom: 0,
          borderRadius: 4,
          p: 2,
          bgcolor: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          border: "1px solid rgba(0, 0, 0, 0.08)",
        }}>
        <Box>
          {hasUnsavedChanges && <Typography sx={{ fontSize: 11, color: "#f59e0b", ml: 1 }}>You have unsaved changes</Typography>}
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            disabled={hasUnsavedChanges}
            startIcon={<ShareOutlined sx={{ fontSize: 14 }} />}
            sx={{
              px: 3,
              height: 40,
              fontSize: 13,
              borderRadius: 10,
              textTransform: "none",
              bgcolor: "rgba(0, 0, 0, 0.05)",
              color: hasUnsavedChanges ? "rgba(0, 0, 0, 0.4)" : "black",
              "&:hover": { bgcolor: hasUnsavedChanges ? "rgba(0, 0, 0, 0.05)" : "rgba(0, 0, 0, 0.1)" },
              "&.Mui-disabled": { color: "rgba(0, 0, 0, 0.4)" },
            }}>
            Share Profile
          </Button>
          <Button
            onClick={handleSaveChanges}
            disabled={!hasUnsavedChanges || saving}
            sx={{
              px: 3,
              height: 40,
              fontSize: 13,
              color: "white",
              borderRadius: 10,
              textTransform: "none",
              bgcolor: hasUnsavedChanges ? "green" : "rgba(0, 0, 0, 0.2)",
              cursor: hasUnsavedChanges ? "pointer" : "not-allowed",
              "&:hover": { bgcolor: hasUnsavedChanges ? "rgba(0, 0, 0, 0.8)" : "rgba(0, 0, 0, 0.2)" },
              "&.Mui-disabled": { color: "white" },
            }}>
            {saving ? <CircularProgress size={20} sx={{ color: "white" }} /> : "Save Changes"}
          </Button>
        </Box>
      </Paper>

      {/* TODO: re-enable Education & Certificate dialogs when feature is ready */}
      {/* Education Dialog */}
      {/* <Dialog open={educationDialog.open} ... /> */}

      {/* Certificate Dialog */}
      {/* <Dialog open={certificateDialog.open} ... /> */}

      {/* Language Dialog */}
      <Dialog open={languageDialog.open} onClose={() => setLanguageDialog(prev => ({ ...prev, open: false }))}>
        <DialogContent sx={{ minWidth: 400 }}>
          <Typography sx={{ fontSize: 16, fontWeight: 600, color: "black" }}>Add Language</Typography>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <SelectInput
              label='Language'
              value={languageDialog.selectedLanguage?.id ?? ""}
              onChange={v =>
                setLanguageDialog(prev => ({
                  ...prev,
                  selectedLanguage: languages.find(l => l.id === Number(v)) ?? null,
                }))
              }
              options={languages
                .filter(l => !selectedLanguages.some(sl => sl.language_id === l.id))
                .map(l => ({ value: l.id, label: l.name }))}
            />
            <SelectInput
              label='Proficiency'
              value={languageDialog.proficiency}
              onChange={v => setLanguageDialog(prev => ({ ...prev, proficiency: v as ProficiencyLevel }))}
              options={PROFICIENCY_OPTIONS.map(option => ({ value: option.value, label: option.label }))}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLanguageDialog(prev => ({ ...prev, open: false }))}>Cancel</Button>
          <Button onClick={handleSaveLanguage} disabled={!languageDialog.selectedLanguage} variant='contained'>
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
