"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import RichTextEditor from "@/components/ui/RichTextEditor";
import { Box, Typography, Button, CircularProgress, Alert, Snackbar, Skeleton, Stack } from "@mui/material";
import {
  RoomOutlined, LanguageOutlined, ShieldOutlined, BadgeOutlined, PhoneOutlined,
  PhotoCameraOutlined, BusinessOutlined, EditOutlined,
} from "@mui/icons-material";
import { useAuth } from "@/components/context/AuthContext";
import { api } from "@/lib/api";
import { Industry, ClientProfileRequest } from "@/types/user";
import { TextInput, SelectInput } from "@/components/ui/inputs";
import { tokens } from "@/theme";
import { ProfileAvatar, SectionCard, Field, VerifyRow } from "@/components/profile/profileKit";

const CLIENT_SIZES = ["1-10", "11-50", "51-200", "201-500", "500+"] as const;

const primaryBtnSx = { height: 38, px: 2.5, borderRadius: "999px", textTransform: "none", fontSize: 13.5, fontWeight: 600, bgcolor: "#000", color: "#fff", boxShadow: "none", "&:hover": { bgcolor: "rgba(0,0,0,0.8)", boxShadow: "none" } } as const;
const secBtnSx = { height: 34, px: 1.75, borderRadius: "999px", textTransform: "none", fontSize: 13, fontWeight: 600, border: `1px solid ${tokens.borderStrong}`, color: tokens.text, "&:hover": { bgcolor: tokens.surface2 } } as const;

function SizePills({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
      {CLIENT_SIZES.map(o => {
        const on = value === o;
        return (
          <Box key={o} component="button" onClick={() => onChange(o)}
            sx={{ height: 38, px: 1.875, borderRadius: "999px", cursor: "pointer", fontFamily: "inherit", fontSize: 13.5, fontWeight: 600, border: `1px solid ${on ? "transparent" : tokens.borderStrong}`, bgcolor: on ? "#000" : tokens.surface, color: on ? "#fff" : tokens.text2, transition: "background .12s, border-color .12s, color .12s", "&:hover": on ? {} : { borderColor: tokens.accent, color: tokens.text } }}>
            {o}
          </Box>
        );
      })}
    </Box>
  );
}

export default function ProfileContent() {
  const { user, refreshUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    company_name: "",
    industry_id: "" as number | "",
    company_size: "" as ClientProfileRequest["company_size"] | "",
    location: "",
    website: "",
    about: "",
  });

  const [industries, setIndustries] = useState<Industry[]>([]);
  const [loadingIndustries, setLoadingIndustries] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({ open: false, message: "", severity: "success" });

  useEffect(() => {
    const loadIndustries = async () => {
      try {
        const data = await api.getIndustries();
        setIndustries(data);
      } catch (error) {
        console.error("Failed to load industries:", error);
      } finally {
        setLoadingIndustries(false);
      }
    };
    loadIndustries();
  }, []);

  useEffect(() => {
    if (user?.client_profile) {
      const profile = user.client_profile;
      setFormData({
        company_name: profile.company_name || "",
        industry_id: profile.industry_id || "",
        company_size: profile.company_size || "",
        location: profile.location || "",
        website: profile.website || "",
        about: profile.about || "",
      });
    }
  }, [user?.client_profile]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const handleSaveChanges = async () => {
    if (!user?.client_profile) return;
    setSaving(true);
    try {
      const requestData: ClientProfileRequest = {
        company_name: formData.company_name || undefined,
        industry_id: formData.industry_id ? Number(formData.industry_id) : undefined,
        company_size: formData.company_size || undefined,
        location: formData.location || undefined,
        website: formData.website || undefined,
        about: formData.about || undefined,
      };
      await api.updateClientProfile(user.client_profile.id, requestData);
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
      await refreshUser();
      setSnackbar({ open: true, message: "Profile picture updated!", severity: "success" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to upload image";
      setSnackbar({ open: true, message, severity: "error" });
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteImage = async () => {
    if (!user?.avatar_url) return;
    setUploadingImage(true);
    try {
      await api.deleteProfileImage();
      await refreshUser();
      setSnackbar({ open: true, message: "Profile picture removed.", severity: "success" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to remove image";
      setSnackbar({ open: true, message, severity: "error" });
    } finally {
      setUploadingImage(false);
    }
  };

  if (authLoading) {
    return (
      <Box sx={{ maxWidth: 680, mx: "auto", display: "flex", flexDirection: "column", gap: 2.25 }}>
        {[0, 1, 2].map(i => (
          <Box key={i} sx={{ bgcolor: tokens.surface, border: `1px solid ${tokens.border}`, borderRadius: `${tokens.radius.card}px`, p: 3 }}>
            <Skeleton variant="text" width={160} height={22} sx={{ mb: 2 }} />
            <Skeleton variant="rounded" height={44} sx={{ borderRadius: "10px" }} />
          </Box>
        ))}
      </Box>
    );
  }

  if (!user) {
    return <Box sx={{ maxWidth: 680, mx: "auto" }}><Alert severity="warning">Please log in to view your profile.</Alert></Box>;
  }

  const industryName = industries.find(i => i.id === formData.industry_id)?.name;

  return (
    <Box sx={{ maxWidth: 680, mx: "auto", display: "flex", flexDirection: "column", gap: 2.25 }}>
      {/* Heading + inline save */}
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1.5 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: { xs: 24, md: 28 }, fontWeight: 600, letterSpacing: "-0.025em" }}>Company profile</Typography>
          <Typography sx={{ fontSize: 13.5, color: tokens.text2, mt: 0.5 }}>How freelancers see your business when you hire.</Typography>
        </Box>
        {hasUnsavedChanges && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, flex: "none" }}>
            <Box sx={{ display: { xs: "none", sm: "inline-flex" }, alignItems: "center", gap: 0.875, fontSize: 12.5, color: tokens.pendingText }}>
              <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: tokens.pending }} />Unsaved
            </Box>
            <Button onClick={handleSaveChanges} disabled={saving} sx={primaryBtnSx}>{saving ? <CircularProgress size={18} sx={{ color: "white" }} /> : "Save changes"}</Button>
          </Box>
        )}
      </Box>

      {/* Identity */}
      <Box sx={{ bgcolor: tokens.surface, border: `1px solid ${tokens.border}`, borderRadius: `${tokens.radius.card}px`, p: { xs: 2.25, md: 2.75 } }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2.25 }}>
          <Box sx={{ position: "relative" }}>
            <ProfileAvatar name={formData.company_name || user.name} src={user.avatar_url} size={76} />
            {uploadingImage && (
              <Box sx={{ position: "absolute", inset: 0, borderRadius: "50%", bgcolor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CircularProgress size={20} sx={{ color: "white" }} />
              </Box>
            )}
            <input type="file" ref={fileInputRef} accept="image/jpeg,image/jpg,image/png,image/gif,image/webp" style={{ display: "none" }} onChange={handleImageUpload} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: { xs: 17, md: 19 }, fontWeight: 600, letterSpacing: "-0.02em" }}>{formData.company_name || "Your company"}</Typography>
            <Typography sx={{ fontSize: 13, color: tokens.text2, mt: 0.375 }}>
              {industryName || formData.location ? [industryName, formData.location].filter(Boolean).join(" · ") : "Add a logo and details below"}
            </Typography>
            <Box sx={{ display: "flex", gap: 1.125, mt: 1.5 }}>
              <Button onClick={() => fileInputRef.current?.click()} disabled={uploadingImage} startIcon={<PhotoCameraOutlined sx={{ fontSize: 15 }} />} sx={secBtnSx}>Change</Button>
              {user.avatar_url && <Button onClick={handleDeleteImage} disabled={uploadingImage} sx={{ height: 34, px: 1.5, borderRadius: "999px", textTransform: "none", fontSize: 13, fontWeight: 600, color: tokens.text2, "&:hover": { bgcolor: tokens.surface2 } }}>Remove</Button>}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Company details */}
      <SectionCard icon={<BusinessOutlined sx={{ fontSize: 19 }} />} title="Company details">
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
          <Field label="Company name"><TextInput value={formData.company_name} onChange={v => handleInputChange("company_name", v)} placeholder="e.g. Brown Coffee Roastery" /></Field>
          <Field label="Industry"><SelectInput value={formData.industry_id} onChange={v => handleInputChange("industry_id", v)} options={industries.map(i => ({ value: i.id, label: i.name ?? "" }))} placeholder="Select an industry" disabled={loadingIndustries} /></Field>
          <Field label="Location"><TextInput value={formData.location} onChange={v => handleInputChange("location", v)} placeholder="City, Country" startIcon={<RoomOutlined sx={{ fontSize: 16, color: tokens.text3 }} />} /></Field>
          <Field label="Website" optional><TextInput value={formData.website} onChange={v => handleInputChange("website", v)} placeholder="yourcompany.com" startIcon={<LanguageOutlined sx={{ fontSize: 16, color: tokens.text3 }} />} /></Field>
        </Box>
        <Box sx={{ mt: 2 }}>
          <Field label="Company size"><SizePills value={formData.company_size || ""} onChange={v => handleInputChange("company_size", v)} /></Field>
        </Box>
      </SectionCard>

      {/* About */}
      <SectionCard icon={<EditOutlined sx={{ fontSize: 19 }} />} title="About the company">
        <Field label="About" hint="A short intro helps freelancers understand who they'd be working with.">
          <RichTextEditor value={formData.about} onChange={html => handleInputChange("about", html)} placeholder="Describe your company, what you do, and what you hire for…" minHeight={110} />
        </Field>
      </SectionCard>

      {/* Verification */}
      <SectionCard icon={<ShieldOutlined sx={{ fontSize: 19 }} />} title="Verification" hint="Verified clients get faster responses from top freelancers.">
        <VerifyRow icon={<BadgeOutlined sx={{ fontSize: 20 }} />} title="Identity (ID)" sub={user.is_verified_id ? "Government ID confirmed" : "Upload a government ID to get verified"} verified={!!user.is_verified_id} onVerify={() => router.push("/dashboard/kyc")} />
        <VerifyRow icon={<PhoneOutlined sx={{ fontSize: 20 }} />} title="Phone number" sub={user.is_verified_phone ? user.telephone || "Phone verified" : "Confirm your phone number"} verified={!!user.is_verified_phone} onVerify={() => router.push("/settings")} />
      </SectionCard>

      <Box sx={{ height: 4 }} />

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} severity={snackbar.severity} sx={{ width: "100%" }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
