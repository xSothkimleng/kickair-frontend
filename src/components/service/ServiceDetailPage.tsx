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
  TextField,
  Modal,
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
  CalendarMonth,
  Send,
  LocationOn,
  ShoppingBag,
} from "@mui/icons-material";
import { api } from "@/lib/api";
import { Service, ServiceDetailResponse } from "@/types/service";

interface ServiceDetailPageProps {
  serviceId: number;
}

export function ServiceDetailPage({ serviceId }: ServiceDetailPageProps) {
  const router = useRouter();

  // API state
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedPackage, setSelectedPackage] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showInstallmentModal, setShowInstallmentModal] = useState(false);
  const [installmentTerms, setInstallmentTerms] = useState({
    numberOfPayments: 3,
    daysBetweenPayments: 14,
  });
  const [imageError, setImageError] = useState<{ [key: string]: boolean }>({});

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

  const handleSendProposal = () => {
    if (!service || !pricingOptions[selectedPackage]) return;

    const selectedPkg = pricingOptions[selectedPackage];
    const platformFee = selectedPkg.price_raw * 0.05;
    const total = selectedPkg.price_raw + platformFee;
    const installmentFee = total * 0.03;
    const totalWithFee = total + installmentFee;
    const perPayment = totalWithFee / installmentTerms.numberOfPayments;

    alert(
      `Installment proposal sent to ${freelancerName}!\n\nPackage: ${selectedPkg.title}\nTotal: $${totalWithFee.toFixed(2)}\nPayments: ${installmentTerms.numberOfPayments}\nEvery: ${installmentTerms.daysBetweenPayments} days\nPer Payment: $${perPayment.toFixed(2)}\n\nThe freelancer will review your proposal and can accept or counter with different terms.`,
    );
    setShowInstallmentModal(false);
    setInstallmentTerms({ numberOfPayments: 3, daysBetweenPayments: 14 });
  };

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
  const freelancerAvatar = user?.profile_image || "";
  const pricingOptions = service.pricing_options || [];
  const media = service.media || [];
  const faqs = service.faqs || [];
  const imageMedia = media.filter(m => m.file_type === "image");
  const sortedImageMedia = service.feature_image_id
    ? [
        ...imageMedia.filter(m => m.id === service.feature_image_id),
        ...imageMedia.filter(m => m.id !== service.feature_image_id),
      ]
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
                  {/* {service.category && (
                    <Chip
                      label={service.category.name}
                      size='small'
                      sx={{ mb: 1, bgcolor: "rgba(0, 113, 227, 0.1)", color: "#0071e3" }}
                    />
                  )} */}
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
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                      <Box>
                        <Typography variant='h6' sx={{ fontSize: "17px", fontWeight: 600 }}>
                          {freelancerName}
                        </Typography>
                        {freelancer?.certificates && freelancer.certificates.length > 0 && (
                          <Typography variant='caption' sx={{ color: "#0071e3", fontWeight: 500 }}>
                            {freelancer.certificates[0].title}
                          </Typography>
                        )}
                      </Box>
                      <Button
                        onClick={() => router.push(`/find-freelancer/${freelancer?.id}`)}
                        sx={{ fontSize: "13px", color: "#0071e3", textTransform: "none" }}>
                        View Profile
                      </Button>
                    </Box>
                    {freelancer?.educations && freelancer.educations.length > 0 && (
                      <Grid container spacing={2} sx={{ mt: 2, pt: 2, borderTop: "1px solid rgba(0,0,0,0.08)" }}>
                        <Grid size={{ xs: 6, md: 6 }}>
                          <Typography variant='caption' color='text.secondary' display='block'>
                            Education
                          </Typography>
                          <Typography variant='body2' fontWeight={500}>
                            {freelancer.educations[0].studies} - {freelancer.educations[0].facility}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 6, md: 6 }}>
                          <Typography variant='caption' color='text.secondary' display='block'>
                            Total Orders
                          </Typography>
                          <Typography variant='body2' fontWeight={500}>
                            {service.orders_count}
                          </Typography>
                        </Grid>
                      </Grid>
                    )}
                  </Box>
                </Box>
              </Card>

              {/* Description */}
              <Card elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(0,0,0,0.08)", p: 3 }}>
                <Typography variant='h5' sx={{ fontSize: "21px", fontWeight: 600, mb: 2 }}>
                  About This Service
                </Typography>
                <Box sx={{ fontSize: "15px", color: "rgba(0,0,0,0.8)", lineHeight: 1.7 }}>
                  {service.description
                    ? <RichTextDisplay value={service.description} />
                    : <Typography variant="body1" sx={{ fontSize: "15px", color: "rgba(0,0,0,0.8)" }}>No description available.</Typography>
                  }
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
                          ${selectedPricing.price_raw}
                        </Typography>
                        <Box sx={{ display: "flex", gap: 2, fontSize: "13px", color: "rgba(0,0,0,0.6)", mb: 2 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            <AccessTime sx={{ fontSize: 14 }} />
                            <Typography variant='caption'>
                              {selectedPricing.delivery_time} day{selectedPricing.delivery_time !== 1 ? "s" : ""} delivery
                            </Typography>
                          </Box>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            <Refresh sx={{ fontSize: 14 }} />
                            <Typography variant='caption'>
                              {selectedPricing.revisions === -1 ? "Unlimited" : selectedPricing.revisions} revision
                              {selectedPricing.revisions !== 1 ? "s" : ""}
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
                        <Button
                          fullWidth
                          variant='contained'
                          onClick={() =>
                            router.push(`/explore-services/${serviceId}/checkout?pricing_option_id=${selectedPricing.id}`)
                          }
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
                          Continue (${selectedPricing.price_raw})
                        </Button>
                        <Button
                          fullWidth
                          variant='outlined'
                          startIcon={<CalendarMonth />}
                          onClick={() => setShowInstallmentModal(true)}
                          sx={{
                            height: 44,
                            bgcolor: "#f3e5f5",
                            color: "#7b1fa2",
                            borderColor: "#ce93d8",
                            fontSize: "13px",
                            fontWeight: 500,
                            borderRadius: 28,
                            textTransform: "none",
                            "&:hover": { bgcolor: "#e1bee7", borderColor: "#ce93d8" },
                          }}>
                          Propose Installment Plan
                        </Button>
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

      {/* Installment Proposal Modal */}
      {selectedPricing && (
        <Modal
          open={showInstallmentModal}
          onClose={() => {
            setShowInstallmentModal(false);
            setInstallmentTerms({ numberOfPayments: 3, daysBetweenPayments: 14 });
          }}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "90%",
              maxWidth: 560,
              bgcolor: "white",
              borderRadius: 4,
              border: "1px solid rgba(0,0,0,0.08)",
              boxShadow: 24,
              p: 4,
            }}>
            <Typography variant='h5' sx={{ fontSize: "24px", fontWeight: 600, mb: 1 }}>
              Propose Installment Plan
            </Typography>
            <Typography variant='body2' sx={{ fontSize: "13px", color: "rgba(0,0,0,0.6)", mb: 3 }}>
              Set your preferred payment terms for the {selectedPricing.title} package. {freelancerName} will review and can
              accept or counter-propose.
            </Typography>

            <Card sx={{ bgcolor: "#F5F5F7", p: 2, mb: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                <Typography variant='caption' color='text.secondary'>
                  Package
                </Typography>
                <Typography variant='body2' fontWeight={500}>
                  {selectedPricing.title}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                <Typography variant='caption' color='text.secondary'>
                  Base Price
                </Typography>
                <Typography variant='body2' fontWeight={500}>
                  ${selectedPricing.price_raw}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                <Typography variant='caption' color='text.secondary'>
                  Platform Fee (5%)
                </Typography>
                <Typography variant='body2' fontWeight={500}>
                  ${(selectedPricing.price_raw * 0.05).toFixed(2)}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                <Typography variant='caption' color='text.secondary'>
                  Installment Fee (3%)
                </Typography>
                <Typography variant='body2' fontWeight={500}>
                  ${(selectedPricing.price_raw * 1.05 * 0.03).toFixed(2)}
                </Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant='body1' fontWeight={600}>
                  Total Amount
                </Typography>
                <Typography variant='h6' sx={{ fontSize: "17px", fontWeight: 600, color: "#0071e3" }}>
                  ${(selectedPricing.price_raw * 1.05 * 1.03).toFixed(2)}
                </Typography>
              </Box>
            </Card>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, mb: 3 }}>
              <Box>
                <Typography variant='body2' sx={{ fontSize: "13px", fontWeight: 500, mb: 1 }}>
                  Number of Payments
                </Typography>
                <TextField
                  fullWidth
                  type='number'
                  value={installmentTerms.numberOfPayments}
                  onChange={e =>
                    setInstallmentTerms({
                      ...installmentTerms,
                      numberOfPayments: Math.max(2, Math.min(12, parseInt(e.target.value) || 2)),
                    })
                  }
                  inputProps={{ min: 2, max: 12 }}
                  placeholder='2-12 payments'
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
                />
                <Typography variant='caption' color='text.secondary' sx={{ mt: 0.5, display: "block" }}>
                  Min: 2, Max: 12 payments
                </Typography>
              </Box>

              <Box>
                <Typography variant='body2' sx={{ fontSize: "13px", fontWeight: 500, mb: 1 }}>
                  Days Between Payments
                </Typography>
                <TextField
                  fullWidth
                  type='number'
                  value={installmentTerms.daysBetweenPayments}
                  onChange={e =>
                    setInstallmentTerms({
                      ...installmentTerms,
                      daysBetweenPayments: Math.max(3, Math.min(90, parseInt(e.target.value) || 14)),
                    })
                  }
                  inputProps={{ min: 3, max: 90 }}
                  placeholder='3-90 days'
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
                />
                <Typography variant='caption' color='text.secondary' sx={{ mt: 0.5, display: "block" }}>
                  Min: 3 days, Max: 90 days
                </Typography>
              </Box>
            </Box>

            <Card sx={{ bgcolor: "#f3e5f5", border: "1px solid #ce93d8", p: 2, mb: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                  <Typography variant='caption' sx={{ color: "#7b1fa2", fontWeight: 500, mb: 0.25, display: "block" }}>
                    Payment Schedule
                  </Typography>
                  <Typography variant='body2' color='text.secondary' sx={{ fontSize: "13px" }}>
                    {installmentTerms.numberOfPayments} payments • Every {installmentTerms.daysBetweenPayments} days
                  </Typography>
                </Box>
                <Box sx={{ textAlign: "right" }}>
                  <Typography variant='caption' color='text.secondary' sx={{ mb: 0.25, display: "block" }}>
                    Per Payment
                  </Typography>
                  <Typography variant='h6' sx={{ fontSize: "20px", fontWeight: 600, color: "#7b1fa2" }}>
                    ${((selectedPricing.price_raw * 1.05 * 1.03) / installmentTerms.numberOfPayments).toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </Card>

            <Box sx={{ display: "flex", gap: 1.5 }}>
              <Button
                fullWidth
                onClick={() => {
                  setShowInstallmentModal(false);
                  setInstallmentTerms({ numberOfPayments: 3, daysBetweenPayments: 14 });
                }}
                sx={{
                  height: 44,
                  bgcolor: "rgba(0,0,0,0.05)",
                  color: "black",
                  fontSize: "13px",
                  fontWeight: 500,
                  borderRadius: 28,
                  textTransform: "none",
                  "&:hover": { bgcolor: "rgba(0,0,0,0.1)" },
                }}>
                Cancel
              </Button>
              <Button
                fullWidth
                variant='contained'
                startIcon={<Send />}
                onClick={handleSendProposal}
                sx={{
                  height: 44,
                  bgcolor: "#7b1fa2",
                  fontSize: "13px",
                  fontWeight: 500,
                  borderRadius: 28,
                  textTransform: "none",
                  boxShadow: 1,
                  "&:hover": { bgcolor: "#6a1b9a" },
                }}>
                Send Proposal
              </Button>
            </Box>
          </Box>
        </Modal>
      )}
    </Box>
  );
}
