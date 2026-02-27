"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Box, Container, Typography, Card, Button, Grid, Avatar, CircularProgress, Alert } from "@mui/material";
import {
  ArrowBack as ChevronLeft,
  Check as CheckIcon,
  CreditCard,
  AccountBalance as BankIcon,
  Smartphone as SmartphoneIcon,
} from "@mui/icons-material";
import PaymentOption, { PaymentMethod } from "@/components/checkout/PaymentOptionCard";
import { api } from "@/lib/api";
import { Service, ServiceDetailResponse, PricingOption } from "@/types/service";
import { CreateOrderResponse } from "@/types/order";

function CheckoutContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const serviceId = params.id as string;
  const pricingOptionId = searchParams.get("pricing_option_id");

  // Data state
  const [service, setService] = useState<Service | null>(null);
  const [selectedPricing, setSelectedPricing] = useState<PricingOption | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  // Fetch service data
  useEffect(() => {
    const fetchService = async () => {
      if (!serviceId || !pricingOptionId) {
        setError("Missing service or pricing information");
        setLoading(false);
        return;
      }

      try {
        const response: ServiceDetailResponse = await api.get(`/api/services/${serviceId}`);
        setService(response.data);

        // Find the selected pricing option
        const pricing = response.data.pricing_options?.find(p => p.id === Number(pricingOptionId));

        if (!pricing) {
          setError("Selected pricing option not found");
        } else {
          setSelectedPricing(pricing);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load service");
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [serviceId, pricingOptionId]);

  const handleConfirmPayment = async () => {
    if (!selectedPricing) return;

    setIsProcessing(true);
    setOrderError(null);

    try {
      const response: CreateOrderResponse = await api.post("/api/orders", {
        pricing_option_id: selectedPricing.id,
      });

      // Order created successfully
      console.log(`Order placed successfully! Order #${response.data.id}`);
      router.push("/dashboard/client");
    } catch (err) {
      setOrderError(err instanceof Error ? err.message : "Failed to create order");
      setIsProcessing(false);
    }
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
  if (error || !service || !selectedPricing) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "#F5F5F7" }}>
        <Box sx={{ bgcolor: "white", borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
          <Container maxWidth='lg' sx={{ px: 3, py: 2 }}>
            <Button
              onClick={() => router.back()}
              startIcon={<ChevronLeft />}
              sx={{
                fontSize: 12,
                color: "rgba(0,0,0,0.6)",
                textTransform: "none",
                "&:hover": { color: "black", bgcolor: "transparent" },
              }}>
              Go Back
            </Button>
          </Container>
        </Box>
        <Container maxWidth='lg' sx={{ px: 3, py: 4 }}>
          <Alert severity='error'>{error || "Unable to load checkout"}</Alert>
        </Container>
      </Box>
    );
  }

  const freelancer = service.freelancer_profile;
  const user = freelancer?.user;
  const freelancerName = user?.name || "Unknown";
  const freelancerAvatar = user?.profile_image || "";

  const priceRaw = Number(selectedPricing.price_raw);
  const platformFee = priceRaw * 0.05;
  const total = priceRaw + platformFee;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#F5F5F7", pb: 6 }}>
      {/* Header */}
      <Box sx={{ bgcolor: "white", borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
        <Container maxWidth='lg' sx={{ px: 3, py: 2 }}>
          <Button
            onClick={() => router.push(`/explore-services/${serviceId}`)}
            startIcon={<ChevronLeft />}
            sx={{
              fontSize: 12,
              color: "rgba(0,0,0,0.6)",
              textTransform: "none",
              "&:hover": { color: "black", bgcolor: "transparent" },
            }}>
            Back to Service
          </Button>
        </Container>
      </Box>

      <Container maxWidth='md' sx={{ px: 3, py: 6 }}>
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography variant='h3' sx={{ fontSize: 40, fontWeight: 600, color: "black", letterSpacing: "-0.03em" }}>
            Checkout
          </Typography>
          <Typography variant='body1' sx={{ fontSize: 17, color: "rgba(0,0,0,0.6)", mt: 1 }}>
            Complete your order
          </Typography>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Order Summary */}
          <Card
            sx={{
              borderRadius: 4,
              border: "1px solid",
              borderColor: "divider",
              p: 4,
            }}>
            <Typography variant='h5' sx={{ mb: 3 }}>
              Order Summary
            </Typography>

            {/* Freelancer Info */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                pb: 3,
                borderBottom: "1px solid",
                borderColor: "divider",
              }}>
              <Avatar sx={{ width: 64, height: 64 }}>
                {freelancerAvatar ? (
                  <Image src={freelancerAvatar} alt={freelancerName} fill style={{ objectFit: "cover" }} />
                ) : (
                  freelancerName.charAt(0)
                )}
              </Avatar>
              <Box>
                <Typography variant='body1' fontWeight={500}>
                  {freelancerName}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {service.title}
                </Typography>
              </Box>
            </Box>

            {/* Package Details */}
            <Box sx={{ mt: 3, display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography>Package</Typography>
                <Typography fontWeight={500}>{selectedPricing.title}</Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography color='text.secondary'>Delivery</Typography>
                <Typography color='text.secondary'>
                  {selectedPricing.delivery_time} day{selectedPricing.delivery_time !== 1 ? "s" : ""}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography color='text.secondary'>Revisions</Typography>
                <Typography color='text.secondary'>
                  {selectedPricing.revisions === -1 ? "Unlimited" : selectedPricing.revisions}
                </Typography>
              </Box>
            </Box>

            {/* Price Breakdown */}
            <Box
              sx={{
                mt: 3,
                pt: 3,
                borderTop: "1px solid",
                borderColor: "divider",
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
              }}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography>Package price</Typography>
                <Typography>${priceRaw.toFixed(2)}</Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography color='text.secondary'>Platform fee (5%)</Typography>
                <Typography color='text.secondary'>${platformFee.toFixed(2)}</Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  pt: 2,
                  borderTop: "1px solid",
                  borderColor: "divider",
                }}>
                <Typography sx={{ fontSize: 20, fontWeight: 600 }}>Total</Typography>
                <Typography sx={{ fontSize: 26, fontWeight: 600 }}>${total.toFixed(2)}</Typography>
              </Box>
            </Box>
          </Card>

          {/* Payment Method */}
          <Card
            sx={{
              borderRadius: 4,
              border: "1px solid",
              borderColor: "divider",
              p: 4,
            }}>
            <Typography variant='h5' sx={{ mb: 3 }}>
              Payment Method
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <PaymentOption
                  value='card'
                  icon={<CreditCard sx={{ fontSize: 20 }} />}
                  title='Credit / Debit Card'
                  subtitle='Visa, Mastercard, JCB'
                  selected={paymentMethod === "card"}
                  onSelect={setPaymentMethod}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <PaymentOption
                  value='bank'
                  icon={<BankIcon sx={{ fontSize: 20 }} />}
                  title='Local Bank Transfer'
                  subtitle='ABA, ACLEDA, Canadia'
                  selected={paymentMethod === "bank"}
                  onSelect={setPaymentMethod}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <PaymentOption
                  value='ewallet'
                  icon={<SmartphoneIcon sx={{ fontSize: 20 }} />}
                  title='E-Wallet'
                  subtitle='Wing, Pi Pay, True Money'
                  selected={paymentMethod === "ewallet"}
                  onSelect={setPaymentMethod}
                />
              </Grid>
            </Grid>

            <Typography variant='caption' color='text.secondary' sx={{ display: "block", mt: 2 }}>
              Payment processing is simulated. No actual charges will be made.
            </Typography>
          </Card>

          {/* Order Error */}
          {orderError && (
            <Alert severity='error' onClose={() => setOrderError(null)}>
              {orderError}
            </Alert>
          )}

          {/* Confirm Button */}
          <Button
            fullWidth
            onClick={handleConfirmPayment}
            disabled={isProcessing}
            sx={{
              py: 1.5,
              borderRadius: 999,
              bgcolor: "#0071e3",
              color: "white",
              fontSize: 15,
              fontWeight: 500,
              textTransform: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              opacity: isProcessing ? 0.6 : 1,
              cursor: isProcessing ? "default" : "pointer",
              "&:hover": {
                bgcolor: "#0077ED",
              },
            }}>
            {isProcessing ? (
              <>
                <CircularProgress size={20} sx={{ color: "inherit" }} />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <CheckIcon sx={{ fontSize: 20 }} />
                <span>Confirm & Pay ${total.toFixed(2)}</span>
              </>
            )}
          </Button>

          {/* Security Note */}
          <Typography variant='body2' align='center' sx={{ mt: 1, color: "text.secondary" }}>
            Your payment information is secure and encrypted
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}><CircularProgress sx={{ color: "#0071e3" }} /></Box>}>
      <CheckoutContent />
    </Suspense>
  );
}
