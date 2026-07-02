"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Box, Button, CircularProgress, Container, Typography, Alert } from "@mui/material";
import {
  ArrowBack as ChevronLeft,
  Lock as LockIcon,
  AccountBalanceWallet as WalletIcon,
  CreditCard as CardIcon,
  VerifiedUser as ShieldIcon,
  AccessTime as ClockIcon,
  Autorenew as RevisionIcon,
  Check as CheckIcon,
  InfoOutlined as InfoIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { api } from "@/lib/api";
import { qk } from "@/lib/queryKeys";
import { tokens } from "@/theme";
import { useAuth } from "@/components/context/AuthContext";
import { usePurchaseGate } from "@/components/purchase/PurchaseGate";
import type { Service, ServiceDetailResponse } from "@/types/service";
import type { CreateOrderResponse } from "@/types/order";
import type { Wallet } from "@/types/wallet";
import {
  AbaMethodSelector,
  Annot,
  PaymentOption,
  PayLogo,
  PaymentFooterLogos,
  PriceRow,
  StatusChip,
  TopUpDialog,
  fmtUsd,
  usePaymentProcessing,
  type AbaMethod,
} from "@/components/payment";

type PaySource = "wallet" | "aba";

function deliveryText(d: string | number): string {
  const s = String(d).trim();
  if (/^\d+$/.test(s)) return `${s}-day delivery`;
  return s || "Delivery on agreed date";
}
function revisionsText(r: string | number): string {
  const s = String(r).trim();
  if (s === "-1") return "Unlimited revisions";
  if (/^\d+$/.test(s)) return `${s} revision${s === "1" ? "" : "s"}`;
  return s || "Revisions on request";
}

function CheckoutContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { ensureCanPurchase, gateDialog } = usePurchaseGate();
  const qc = useQueryClient();

  const serviceId = params.id as string;
  const pricingOptionId = searchParams.get("pricing_option_id");

  const [paySource, setPaySource] = useState<PaySource | null>(null);
  const [abaMethod, setAbaMethod] = useState<AbaMethod | null>(null);
  const [topUpOpen, setTopUpOpen] = useState(false);
  const createdOrderId = useRef<number | null>(null);

  const { data: service, isLoading, error } = useQuery({
    queryKey: qk.services.detail(serviceId),
    queryFn: async () => {
      const r: ServiceDetailResponse = await api.get(`/api/services/${serviceId}`);
      return r.data;
    },
    enabled: !!serviceId,
  });

  const { data: wallet } = useQuery({
    queryKey: qk.wallet(),
    queryFn: async () => (await api.get("/api/wallet")).data as Wallet,
  });

  const selectedPricing = service?.pricing_options?.find(p => p.id === Number(pricingOptionId)) ?? null;
  const total = selectedPricing ? Number(selectedPricing.price_raw) : 0;
  const balance = wallet ? parseFloat(wallet.available_balance_raw) : 0;
  const insufficient = balance < total;
  const topUpSuggested = Math.max(10, Math.ceil((total - balance) / 5) * 5);

  const flow = usePaymentProcessing({
    context: "checkout",
    merchant: "KickAir",
    perform: async () => {
      if (!selectedPricing) throw new Error("No package selected");
      const res: CreateOrderResponse = await api.post("/api/orders", { pricing_option_id: selectedPricing.id });
      createdOrderId.current = res.data.id;
      await qc.invalidateQueries({ queryKey: qk.wallet() });
      qc.invalidateQueries({ queryKey: qk.orders.all() });
      qc.invalidateQueries({ queryKey: qk.dashboard.client() });
    },
    onSuccessPrimary: () => router.push(createdOrderId.current ? `/dashboard/orders/${createdOrderId.current}` : "/dashboard/client"),
    onSuccessDone: () => router.push("/explore-services"),
    reference: { success: "#KA-OR-48217", failure: "#KA-ERR-90341 · ABA PayWay" },
  });

  const canPay = paySource === "wallet" ? !insufficient : paySource === "aba" && !!abaMethod;

  // Surface the login / client-role / KYC gate as soon as auth is resolved so an
  // unauthenticated (or ineligible) visitor never sees the payment wall unguarded.
  useEffect(() => {
    if (!authLoading) ensureCanPurchase();
  }, [authLoading, ensureCanPurchase]);

  const handleConfirm = () => {
    if (!selectedPricing) return;
    if (!ensureCanPurchase()) return;
    if (paySource === "wallet" && !insufficient) flow.startWallet(total);
    else if (paySource === "aba" && abaMethod) flow.startAba(abaMethod, total);
  };

  if (isLoading) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: tokens.canvas, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <CircularProgress sx={{ color: tokens.accent }} />
      </Box>
    );
  }

  const isOwnService = !!(service && user?.is_freelancer && user.freelancer_profile?.id === service.freelancer_profile_id);
  if (isOwnService) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: tokens.canvas, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Box sx={{ textAlign: "center" }}>
          <Typography sx={{ fontSize: 16, fontWeight: 600, mb: 1 }}>You cannot purchase your own service</Typography>
          <Button onClick={() => router.back()} variant='outlined' sx={{ textTransform: "none", borderRadius: 28 }}>
            Go back
          </Button>
        </Box>
      </Box>
    );
  }

  if (error || !service || !selectedPricing) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: tokens.canvas }}>
        <HeaderBar onBack={() => router.back()} label='Go Back' />
        <Container maxWidth='lg' sx={{ px: 3, py: 4 }}>
          <Alert severity='error'>{error instanceof Error ? error.message : "Unable to load checkout"}</Alert>
        </Container>
      </Box>
    );
  }

  const freelancerUser = service.freelancer_profile?.user;
  const freelancerName = freelancerUser?.name || "Freelancer";

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: tokens.canvas, pb: 2 }}>
      <HeaderBar onBack={() => router.back()} label='Back to Service' />

      <Container maxWidth='lg' sx={{ px: { xs: 2, md: 4 }, py: { xs: 3, md: 5 } }}>
        {/* Title */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", mb: { xs: 2.5, md: 3.5 }, gap: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Annot>{["STEP 1 · order initiated", "STEP 3 · proceed to checkout"]}</Annot>
            <Typography sx={{ fontSize: { xs: 28, md: 40 }, fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.05 }}>Checkout</Typography>
          </Box>
          <Box sx={{ display: { xs: "none", md: "block" } }}>
            <Annot>Billing address skipped (STEP 5 — digital service)</Annot>
          </Box>
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: { xs: 2, md: 3 }, alignItems: "start" }}>
          {/* ---- Order summary ---- */}
          <Card>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.25 }}>
              <Label>Order summary</Label>
              <Annot>STEP 2</Annot>
            </Box>

            <Box sx={{ display: "flex", gap: 1.75, mb: 2.25, alignItems: "center" }}>
              <Box sx={{ width: 48, height: 48, borderRadius: "50%", bgcolor: tokens.canvas, border: `1px solid ${tokens.border}`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flex: "none", fontWeight: 600, color: tokens.text2 }}>
                {freelancerUser?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={freelancerUser.avatar_url} alt={freelancerName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  freelancerName.charAt(0)
                )}
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontWeight: 600, fontSize: 15 }}>{freelancerName}</Typography>
                {service.rating_average && (
                  <Typography sx={{ fontSize: 12, fontWeight: 500, color: tokens.text2 }}>
                    ★ {Number(service.rating_average).toFixed(1)} ({service.rating_count})
                  </Typography>
                )}
              </Box>
            </Box>

            <Typography sx={{ fontSize: 16, fontWeight: 500, lineHeight: 1.4, mb: 2.25 }}>{service.title}</Typography>

            <Box sx={{ border: `1px solid ${tokens.border}`, borderRadius: `${tokens.radius.tile}px`, p: 2, mb: 2.5 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5, gap: 1 }}>
                <Typography sx={{ fontWeight: 600, fontSize: 14 }}>{selectedPricing.title}</Typography>
                <PayLogo id='khqr' size='sm' />
              </Box>
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <Meta icon={<ClockIcon sx={{ fontSize: 14, color: tokens.text3 }} />}>{deliveryText(selectedPricing.delivery_time)}</Meta>
                <Meta icon={<RevisionIcon sx={{ fontSize: 14, color: tokens.text3 }} />}>{revisionsText(selectedPricing.revisions)}</Meta>
              </Box>
              {selectedPricing.description && (
                <Typography sx={{ mt: 1.5, fontSize: 13.5, color: tokens.text2, lineHeight: 1.5 }}>{selectedPricing.description}</Typography>
              )}
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <PriceRow label='Package price' value={fmtUsd(total)} />
              <Box sx={{ height: 1, bgcolor: tokens.border }} />
              <PriceRow label='Total' sub='USD · charged once' value={fmtUsd(total)} strong />
            </Box>

            <Box sx={{ display: "flex", gap: 1, mt: 2.25, p: "12px 14px", bgcolor: tokens.pendingTint, borderRadius: `${tokens.radius.tile}px` }}>
              <ShieldIcon sx={{ fontSize: 16, color: tokens.pendingText, flex: "none" }} />
              <Typography sx={{ fontSize: 12.5, color: tokens.pendingText, lineHeight: 1.4 }}>
                Funds are held in escrow and released to {freelancerName.split(" ")[0]} only when you mark the order complete.
              </Typography>
            </Box>
          </Card>

          {/* ---- How to pay ---- */}
          <Card>
            <Typography sx={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.015em", mb: 2.25 }}>How would you like to pay?</Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <PaymentOption selected={paySource === "wallet"} onClick={() => setPaySource("wallet")}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1.5 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <IconTile>
                      <WalletIcon sx={{ fontSize: 20, color: tokens.text }} />
                    </IconTile>
                    <Box>
                      <Typography sx={{ fontWeight: 600, fontSize: 15 }}>Wallet balance</Typography>
                      <Typography sx={{ fontSize: 13, color: tokens.text2 }}>{fmtUsd(balance)} available</Typography>
                    </Box>
                  </Box>
                  {insufficient && <StatusChip status='error' dot={false}>Low</StatusChip>}
                </Box>
              </PaymentOption>

              <PaymentOption selected={paySource === "aba"} onClick={() => setPaySource("aba")}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1.5 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <IconTile>
                      <CardIcon sx={{ fontSize: 20, color: tokens.text }} />
                    </IconTile>
                    <Box>
                      <Typography sx={{ fontWeight: 600, fontSize: 15 }}>ABA PayWay</Typography>
                      <Typography sx={{ fontSize: 13, color: tokens.text2 }}>KHQR, card, Alipay or WeChat</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", gap: 0.75, flexShrink: 0 }}>
                    {(["khqr", "visa", "mc"] as const).map(l => (
                      <PayLogo key={l} id={l} size='sm' />
                    ))}
                  </Box>
                </Box>
              </PaymentOption>
            </Box>

            {/* Insufficient balance inline path */}
            {paySource === "wallet" && insufficient && (
              <Box sx={{ mt: 2, p: 2, border: `1px solid ${tokens.errorTint}`, bgcolor: tokens.errorTint, borderRadius: `${tokens.radius.cardSm}px` }}>
                <Box sx={{ display: "flex", gap: 1, mb: 1.25, alignItems: "center" }}>
                  <InfoIcon sx={{ fontSize: 16, color: tokens.errorText }} />
                  <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: tokens.errorText }}>Insufficient balance</Typography>
                </Box>
                <Typography sx={{ fontSize: 13, color: tokens.errorText, mb: 1.5 }}>
                  You need {fmtUsd(total - balance)} more to cover this order. Top up your wallet, then come back to finish.
                </Typography>
                <Button
                  onClick={() => setTopUpOpen(true)}
                  startIcon={<AddIcon sx={{ fontSize: 15 }} />}
                  sx={{ height: 36, borderRadius: "999px", bgcolor: "rgba(0,0,0,0.05)", color: "#000", textTransform: "none", fontSize: 13, fontWeight: 500, px: 2, "&:hover": { bgcolor: "rgba(0,0,0,0.1)" } }}>
                  Top up {fmtUsd(topUpSuggested)}
                </Button>
              </Box>
            )}

            {/* ABA method selector (step 6) */}
            {paySource === "aba" && (
              <Box sx={{ mt: 2.25 }}>
                <AbaMethodSelector value={abaMethod} onChange={setAbaMethod} />
              </Box>
            )}

            <Box sx={{ mt: 2.75 }}>
              <Button
                fullWidth
                disabled={!canPay}
                onClick={handleConfirm}
                startIcon={paySource === "wallet" ? <CheckIcon sx={{ fontSize: 16 }} /> : <LockIcon sx={{ fontSize: 16 }} />}
                sx={{
                  height: 52,
                  borderRadius: "999px",
                  bgcolor: "#000",
                  color: "#fff",
                  textTransform: "none",
                  fontSize: 16,
                  fontWeight: 500,
                  "&:hover": { bgcolor: "rgba(0,0,0,0.8)" },
                  "&.Mui-disabled": { bgcolor: "rgba(0,0,0,0.18)", color: "#fff" },
                }}>
                {paySource === "wallet" ? `Pay ${fmtUsd(total)} from wallet` : `Confirm & Pay ${fmtUsd(total)}`}
              </Button>
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 0.75, mt: 1.5, color: tokens.text3 }}>
                <LockIcon sx={{ fontSize: 12 }} />
                <Typography sx={{ fontSize: 12 }}>Secured by ABA PayWay · you can review before paying</Typography>
              </Box>
            </Box>
          </Card>
        </Box>

        <Box sx={{ borderTop: `1px solid ${tokens.border}`, mt: 3, pt: 3 }}>
          <PaymentFooterLogos variant='light' />
        </Box>
      </Container>

      {/* Overlays */}
      <TopUpDialog
        open={topUpOpen}
        onClose={() => setTopUpOpen(false)}
        currentBalance={balance}
        suggestedAmount={topUpSuggested}
        returnNote='Top up, then come back to finish your order.'
        onSuccess={() => qc.invalidateQueries({ queryKey: qk.wallet() })}
      />
      {flow.overlay}
      {gateDialog}
    </Box>
  );
}

/* ---- local presentational helpers ---- */
function HeaderBar({ onBack, label }: { onBack: () => void; label: string }) {
  return (
    <Box sx={{ bgcolor: "#fff", borderBottom: `1px solid ${tokens.border}` }}>
      <Container maxWidth='lg' sx={{ px: 3, py: 2 }}>
        <Button onClick={onBack} startIcon={<ChevronLeft />} sx={{ fontSize: 12, color: tokens.text2, textTransform: "none", "&:hover": { color: "#000", bgcolor: "transparent" } }}>
          {label}
        </Button>
      </Container>
    </Box>
  );
}
function Card({ children }: { children: React.ReactNode }) {
  return <Box sx={{ bgcolor: tokens.surface, border: `1px solid ${tokens.border}`, borderRadius: `${tokens.radius.card}px`, p: { xs: 2.75, md: 3.5 } }}>{children}</Box>;
}
function Label({ children }: { children: React.ReactNode }) {
  return <Typography sx={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: tokens.text3 }}>{children}</Typography>;
}
function Meta({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, fontSize: 12, fontWeight: 500, color: tokens.text2 }}>
      {icon} {children}
    </Box>
  );
}
function IconTile({ children }: { children: React.ReactNode }) {
  return <Box sx={{ width: 38, height: 38, borderRadius: "10px", bgcolor: "rgba(0,0,0,0.05)", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>{children}</Box>;
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
          <CircularProgress sx={{ color: tokens.accent }} />
        </Box>
      }>
      <CheckoutContent />
    </Suspense>
  );
}
