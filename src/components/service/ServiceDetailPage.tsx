"use client";

import { useState, useEffect } from "react";
import RichTextDisplay from "@/components/ui/RichTextDisplay";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  Card,
  CardContent,
  IconButton,
  Collapse,
  Avatar,
  Divider,
  CircularProgress,
  Alert,
  Chip,
} from "@mui/material";
import {
  ChevronLeft,
  AccessTime,
  Check,
  ChatBubbleOutline,
  FavoriteBorder,
  Favorite,
  Share,
  Shield,
  Refresh,
  ExpandMore,
  ExpandLess,
  LocationOn,
  ShoppingBag,
  StarRounded,
} from "@mui/icons-material";
import { api } from "@/lib/api";
import { Service, ServiceDetailResponse } from "@/types/service";
import { useAuth } from "@/components/context/AuthContext";
import RequestCustomOrderDialog from "@/components/customOrders/RequestCustomOrderDialog";
import { usePurchaseGate, type PurchaseSummary } from "@/components/purchase/PurchaseGate";
import { deliveryText, revisionsText } from "@/lib/serviceFormat";
import { RequestQuoteOutlined } from "@mui/icons-material";

interface ServiceDetailPageProps {
  serviceId: number;
}

export function ServiceDetailPage({ serviceId }: ServiceDetailPageProps) {
  const router = useRouter();
  const { user: currentUser } = useAuth();

  // API state
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedPackage, setSelectedPackage] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showCustomOrderDialog, setShowCustomOrderDialog] = useState(false);
  const [imageError, setImageError] = useState<{ [key: string]: boolean }>({});

  // Purchase gate — carries the selected package as order context and, after auth,
  // returns the buyer straight to checkout for this tier.
  const gatePricing = service?.pricing_options?.[selectedPackage] ?? null;
  const gateSummary: PurchaseSummary | null =
    service && gatePricing
      ? {
          imageUrl: service.feature_image?.file_url ?? null,
          title: service.title,
          tierLabel: gatePricing.title,
          sellerName: service.freelancer_profile?.user?.name ?? null,
          metaLine: `${deliveryText(gatePricing.delivery_time)} · ${revisionsText(gatePricing.revisions)}`,
          amount: Number(gatePricing.price_raw),
        }
      : null;
  const { ensureCanPurchase, gateDialog } = usePurchaseGate({
    summary: gateSummary,
    redirectTo: service && gatePricing ? `/explore-services/${serviceId}/checkout?pricing_option_id=${gatePricing.id}` : null,
  });

  // Fetch service data
  useEffect(() => {
    const fetchService = async () => {
      if (!serviceId) return;

      setLoading(true);
      setError(null);

      try {
        const response: ServiceDetailResponse = await api.get(`/api/services/${serviceId}`);
        setService(response.data);
        // Set default selected package to first one, or the one marked as popular
        if (response.data.pricing_options && response.data.pricing_options.length > 0) {
          const popularIndex = response.data.pricing_options.findIndex(p => p.title === "Standard");
          setSelectedPackage(popularIndex >= 0 ? popularIndex : 0);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load service");
        setService(null);
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [serviceId]);

  const handleImageError = (imageKey: string) => {
    setImageError(prev => ({ ...prev, [imageKey]: true }));
  };

  // Loading state
  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "#F5F5F7", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <CircularProgress sx={{ color: "#0071e3" }} />
      </Box>
    );
  }

  // Error state
  if (error || !service) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "#F5F5F7" }}>
        <Box sx={{ bgcolor: "white", borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
          <Button
            onClick={() => router.back()}
            startIcon={<ChevronLeft />}
            sx={{
              fontSize: "12px",
              color: "rgba(0,0,0,0.6)",
              "&:hover": { color: "black", bgcolor: "transparent" },
              textTransform: "none",
            }}>
            Back to Services
          </Button>
        </Box>
        <Container maxWidth='xl' sx={{ px: 3, py: 4 }}>
          <Alert severity='error' sx={{ mb: 3 }}>
            {error || "Service not found"}
          </Alert>
          <Button variant='contained' onClick={() => router.push("/explore-services")}>
            Browse Services
          </Button>
        </Container>
      </Box>
    );
  }

  // Extract data from service
  const freelancer = service.freelancer_profile;
  const user = freelancer?.user;
  const freelancerName = user?.name || "Unknown";
  const freelancerAvatar = user?.avatar_url || "";
  const isOwnService = !!(currentUser?.is_freelancer && currentUser.freelancer_profile?.id === service.freelancer_profile_id);
  const pricingOptions = service.pricing_options || [];
  const media = service.media || [];
  const faqs = service.faqs || [];
  const imageMedia = media.filter(m => m.file_type === "image");
  const sortedImageMedia = service.feature_image_id
    ? [...imageMedia.filter(m => m.id === service.feature_image_id), ...imageMedia.filter(m => m.id !== service.feature_image_id)]
    : imageMedia;
  const gallery = sortedImageMedia.map(m => m.file_url);
  const selectedPricing = pricingOptions[selectedPackage];

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#F5F5F7" }}>
      {/* Header */}
      <Box sx={{ bgcolor: "white", borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
        <Container sx={{ py: 2 }}>
          <Button
            onClick={() => router.back()}
            startIcon={<ChevronLeft />}
            sx={{
              fontSize: "12px",
              color: "rgba(0,0,0,0.6)",
              "&:hover": { color: "black", bgcolor: "transparent" },
              textTransform: "none",
            }}>
            Back to Services
          </Button>
        </Container>
      </Box>

      <Container sx={{ py: 4 }}>
        {/* Owner-only status banners */}
        {isOwnService && service.status === "pending_review" && (
          <Box sx={{ mb: 3, p: 2, borderRadius: 2, bgcolor: "rgba(245, 158, 11, 0.08)", border: "1px solid rgba(245, 158, 11, 0.3)", display: "flex", gap: 1.25, alignItems: "flex-start" }}>
            <AccessTime sx={{ fontSize: 18, color: "#b45309", mt: "1px" }} />
            <Box>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#b45309" }}>Pending review</Typography>
              <Typography sx={{ fontSize: 12, color: "rgba(0,0,0,0.7)" }}>
                This is a preview. Your service is awaiting admin approval and is not visible to the public yet.
              </Typography>
            </Box>
          </Box>
        )}
        {isOwnService && service.status === "rejected" && (
          <Box sx={{ mb: 3, p: 2, borderRadius: 2, bgcolor: "rgba(220, 38, 38, 0.06)", border: "1px solid rgba(220, 38, 38, 0.25)", display: "flex", gap: 1.25, alignItems: "flex-start" }}>
            <Shield sx={{ fontSize: 18, color: "#dc2626", mt: "1px" }} />
            <Box>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#dc2626" }}>Rejected by admin</Typography>
              <Typography sx={{ fontSize: 12, color: "rgba(0,0,0,0.7)" }}>
                {service.rejection_reason || "No reason provided. Edit and resubmit your service for review."}
              </Typography>
            </Box>
          </Box>
        )}
        <Grid container spacing={4}>
          {/* Left Column - Service Details */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {/* Image Gallery */}
              <Card elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(0,0,0,0.08)" }}>
                <Box sx={{ position: "relative", aspectRatio: "16/9", bgcolor: "rgba(0,0,0,0.05)" }}>
                  {gallery.length > 0 && !imageError[`main-${selectedImage}`] ? (
                    <Image
                      unoptimized={true}
                      src={gallery[selectedImage] || gallery[0]}
                      alt={service.title}
                      fill
                      style={{ objectFit: "cover" }}
                      onError={() => handleImageError(`main-${selectedImage}`)}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: "#e0e0e0",
                      }}>
                      <Typography color='text.secondary'>No image available</Typography>
                    </Box>
                  )}
                </Box>
                {gallery.length > 1 && (
                  <Grid container spacing={1.5} sx={{ p: 2 }}>
                    {gallery.map((img, idx) => (
                      <Grid size={{ xs: 4 }} key={idx}>
                        <Box
                          onClick={() => setSelectedImage(idx)}
                          sx={{
                            position: "relative",
                            aspectRatio: "16/9",
                            borderRadius: 2,
                            overflow: "hidden",
                            border: selectedImage === idx ? "2px solid #0071e3" : "2px solid rgba(0,0,0,0.1)",
                            cursor: "pointer",
                            transition: "all 0.2s",
                            "&:hover": { borderColor: selectedImage === idx ? "#0071e3" : "rgba(0,0,0,0.2)" },
                          }}>
                          {!imageError[`thumb-${idx}`] ? (
                            <Image
                              unoptimized={true}
                              src={img}
                              alt={`Gallery ${idx + 1}`}
                              fill
                              style={{ objectFit: "cover" }}
                              onError={() => handleImageError(`thumb-${idx}`)}
                            />
                          ) : (
                            <Box sx={{ width: "100%", height: "100%", bgcolor: "#e0e0e0" }} />
                          )}
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Card>

              {/* Title & Actions */}
              <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2 }}>
                <Box>
                  {service.category && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1, flexWrap: "wrap" }}>
                      {service.category.parent && (
                        <>
                          <Typography component='span' sx={{ fontSize: 13, fontWeight: 500, color: "#0071e3" }}>
                            {service.category.parent.category_name}
                          </Typography>
                          <Typography component='span' sx={{ fontSize: 13, color: "rgba(0,0,0,0.35)" }}>
                            ›
                          </Typography>
                        </>
                      )}
                      <Typography component='span' sx={{ fontSize: 13, fontWeight: 500, color: "#0071e3" }}>
                        {service.category.category_name}
                      </Typography>
                    </Box>
                  )}
                  <Typography variant='h3' sx={{ fontSize: "32px", fontWeight: 600, mb: 1 }}>
                    {service.title}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, fontSize: "13px", flexWrap: "wrap" }}>
                    {service.location && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <LocationOn sx={{ fontSize: 14, color: "rgba(0,0,0,0.6)" }} />
                        <Typography variant='body2' color='text.secondary'>
                          {service.location}
                        </Typography>
                      </Box>
                    )}
                    {service.rating_count > 0 && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <StarRounded sx={{ fontSize: 15, color: "#f59e0b" }} />
                        <Typography variant='body2' sx={{ fontWeight: 600, color: "black" }}>
                          {parseFloat(String(service.rating_average)).toFixed(1)}
                        </Typography>
                        <Typography variant='body2' color='text.secondary'>
                          ({service.rating_count} {service.rating_count === 1 ? "review" : "reviews"})
                        </Typography>
                      </Box>
                    )}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <ShoppingBag sx={{ fontSize: 14, color: "rgba(0,0,0,0.6)" }} />
                      <Typography variant='body2' color='text.secondary'>
                        {service.orders_count} orders
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <IconButton
                    onClick={() => setIsFavorite(!isFavorite)}
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: isFavorite ? "#ffebee" : "white",
                      border: isFavorite ? "1px solid #ffcdd2" : "1px solid rgba(0,0,0,0.1)",
                      color: isFavorite ? "#f44336" : "rgba(0,0,0,0.4)",
                      "&:hover": { bgcolor: isFavorite ? "#ffebee" : "rgba(0,0,0,0.02)" },
                    }}>
                    {isFavorite ? <Favorite /> : <FavoriteBorder />}
                  </IconButton>
                  <IconButton
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: "white",
                      border: "1px solid rgba(0,0,0,0.1)",
                      color: "rgba(0,0,0,0.4)",
                      "&:hover": { bgcolor: "rgba(0,0,0,0.02)" },
                    }}>
                    <Share />
                  </IconButton>
                </Box>
              </Box>

              {/* Freelancer Info Card */}
              <Card elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(0,0,0,0.08)", p: 3 }}>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Avatar src={freelancerAvatar} alt={freelancerName} sx={{ width: 64, height: 64 }}>
                    {freelancerName.charAt(0)}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Box>
                        <Typography variant='h6' sx={{ fontSize: "17px", fontWeight: 600 }}>
                          {freelancerName}
                        </Typography>
                      </Box>
                      <Button
                        onClick={() => router.push(`/find-freelancer/${freelancer?.id}`)}
                        sx={{ fontSize: "13px", color: "#0071e3", textTransform: "none" }}>
                        View Profile
                      </Button>
                    </Box>
                    <Grid container spacing={2} sx={{ pt: 2, borderTop: "1px solid rgba(0,0,0,0.08)" }}>
                      <Grid size={{ xs: 6, md: 3 }}>
                        <Typography variant='caption' color='text.secondary' display='block' sx={{ mb: 0.25 }}>
                          Response Time
                        </Typography>
                        <Typography variant='body2' fontWeight={500}>
                          {"< 1 hour"}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 6, md: 3 }}>
                        <Typography variant='caption' color='text.secondary' display='block' sx={{ mb: 0.25 }}>
                          Total Orders
                        </Typography>
                        <Typography variant='body2' fontWeight={500}>
                          {service.orders_count}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 6, md: 3 }}>
                        <Typography variant='caption' color='text.secondary' display='block' sx={{ mb: 0.25 }}>
                          Member Since
                        </Typography>
                        <Typography variant='body2' fontWeight={500}>
                          {user?.created_at
                            ? new Date(user.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })
                            : "—"}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 6, md: 3 }}>
                        <Typography variant='caption' color='text.secondary' display='block' sx={{ mb: 0.25 }}>
                          Languages
                        </Typography>
                        <Typography variant='body2' fontWeight={500}>
                          {freelancer?.languages && freelancer.languages.length > 0
                            ? freelancer.languages
                                .slice(0, 2)
                                .map(l => l.name)
                                .join(", ")
                            : "—"}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                </Box>
              </Card>

              {/* Description */}
              <Card elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(0,0,0,0.08)", p: 3 }}>
                <Typography variant='h5' sx={{ fontSize: "21px", fontWeight: 600, mb: 2 }}>
                  About This Service
                </Typography>
                <Box sx={{ fontSize: "15px", color: "rgba(0,0,0,0.8)", lineHeight: 1.7 }}>
                  {service.description ? (
                    <RichTextDisplay value={service.description} />
                  ) : (
                    <Typography variant='body1' sx={{ fontSize: "15px", color: "rgba(0,0,0,0.8)" }}>
                      No description available.
                    </Typography>
                  )}
                </Box>

                {/* Tags */}
                {service.search_tags && service.search_tags.length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Typography sx={{ fontWeight: 500, mb: 1.5, fontSize: 14 }}>Tags</Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {service.search_tags.map((tag, index) => (
                        <Chip
                          key={index}
                          label={tag}
                          size='small'
                          sx={{ bgcolor: "rgba(0, 0, 0, 0.05)", color: "rgba(0, 0, 0, 0.7)" }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </Card>

              {/* FAQ */}
              {faqs.length > 0 && (
                <Card elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(0,0,0,0.08)", p: 3 }}>
                  <Typography variant='h5' sx={{ fontSize: "21px", fontWeight: 600 }}>
                    Frequently Asked Questions
                  </Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mt: 2 }}>
                    {faqs.map((faq, idx) => (
                      <Card key={idx} variant='outlined' sx={{ borderRadius: 3 }}>
                        <Button
                          fullWidth
                          onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                          sx={{
                            justifyContent: "space-between",
                            p: 2,
                            textAlign: "left",
                            textTransform: "none",
                            color: "black",
                            "&:hover": { bgcolor: "rgba(0,0,0,0.02)" },
                          }}>
                          <Typography variant='body1' sx={{ fontSize: "15px", fontWeight: 500 }}>
                            {faq.question}
                          </Typography>
                          {openFaq === idx ? <ExpandLess /> : <ExpandMore />}
                        </Button>
                        <Collapse in={openFaq === idx}>
                          <Box sx={{ px: 2, pb: 2 }}>
                            <Typography variant='body2' sx={{ fontSize: "14px", color: "rgba(0,0,0,0.7)" }}>
                              {faq.answer}
                            </Typography>
                          </Box>
                        </Collapse>
                      </Card>
                    ))}
                  </Box>
                </Card>
              )}

              {/* Reviews */}
              {service.reviews && service.reviews.length > 0 && (
                <Card elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(0,0,0,0.08)", p: 3 }}>
                  {/* Header */}
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
                    <Typography variant='h5' sx={{ fontSize: "21px", fontWeight: 600 }}>
                      Reviews
                    </Typography>
                    {service.rating_count > 0 && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                        <StarRounded sx={{ fontSize: 20, color: "#f59e0b" }} />
                        <Typography sx={{ fontSize: 18, fontWeight: 700, color: "black" }}>
                          {parseFloat(String(service.rating_average)).toFixed(1)}
                        </Typography>
                        <Typography variant='body2' color='text.secondary'>
                          ({service.rating_count})
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {/* Review list */}
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    {service.reviews.map((review, idx) => (
                      <Box key={review.id}>
                        {idx > 0 && <Divider sx={{ mb: 3 }} />}
                        <Box sx={{ display: "flex", gap: 2 }}>
                          <Avatar
                            src={review.client_profile.user.avatar_url ?? undefined}
                            alt={review.client_profile.user.name}
                            sx={{ width: 40, height: 40 }}>
                            {review.client_profile.user.name.charAt(0)}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 0.5 }}>
                              <Box>
                                <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{review.client_profile.user.name}</Typography>
                                <Typography variant='caption' color='text.secondary'>
                                  {review.pricing_option.title} package
                                </Typography>
                              </Box>
                              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 0.25 }}>
                                <Box sx={{ display: "flex" }}>
                                  {[1, 2, 3, 4, 5].map(star => (
                                    <StarRounded
                                      key={star}
                                      sx={{ fontSize: 14, color: star <= review.rating ? "#f59e0b" : "rgba(0,0,0,0.15)" }}
                                    />
                                  ))}
                                </Box>
                                <Typography variant='caption' color='text.secondary'>
                                  {new Date(review.created_at).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </Typography>
                              </Box>
                            </Box>
                            {review.comment && (
                              <Typography sx={{ fontSize: 14, color: "rgba(0,0,0,0.8)", lineHeight: 1.6, mt: 1 }}>
                                {review.comment}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Card>
              )}
            </Box>
          </Grid>

          {/* Right Column - Pricing Packages (Sticky) */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Box sx={{ position: "sticky", top: 96 }}>
              {/* Package Selection */}
              {pricingOptions.length > 0 ? (
                <Card elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(0,0,0,0.08)", overflow: "hidden", mb: 2 }}>
                  {/* Package Tabs */}
                  {pricingOptions.length > 1 && (
                    <Box sx={{ display: "flex", borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
                      {pricingOptions.map((pkg, idx) => (
                        <Button
                          key={pkg.id}
                          onClick={() => setSelectedPackage(idx)}
                          sx={{
                            flex: 1,
                            py: 1.5,
                            fontSize: "13px",
                            fontWeight: 500,
                            textTransform: "none",
                            borderRadius: 0,
                            color: selectedPackage === idx ? "black" : "rgba(0,0,0,0.5)",
                            borderBottom: selectedPackage === idx ? "2px solid #0071e3" : "none",
                            "&:hover": { bgcolor: "rgba(0,0,0,0.02)", color: "rgba(0,0,0,0.7)" },
                          }}>
                          {pkg.title}
                        </Button>
                      ))}
                    </Box>
                  )}

                  {/* Package Details */}
                  {selectedPricing && (
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ mb: 3 }}>
                        <Typography variant='h3' sx={{ fontSize: "32px", fontWeight: 600, mb: 0.5 }}>
                          ${Number(selectedPricing.price_raw).toFixed(2)}
                        </Typography>
                        <Box sx={{ display: "flex", gap: 2, fontSize: "13px", color: "rgba(0,0,0,0.6)", mb: 2 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            <AccessTime sx={{ fontSize: 14 }} />
                            <Typography variant='caption'>{selectedPricing.delivery_time} delivery</Typography>
                          </Box>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            <Refresh sx={{ fontSize: 14 }} />
                            <Typography variant='caption'>
                              {selectedPricing.revisions} {String(selectedPricing.revisions) === "1" ? "revision" : "revisions"}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>

                      {/* Description */}
                      {selectedPricing.description && (
                        <Box sx={{ fontSize: "14px", color: "rgba(0,0,0,0.7)", mb: 3 }}>
                          <RichTextDisplay value={selectedPricing.description} />
                        </Box>
                      )}

                      {/* CTA Buttons */}
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                        {isOwnService ? (
                          <Box sx={{ textAlign: "center", py: 1.25, px: 2, bgcolor: "rgba(0,0,0,0.04)", borderRadius: 28 }}>
                            <Typography sx={{ fontSize: 13, color: "rgba(0,0,0,0.5)", fontWeight: 500 }}>
                              This is your own service
                            </Typography>
                          </Box>
                        ) : (
                          <Button
                            fullWidth
                            variant='contained'
                            onClick={() => {
                              if (ensureCanPurchase()) {
                                router.push(`/explore-services/${serviceId}/checkout?pricing_option_id=${selectedPricing.id}`);
                              }
                            }}
                            sx={{
                              height: 44,
                              bgcolor: "#0071e3",
                              fontSize: "13px",
                              fontWeight: 500,
                              borderRadius: 28,
                              textTransform: "none",
                              boxShadow: 1,
                              color: "white",
                              "&:hover": { bgcolor: "#0077ED", boxShadow: 2 },
                            }}>
                            Continue (${Number(selectedPricing.price_raw).toFixed(2)})
                          </Button>
                        )}
                        {!isOwnService && service.custom_orders_enabled && (
                          service.my_active_custom_order ? (
                            <Button
                              fullWidth
                              variant='outlined'
                              startIcon={<RequestQuoteOutlined />}
                              onClick={() => router.push(`/dashboard/custom-orders/${service.my_active_custom_order!.id}`)}
                              sx={{
                                height: 44,
                                bgcolor: "rgba(0,0,0,0.04)",
                                color: "black",
                                borderColor: "rgba(0,0,0,0.15)",
                                fontSize: "13px",
                                fontWeight: 500,
                                borderRadius: 28,
                                textTransform: "none",
                                "&:hover": { bgcolor: "rgba(0,0,0,0.07)", borderColor: "rgba(0,0,0,0.25)" },
                              }}>
                              View your custom order
                            </Button>
                          ) : (
                            <Button
                              fullWidth
                              variant='contained'
                              startIcon={<RequestQuoteOutlined />}
                              onClick={() => setShowCustomOrderDialog(true)}
                              sx={{
                                height: 44,
                                bgcolor: "black",
                                color: "white",
                                fontSize: "13px",
                                fontWeight: 500,
                                borderRadius: 28,
                                textTransform: "none",
                                boxShadow: "none",
                                "&:hover": { bgcolor: "rgba(0,0,0,0.82)", boxShadow: "none" },
                              }}>
                              Request a Custom Order
                            </Button>
                          )
                        )}
                        <Button
                          fullWidth
                          variant='outlined'
                          startIcon={<ChatBubbleOutline />}
                          sx={{
                            height: 44,
                            bgcolor: "white",
                            color: "black",
                            borderColor: "rgba(0,0,0,0.1)",
                            fontSize: "13px",
                            fontWeight: 500,
                            borderRadius: 28,
                            textTransform: "none",
                            "&:hover": { borderColor: "rgba(0,0,0,0.2)", bgcolor: "white" },
                          }}>
                          Contact Freelancer
                        </Button>
                      </Box>
                    </CardContent>
                  )}
                </Card>
              ) : (
                <Card elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(0,0,0,0.08)", p: 3, mb: 2 }}>
                  <Typography sx={{ color: "rgba(0, 0, 0, 0.6)", textAlign: "center", mb: 2 }}>
                    No pricing options available. Contact the freelancer for a quote.
                  </Typography>
                  <Button
                    fullWidth
                    variant='contained'
                    startIcon={<ChatBubbleOutline />}
                    sx={{
                      height: 44,
                      bgcolor: "#0071e3",
                      fontSize: "13px",
                      fontWeight: 500,
                      borderRadius: 28,
                      textTransform: "none",
                      "&:hover": { bgcolor: "#0077ED" },
                    }}>
                    Contact Freelancer
                  </Button>
                </Card>
              )}

              {/* Trust Badges */}
              <Card elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(0,0,0,0.08)", p: 2 }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  <Box sx={{ display: "flex", gap: 1.5 }}>
                    <Shield sx={{ fontSize: 18, color: "#0071e3", mt: 0.5 }} />
                    <Box>
                      <Typography variant='body2' sx={{ fontSize: "13px", fontWeight: 500 }}>
                        Money Back Guarantee
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        Full refund if not satisfied
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", gap: 1.5 }}>
                    <Check sx={{ fontSize: 18, color: "#0071e3", mt: 0.5 }} />
                    <Box>
                      <Typography variant='body2' sx={{ fontSize: "13px", fontWeight: 500 }}>
                        Quality Verified
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        Reviewed by KickAir team
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Card>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Request a Custom Order */}
      <RequestCustomOrderDialog
        open={showCustomOrderDialog}
        onClose={() => setShowCustomOrderDialog(false)}
        serviceId={serviceId}
        freelancerName={freelancerName}
        minBudget={service.custom_min_budget ?? null}
        instructions={service.custom_instructions ?? null}
      />

      {/* Purchase precondition gate (login / client role / KYC) */}
      {gateDialog}
    </Box>
  );
}
