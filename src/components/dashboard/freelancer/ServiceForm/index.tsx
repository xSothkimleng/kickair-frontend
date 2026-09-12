"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, History, ShieldCheck } from "lucide-react";
import { css, cva, cx } from "styled-system/css";
import { Spinner } from "@/components/ds";
import { BareModal } from "@/components/ds/BareModal";
import { Checkbox } from "@/components/ui/inputs";
import { Service, ServiceCategory, ServiceMedia, CreateServiceRequest, TemporaryUpload } from "@/types/service";
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

const page = css({ display: "flex", flexDirection: "column", gap: "16px" });
/* MUI text `Button` metrics: 500 weight, 1.75 line-height, no padding here. */
const backBtn = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  m: 0,
  mb: "16px",
  p: 0,
  border: "none",
  bg: "transparent",
  color: "ink2",
  fontFamily: "inherit",
  fontSize: "12px",
  fontWeight: 500,
  lineHeight: 1.75,
  cursor: "pointer",
  transition: "color .25s",
  _hover: { color: "ink" },
  _focusVisible: { outline: "none", boxShadow: "focusRing" },
  "& svg": { flexShrink: 0 },
});
const pageTitle = css({ lineHeight: 1.5, fontSize: "28px", fontWeight: 600, color: "ink" });
const pageSub = css({ lineHeight: 1.5, fontSize: "13px", color: "ink2" });

const banner = css({
  borderRadius: "cardSm",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "rgba(245, 158, 11, 0.35)",
  bg: "rgba(245, 158, 11, 0.06)",
  p: "16px",
  display: "flex",
  alignItems: "center",
  gap: "12px",
  flexWrap: "wrap",
});
const bannerIcon = css({ color: "pendingText", flexShrink: 0 });
const bannerText = css({ lineHeight: 1.5, fontSize: "13px", color: "#92400e", flex: 1, minW: "200px" });
const smallBtnBase = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  boxSizing: "border-box",
  m: 0,
  px: "16px",
  h: "32px",
  minW: "64px",
  border: "none",
  borderRadius: "8px",
  fontFamily: "inherit",
  fontSize: "12px",
  fontWeight: 500,
  lineHeight: 1.75,
  cursor: "pointer",
  transition: "background-color .25s, color .25s",
  _focusVisible: { outline: "none", boxShadow: "focusRing" },
});
const amberBtn = css({ bg: "pendingText", color: "white", _hover: { bg: "#92400e" } });
const amberGhostBtn = css({ bg: "transparent", color: "#92400e", _hover: { bg: "rgba(245,158,11,0.12)" } });

const mediaError = css({ borderWidth: "1px", borderStyle: "solid", borderColor: "#ef4444", borderRadius: "card" });
const errorText = css({ lineHeight: 1.5, fontSize: "12px", color: "#ef4444" });

const termsCard = css({
  bg: "surface",
  borderRadius: "card",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "hairline",
  p: "32px",
});
const termsRow = css({ display: "flex", alignItems: "center" });
const termsText = css({ lineHeight: 1.5, fontSize: "11px", color: "ink2" });
const termsLink = css({ lineHeight: 1.5, fontSize: "11px", color: "accent", cursor: "pointer", _hover: { textDecoration: "underline" } });
const actions = css({ display: "flex", alignItems: "center", gap: "12px" });
/* Base metrics only — `bg`/`cursor` live on the per-button classes so no two
   atomic classes ever fight (Panda's `cx` concatenates, it can't resolve conflicts). */
const bigBtnBase = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  boxSizing: "border-box",
  m: 0,
  px: "24px",
  h: "44px",
  minW: "64px",
  border: "none",
  fontFamily: "inherit",
  fontSize: "13px",
  fontWeight: 500,
  lineHeight: 1.75,
  transition: "background-color .25s, color .25s",
  _focusVisible: { outline: "none", boxShadow: "focusRing" },
  _disabled: { pointerEvents: "none" },
});
const publishBtn = cva({
  base: { borderRadius: "40px", color: "white" },
  variants: {
    ready: {
      true: { bg: "ink", cursor: "pointer", _hover: { bg: "rgba(0, 0, 0, 0.8)" } },
      false: { bg: "rgba(0, 0, 0, 0.2)", cursor: "not-allowed", _hover: { bg: "rgba(0, 0, 0, 0.2)" } },
    },
  },
});
const draftBtn = css({ borderRadius: "40px", color: "ink", bg: "rgba(0, 0, 0, 0.05)", cursor: "pointer", _hover: { bg: "rgba(0, 0, 0, 0.1)" } });
const cancelBtn = css({ color: "ink2", bg: "transparent", cursor: "pointer", _hover: { color: "ink", bg: "transparent" } });

/* Saved-as-draft dialog (MUI `Dialog maxWidth="xs" fullWidth` + `PaperProps p:1`). */
const dialogPanel = css({ p: "8px" });
const dialogBody = css({ p: "20px 24px", overflowY: "auto", flex: 1 });
const dialogTitleRow = css({ display: "flex", alignItems: "center", gap: "12px", fontSize: "18px", fontWeight: 600, pt: "8px", mb: "8px", color: "ink" });
const dialogText = css({ lineHeight: 1.5, fontSize: "14px", color: "rgba(0,0,0,0.75)" });
const dialogText2 = css({ lineHeight: 1.5, fontSize: "13px", color: "rgba(0,0,0,0.55)" });
const dialogActions = css({ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px", p: "8px 24px 16px", flex: "0 0 auto" });
const dialogTextBtn = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  boxSizing: "border-box",
  m: 0,
  p: "6px 8px",
  minW: "64px",
  border: "none",
  borderRadius: "4px",
  bg: "transparent",
  color: "ink2",
  fontFamily: "inherit",
  fontSize: "14px",
  fontWeight: 500,
  lineHeight: 1.75,
  cursor: "pointer",
  transition: "background-color .25s",
  _hover: { bg: "rgba(0, 0, 0, 0.04)" },
  _focusVisible: { outline: "none", boxShadow: "focusRing" },
});
const dialogSolidBtn = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  boxSizing: "border-box",
  m: 0,
  p: "6px 20px",
  minW: "64px",
  border: "none",
  borderRadius: "32px",
  bg: "ink",
  color: "white",
  fontFamily: "inherit",
  fontSize: "14px",
  fontWeight: 500,
  lineHeight: 1.75,
  cursor: "pointer",
  boxShadow: "0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12)",
  transition: "background-color .25s, box-shadow .25s",
  _hover: { bg: "rgba(0, 0, 0, 0.8)" },
  _focusVisible: { outline: "none", boxShadow: "focusRing" },
});

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

    // Cross-tier price ordering: Basic ≤ Standard ≤ Premium (compared among enabled tiers).
    const TIER_LABEL = { basic: "Basic", standard: "Standard", premium: "Premium" } as const;
    const pricedTiers = enabledTiers.filter(t => formData.pricing[t].price);
    for (let i = 1; i < pricedTiers.length; i++) {
      const lower = pricedTiers[i - 1];
      const higher = pricedTiers[i];
      if (parseFloat(formData.pricing[lower].price) > parseFloat(formData.pricing[higher].price)) {
        errs[`${higher}_price`] = `${TIER_LABEL[lower]} can't cost more than ${TIER_LABEL[higher]}`;
      }
    }

    setFieldErrors(errs);
    if (Object.keys(errs).length === 0) return null;
    scrollToFirstError(errs);
    // One friendly summary; each field shows its own red indicator below.
    return "Please complete the required fields highlighted below before publishing.";
  };

  // Bring the first invalid field into view (in page order) so the user
  // doesn't have to hunt for the red indicator on a long form.
  const ERROR_ANCHORS: Array<[key: string, anchorId: string]> = [
    ["title", "svc-section-basic"],
    ["category", "svc-section-basic"],
    ["noTier", "svc-section-pricing"],
    ...(["basic", "standard", "premium"] as const).flatMap(t =>
      ["price", "revisions", "delivery"].map(f => [`${t}_${f}`, `svc-tier-${t}`] as [string, string]),
    ),
    ["image", "svc-section-media"],
  ];

  const scrollToFirstError = (errs: Record<string, string>) => {
    for (const [key, anchorId] of ERROR_ANCHORS) {
      if (errs[key]) {
        document.getElementById(anchorId)?.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
    }
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
    <div className={page}>
      {/* Header */}
      <div>
        <button type="button" onClick={onBack} className={backBtn}>
          <ChevronLeft size={16} />
          Back to Services
        </button>
        <p className={pageTitle}>
          {isEditing ? "Edit Service" : "Create New Service"}
        </p>
        <p className={pageSub}>
          Fill in the details about your service offering
        </p>
      </div>

      {/* Unsaved-changes recovery banner (local-storage safety net) */}
      {recovered && (
        <div className={banner}>
          <History size={20} className={bannerIcon} />
          <p className={bannerText}>
            You have unsaved changes from a previous session.
          </p>
          <button
            type="button"
            onClick={() => { setFormData(recovered.data); dismissRecovery(); }}
            className={cx(smallBtnBase, amberBtn)}>
            Restore
          </button>
          <button type="button" onClick={discardRecovery} className={cx(smallBtnBase, amberGhostBtn)}>
            Discard
          </button>
        </div>
      )}

      {/* Publish-eligibility heads-up: unverified freelancers can only save drafts. */}
      {user && !user.is_verified_id && (
        <div className={banner}>
          <ShieldCheck size={20} className={bannerIcon} />
          <p className={bannerText}>
            <strong>Verify your identity to publish.</strong> You can build and save this service as a draft now — once your
            identity (KYC) is verified, you can publish it for review.
          </p>
          <button
            type="button"
            onClick={() => router.push("/dashboard/kyc")}
            className={cx(smallBtnBase, amberBtn)}>
            Verify identity
          </button>
        </div>
      )}

      <div id='svc-section-basic'>
      <BasicInfoSection
        formData={formData}
        onFormDataChange={(data) => { setFormData(data); setFieldErrors(prev => ({ ...prev, title: "", category: "" })); }}
        categories={categories}
        categoriesLoading={categoriesLoading}
        fieldErrors={{ title: fieldErrors.title, category: fieldErrors.category }}
      />
      </div>
      <PricingSection
        formData={formData}
        onFormDataChange={setFormData}
        fieldErrors={fieldErrors}
        onClearTierError={(key) => setFieldErrors(prev => { const n = { ...prev }; delete n[key]; return n; })}
      />
      <div id='svc-section-media' className={fieldErrors.image ? mediaError : undefined}>
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
      </div>
      {fieldErrors.image && (
        <p className={errorText}>{fieldErrors.image}</p>
      )}
      <FAQsSection formData={formData} onFormDataChange={setFormData} />

      <CustomOrdersSection formData={formData} onFormDataChange={setFormData} />

      {/* TODO: After implementing Message feature */}
      {/* <RequirementsSection formData={formData} onFormDataChange={setFormData} /> */}

      {/* Terms & Actions */}
      <div className={termsCard}>
        <div className={termsRow}>
          <Checkbox
            checked={formData.agreeToTerms}
            onChange={c => setFormData({ ...formData, agreeToTerms: c })}
            label={
              <span className={termsText}>
                I agree to the{" "}
                <span className={termsLink}>
                  Terms of Service
                </span>{" "}
                and confirm that all information provided is accurate
              </span>
            }
          />
        </div>

        {error && <p className={errorText}>{error}</p>}

        <div className={actions}>
          <button
            type="button"
            onClick={handlePublish}
            disabled={!formData.agreeToTerms || submitting || savingDraft}
            className={cx(bigBtnBase, publishBtn({ ready: formData.agreeToTerms && !submitting }))}>
            {submitting ? <Spinner size={18} /> : service?.status === "rejected" ? "Resubmit" : (service?.status === "draft" || !isEditing) ? "Publish Service" : "Save Changes"}
          </button>

          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={submitting || savingDraft}
            className={cx(bigBtnBase, draftBtn)}>
            {savingDraft ? <Spinner size={18} className={css({ color: "rgba(0,0,0,0.5)" })} /> : "Save as Draft"}
          </button>

          <button
            type="button"
            onClick={onBack}
            disabled={submitting}
            className={cx(bigBtnBase, cancelBtn)}>
            Cancel
          </button>
        </div>
      </div>

      {/* Publish was blocked → the service was saved as a draft. Explain why and offer to verify. */}
      <BareModal
        open={!!kycNotice}
        onOpenChange={(open) => { if (!open) { setKycNotice(null); onBack(); } }}
        maxW="444px"
        className={dialogPanel}>
        <div className={dialogBody}>
          <div className={dialogTitleRow}>
            <ShieldCheck size={24} className={css({ color: "warning", flexShrink: 0 })} /> Saved as a draft
          </div>
          <p className={dialogText}>
            {kycNotice}
          </p>
          <p className={dialogText2}>
            Your work is safe under <strong>Drafts</strong> — publish it for review once you&apos;re verified.
          </p>
        </div>
        <div className={dialogActions}>
          <button
            type="button"
            onClick={() => { setKycNotice(null); onBack(); }}
            className={dialogTextBtn}>
            Back to My Services
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard/kyc")}
            className={dialogSolidBtn}>
            Verify Identity
          </button>
        </div>
      </BareModal>
    </div>
  );
}
