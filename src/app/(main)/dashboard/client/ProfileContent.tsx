"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import RichTextEditor from "@/components/ui/RichTextEditor";
import { MapPin, Globe, Shield, IdCard, Phone, Camera, Building2, Pencil } from "lucide-react";
import { css } from "styled-system/css";
import { Alert, Skeleton, Spinner, toast } from "@/components/ds";
import { useAuth } from "@/components/context/AuthContext";
import { api } from "@/lib/api";
import { Industry, ClientProfileRequest } from "@/types/user";
import { TextInput, SelectInput } from "@/components/ui/inputs";
import { ProfileAvatar, SectionCard, Field, VerifyRow } from "@/components/profile/profileKit";

const CLIENT_SIZES = ["1-10", "11-50", "51-200", "201-500", "500+"] as const;

const primaryBtn = css({
  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px",
  h: "38px", px: "20px", borderRadius: "999px", border: "none",
  bg: "#000", color: "#fff", fontFamily: "inherit", fontSize: "13.5px", fontWeight: 600,
  lineHeight: 1.75, cursor: "pointer", boxShadow: "none", whiteSpace: "nowrap",
  _hover: { bg: "rgba(0,0,0,0.8)", boxShadow: "none" },
  _disabled: { bg: "rgba(0,0,0,0.25)", color: "#fff", cursor: "default", pointerEvents: "none" },
});
const secBtn = css({
  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px",
  h: "34px", pl: "10px", pr: "14px", borderRadius: "999px",  // MUI startIcon pulls 4px off the left padding
  borderWidth: "1px", borderStyle: "solid", borderColor: "hairlineStrong",
  bg: "transparent", color: "ink", fontFamily: "inherit", fontSize: "13px", fontWeight: 600,
  lineHeight: 1.75, cursor: "pointer", whiteSpace: "nowrap",
  _hover: { bg: "surface2" },
  _disabled: { color: "rgba(0,0,0,0.26)", cursor: "default", pointerEvents: "none" },
  "& svg": { display: "block" },
});
const ghostBtn = css({
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  h: "34px", px: "12px", borderRadius: "999px", border: "none", bg: "transparent",
  color: "ink2", fontFamily: "inherit", fontSize: "13px", fontWeight: 600, lineHeight: 1.75,
  cursor: "pointer", whiteSpace: "nowrap",
  _hover: { bg: "surface2" },
  _disabled: { color: "rgba(0,0,0,0.26)", cursor: "default", pointerEvents: "none" },
});

const pillRow = css({ display: "flex", flexWrap: "wrap", gap: "8px" });
const sizePill = css({
  h: "38px", px: "15px", borderRadius: "999px", cursor: "pointer",
  fontFamily: "inherit", fontSize: "13.5px", fontWeight: 600,
  borderWidth: "1px", borderStyle: "solid", borderColor: "hairlineStrong",
  bg: "surface", color: "ink2",
  transition: "background .12s, border-color .12s, color .12s",
  _hover: { borderColor: "accent", color: "ink" },
  "&[data-on]": { borderColor: "transparent", bg: "#000", color: "#fff", _hover: { borderColor: "transparent", color: "#fff" } },
});

function SizePills({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className={pillRow}>
      {CLIENT_SIZES.map(o => {
        const on = value === o;
        return (
          <button key={o} type="button" onClick={() => onChange(o)} className={sizePill} data-on={on ? "" : undefined}>
            {o}
          </button>
        );
      })}
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const pageStack = css({ display: "flex", flexDirection: "column", gap: "18px" });
const skeletonCard = css({
  bg: "surface", borderWidth: "1px", borderStyle: "solid", borderColor: "hairline",
  borderRadius: "card", p: "24px",
});
const skeletonTitle = css({ mb: "16px" });
const headRow = css({ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" });
const headTitle = css({ fontSize: { base: "24px", md: "28px" }, fontWeight: 600, lineHeight: 1.5, letterSpacing: "-0.025em" });
const headSub = css({ fontSize: "13.5px", lineHeight: 1.5, color: "ink2" });
const saveGroup = css({ display: "flex", alignItems: "center", gap: "10px", flex: "none" });
const unsavedTag = css({ display: { base: "none", sm: "inline-flex" }, alignItems: "center", gap: "7px", fontSize: "12.5px", color: "pendingText" });
const unsavedDot = css({ w: "8px", h: "8px", borderRadius: "50%", bg: "pending" });

const identityCard = css({
  bg: "surface", borderWidth: "1px", borderStyle: "solid", borderColor: "hairline",
  borderRadius: "card", p: { base: "18px", md: "22px" },
});
const identityRow = css({ display: "flex", alignItems: "center", gap: "18px" });
const avatarWrap = css({ position: "relative" });
const uploadingOverlay = css({
  position: "absolute", inset: 0, borderRadius: "50%", bg: "rgba(0,0,0,0.5)",
  display: "flex", alignItems: "center", justifyContent: "center",
});
const identityName = css({ fontSize: { base: "17px", md: "19px" }, fontWeight: 600, lineHeight: 1.5, letterSpacing: "-0.02em" });
const identitySub = css({ fontSize: "13px", lineHeight: 1.5, color: "ink2" });
const identityActions = css({ display: "flex", gap: "9px", mt: "12px" });
const detailsGrid = css({ display: "grid", gridTemplateColumns: { base: "1fr", sm: "1fr 1fr" }, gap: "16px" });
const sizeBlock = css({ mt: "16px" });
const tailSpacer = css({ h: "4px" });

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
      // Send cleared fields as null (not undefined) — undefined keys are dropped
      // from the JSON body, so the API would silently keep the old value.
      const website = formData.website.trim();
      const requestData: ClientProfileRequest = {
        company_name: formData.company_name || null,
        industry_id: formData.industry_id ? Number(formData.industry_id) : null,
        company_size: formData.company_size || null,
        location: formData.location || null,
        website: website && !/^[a-z][a-z0-9+.-]*:\/\//i.test(website) ? `https://${website}` : website || null,
        about: formData.about || null,
      };
      await api.updateClientProfile(user.client_profile.id, requestData);
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
      await refreshUser();
      toast.success("Profile picture updated!");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to upload image";
      toast.error(message);
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
      toast.success("Profile picture removed.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to remove image";
      toast.error(message);
    } finally {
      setUploadingImage(false);
    }
  };

  if (authLoading) {
    return (
      <div className={pageStack}>
        {[0, 1, 2].map(i => (
          <div key={i} className={skeletonCard}>
            <Skeleton variant="text" width={160} height={22} className={skeletonTitle} />
            <Skeleton variant="rect" height={44} style={{ borderRadius: "10px" }} />
          </div>
        ))}
      </div>
    );
  }

  if (!user) {
    return <div><Alert tone="warning">Please log in to view your profile.</Alert></div>;
  }

  const industryName = industries.find(i => i.id === formData.industry_id)?.name;

  return (
    <div className={pageStack}>
      {/* Heading + inline save */}
      <div className={headRow}>
        <div className={css({ minW: 0 })}>
          <p className={headTitle}>Company profile</p>
          <p className={headSub}>How freelancers see your business when you hire.</p>
        </div>
        {hasUnsavedChanges && (
          <div className={saveGroup}>
            <span className={unsavedTag}>
              <span className={unsavedDot} />Unsaved
            </span>
            <button type="button" onClick={handleSaveChanges} disabled={saving} className={primaryBtn}>
              {saving ? <Spinner size={18} style={{ color: "white" }} /> : "Save changes"}
            </button>
          </div>
        )}
      </div>

      {/* Identity */}
      <div className={identityCard}>
        <div className={identityRow}>
          <div className={avatarWrap}>
            <ProfileAvatar name={formData.company_name || user.name} src={user.avatar_url} size={76} />
            {uploadingImage && (
              <div className={uploadingOverlay}>
                <Spinner size={20} style={{ color: "white" }} />
              </div>
            )}
            <input type="file" ref={fileInputRef} accept="image/jpeg,image/jpg,image/png,image/gif,image/webp" style={{ display: "none" }} onChange={handleImageUpload} />
          </div>
          <div className={css({ flex: 1, minW: 0 })}>
            <p className={identityName}>{formData.company_name || "Your company"}</p>
            <p className={identitySub}>
              {industryName || formData.location ? [industryName, formData.location].filter(Boolean).join(" · ") : "Add a logo and details below"}
            </p>
            <div className={identityActions}>
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploadingImage} className={secBtn}>
                <Camera size={15} />Change
              </button>
              {user.avatar_url && (
                <button type="button" onClick={handleDeleteImage} disabled={uploadingImage} className={ghostBtn}>Remove</button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Company details */}
      <SectionCard icon={<Building2 size={19} />} title="Company details">
        <div className={detailsGrid}>
          <Field label="Company name"><TextInput value={formData.company_name} onChange={v => handleInputChange("company_name", v)} placeholder="e.g. Brown Coffee Roastery" /></Field>
          <Field label="Industry"><SelectInput value={formData.industry_id} onChange={v => handleInputChange("industry_id", v)} options={industries.map(i => ({ value: i.id, label: i.name ?? "" }))} placeholder="Select an industry" disabled={loadingIndustries} /></Field>
          <Field label="Location"><TextInput value={formData.location} onChange={v => handleInputChange("location", v)} placeholder="City, Country" startIcon={<MapPin size={16} className={css({ color: "ink3" })} />} /></Field>
          <Field label="Website" optional><TextInput value={formData.website} onChange={v => handleInputChange("website", v)} placeholder="yourcompany.com" startIcon={<Globe size={16} className={css({ color: "ink3" })} />} /></Field>
        </div>
        <div className={sizeBlock}>
          <Field label="Company size"><SizePills value={formData.company_size || ""} onChange={v => handleInputChange("company_size", v)} /></Field>
        </div>
      </SectionCard>

      {/* About */}
      <SectionCard icon={<Pencil size={19} />} title="About the company">
        <Field label="About" hint="A short intro helps freelancers understand who they'd be working with.">
          <RichTextEditor value={formData.about} onChange={html => handleInputChange("about", html)} placeholder="Describe your company, what you do, and what you hire for…" minHeight={110} />
        </Field>
      </SectionCard>

      {/* Verification */}
      <SectionCard icon={<Shield size={19} />} title="Verification" hint="Verified clients get faster responses from top freelancers.">
        <VerifyRow icon={<IdCard size={20} />} title="Identity (ID)" sub={user.is_verified_id ? "Government ID confirmed" : "Upload a government ID to get verified"} verified={!!user.is_verified_id} onVerify={() => router.push("/dashboard/kyc")} />
        <VerifyRow icon={<Phone size={20} />} title="Phone number" sub={user.is_verified_phone ? user.telephone || "Phone verified" : "Confirm your phone number"} verified={!!user.is_verified_phone} onVerify={() => router.push("/settings")} />
      </SectionCard>

      <div className={tailSpacer} />
    </div>
  );
}
