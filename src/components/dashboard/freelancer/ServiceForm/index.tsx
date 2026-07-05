"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, Paper, Typography, Button, Checkbox, FormControlLabel, CircularProgress, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from "@mui/material";
import { ChevronLeftOutlined, RestoreOutlined, VerifiedUserOutlined } from "@mui/icons-material";
import { Service, ServiceCategory, ServiceMedia, CreateServiceRequest, TemporaryUpload, UploadToken } from "@/types/service";
import { ServiceFormData } from "../types";
import { api } from "@/lib/api";
import { useAuth } from "@/components/context/AuthContext";
import { useFormRecovery } from "@/hooks/useFormRecovery";
import BasicInfoSection from "./BasicInfoSection";
import PricingSection from "./PricingSection";
import MediaGallerySection from "./MediaGallerySection";
import FAQsSection from "./FAQsSection";
import CustomOrdersSection from "./CustomOrdersSection";

// TODO: After implementing Message feature
// import RequirementsSection from "./RequirementsSection";

interface ServiceFormProps {
  service?: Service | null;
  onBack: () => void;
}

export default function ServiceForm({ service, onBack }: ServiceFormProps) {
  const isEditing = !!service;
  const router = useRouter();
  const { user } = useAuth();

  // Categories state
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  // Set when a publish attempt was silently saved as a draft because the account isn't
  // eligible to publish yet (identity/KYC — or, with the flag on, unverified contacts).
  const [kycNotice, setKycNotice] = useState<string | null>(null);

  // Media state for editing existing services
  const [media, setMedia] = useState<ServiceMedia[]>(service?.media || []);
  const [featureImageId, setFeatureImageId] = useState<number | null>(service?.feature_image_id ?? null);

  // Temporary upload state for new services (upload-before-create flow)
  const [uploadToken, setUploadToken] = useState<string | null>(null);
  const [tempUploads, setTempUploads] = useState<TemporaryUpload[]>([]);
  // Which temp upload the user wants as cover (applied via PATCH after creation)
  const [desiredCoverTempId, setDesiredCoverTempId] = useState<number | null>(null);

  // Initialize form data from service if editing
  const getInitialFormData = (): ServiceFormData => {
    const pricingOptions = service?.pricing_options || [];
    const basicOption = pricingOptions.find(p => p.title === "Basic");
    const standardOption = pricingOptions.find(p => p.title === "Standard");
    const premiumOption = pricingOptions.find(p => p.title === "Premium");

    return {
      title: service?.title || "",
      categoryId: service?.category_id || null,
      requestedCategory: service?.requested_category ?? null,
      requestedParentId: service?.requested_parent_id ?? null,
      searchTags: service?.search_tags?.filter((t: string) => t.trim()) || [],
      description: service?.description || "",
      location: service?.location || "Phnom Penh, Cambodia",
      pricing: {
        basic: {
          id: basicOption?.id,
          enabled: !!basicOption,
          name: "Basic",
          description: basicOption?.description || "",
          revisions: String(basicOption?.revisions || "1"),
          deliveryTime: String(basicOption?.delivery_time || "").replace(" days", "") || "3",
          price: basicOption?.price || "",
        },
        standard: {
          id: standardOption?.id,
          enabled: isEditing ? !!standardOption : true,
          name: "Standard",
          description: standardOption?.description || "",
          revisions: String(standardOption?.revisions || "3"),
          deliveryTime: String(standardOption?.delivery_time || "").replace(" days", "") || "5",
          price: standardOption?.price || "",
        },
        premium: {
          id: premiumOption?.id,
          enabled: !!premiumOption,
          name: "Premium",
          description: premiumOption?.description || "",
          revisions: String(premiumOption?.revisions || "Unlimited"),
          deliveryTime: String(premiumOption?.delivery_time || "").replace(" days", "") || "7",
          price: premiumOption?.price || "",
        },
      },
      customOrders: {
        enabled: service?.custom_orders_enabled ?? false,
        acceptHourlyRate: service?.custom_hourly_rate != null,
        hourlyRate: service?.custom_hourly_rate != null ? String(service.custom_hourly_rate) : "",
        minimumBudget: service?.custom_min_budget != null ? String(service.custom_min_budget) : "",
        customInstructions: service?.custom_instructions ?? "",
      },
      requirements: [],
      faqs: service?.faqs || [],
      agreeToTerms: false,
    };
  };

  const [formData, setFormData] = useState<ServiceFormData>(getInitialFormData);

  // Local-storage recovery safety net (survives accidental tab close / crash).
  const recoveryKey = isEditing ? `kickair:svc-recovery:edit:${service!.id}` : "kickair:svc-recovery:new";
  const { recovered, clear: clearRecovery, discard: discardRecovery, dismiss: dismissRecovery } =
    useFormRecovery<ServiceFormData>(recoveryKey, formData);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const cats = await api.getCategoryTree();
        setCategories(cats);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Generate upload token for new services (upload-before-create flow)
  useEffect(() => {
    if (isEditing) return; // Don't need token for editing existing services

    const generateUploadToken = async () => {
      try {
        const response = await api.post("/api/upload-tokens", {});
        setUploadToken(response.data.upload_token);
      } catch (err) {
        console.error("Failed to generate upload token:", err);
      }
    };
    generateUploadToken();
  }, [isEditing]);

  // Transform form data to API request format
  const transformFormData = (): CreateServiceRequest => {
    const pricingOptions: import("@/types/service").CreatePricingOptionRequest[] = [];

    // Only include enabled pricing tiers
    (["basic", "standard", "premium"] as const).forEach(tier => {
      const t = formData.pricing[tier];
      if (!t.enabled) return;
      pricingOptions.push({
        ...(t.id ? { id: t.id } : {}),
        title: t.name,
        description: t.description || undefined,
        price: parseFloat(t.price) || 0,
        revisions: t.revisions || undefined,
        delivery_time: t.deliveryTime ? `${t.deliveryTime} days` : undefined,
      });
    });

    // Filter out empty FAQs (both question and answer must be filled)
    const validFaqs = formData.faqs.filter(faq => faq.question.trim() && faq.answer.trim());

    return {
      // Either an existing category, or a brand-new one to be reviewed by an admin.
      ...(formData.categoryId
        ? { category_id: formData.categoryId }
        : { requested_category: formData.requestedCategory, requested_parent_id: formData.requestedParentId ?? undefined }),
      title: formData.title,
      description: formData.description,
      search_tags: formData.searchTags.filter(tag => tag.trim() !== ""),
      location: formData.location,
      pricing_options: pricingOptions,
      faqs: validFaqs.length > 0 ? validFaqs : undefined,
      // Custom-order settings (the gig escape hatch)
      custom_orders_enabled: formData.customOrders.enabled,
      custom_min_budget: formData.customOrders.minimumBudget ? parseFloat(formData.customOrders.minimumBudget) : null,
      custom_hourly_rate:
        formData.customOrders.enabled && formData.customOrders.acceptHourlyRate && formData.customOrders.hourlyRate
          ? parseFloat(formData.customOrders.hourlyRate)
          : null,
      custom_instructions: formData.customOrders.customInstructions || null,
      // Include upload token for new services (links temp uploads to the service)
      ...(uploadToken && !isEditing && { upload_token: uploadToken }),
    };
  };

  // Count images across already-saved media and not-yet-saved temp uploads.
  const imageCount =
    media.filter(m => m.file_type === "image").length +
    tempUploads.filter(t => t.file_type === "image").length;

  const validateForm = (): string | null => {
    const errs: Record<string, string> = {};

    if (!formData.title.trim()) errs.title = "Service title is required";
    if (!formData.categoryId && !formData.requestedCategory?.trim()) errs.category = "Please select or suggest a category";
    if (imageCount === 0) errs.image = "Add at least one image";

    const enabledTiers = (["basic", "standard", "premium"] as const).filter(t => formData.pricing[t].enabled);
    if (enabledTiers.length === 0) errs.noTier = "Please enable at least one pricing tier";

    for (const t of enabledTiers) {
      const tier = formData.pricing[t];
      if (!tier.price)        errs[`${t}_price`]    = "Price is required";
      if (!tier.revisions)    errs[`${t}_revisions`] = "Revisions is required";
      if (!tier.deliveryTime) errs[`${t}_delivery`]  = "Delivery time is required";
    }

    setFieldErrors(errs);
    if (Object.keys(errs).length === 0) return null;
    // One friendly summary; each field shows its own red indicator below.
    return "Please complete the required fields highlighted below before publishing.";
  };

  const handlePublish = async () => {
    if (!formData.agreeToTerms) {
      setError("Please agree to the Terms of Service");
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const requestData = transformFormData();

      let response;
      if (isEditing && service) {
        response = await api.put(`/api/services/${service.id}`, requestData);
      } else {
        response = await api.post("/api/services", requestData);
        // Apply the desired cover image if the user selected one during creation
        if (desiredCoverTempId !== null && response?.data?.media?.length) {
          const desiredTempUpload = tempUploads.find(t => t.id === desiredCoverTempId);
          if (desiredTempUpload) {
            const matchingMedia = response.data.media.find(
              (m: { file_name: string; id: number }) => m.file_name === desiredTempUpload.file_name,
            );
            if (matchingMedia) {
              await api.put(`/api/services/${response.data.id}`, { feature_image_id: matchingMedia.id });
            }
          }
        }
      }

      clearRecovery();

      // The backend silently downgrades a publish to a draft when the account can't publish yet
      // (identity/KYC — or, with the flag on, unverified contacts). Don't navigate away as if it
      // went live: surface why, with a path to verify. The draft is already saved.
      if (response?.data?.status === "draft") {
        setKycNotice(response?.message || "Your service was saved as a draft. Verify your identity (KYC) to publish it.");
        return;
      }

      onBack();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save service");
    } finally {
      setSubmitting(false);
    }
  };

  // Save as Draft — no validation, never enters the review queue, stays private.
  const handleSaveDraft = async () => {
    try {
      setSavingDraft(true);
      setError(null);

      const requestData = { ...transformFormData(), save_as_draft: true };

      if (isEditing && service) {
        await api.put(`/api/services/${service.id}`, requestData);
      } else {
        await api.post("/api/services", requestData);
      }

      clearRecovery();
      onBack();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save draft");
    } finally {
      setSavingDraft(false);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Header */}
      <Box>
        <Button
          onClick={onBack}
          startIcon={<ChevronLeftOutlined sx={{ fontSize: 16 }} />}
          sx={{
            mb: 2,
            fontSize: 12,
            color: "rgba(0, 0, 0, 0.6)",
            textTransform: "none",
            p: 0,
            minWidth: "auto",
            "&:hover": {
              color: "black",
              bgcolor: "transparent",
            },
          }}>
          Back to Services
        </Button>
        <Typography sx={{ fontSize: 28, fontWeight: 600, color: "black", mb: 0.5 }}>
          {isEditing ? "Edit Service" : "Create New Service"}
        </Typography>
        <Typography sx={{ fontSize: 13, color: "rgba(0, 0, 0, 0.6)" }}>
          Fill in the details about your service offering
        </Typography>
      </Box>

      {/* Unsaved-changes recovery banner (local-storage safety net) */}
      {recovered && (
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            border: "1px solid rgba(245, 158, 11, 0.35)",
            bgcolor: "rgba(245, 158, 11, 0.06)",
            p: 2,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            flexWrap: "wrap",
          }}>
          <RestoreOutlined sx={{ fontSize: 20, color: "#b45309" }} />
          <Typography sx={{ fontSize: 13, color: "#92400e", flex: 1, minWidth: 200 }}>
            You have unsaved changes from a previous session.
          </Typography>
          <Button
            onClick={() => { setFormData(recovered.data); dismissRecovery(); }}
            sx={{ px: 2, height: 32, fontSize: 12, color: "white", bgcolor: "#b45309", borderRadius: 2, textTransform: "none", "&:hover": { bgcolor: "#92400e" } }}>
            Restore
          </Button>
          <Button
            onClick={discardRecovery}
            sx={{ px: 2, height: 32, fontSize: 12, color: "#92400e", bgcolor: "transparent", borderRadius: 2, textTransform: "none", "&:hover": { bgcolor: "rgba(245,158,11,0.12)" } }}>
            Discard
          </Button>
        </Paper>
      )}

      {/* Publish-eligibility heads-up: unverified freelancers can only save drafts. */}
      {user && !user.is_verified_id && (
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            border: "1px solid rgba(245, 158, 11, 0.35)",
            bgcolor: "rgba(245, 158, 11, 0.06)",
            p: 2,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            flexWrap: "wrap",
          }}>
          <VerifiedUserOutlined sx={{ fontSize: 20, color: "#b45309" }} />
          <Typography sx={{ fontSize: 13, color: "#92400e", flex: 1, minWidth: 200 }}>
            <strong>Verify your identity to publish.</strong> You can build and save this service as a draft now — once your
            identity (KYC) is verified, you can publish it for review.
          </Typography>
          <Button
            onClick={() => router.push("/dashboard/kyc")}
            sx={{ px: 2, height: 32, fontSize: 12, color: "white", bgcolor: "#b45309", borderRadius: 2, textTransform: "none", "&:hover": { bgcolor: "#92400e" } }}>
            Verify identity
          </Button>
        </Paper>
      )}

      <BasicInfoSection
        formData={formData}
        onFormDataChange={(data) => { setFormData(data); setFieldErrors(prev => ({ ...prev, title: "", category: "" })); }}
        categories={categories}
        categoriesLoading={categoriesLoading}
        fieldErrors={{ title: fieldErrors.title, category: fieldErrors.category }}
      />
      <PricingSection
        formData={formData}
        onFormDataChange={setFormData}
        fieldErrors={fieldErrors}
        onClearTierError={(key) => setFieldErrors(prev => { const n = { ...prev }; delete n[key]; return n; })}
      />
      <Box sx={fieldErrors.image ? { border: "1px solid #ef4444", borderRadius: 4 } : undefined}>
        <MediaGallerySection
          serviceId={service?.id || null}
          media={media}
          onMediaChange={updatedMedia => {
            setMedia(updatedMedia);
            // If the cover image was removed, clear local featureImageId
            if (featureImageId && !updatedMedia.some(m => m.id === featureImageId)) {
              setFeatureImageId(null);
            }
            setFieldErrors(prev => { const n = { ...prev }; delete n.image; return n; });
          }}
          uploadToken={uploadToken}
          tempUploads={tempUploads}
          onTempUploadsChange={(t) => { setTempUploads(t); setFieldErrors(prev => { const n = { ...prev }; delete n.image; return n; }); }}
          featureImageId={featureImageId}
          onFeatureImageChange={setFeatureImageId}
          desiredCoverTempId={desiredCoverTempId}
          onDesiredCoverTempIdChange={setDesiredCoverTempId}
          disabled={submitting}
        />
      </Box>
      {fieldErrors.image && (
        <Typography sx={{ fontSize: 12, color: "#ef4444", mt: -1 }}>{fieldErrors.image}</Typography>
      )}
      <FAQsSection formData={formData} onFormDataChange={setFormData} />

      <CustomOrdersSection formData={formData} onFormDataChange={setFormData} />

      {/* TODO: After implementing Message feature */}
      {/* <RequirementsSection formData={formData} onFormDataChange={setFormData} /> */}

      {/* Terms & Actions */}
      <Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(0, 0, 0, 0.08)", p: 4 }}>
        <FormControlLabel
          style={{ display: "flex", alignItems: "center" }}
          control={
            <Checkbox
              checked={formData.agreeToTerms}
              onChange={e => setFormData({ ...formData, agreeToTerms: e.target.checked })}
              sx={{
                color: "rgba(0, 0, 0, 0.2)",
                "&.Mui-checked": {
                  color: "black",
                },
              }}
            />
          }
          label={
            <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)" }}>
              I agree to the{" "}
              <Typography
                component='span'
                sx={{ fontSize: 11, color: "#0071e3", cursor: "pointer", "&:hover": { textDecoration: "underline" } }}>
                Terms of Service
              </Typography>{" "}
              and confirm that all information provided is accurate
            </Typography>
          }
          sx={{ alignItems: "flex-start" }}
        />

        {error && <Typography sx={{ fontSize: 12, color: "#ef4444", mb: 2 }}>{error}</Typography>}

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Button
            onClick={handlePublish}
            disabled={!formData.agreeToTerms || submitting || savingDraft}
            sx={{
              px: 3,
              height: 44,
              fontSize: 13,
              borderRadius: 10,
              textTransform: "none",
              bgcolor: formData.agreeToTerms && !submitting ? "black" : "rgba(0, 0, 0, 0.2)",
              color: "white",
              cursor: formData.agreeToTerms && !submitting ? "pointer" : "not-allowed",
              "&:hover": {
                bgcolor: formData.agreeToTerms && !submitting ? "rgba(0, 0, 0, 0.8)" : "rgba(0, 0, 0, 0.2)",
              },
              "&.Mui-disabled": {
                color: "white",
              },
            }}>
            {submitting ? <CircularProgress size={18} sx={{ color: "white" }} /> : service?.status === "rejected" ? "Resubmit" : (service?.status === "draft" || !isEditing) ? "Publish Service" : "Save Changes"}
          </Button>

          <Button
            onClick={handleSaveDraft}
            disabled={submitting || savingDraft}
            sx={{
              px: 3,
              height: 44,
              fontSize: 13,
              color: "black",
              bgcolor: "rgba(0, 0, 0, 0.05)",
              borderRadius: 10,
              textTransform: "none",
              "&:hover": {
                bgcolor: "rgba(0, 0, 0, 0.1)",
              },
            }}>
            {savingDraft ? <CircularProgress size={18} sx={{ color: "rgba(0,0,0,0.5)" }} /> : "Save as Draft"}
          </Button>

          <Button
            onClick={onBack}
            disabled={submitting}
            sx={{
              px: 3,
              height: 44,
              fontSize: 13,
              color: "rgba(0, 0, 0, 0.6)",
              textTransform: "none",
              "&:hover": {
                color: "black",
                bgcolor: "transparent",
              },
            }}>
            Cancel
          </Button>
        </Box>
      </Paper>

      {/* Publish was blocked → the service was saved as a draft. Explain why and offer to verify. */}
      <Dialog
        open={!!kycNotice}
        onClose={() => { setKycNotice(null); onBack(); }}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4, p: 1 } }}>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5, fontSize: 18, fontWeight: 600 }}>
          <VerifiedUserOutlined sx={{ color: "#f59e0b" }} /> Saved as a draft
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: 14, color: "rgba(0,0,0,0.75)" }}>
            {kycNotice}
          </DialogContentText>
          <DialogContentText sx={{ fontSize: 13, color: "rgba(0,0,0,0.55)", mt: 1.5 }}>
            Your work is safe under <strong>Drafts</strong> — publish it for review once you&apos;re verified.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            onClick={() => { setKycNotice(null); onBack(); }}
            sx={{ textTransform: "none", color: "rgba(0,0,0,0.6)" }}>
            Back to My Services
          </Button>
          <Button
            onClick={() => router.push("/dashboard/kyc")}
            variant="contained"
            sx={{ textTransform: "none", bgcolor: "black", borderRadius: 8, px: 2.5, "&:hover": { bgcolor: "rgba(0,0,0,0.8)" } }}>
            Verify Identity
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
