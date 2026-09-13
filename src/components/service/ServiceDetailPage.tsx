"use client";

import { useState, useEffect } from "react";
import RichTextDisplay from "@/components/ui/RichTextDisplay";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Clock,
  ExternalLink,
  FileText,
  Heart,
  MapPin,
  MessageCircle,
  PlayCircle,
  Receipt,
  RefreshCw,
  Share2,
  Shield,
  ShoppingBag,
  Star,
} from "lucide-react";
import { css, cx } from "styled-system/css";
import { Alert, Avatar, Spinner, toast } from "@/components/ds";
import { BareModal } from "@/components/ds/BareModal";
import { api } from "@/lib/api";
import { Service, ServiceDetailResponse } from "@/types/service";
import { useAuth } from "@/components/context/AuthContext";
import RequestCustomOrderDialog from "@/components/customOrders/RequestCustomOrderDialog";
import { usePurchaseGate, type PurchaseSummary } from "@/components/purchase/PurchaseGate";
import { useServiceListingLive } from "@/hooks/useServiceListingLive";
import { deliveryText, revisionsText } from "@/lib/serviceFormat";
import { LevelBadge } from "@/components/profile/profileKit";

interface ServiceDetailPageProps {
  serviceId: number;
}

/* ── layout ────────────────────────────────────────────────────────────────── */
const pageCss = css({ minH: "100vh", bg: "page" });
const centeredCss = css({ minH: "100vh", bg: "page", display: "flex", justifyContent: "center", alignItems: "center", color: "accent" });
const headerBarCss = css({ bg: "white", borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "hairline" });
const containerCss = css({ w: "100%", boxSizing: "border-box", maxW: "1200px", mx: "auto", px: { base: "16px", sm: "24px" } });
const containerXlCss = css({ w: "100%", boxSizing: "border-box", maxW: "1536px", mx: "auto", px: "24px" });
const headerPadCss = css({ py: "16px" });
const mainPadCss = css({ py: "32px" });
const errorPadCss = css({ py: "32px" });

/** MUI text Button (medium) with a 20px start icon. */
const textBtnCss = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  boxSizing: "border-box",
  minW: "64px",
  p: "6px 8px",
  m: 0,
  border: "none",
  borderRadius: "4px",
  bg: "transparent",
  fontFamily: "inherit",
  fontWeight: 500,
  lineHeight: 1.75,
  letterSpacing: "0.02857em",
  cursor: "pointer",
  transition: "background-color .25s, color .25s",
  "& svg": { display: "block", flexShrink: 0 },
});
const backBtnCss = css({
  ml: "-4px",
  gap: "8px",
  color: "ink2",
  fontSize: "12px",
  _hover: { color: "black", bg: "transparent" },
});
const viewProfileCss = css({ color: "accent", fontSize: "13px", _hover: { bg: "rgba(0, 113, 227, 0.04)" } });

/** MUI contained/outlined Button, pill radius, 44px tall (the sidebar CTAs). */
const ctaCss = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  boxSizing: "border-box",
  w: "100%",
  h: "44px",
  p: "6px 16px",
  m: 0,
  border: "none",
  borderRadius: "112px",
  fontFamily: "inherit",
  fontSize: "13px",
  fontWeight: 500,
  lineHeight: 1.75,
  letterSpacing: "0.02857em",
  cursor: "pointer",
  transition: "background-color .25s, box-shadow .25s, border-color .25s",
  _disabled: { cursor: "default", pointerEvents: "none" },
  "& svg": { display: "block", flexShrink: 0 },
});
const ctaAccentCss = css({
  bg: "accent",
  color: "white",
  boxShadow: "rgba(0,0,0,0.2) 0px 2px 1px -1px, rgba(0,0,0,0.14) 0px 1px 1px 0px, rgba(0,0,0,0.12) 0px 1px 3px 0px",
  _hover: { bg: "accentHover", boxShadow: "rgba(0,0,0,0.2) 0px 3px 1px -2px, rgba(0,0,0,0.14) 0px 2px 2px 0px, rgba(0,0,0,0.12) 0px 1px 5px 0px" },
  _disabled: { bg: "rgba(0,0,0,0.12)", color: "rgba(0,0,0,0.26)", boxShadow: "none" },
});
const ctaBlackCss = css({ bg: "black", color: "white", boxShadow: "none", _hover: { bg: "rgba(0,0,0,0.82)", boxShadow: "none" }, _disabled: { bg: "rgba(0,0,0,0.12)", color: "rgba(0,0,0,0.26)" } });
const ctaOutlineCss = css({
  p: "5px 15px",
  bg: "white",
  color: "black",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "rgba(0,0,0,0.1)",
  _hover: { borderColor: "rgba(0,0,0,0.2)", bg: "white" },
  _disabled: { bg: "white", borderColor: "rgba(0,0,0,0.12)", color: "rgba(0,0,0,0.26)" },
});
const ctaGreyCss = css({
  p: "5px 15px",
  bg: "rgba(0,0,0,0.04)",
  color: "black",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "rgba(0,0,0,0.15)",
  _hover: { bg: "rgba(0,0,0,0.07)", borderColor: "rgba(0,0,0,0.25)" },
});

const cardCss = css({
  bg: "surface",
  borderRadius: "card",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "hairline",
});
const cardPadCss = css({ p: "24px" });

/* ── banners ───────────────────────────────────────────────────────────────── */
const bannerCss = css({ mb: "24px", p: "16px", borderRadius: "8px", borderWidth: "1px", borderStyle: "solid", display: "flex", gap: "10px", alignItems: "flex-start" });
const bannerWarnCss = css({ bg: "rgba(245, 158, 11, 0.08)", borderColor: "rgba(245, 158, 11, 0.3)" });
const bannerErrCss = css({ bg: "rgba(220, 38, 38, 0.06)", borderColor: "rgba(220, 38, 38, 0.25)" });
const bannerIconWarnCss = css({ color: "#b45309", mt: "1px", flexShrink: 0 });
const bannerIconErrCss = css({ color: "#dc2626", mt: "1px", flexShrink: 0 });
const bannerTitleWarnCss = css({ fontSize: "13px", fontWeight: 600, lineHeight: 1.5, color: "#b45309" });
const bannerTitleErrCss = css({ fontSize: "13px", fontWeight: 600, lineHeight: 1.5, color: "#dc2626" });
const bannerBodyCss = css({ fontSize: "12px", lineHeight: 1.5, color: "rgba(0,0,0,0.7)" });

/* ── grid ──────────────────────────────────────────────────────────────────── */
// MUI Grid `container spacing={4}` with 8/4 items: the columns lose a share of
// the 32px gutter, so reproduce its exact widths instead of a plain `2fr 1fr`.
const layoutCss = css({
  display: "grid",
  gridTemplateColumns: { base: "1fr", lg: "calc(66.6667% - 10.6667px) calc(33.3333% - 21.3333px)" },
  gap: "32px",
  alignItems: "start",
});
const leftColCss = css({ display: "flex", flexDirection: "column", gap: "24px", minW: 0 });
const stickyColCss = css({ position: "sticky", top: "96px", minW: 0 });

/* ── gallery ───────────────────────────────────────────────────────────────── */
const galleryCardCss = css({ overflow: "hidden" });
const galleryMainCss = css({ position: "relative", aspectRatio: "16/9", bg: "rgba(0,0,0,0.05)" });
const galleryEmptyCss = css({ w: "100%", h: "100%", display: "flex", alignItems: "center", justifyContent: "center", bg: "#e0e0e0", color: "ink2", fontSize: "16px" });
const thumbsCss = css({ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", p: "16px" });
const thumbCss = css({
  position: "relative",
  aspectRatio: "16/9",
  borderRadius: "8px",
  overflow: "hidden",
  borderWidth: "2px",
  borderStyle: "solid",
  borderColor: "rgba(0,0,0,0.1)",
  cursor: "pointer",
  transition: "all 0.2s",
  _hover: { borderColor: "rgba(0,0,0,0.2)" },
  "&[data-selected]": { borderColor: "accent", _hover: { borderColor: "accent" } },
});
const thumbVideoOverlayCss = css({ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", bg: "rgba(0,0,0,0.25)", color: "#fff" });
const thumbFallbackCss = css({ w: "100%", h: "100%", bg: "#e0e0e0" });

/* ── title block ───────────────────────────────────────────────────────────── */
const titleRowCss = css({ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" });
const breadcrumbCss = css({ display: "flex", alignItems: "center", gap: "4px", mb: "8px", flexWrap: "wrap" });
const crumbCss = css({ fontSize: "13px", fontWeight: 500, color: "accent" });
const crumbSepCss = css({ fontSize: "13px", color: "rgba(0,0,0,0.35)" });
const serviceTitleCss = css({ fontSize: "32px", fontWeight: 600, lineHeight: 1.167 });
const metaRowCss = css({ display: "flex", alignItems: "center", gap: "16px", fontSize: "13px", flexWrap: "wrap" });
const metaItemCss = css({ display: "flex", alignItems: "center", gap: "4px" });
const body2MutedCss = css({ fontSize: "14px", lineHeight: 1.43, color: "ink2" });
const body2StrongCss = css({ fontSize: "14px", lineHeight: 1.43, fontWeight: 600, color: "black" });
const iconMutedCss = css({ color: "ink2", flexShrink: 0 });
const starCss = css({ color: "#f59e0b", fill: "#f59e0b", flexShrink: 0 });
const actionsCss = css({ display: "flex", gap: "8px", flexShrink: 0 });
const roundBtnCss = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  boxSizing: "border-box",
  w: "40px",
  h: "40px",
  p: 0,
  m: 0,
  borderRadius: "50%",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "rgba(0,0,0,0.1)",
  bg: "white",
  color: "ink3",
  cursor: "pointer",
  fontFamily: "inherit",
  transition: "background-color .25s, border-color .25s, color .25s",
  _hover: { bg: "rgba(0,0,0,0.02)" },
  "& svg": { display: "block" },
  "&[data-active]": { bg: "#ffebee", borderColor: "#ffcdd2", color: "#f44336", _hover: { bg: "#ffebee" } },
});

/* ── freelancer card ───────────────────────────────────────────────────────── */
const flRowCss = css({ display: "flex", gap: "16px" });
const flMainCss = css({ flex: 1, minW: 0 });
const flHeadCss = css({ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" });
const flNameRowCss = css({ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" });
const flNameCss = css({ fontSize: "17px", fontWeight: 600, lineHeight: 1.6 });
const statsGridCss = css({
  display: "grid",
  gridTemplateColumns: { base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
  gap: "16px",
  pt: "16px",
  borderTopWidth: "1px",
  borderTopStyle: "solid",
  borderTopColor: "hairline",
});
const captionCss = css({ display: "block", fontSize: "12px", lineHeight: 1.66, color: "ink2" });
const statCaptionCss = css({ display: "block", fontSize: "12px", lineHeight: 1.66, color: "ink2", mb: "2px" });
const statValueCss = css({ fontSize: "14px", lineHeight: 1.43, fontWeight: 500 });

/* ── sections ──────────────────────────────────────────────────────────────── */
const sectionHeadingCss = css({ fontSize: "21px", fontWeight: 600, lineHeight: 1.334 });
const descBodyCss = css({ fontSize: "15px", color: "rgba(0,0,0,0.8)", lineHeight: 1.7 });
const tagsWrapCss = css({ mt: "24px" });
const tagsLabelCss = css({ fontWeight: 500, fontSize: "14px", lineHeight: 1.5, mb: "12px" });
const tagsRowCss = css({ display: "flex", flexWrap: "wrap", gap: "8px" });
const tagCss = css({
  display: "inline-flex",
  alignItems: "center",
  boxSizing: "border-box",
  h: "24px",
  px: "8px",
  borderRadius: "16px",
  bg: "rgba(0, 0, 0, 0.05)",
  color: "rgba(0, 0, 0, 0.7)",
  fontSize: "13px",
  whiteSpace: "nowrap",
});

const docListCss = css({ display: "flex", flexDirection: "column", gap: "8px" });
const docRowCss = css({
  display: "flex",
  alignItems: "center",
  gap: "12px",
  p: "12px 14px",
  borderRadius: "8px",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "hairline",
  textDecoration: "none",
  color: "inherit",
  transition: "all 0.15s",
  _hover: { borderColor: "rgba(0,0,0,0.2)", bg: "rgba(0,0,0,0.02)" },
});
const docIconCss = css({ w: "38px", h: "38px", borderRadius: "12px", bg: "rgba(220,38,38,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#dc2626" });
const docNameCss = css({ fontSize: "14px", fontWeight: 500, lineHeight: 1.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" });
const docMetaCss = css({ fontSize: "12px", lineHeight: 1.5, color: "rgba(0,0,0,0.5)" });

const faqListCss = css({ display: "flex", flexDirection: "column", gap: "12px", mt: "16px" });
const faqCardCss = css({ bg: "surface", borderRadius: "12px", borderWidth: "1px", borderStyle: "solid", borderColor: "rgba(0, 0, 0, 0.12)", overflow: "hidden" });
const faqBtnCss = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  w: "100%",
  boxSizing: "border-box",
  m: 0,
  p: "16px",
  border: "none",
  borderRadius: "4px",
  bg: "transparent",
  color: "black",
  fontFamily: "inherit",
  fontSize: "14px",
  fontWeight: 500,
  lineHeight: 1.75,
  letterSpacing: "0.02857em",
  textAlign: "left",
  cursor: "pointer",
  transition: "background-color .25s",
  _hover: { bg: "rgba(0,0,0,0.02)" },
  "& svg": { display: "block", flexShrink: 0 },
});
const faqQuestionCss = css({ fontSize: "15px", fontWeight: 500, lineHeight: 1.5 });
const faqAnswerWrapCss = css({ px: "16px", pb: "16px" });
const faqAnswerCss = css({ fontSize: "14px", lineHeight: 1.43, color: "rgba(0,0,0,0.7)" });

const reviewsHeadCss = css({ display: "flex", alignItems: "center", justifyContent: "space-between", mb: "24px" });
const reviewsScoreCss = css({ display: "flex", alignItems: "center", gap: "6px" });
const reviewsScoreValueCss = css({ fontSize: "18px", fontWeight: 700, lineHeight: 1.5, color: "black" });
const reviewListCss = css({ display: "flex", flexDirection: "column", gap: "24px" });
const reviewDividerCss = css({ h: "1px", bg: "border", mb: "24px", border: "none" });
const reviewRowCss = css({ display: "flex", gap: "16px" });
const reviewHeadCss = css({ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px", mb: "4px" });
const reviewNameCss = css({ fontSize: "14px", fontWeight: 600, lineHeight: 1.5 });
const reviewRightCss = css({ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px" });
const reviewStarsCss = css({ display: "flex" });
const reviewCommentCss = css({ fontSize: "14px", color: "rgba(0,0,0,0.8)", lineHeight: 1.6, mt: "8px" });
const starOffCss = css({ color: "rgba(0,0,0,0.15)", fill: "rgba(0,0,0,0.15)", flexShrink: 0 });

/* ── pricing panel ─────────────────────────────────────────────────────────── */
const pricingCardCss = css({ overflow: "hidden", mb: "16px" });
const tierTabsCss = css({ display: "flex", borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "hairline" });
const tierTabCss = css({
  flex: 1,
  boxSizing: "border-box",
  minW: "64px",
  m: 0,
  p: "12px 8px",
  border: "none",
  borderRadius: 0,
  bg: "transparent",
  color: "rgba(0,0,0,0.5)",
  fontFamily: "inherit",
  fontSize: "13px",
  fontWeight: 500,
  lineHeight: 1.75,
  letterSpacing: "0.02857em",
  cursor: "pointer",
  transition: "background-color .25s, color .25s",
  borderBottomWidth: "2px",
  borderBottomStyle: "solid",
  borderBottomColor: "transparent",
  _hover: { bg: "rgba(0,0,0,0.02)", color: "rgba(0,0,0,0.7)" },
  "&[data-selected]": { color: "black", borderBottomColor: "accent" },
});
const priceCss = css({ fontSize: "32px", fontWeight: 600, lineHeight: 1.167, mb: "4px" });
const priceMetaRowCss = css({ display: "flex", gap: "16px", fontSize: "13px", color: "ink2", mb: "16px" });
const priceMetaItemCss = css({ display: "flex", alignItems: "center", gap: "4px" });
const priceMetaTextCss = css({ fontSize: "12px", lineHeight: 1.66 });
const priceBlockCss = css({ mb: "24px" });
const tierDescCss = css({ fontSize: "14px", color: "rgba(0,0,0,0.7)", mb: "24px" });
const ctaColCss = css({ display: "flex", flexDirection: "column", gap: "12px" });
const ownNoticeCss = css({ textAlign: "center", py: "10px", px: "16px", bg: "rgba(0,0,0,0.04)", borderRadius: "112px" });
const ownNoticeTextCss = css({ fontSize: "13px", lineHeight: 1.5, color: "rgba(0,0,0,0.5)", fontWeight: 500 });
const noPricingTextCss = css({ color: "ink2", textAlign: "center", fontSize: "16px", lineHeight: 1.5, mb: "16px" });

const trustColCss = css({ display: "flex", flexDirection: "column", gap: "12px" });
const trustRowCss = css({ display: "flex", gap: "12px" });
const trustIconCss = css({ color: "accent", mt: "4px", flexShrink: 0 });
const trustTitleCss = css({ fontSize: "13px", fontWeight: 500, lineHeight: 1.43 });

/* ── live-edit guard dialog ────────────────────────────────────────────────── */
const guardPanelCss = css({ borderRadius: "12px" });
const guardBodyCss = css({ p: "24px 24px 20px" });
const guardTitleCss = css({ fontSize: "17px", fontWeight: 600, lineHeight: 1.5 });
const guardTextCss = css({ fontSize: "13.5px", lineHeight: 1.6, color: "rgba(0,0,0,0.7)" });
const guardActionsCss = css({ display: "flex", p: "8px 24px 20px" });

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
  // "Contact Freelancer" — opens (or creates) the conversation with this service's owner.
  const [contacting, setContacting] = useState(false);
  const [imageError, setImageError] = useState<{ [key: string]: boolean }>({});
  // Set when a live "service.changed" event arrives for this service — the freelancer edited
  // (delisted) or deleted it while the visitor was on this page. Blocks purchases of the stale
  // version; the backend rejects them too as a safety net.
  const [listingChanged, setListingChanged] = useState(false);
  useServiceListingLive(serviceId, () => setListingChanged(true));

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

  // Mirrors `handleMessage` on the freelancer profile page: guests go to sign-in,
  // everyone else lands in the client messages view on the freelancer's conversation.
  const contactUserId = service?.freelancer_profile?.user_id ?? service?.freelancer_profile?.user?.id ?? null;

  const handleContact = async () => {
    if (!currentUser) {
      router.push("/auth/sign-in");
      return;
    }
    if (!contactUserId) return;
    setContacting(true);
    try {
      const conv = await api.startConversation(contactUserId);
      router.push(`/dashboard/client/messages?id=${conv.id}`);
    } catch (err) {
      setContacting(false);
      toast.error(err instanceof Error ? err.message : "Couldn't open the conversation. Please try again.");
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className={centeredCss}>
        <Spinner size={40} />
      </div>
    );
  }

  // Error state
  if (error || !service) {
    return (
      <div className={pageCss}>
        <div className={headerBarCss}>
          <button type='button' onClick={() => router.back()} className={cx(textBtnCss, backBtnCss)}>
            <ChevronLeft size={20} />
            Back to Services
          </button>
        </div>
        <div className={cx(containerXlCss, errorPadCss)}>
          <div className={css({ mb: "24px" })}>
            <Alert tone='error'>{error || "Service not found"}</Alert>
          </div>
          <button type='button' onClick={() => router.push("/explore-services")} className={cx(ctaCss, ctaAccentCss, css({ w: "auto", h: "36.5px", borderRadius: "4px", fontSize: "14px" }))}>
            Browse Services
          </button>
        </div>
      </div>
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
  // Gallery shows images (feature image first) then videos; PDFs get their own document list.
  const gallery: { type: "image" | "video"; url: string }[] = [
    ...sortedImageMedia.map(m => ({ type: "image" as const, url: m.file_url })),
    ...media.filter(m => m.file_type === "video").map(m => ({ type: "video" as const, url: m.file_url })),
  ];
  const documents = media.filter(m => m.file_type === "pdf");
  const selectedPricing = pricingOptions[selectedPackage];

  return (
    <div className={pageCss}>
      {/* Header */}
      <div className={headerBarCss}>
        <div className={cx(containerCss, headerPadCss)}>
          <button type='button' onClick={() => router.back()} className={cx(textBtnCss, backBtnCss)}>
            <ChevronLeft size={20} />
            Back to Services
          </button>
        </div>
      </div>

      <div className={cx(containerCss, mainPadCss)}>
        {/* Owner-only status banners */}
        {isOwnService && service.status === "pending_review" && (
          <div className={cx(bannerCss, bannerWarnCss)}>
            <Clock size={18} className={bannerIconWarnCss} />
            <div>
              <p className={bannerTitleWarnCss}>Pending review</p>
              <p className={bannerBodyCss}>
                This is a preview. Your service is awaiting admin approval and is not visible to the public yet.
              </p>
            </div>
          </div>
        )}
        {isOwnService && service.status === "rejected" && (
          <div className={cx(bannerCss, bannerErrCss)}>
            <Shield size={18} className={bannerIconErrCss} />
            <div>
              <p className={bannerTitleErrCss}>Rejected by admin</p>
              <p className={bannerBodyCss}>
                {service.rejection_reason || "No reason provided. Edit and resubmit your service for review."}
              </p>
            </div>
          </div>
        )}
        <div className={layoutCss}>
          {/* Left Column - Service Details */}
          <div className={leftColCss}>
            {/* Image Gallery */}
            <div className={cx(cardCss, galleryCardCss)}>
              <div className={galleryMainCss}>
                {gallery.length > 0 && gallery[selectedImage]?.type === "video" ? (
                  <video
                    key={gallery[selectedImage].url}
                    src={gallery[selectedImage].url}
                    controls
                    preload='metadata'
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", background: "#000" }}
                  />
                ) : gallery.length > 0 && !imageError[`main-${selectedImage}`] ? (
                  <Image
                    unoptimized={true}
                    src={(gallery[selectedImage] || gallery[0]).url}
                    alt={service.title}
                    fill
                    style={{ objectFit: "cover" }}
                    onError={() => handleImageError(`main-${selectedImage}`)}
                  />
                ) : (
                  <div className={galleryEmptyCss}>No image available</div>
                )}
              </div>
              {gallery.length > 1 && (
                <div className={thumbsCss}>
                  {gallery.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      data-selected={selectedImage === idx ? "" : undefined}
                      className={thumbCss}>
                      {item.type === "video" ? (
                        <>
                          <video
                            src={item.url}
                            preload='metadata'
                            muted
                            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none", background: "#000" }}
                          />
                          <div className={thumbVideoOverlayCss}>
                            <PlayCircle size={28} />
                          </div>
                        </>
                      ) : !imageError[`thumb-${idx}`] ? (
                        <Image
                          unoptimized={true}
                          src={item.url}
                          alt={`Gallery ${idx + 1}`}
                          fill
                          style={{ objectFit: "cover" }}
                          onError={() => handleImageError(`thumb-${idx}`)}
                        />
                      ) : (
                        <div className={thumbFallbackCss} />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Title & Actions */}
            <div className={titleRowCss}>
              <div>
                {service.category && (
                  <div className={breadcrumbCss}>
                    {service.category.parent && (
                      <>
                        <span className={crumbCss}>{service.category.parent.category_name}</span>
                        <span className={crumbSepCss}>›</span>
                      </>
                    )}
                    <span className={crumbCss}>{service.category.category_name}</span>
                  </div>
                )}
                <h3 className={serviceTitleCss}>{service.title}</h3>
                <div className={metaRowCss}>
                  {service.location && (
                    <div className={metaItemCss}>
                      <MapPin size={14} className={iconMutedCss} />
                      <p className={body2MutedCss}>{service.location}</p>
                    </div>
                  )}
                  {service.rating_count > 0 && (
                    <div className={metaItemCss}>
                      <Star size={15} className={starCss} />
                      <p className={body2StrongCss}>{parseFloat(String(service.rating_average)).toFixed(1)}</p>
                      <p className={body2MutedCss}>
                        ({service.rating_count} {service.rating_count === 1 ? "review" : "reviews"})
                      </p>
                    </div>
                  )}
                  <div className={metaItemCss}>
                    <ShoppingBag size={14} className={iconMutedCss} />
                    <p className={body2MutedCss}>{service.orders_count} orders</p>
                  </div>
                </div>
              </div>
              <div className={actionsCss}>
                <button
                  type='button'
                  aria-label={isFavorite ? "Remove from favourites" : "Add to favourites"}
                  onClick={() => setIsFavorite(!isFavorite)}
                  data-active={isFavorite ? "" : undefined}
                  className={roundBtnCss}>
                  <Heart size={24} className={isFavorite ? css({ fill: "currentcolor" }) : undefined} />
                </button>
                <button type='button' aria-label='Share' className={roundBtnCss}>
                  <Share2 size={24} />
                </button>
              </div>
            </div>

            {/* Freelancer Info Card */}
            <div className={cx(cardCss, cardPadCss)}>
              <div className={flRowCss}>
                <Avatar name={freelancerName} src={freelancerAvatar || null} px={64} />
                <div className={flMainCss}>
                  <div className={flHeadCss}>
                    <div className={flNameRowCss}>
                      <h6 className={flNameCss}>{freelancerName}</h6>
                      {freelancer?.level && <LevelBadge level={freelancer.level} small />}
                    </div>
                    <button
                      type='button'
                      onClick={() => router.push(`/find-freelancer/${freelancer?.id}`)}
                      className={cx(textBtnCss, viewProfileCss)}>
                      View Profile
                    </button>
                  </div>
                  <div className={statsGridCss}>
                    <div>
                      <span className={statCaptionCss}>Response Time</span>
                      <p className={statValueCss}>{"< 1 hour"}</p>
                    </div>
                    <div>
                      <span className={statCaptionCss}>Total Orders</span>
                      <p className={statValueCss}>{service.orders_count}</p>
                    </div>
                    <div>
                      <span className={statCaptionCss}>Member Since</span>
                      <p className={statValueCss}>
                        {user?.created_at
                          ? new Date(user.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })
                          : "—"}
                      </p>
                    </div>
                    <div>
                      <span className={statCaptionCss}>Languages</span>
                      <p className={statValueCss}>
                        {freelancer?.languages && freelancer.languages.length > 0
                          ? freelancer.languages
                              .slice(0, 2)
                              .map(l => l.name)
                              .join(", ")
                          : "—"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className={cx(cardCss, cardPadCss)}>
              <h5 className={sectionHeadingCss}>About This Service</h5>
              <div className={descBodyCss}>
                {service.description ? (
                  <RichTextDisplay value={service.description} />
                ) : (
                  <p className={css({ fontSize: "15px", lineHeight: 1.5, color: "rgba(0,0,0,0.8)" })}>No description available.</p>
                )}
              </div>

              {/* Tags */}
              {service.search_tags && service.search_tags.length > 0 && (
                <div className={tagsWrapCss}>
                  <p className={tagsLabelCss}>Tags</p>
                  <div className={tagsRowCss}>
                    {service.search_tags.map((tag, index) => (
                      <span key={index} className={tagCss}>{tag}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Documents (PDF work samples) */}
            {documents.length > 0 && (
              <div className={cx(cardCss, cardPadCss)}>
                <h5 className={cx(sectionHeadingCss, css({ mb: "16px" }))}>Documents</h5>
                <div className={docListCss}>
                  {documents.map(doc => (
                    <a
                      key={doc.id}
                      href={doc.file_url}
                      target='_blank'
                      rel='noopener noreferrer'
                      className={docRowCss}>
                      <span className={docIconCss}>
                        <FileText size={20} />
                      </span>
                      <div className={css({ flex: 1, minW: 0 })}>
                        <p className={docNameCss}>{doc.file_name}</p>
                        <p className={docMetaCss}>
                          PDF{doc.file_size ? ` · ${(doc.file_size / 1024 / 1024).toFixed(1)} MB` : ""}
                        </p>
                      </div>
                      <ExternalLink size={16} className={css({ color: "rgba(0,0,0,0.35)", flexShrink: 0 })} />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* FAQ */}
            {faqs.length > 0 && (
              <div className={cx(cardCss, cardPadCss)}>
                <h5 className={sectionHeadingCss}>Frequently Asked Questions</h5>
                <div className={faqListCss}>
                  {faqs.map((faq, idx) => (
                    <div key={idx} className={faqCardCss}>
                      <button
                        type='button'
                        aria-expanded={openFaq === idx}
                        onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                        className={faqBtnCss}>
                        <span className={faqQuestionCss}>{faq.question}</span>
                        {openFaq === idx ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                      </button>
                      {openFaq === idx && (
                        <div className={faqAnswerWrapCss}>
                          <p className={faqAnswerCss}>{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            {service.reviews && service.reviews.length > 0 && (
              <div className={cx(cardCss, cardPadCss)}>
                {/* Header */}
                <div className={reviewsHeadCss}>
                  <h5 className={sectionHeadingCss}>Reviews</h5>
                  {service.rating_count > 0 && (
                    <div className={reviewsScoreCss}>
                      <Star size={20} className={starCss} />
                      <p className={reviewsScoreValueCss}>{parseFloat(String(service.rating_average)).toFixed(1)}</p>
                      <p className={body2MutedCss}>({service.rating_count})</p>
                    </div>
                  )}
                </div>

                {/* Review list */}
                <div className={reviewListCss}>
                  {service.reviews.map((review, idx) => (
                    <div key={review.id}>
                      {idx > 0 && <hr className={reviewDividerCss} />}
                      <div className={reviewRowCss}>
                        <Avatar
                          name={review.client_profile?.user?.name ?? "Client"}
                          src={review.client_profile?.user?.avatar_url ?? null}
                          px={40}
                        />
                        <div className={css({ flex: 1, minW: 0 })}>
                          <div className={reviewHeadCss}>
                            <div>
                              <p className={reviewNameCss}>{review.client_profile?.user?.name ?? "Client"}</p>
                              <span className={captionCss}>
                                {review.pricing_option ? `${review.pricing_option.title} package` : "Custom order"}
                              </span>
                            </div>
                            <div className={reviewRightCss}>
                              <div className={reviewStarsCss}>
                                {[1, 2, 3, 4, 5].map(star => (
                                  <Star key={star} size={14} className={star <= review.rating ? starCss : starOffCss} />
                                ))}
                              </div>
                              <span className={captionCss}>
                                {new Date(review.created_at).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                            </div>
                          </div>
                          {review.comment && <p className={reviewCommentCss}>{review.comment}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Pricing Packages (Sticky) */}
          <div>
            <div className={stickyColCss}>
              {/* Package Selection */}
              {pricingOptions.length > 0 ? (
                <div className={cx(cardCss, pricingCardCss)}>
                  {/* Package Tabs */}
                  {pricingOptions.length > 1 && (
                    <div className={tierTabsCss}>
                      {pricingOptions.map((pkg, idx) => (
                        <button
                          key={pkg.id}
                          type='button'
                          onClick={() => setSelectedPackage(idx)}
                          data-selected={selectedPackage === idx ? "" : undefined}
                          className={tierTabCss}>
                          {pkg.title}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Package Details */}
                  {selectedPricing && (
                    <div className={cardPadCss}>
                      <div className={priceBlockCss}>
                        <p className={priceCss}>${Number(selectedPricing.price_raw).toFixed(2)}</p>
                        <div className={priceMetaRowCss}>
                          <div className={priceMetaItemCss}>
                            <Clock size={14} />
                            <span className={priceMetaTextCss}>{selectedPricing.delivery_time} delivery</span>
                          </div>
                          <div className={priceMetaItemCss}>
                            <RefreshCw size={14} />
                            <span className={priceMetaTextCss}>
                              {selectedPricing.revisions} {String(selectedPricing.revisions) === "1" ? "revision" : "revisions"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      {selectedPricing.description && (
                        <div className={tierDescCss}>
                          <RichTextDisplay value={selectedPricing.description} />
                        </div>
                      )}

                      {/* CTA Buttons */}
                      <div className={ctaColCss}>
                        {isOwnService ? (
                          <div className={ownNoticeCss}>
                            <p className={ownNoticeTextCss}>This is your own service</p>
                          </div>
                        ) : (
                          <button
                            type='button'
                            disabled={listingChanged}
                            onClick={() => {
                              if (listingChanged) return;
                              if (ensureCanPurchase()) {
                                router.push(`/explore-services/${serviceId}/checkout?pricing_option_id=${selectedPricing.id}`);
                              }
                            }}
                            className={cx(ctaCss, ctaAccentCss)}>
                            Continue (${Number(selectedPricing.price_raw).toFixed(2)})
                          </button>
                        )}
                        {!isOwnService && service.custom_orders_enabled && (
                          service.my_active_custom_order ? (
                            <button
                              type='button'
                              onClick={() => router.push(`/dashboard/custom-orders/${service.my_active_custom_order!.id}`)}
                              className={cx(ctaCss, ctaGreyCss)}>
                              <Receipt size={20} />
                              View your custom order
                            </button>
                          ) : (
                            <button
                              type='button'
                              disabled={listingChanged}
                              onClick={() => !listingChanged && setShowCustomOrderDialog(true)}
                              className={cx(ctaCss, ctaBlackCss)}>
                              <Receipt size={20} />
                              Request a Custom Order
                            </button>
                          )
                        )}
                        <button
                          type='button'
                          onClick={handleContact}
                          disabled={contacting || isOwnService || !contactUserId}
                          className={cx(ctaCss, ctaOutlineCss)}>
                          <MessageCircle size={20} />
                          Contact Freelancer
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className={cx(cardCss, cardPadCss, css({ mb: "16px" }))}>
                  <p className={noPricingTextCss}>
                    No pricing options available. Contact the freelancer for a quote.
                  </p>
                  <button
                    type='button'
                    onClick={handleContact}
                    disabled={contacting || isOwnService || !contactUserId}
                    className={cx(ctaCss, ctaAccentCss)}>
                    <MessageCircle size={20} />
                    Contact Freelancer
                  </button>
                </div>
              )}

              {/* Trust Badges */}
              <div className={cx(cardCss, css({ p: "16px" }))}>
                <div className={trustColCss}>
                  <div className={trustRowCss}>
                    <Shield size={18} className={trustIconCss} />
                    <div>
                      <p className={trustTitleCss}>Money Back Guarantee</p>
                      <span className={captionCss}>Full refund if not satisfied</span>
                    </div>
                  </div>
                  <div className={trustRowCss}>
                    <Check size={18} className={trustIconCss} />
                    <div>
                      <p className={trustTitleCss}>Quality Verified</p>
                      <span className={captionCss}>Reviewed by KickAir team</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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

      {/* Live-edit guard — the freelancer changed/removed this service while it was open here.
          Blocking: no onClose, so backdrop clicks and Escape can't dismiss it. */}
      <BareModal
        open={listingChanged && !isOwnService}
        maxW='444px'
        closeOnInteractOutside={false}
        closeOnEscape={false}
        className={guardPanelCss}>
        <div className={guardBodyCss}>
          <p className={guardTitleCss}>This service was just updated</p>
          <p className={guardTextCss}>
            This service was just updated by the freelancer and is awaiting admin approval. It&apos;s no longer
            available in its current form.
          </p>
        </div>
        <div className={guardActionsCss}>
          <button type='button' onClick={() => window.location.reload()} className={cx(ctaCss, ctaAccentCss)}>
            Refresh page
          </button>
        </div>
      </BareModal>
    </div>
  );
}
