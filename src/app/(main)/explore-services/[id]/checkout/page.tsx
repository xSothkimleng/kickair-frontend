"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Check, Clock, CreditCard, Info, Lock, Plus, RotateCw, ShieldCheck, Wallet } from "lucide-react";
import { css, cx } from "styled-system/css";
import { Alert, Spinner } from "@/components/ds";
import { api } from "@/lib/api";
import { qk } from "@/lib/queryKeys";
import { useAuth } from "@/components/context/AuthContext";
import { usePurchaseGate, type PurchaseSummary } from "@/components/purchase/PurchaseGate";
import { deliveryText, revisionsText } from "@/lib/serviceFormat";
import RichTextDisplay from "@/components/ui/RichTextDisplay";
import type { ServiceDetailResponse } from "@/types/service";
import type { CreateOrderResponse } from "@/types/order";
import type { Wallet as WalletType } from "@/types/wallet";
import { serviceCoverUrl } from "@/lib/serviceCover";
import { pillButton } from "@/components/payment/pill";
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

/* ---- styles ---- */
const pageCss = css({ minH: "100vh", bg: "canvas", pb: "16px" });
const centeredCss = css({ minH: "100vh", bg: "canvas", display: "flex", justifyContent: "center", alignItems: "center", color: "accent" });
const containerCss = css({ w: "100%", boxSizing: "border-box", maxW: "1200px", mx: "auto" });
const headerBarCss = css({ bg: "#fff", borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "hairline" });
const headerInnerCss = css({ px: "24px", py: "16px" });
const backBtnCss = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  boxSizing: "border-box",
  minW: "64px",
  p: "6px 8px",
  ml: "-4px",
  m: 0,
  border: "none",
  borderRadius: "4px",
  bg: "transparent",
  color: "ink2",
  textStyle: "meta",
  fontWeight: 500,
  cursor: "pointer",
  transition: "color .25s",
  _hover: { color: "#000", bg: "transparent" },
  "& svg": { display: "block", flexShrink: 0 },
});
const bodyCss = css({ px: { base: "16px", md: "32px" }, py: { base: "24px", md: "40px" } });
const titleRowCss = css({ display: "flex", justifyContent: "space-between", alignItems: "flex-end", mb: { base: "20px", md: "28px" }, gap: "16px" });
const titleColCss = css({ display: "flex", flexDirection: "column", gap: "8px" });
const titleCss = css({ textStyle: { base: "stat", md: "display" }, fontWeight: 600 });
const titleAsideCss = css({ display: { base: "none", md: "block" } });
const gridCss = css({ display: "grid", gridTemplateColumns: { base: "1fr", md: "1fr 1fr" }, gap: { base: "16px", md: "24px" }, alignItems: "start" });
const cardCss = css({
  bg: "surface",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "hairline",
  borderRadius: "card",
  p: { base: "22px", md: "28px" },
});
const labelCss = css({ textStyle: "eyebrow", fontWeight: 600, color: "ink3" });
const summaryHeadCss = css({ display: "flex", justifyContent: "space-between", alignItems: "center", mb: "18px" });
const sellerRowCss = css({ display: "flex", gap: "14px", mb: "18px", alignItems: "center" });
const sellerAvatarCss = css({
  boxSizing: "border-box",
  w: "48px",
  h: "48px",
  borderRadius: "50%",
  bg: "canvas",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "hairline",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
  flex: "none",
  fontWeight: 600,
  color: "ink2",
});
const sellerNameCss = css({ fontWeight: 600, textStyle: "body" });
const sellerRatingCss = css({ textStyle: "meta", fontWeight: 500, color: "ink2" });
const serviceTitleCss = css({ textStyle: "lead", fontWeight: 500 });
const tierBoxCss = css({ borderWidth: "1px", borderStyle: "solid", borderColor: "hairline", borderRadius: "tile", p: "16px", mb: "20px" });
const tierHeadCss = css({ display: "flex", justifyContent: "space-between", alignItems: "center", mb: "12px", gap: "8px" });
const tierTitleCss = css({ fontWeight: 600, textStyle: "body" });
const tierMetaRowCss = css({ display: "flex", gap: "16px", flexWrap: "wrap" });
const metaCss = css({ display: "flex", alignItems: "center", gap: "6px", textStyle: "meta", fontWeight: 500, color: "ink2", "& svg": { color: "ink3", flexShrink: 0 } });
const tierDescCss = css({
  mt: "12px",
  textStyle: "ui",
  color: "ink2",
  "& p": { m: 0 },
  "& ul, & ol": { m: 0, pl: "20px" },
});
const priceColCss = css({ display: "flex", flexDirection: "column", gap: "12px" });
const hairlineCss = css({ h: "1px", bg: "hairline" });
// Escrow is reassurance, not a warning: a quiet line (no box, no status tint) with a green shield.
const escrowCss = css({ display: "flex", alignItems: "flex-start", gap: "8px", mt: "16px" });
const escrowIconCss = css({ color: "successText", flex: "none", mt: "1px" });
const escrowTextCss = css({ textStyle: "meta", color: "ink2" });
const payHeadingCss = css({ textStyle: "title", fontWeight: 600 });
const optionsColCss = css({ display: "flex", flexDirection: "column", gap: "12px" });
const optionRowCss = css({ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" });
const optionLeftCss = css({ display: "flex", alignItems: "center", gap: "12px" });
const optionTitleCss = css({ fontWeight: 600, textStyle: "body" });
const optionSubCss = css({ textStyle: "ui", color: "ink2" });
const payLogosCss = css({ display: "flex", gap: "6px", flexShrink: 0 });
const iconTileCss = css({ w: "38px", h: "38px", borderRadius: "10px", bg: "rgba(0,0,0,0.05)", display: "flex", alignItems: "center", justifyContent: "center", flex: "none", color: "ink" });
const lowBalanceCss = css({
  mt: "16px",
  p: "16px",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "errorTint",
  bg: "errorTint",
  borderRadius: "cardSm",
});
const lowBalanceHeadCss = css({ display: "flex", gap: "8px", mb: "10px", alignItems: "center", color: "errorText" });
const lowBalanceTitleCss = css({ textStyle: "ui", fontWeight: 600, color: "errorText" });
const lowBalanceTextCss = css({ textStyle: "ui", color: "errorText" });
const topUpBtnCss = css({ px: "16px", fontWeight: 500 });
const abaWrapCss = css({ mt: "18px" });
const ctaWrapCss = css({ mt: "22px" });
const secureNoteCss = css({ display: "flex", justifyContent: "center", alignItems: "center", gap: "6px", mt: "12px", color: "ink3" });
const secureNoteTextCss = css({ textStyle: "meta" });
const footerCss = css({ borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "hairline", mt: "24px", pt: "24px" });
const ownWrapCss = css({ minH: "100vh", bg: "canvas", display: "flex", alignItems: "center", justifyContent: "center" });
const ownInnerCss = css({ textAlign: "center" });
const ownTextCss = css({ textStyle: "lead", fontWeight: 600 });
const ownBtnCss = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  boxSizing: "border-box",
  minW: "64px",
  minH: "36.5px",
  p: "5px 15px",
  m: 0,
  bg: "transparent",
  color: "#000",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "rgba(25, 118, 210, 0.5)",
  borderRadius: "112px",
  textStyle: "body",
  fontWeight: 500,
  cursor: "pointer",
  transition: "background-color .25s, border-color .25s",
  _hover: { bg: "rgba(25, 118, 210, 0.04)", borderColor: "#1976d2" },
});
const errorWrapCss = css({ px: "24px", py: "32px" });

function CheckoutContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
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
    queryFn: async () => (await api.get("/api/wallet")).data as WalletType,
  });

  const selectedPricing = service?.pricing_options?.find(p => p.id === Number(pricingOptionId)) ?? null;
  const total = selectedPricing ? Number(selectedPricing.price_raw) : 0;
  const balance = wallet ? parseFloat(wallet.available_balance_raw) : 0;
  const insufficient = balance < total;
  const topUpSuggested = Math.max(10, Math.ceil((total - balance) / 5) * 5);
  // Wallet-as-hub: ABA only ever tops up the exact shortfall — the wallet then
  // funds the full gig price into escrow. The client never pays more than sticker.
  const shortfall = Math.max(0, Math.round((total - balance) * 100) / 100);
  const walletCovers = Math.round((total - shortfall) * 100) / 100;

  // Purchase gate — carries the order context and returns the buyer to this exact
  // checkout after they authenticate / add a client role.
  const gateSummary: PurchaseSummary | null =
    service && selectedPricing
      ? {
          imageUrl: serviceCoverUrl(service),
          title: service.title,
          tierLabel: selectedPricing.title,
          sellerName: service.freelancer_profile?.user?.name ?? null,
          metaLine: `${deliveryText(selectedPricing.delivery_time)} · ${revisionsText(selectedPricing.revisions)}`,
          amount: total,
        }
      : null;
  const { ensureCanPurchase, gateDialog } = usePurchaseGate({
    summary: gateSummary,
    redirectTo: `/explore-services/${serviceId}/checkout?pricing_option_id=${pricingOptionId ?? ""}`,
  });

  const flow = usePaymentProcessing({
    context: "checkout",
    merchant: "KickAir",
    perform: async () => {
      if (!selectedPricing) throw new Error("No package selected");
      // ABA path: top up exactly the shortfall into the wallet first, then the
      // wallet funds the full order — one pool, one escrow entry.
      if (paySource === "aba" && shortfall > 0) {
        await api.post("/api/wallet/deposit", { amount: shortfall });
      }
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
    // ABA charges only the shortfall (or the full price when the wallet is empty).
    else if (paySource === "aba" && abaMethod) flow.startAba(abaMethod, shortfall > 0 ? shortfall : total);
  };

  if (isLoading) {
    return (
      <div className={centeredCss}>
        <Spinner size={40} />
      </div>
    );
  }

  const isOwnService = !!(service && user?.is_freelancer && user.freelancer_profile?.id === service.freelancer_profile_id);
  if (isOwnService) {
    return (
      <div className={ownWrapCss}>
        <div className={ownInnerCss}>
          <p className={ownTextCss}>You cannot purchase your own service</p>
          <button type='button' onClick={() => router.back()} className={ownBtnCss}>
            Go back
          </button>
        </div>
      </div>
    );
  }

  if (error || !service || !selectedPricing) {
    return (
      <div className={css({ minH: "100vh", bg: "canvas" })}>
        <HeaderBar onBack={() => router.back()} label='Go Back' />
        <div className={cx(containerCss, errorWrapCss)}>
          <Alert tone='error'>{error instanceof Error ? error.message : "Unable to load checkout"}</Alert>
        </div>
      </div>
    );
  }

  const freelancerUser = service.freelancer_profile?.user;
  const freelancerName = freelancerUser?.name || "Freelancer";

  return (
    <div className={pageCss}>
      <HeaderBar onBack={() => router.back()} label='Back to Service' />

      <div className={cx(containerCss, bodyCss)}>
        {/* Title */}
        <div className={titleRowCss}>
          <div className={titleColCss}>
            <Annot>{["STEP 1 · order initiated", "STEP 3 · proceed to checkout"]}</Annot>
            <p className={titleCss}>Checkout</p>
          </div>
          <div className={titleAsideCss}>
            <Annot>Billing address skipped (STEP 5 — digital service)</Annot>
          </div>
        </div>

        <div className={gridCss}>
          {/* ---- Order summary ---- */}
          <div className={cardCss}>
            <div className={summaryHeadCss}>
              <span className={labelCss}>Order summary</span>
              <Annot>STEP 2</Annot>
            </div>

            <div className={sellerRowCss}>
              <div className={sellerAvatarCss}>
                {freelancerUser?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={freelancerUser.avatar_url} alt={freelancerName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  freelancerName.charAt(0)
                )}
              </div>
              <div className={css({ minW: 0 })}>
                <p className={sellerNameCss}>{freelancerName}</p>
                {service.rating_average && (
                  <p className={sellerRatingCss}>
                    ★ {Number(service.rating_average).toFixed(1)} ({service.rating_count})
                  </p>
                )}
              </div>
            </div>

            <p className={serviceTitleCss}>{service.title}</p>

            <div className={tierBoxCss}>
              <div className={tierHeadCss}>
                <p className={tierTitleCss}>{selectedPricing.title}</p>
              </div>
              <div className={tierMetaRowCss}>
                <span className={metaCss}>
                  <Clock size={14} /> {deliveryText(selectedPricing.delivery_time)}
                </span>
                <span className={metaCss}>
                  <RotateCw size={14} /> {revisionsText(selectedPricing.revisions)}
                </span>
              </div>
              {selectedPricing.description && (
                <div className={tierDescCss}>
                  <RichTextDisplay value={selectedPricing.description} />
                </div>
              )}
            </div>

            <div className={priceColCss}>
              <PriceRow label='Package price' value={fmtUsd(total)} />
              {paySource === "aba" && shortfall > 0 && (
                <>
                  <PriceRow label='Paid from wallet' value={`−${fmtUsd(walletCovers)}`} />
                  <PriceRow label='Top-up via bank transfer' value={fmtUsd(shortfall)} />
                </>
              )}
              <div className={hairlineCss} />
              {paySource === "aba" && shortfall > 0 ? (
                <PriceRow label='Charged now' sub='USD · only the shortfall — no service fees' value={fmtUsd(shortfall)} strong />
              ) : (
                <PriceRow label='Total' sub='USD · charged once · no service fees' value={fmtUsd(total)} strong />
              )}
            </div>

            <div className={escrowCss}>
              <ShieldCheck size={16} className={escrowIconCss} />
              <p className={escrowTextCss}>
                Funds are held in escrow and released to {freelancerName.split(" ")[0]} only when you mark the order complete.
              </p>
            </div>
          </div>

          {/* ---- How to pay ---- */}
          <div className={cardCss}>
            <p className={payHeadingCss}>How would you like to pay?</p>

            <div className={optionsColCss}>
              <PaymentOption selected={paySource === "wallet"} onClick={() => setPaySource("wallet")}>
                <div className={optionRowCss}>
                  <div className={optionLeftCss}>
                    <span className={iconTileCss}>
                      <Wallet size={20} />
                    </span>
                    <div>
                      <p className={optionTitleCss}>Wallet balance</p>
                      <p className={optionSubCss}>{fmtUsd(balance)} available</p>
                    </div>
                  </div>
                  {insufficient && <StatusChip status='error' dot={false}>Low</StatusChip>}
                </div>
              </PaymentOption>

              <PaymentOption selected={paySource === "aba"} onClick={() => setPaySource("aba")}>
                <div className={optionRowCss}>
                  <div className={optionLeftCss}>
                    <span className={iconTileCss}>
                      <CreditCard size={20} />
                    </span>
                    <div>
                      <p className={optionTitleCss}>Bank Transfer</p>
                      <p className={optionSubCss}>
                        {shortfall > 0 && shortfall < total
                          ? `Tops up the ${fmtUsd(shortfall)} shortfall — wallet covers the rest`
                          : "KHQR, card, Alipay or WeChat"}
                      </p>
                    </div>
                  </div>
                  <div className={payLogosCss}>
                    {(["visa", "mc"] as const).map(l => (
                      <PayLogo key={l} id={l} size='sm' />
                    ))}
                  </div>
                </div>
              </PaymentOption>
            </div>

            {/* Insufficient balance inline path */}
            {paySource === "wallet" && insufficient && (
              <div className={lowBalanceCss}>
                <div className={lowBalanceHeadCss}>
                  <Info size={16} />
                  <p className={lowBalanceTitleCss}>Insufficient balance</p>
                </div>
                <p className={lowBalanceTextCss}>
                  You need {fmtUsd(total - balance)} more to cover this order. Top up your wallet to continue.
                </p>
                <button
                  type='button'
                  onClick={() => setTopUpOpen(true)}
                  className={cx(pillButton({ tone: "grey", size: "sm" }), topUpBtnCss)}>
                  <Plus size={15} />
                  Top up {fmtUsd(topUpSuggested)}
                </button>
              </div>
            )}

            {/* ABA method selector (step 6) */}
            {paySource === "aba" && (
              <div className={abaWrapCss}>
                <AbaMethodSelector value={abaMethod} onChange={setAbaMethod} />
              </div>
            )}

            <div className={ctaWrapCss}>
              <button
                type='button'
                disabled={!canPay}
                onClick={handleConfirm}
                className={pillButton({ tone: "black", size: "lg", full: true })}>
                {paySource === "wallet" ? <Check size={16} /> : <Lock size={16} />}
                {paySource === "wallet"
                  ? `Pay ${fmtUsd(total)} from wallet`
                  : shortfall > 0
                    ? `Confirm & Pay ${fmtUsd(shortfall)} via ABA`
                    : `Confirm & Pay ${fmtUsd(total)}`}
              </button>
              <div className={secureNoteCss}>
                <Lock size={12} />
                <p className={secureNoteTextCss}>Secured bank transfer · you can review before paying</p>
              </div>
            </div>
          </div>
        </div>

        <div className={footerCss}>
          <PaymentFooterLogos variant='light' />
        </div>
      </div>

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
    </div>
  );
}

/* ---- local presentational helpers ---- */
function HeaderBar({ onBack, label }: { onBack: () => void; label: string }) {
  return (
    <div className={headerBarCss}>
      <div className={cx(containerCss, headerInnerCss)}>
        <button type='button' onClick={onBack} className={backBtnCss}>
          <ArrowLeft size={20} />
          {label}
        </button>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className={css({ display: "flex", justifyContent: "center", alignItems: "center", minH: "100vh", color: "accent" })}>
          <Spinner size={40} />
        </div>
      }>
      <CheckoutContent />
    </Suspense>
  );
}
