"use client";

import { useState, useEffect } from "react";
import { Box, Paper, Typography, Button, Checkbox, FormControlLabel, CircularProgress } from "@mui/material";
import { ChevronLeftOutlined } from "@mui/icons-material";
import { Service, ServiceCategory, ServiceMedia, CreateServiceRequest, TemporaryUpload, UploadToken } from "@/types/service";
import { ServiceFormData } from "../types";
import { api } from "@/lib/api";
import BasicInfoSection from "./BasicInfoSection";
import PricingSection from "./PricingSection";
import MediaGallerySection from "./MediaGallerySection";
import FAQsSection from "./FAQsSection";

// TODO: Enable when API supports these features
// import CustomOrdersSection from "./CustomOrdersSection";
// TODO: After implementing Message feature
// import RequirementsSection from "./RequirementsSection";

interface ServiceFormProps {
  service?: Service | null;
  onBack: () => void;
}

export default function ServiceForm({ service, onBack }: ServiceFormProps) {
  const isEditing = !!service;

  // Categories state
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      searchTags: service?.search_tags || ["", "", "", "", ""],
      description: service?.description || "",
      location: service?.location || "Phnom Penh, Cambodia",
      pricing: {
        basic: {
          name: "Basic",
          description: basicOption?.description || "",
          revisions: String(basicOption?.revisions || "1"),
          deliveryTime: String(basicOption?.delivery_time || "").replace(" days", "") || "3",
          price: basicOption?.price || "",
        },
        standard: {
          name: "Standard",
          description: standardOption?.description || "",
          revisions: String(standardOption?.revisions || "3"),
          deliveryTime: String(standardOption?.delivery_time || "").replace(" days", "") || "5",
          price: standardOption?.price || "",
        },
        premium: {
          name: "Premium",
          description: premiumOption?.description || "",
          revisions: String(premiumOption?.revisions || "Unlimited"),
          deliveryTime: String(premiumOption?.delivery_time || "").replace(" days", "") || "7",
          price: premiumOption?.price || "",
        },
      },
      customOrders: {
        enabled: false,
        acceptHourlyRate: false,
        hourlyRate: "",
        minimumBudget: "",
        customInstructions: "",
      },
      requirements: [],
      faqs: service?.faqs || [],
      agreeToTerms: false,
    };
  };

  const [formData, setFormData] = useState<ServiceFormData>(getInitialFormData);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const cats = await api.getServiceCategories();
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
    const pricingOptions = [];

    // Only include pricing tiers that have a price set
    if (formData.pricing.basic.price) {
      pricingOptions.push({
        title: "Basic",
        description: formData.pricing.basic.description,
        price: parseFloat(formData.pricing.basic.price),
        revisions: parseInt(formData.pricing.basic.revisions) || 0,
        delivery_time: parseInt(formData.pricing.basic.deliveryTime),
      });
    }
    if (formData.pricing.standard.price) {
      pricingOptions.push({
        title: "Standard",
        description: formData.pricing.standard.description,
        price: parseFloat(formData.pricing.standard.price),
        revisions: parseInt(formData.pricing.standard.revisions) || 0,
        delivery_time: parseInt(formData.pricing.standard.deliveryTime),
      });
    }
    if (formData.pricing.premium.price) {
      pricingOptions.push({
        title: "Premium",
        description: formData.pricing.premium.description,
        price: parseFloat(formData.pricing.premium.price),
        revisions: parseInt(formData.pricing.premium.revisions) || 0,
        delivery_time: parseInt(formData.pricing.premium.deliveryTime),
      });
    }

    // Filter out empty FAQs (both question and answer must be filled)
    const validFaqs = formData.faqs.filter(faq => faq.question.trim() && faq.answer.trim());

    return {
      category_id: formData.categoryId!,
      title: formData.title,
      description: formData.description,
      search_tags: formData.searchTags.filter(tag => tag.trim() !== ""),
      location: formData.location,
      pricing_options: pricingOptions,
      faqs: validFaqs.length > 0 ? validFaqs : undefined,
      // Include upload token for new services (links temp uploads to the service)
      ...(uploadToken && !isEditing && { upload_token: uploadToken }),
    };
  };

  const validateForm = (): string | null => {
    if (!formData.title.trim()) return "Please enter a service title";
    if (!formData.categoryId) return "Please select a category";
    if (!formData.description.trim()) return "Please enter a service description";

    const hasAtLeastOnePricingTier =
      formData.pricing.basic.price || formData.pricing.standard.price || formData.pricing.premium.price;

    if (!hasAtLeastOnePricingTier) return "Please set at least one pricing tier";

    return null;
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

      if (isEditing && service) {
        await api.put(`/api/services/${service.id}`, requestData);
      } else {
        const response = await api.post("/api/services", requestData);
        // Apply the desired cover image if the user selected one during creation
        if (desiredCoverTempId !== null && response?.data?.media?.length) {
          const desiredTempUpload = tempUploads.find(t => t.id === desiredCoverTempId);
          if (desiredTempUpload) {
            const matchingMedia = response.data.media.find(
              (m: { file_name: string; id: number }) => m.file_name === desiredTempUpload.file_name
            );
            if (matchingMedia) {
              await api.put(`/api/services/${response.data.id}`, { feature_image_id: matchingMedia.id });
            }
          }
        }
      }

      onBack();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save service");
    } finally {
      setSubmitting(false);
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

      <BasicInfoSection
        formData={formData}
        onFormDataChange={setFormData}
        categories={categories}
        categoriesLoading={categoriesLoading}
      />
      <PricingSection formData={formData} onFormDataChange={setFormData} />
      <MediaGallerySection
        serviceId={service?.id || null}
        media={media}
        onMediaChange={updatedMedia => {
          setMedia(updatedMedia);
          // If the cover image was removed, clear local featureImageId
          if (featureImageId && !updatedMedia.some(m => m.id === featureImageId)) {
            setFeatureImageId(null);
          }
        }}
        uploadToken={uploadToken}
        tempUploads={tempUploads}
        onTempUploadsChange={setTempUploads}
        featureImageId={featureImageId}
        onFeatureImageChange={setFeatureImageId}
        desiredCoverTempId={desiredCoverTempId}
        onDesiredCoverTempIdChange={setDesiredCoverTempId}
        disabled={submitting}
      />
      <FAQsSection formData={formData} onFormDataChange={setFormData} />

      {/* TODO: Enable when API supports these features */}
      {/* <CustomOrdersSection formData={formData} onFormDataChange={setFormData} /> */}
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
                sx={{ color: "#0071e3", cursor: "pointer", "&:hover": { textDecoration: "underline" } }}>
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
            disabled={!formData.agreeToTerms || submitting}
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
            {submitting ? <CircularProgress size={18} sx={{ color: "white" }} /> : isEditing ? "Save Changes" : "Publish Service"}
          </Button>

          {/* TODO: Enable when API supports draft functionality */}
          {/* <Button
            onClick={handleSaveDraft}
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
            Save as Draft
          </Button> */}

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
    </Box>
  );
}
