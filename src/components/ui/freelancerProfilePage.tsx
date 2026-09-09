"use client";

import { useState, useCallback } from "react";
import RichTextDisplay from "@/components/ui/RichTextDisplay";
import ReviewCard from "@/components/ui/ReviewCard";
import { css, cva, cx } from "styled-system/css";
import { button, iconButton, Spinner, Pager } from "@/components/ds";
import {
  ChevronLeft, ChevronRight, X, MapPin, Shield, MessageCircle, Heart, Share2, GraduationCap, Award,
  LayoutGrid, Image as ImageIcon, ExternalLink, Images, Check, Pencil, MessageSquareText,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { FreelancerProfile, FreelancerProfileService, PortfolioItem } from "@/types/user";
import { Service } from "@/types/service";
import ServiceCard from "@/app/(main)/explore-services/ServiceCard";
import { api, FreelancerReview } from "@/lib/api";
import { useAuth } from "@/components/context/AuthContext";
import { ProfileAvatar, Stars5, StarGlyph, LevelBadge, LangChip, EntryRow, Empty } from "@/components/profile/profileKit";

interface FreelancerProfilePageProps {
  profile: FreelancerProfile;
}

type Tab = "about" | "portfolio" | "services" | "reviews";
const TABS: { id: Tab; label: string }[] = [
  { id: "about", label: "About" },
  { id: "portfolio", label: "Portfolio" },
  { id: "services", label: "Services" },
  { id: "reviews", label: "Reviews" },
];

const portfolioDate = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : null);
// Legacy rows may hold scheme-less URLs ("example.com") — prepend https:// so the link doesn't resolve relative to our site.
const externalUrl = (url: string) => (/^[a-z][a-z0-9+.-]*:\/\//i.test(url) ? url : `https://${url}`);

/* ── Buttons: black pill (primary) and outlined pill (secondary), on the ds button recipe ── */
const pill = css.raw({ borderRadius: "pill", h: "40px", boxShadow: "none" });
const primaryRaw = css.raw({ bg: "#000", color: "#fff", fontSize: "14px", px: "16px", _hover: { bg: "rgba(0,0,0,0.8)" } });
const secRaw = css.raw({ bg: "surface", color: "ink", fontSize: "13.5px", px: "16px", borderColor: "hairlineStrong", _hover: { bg: "surface2", borderColor: "hairlineStrong" } });
const heroPrimaryBtn = css(button.raw({ variant: "solid", size: "sm" }), pill, primaryRaw, { px: "22px" });
const heroPrimaryBtnFull = css(button.raw({ variant: "solid", size: "sm", full: true }), pill, primaryRaw, { h: "44px" });
const heroPrimaryBtnBar = css(button.raw({ variant: "solid", size: "sm" }), pill, primaryRaw, { flex: 1, h: "46px" });
const heroSecBtn = css(button.raw({ variant: "outline", size: "sm" }), pill, secRaw);
const heroSecBtnFull = css(button.raw({ variant: "outline", size: "sm", full: true }), pill, secRaw, { h: "44px" });
const heroSecBtnFlex = css(button.raw({ variant: "outline", size: "sm" }), pill, secRaw, { flex: 1 });
const backBtn = css(button.raw({ variant: "ghost", size: "sm" }), { h: "auto", minW: "64px", py: "6px", px: "8px", gap: "8px", fontSize: "12.5px", fontWeight: 500, color: "ink2", _hover: { color: "ink", bg: "transparent" } });
const retryBtn = css(button.raw({ variant: "text", size: "sm" }), { mt: "12px", h: "auto", py: "6px", px: "8px", fontSize: "13px", fontWeight: 500, color: "accent", _hover: { color: "accent", textDecoration: "none", bg: "rgba(0,113,227,0.04)" } });
const whiteSpinner = css({ color: "#fff" });

/* ── Hero icon buttons (40px outlined) ── */
const heroIconOutline = css(iconButton.raw({ variant: "outline", shape: "round" }), { w: "40px", h: "40px", borderColor: "hairlineStrong", color: "ink2", bg: "surface" });
const heroIconFav = css(iconButton.raw({ variant: "outline", shape: "round" }), { w: "40px", h: "40px", borderColor: "rgba(220,38,38,0.3)", color: "error", bg: "errorTint", _hover: { bg: "errorTint", borderColor: "rgba(220,38,38,0.3)", color: "error" } });
const barIconBtn = css(iconButton.raw({ variant: "outline", shape: "round" }), { w: "46px", h: "46px", flex: "none", borderColor: "hairlineStrong", color: "ink2" });
const barIconBtnFav = css(iconButton.raw({ variant: "outline", shape: "round" }), { w: "46px", h: "46px", flex: "none", borderColor: "hairlineStrong", color: "error" });

/* ── Layout ── */
const page = css({ minH: "100vh", bg: "canvas" });
const backBar = css({ bg: "surface", borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "hairline" });
const backBarInner = css({ maxW: "1000px", mx: "auto", px: { base: "16px", md: "24px" }, py: "10px" });
const main = css({ maxW: "1000px", mx: "auto", px: { base: "14px", md: "24px" }, py: { base: "16px", md: "28px" } });
const surfaceCard = css({ bg: "surface", borderWidth: "1px", borderStyle: "solid", borderColor: "hairline", borderRadius: "card" });
const heroCard = cx(surfaceCard, css({ overflow: "hidden" }));
const heroInner = css({ px: { base: "18px", md: "26px" }, pt: { base: "20px", md: "24px" }, pb: { base: "20px", md: "24px" } });
const heroRow = css({ display: "flex", flexDirection: { base: "column", md: "row" }, alignItems: { base: "flex-start", md: "center" }, gap: { base: "14px", md: "20px" } });
const avatarRing = css({ borderRadius: "50%", borderWidth: "4px", borderStyle: "solid", borderColor: "surface", bg: "surface" });
const heroText = css({ flex: 1, minW: 0, pb: { md: "4px" } });
const nameRow = css({ display: "flex", alignItems: "center", gap: "9px", flexWrap: "wrap" });
const heroName = css({ fontSize: { base: "23px", md: "27px" }, fontWeight: 600, letterSpacing: "-0.025em" });
const tagline = css({ fontSize: { base: "14.5px", md: "16px" }, color: "ink", mt: "6px", lineHeight: 1.4 });
const noTagline = css({ color: "ink3" });
const metaRow = css({ display: "flex", alignItems: "center", gap: "14px", mt: "10px", flexWrap: "wrap", fontSize: "13.5px", color: "ink2" });
const metaItem = css({ display: "inline-flex", alignItems: "center", gap: "5px" });
const metaVerified = css({ display: "inline-flex", alignItems: "center", gap: "5px", color: "accent" });
const desktopActions = css({ display: { base: "none", md: "flex" }, gap: "9px", flex: "none", pb: "4px" });
const statStrip = css({ display: "flex", alignItems: "center", gap: { base: "16px", md: "26px" }, mt: "18px", pt: "16px", borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "hairline", flexWrap: "wrap" });
const statCol = css({ display: "flex", flexDirection: "column", gap: "3px", minW: 0 });
const statLabel = css({ fontSize: "10px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "ink3" });
const statValue = css({ lineHeight: 1.1 });
const statDivider = css({ w: "1px", h: "30px", bg: "hairline", flex: "none" });
const ratingInline = css({ display: "inline-flex", alignItems: "center", gap: "6px" });
const monoStat = css({ fontSize: "16px", fontWeight: 600, fontFamily: "mono" });
const ratingCountText = css({ fontSize: "12.5px", color: "ink2" });
const statNew = css({ fontSize: "14px", color: "ink3" });
const levelStat = css({ fontSize: "15px", fontWeight: 600, letterSpacing: "-0.01em" });
const langStat = css({ fontSize: "14.5px", fontWeight: 500 });
const langStatWrap = css({ display: { base: "none", md: "contents" } });

const bodyRow = css({ display: "flex", gap: "24px", mt: "18px", alignItems: "flex-start" });
const bodyMain = css({ flex: 1, minW: 0 });
const tabBar = css({ display: "flex", gap: "26px", borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "hairline", mb: "22px", overflowX: "auto", scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" } });
const tabBtn = cva({
  base: { position: "relative", h: "40px", px: "4px", border: 0, bg: "transparent", cursor: "pointer", fontFamily: "inherit", fontSize: "14.5px", whiteSpace: "nowrap", _hover: { color: "ink" } },
  variants: {
    on: {
      true: { fontWeight: 600, color: "ink", _after: { content: '""', position: "absolute", left: 0, right: 0, bottom: "-1px", h: "2px", bg: "#000", borderRadius: "2px" } },
      false: { fontWeight: 500, color: "ink2" },
    },
  },
});
const tabCount = css({ ml: "6px", fontSize: "12px", color: "ink3" });
const tabPanel = cx(surfaceCard, css({ p: { base: "18px", md: "26px" } }));

const sideCol = css({ display: { base: "none", md: "block" }, w: "290px", flex: "none", position: "sticky", top: "20px" });
const sideCard = cx(surfaceCard, css({ p: "22px" }));
const ownerPill = css({ display: "inline-flex", alignItems: "center", gap: "7px", px: "11px", py: "6px", borderRadius: "pill", bg: "accentFill", color: "accent", fontSize: "11.5px", fontWeight: 600, mb: "14px" });
const sideIdRow = css({ display: "flex", alignItems: "center", gap: "12px" });
const sideIdText = css({ minW: 0 });
const sideName = css({ fontSize: "15px", fontWeight: 600, letterSpacing: "-0.01em" });
const sideTagline = css({ fontSize: "12.5px", color: "ink2", mt: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" });
const sideActions = css({ display: "flex", flexDirection: "column", gap: "9px", mt: "18px" });
const sideActionRow = css({ display: "flex", gap: "9px" });
const sideChecks = css({ mt: "18px", pt: "16px", borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "hairline", display: "flex", flexDirection: "column", gap: "11px" });
const checkRow = css({ display: "flex", alignItems: "center", gap: "9px", fontSize: "13px" });
const checkIcon = cva({ base: { display: "flex" }, variants: { ok: { true: { color: "success" }, false: { color: "ink3" } } } });
const checkLabel = cva({ base: { fontSize: "13px" }, variants: { ok: { true: { color: "ink" }, false: { color: "ink3" } } } });

const mobileBar = css({ display: { base: "flex", md: "none" }, position: "sticky", bottom: 0, gap: "9px", p: "12px 14px", bg: "rgba(255,255,255,0.9)", backdropFilter: "saturate(1.4) blur(16px)", borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "hairline" });

/* ── Tab bodies ── */
const aboutCol = css({ display: "flex", flexDirection: "column" });
const aboutProse = css({ fontSize: "15px", lineHeight: 1.65, color: "ink" });
const emptyLine = css({ color: "ink3", fontSize: "14px" });
const chipWrap = css({ display: "flex", flexWrap: "wrap", gap: "9px" });
const skillWrap = css({ display: "flex", flexWrap: "wrap", gap: "8px" });
const skillChip = css({ display: "inline-flex", alignItems: "center", h: "32px", px: "13px", borderRadius: "pill", bg: "rgba(0,0,0,0.045)", fontSize: "13px", fontWeight: 500 });
const certRow = css({ display: "flex", alignItems: "center", gap: "8px" });
const certMain = css({ flex: 1, minW: 0 });
// globals.css styles `a` outside any layer, so link colour/underline need !important to beat it.
const certLink = css({ fontSize: "12.5px", fontWeight: 600, color: "var(--colors-accent) !important", textDecoration: "none", whiteSpace: "nowrap", _hover: { textDecoration: "underline !important" } });

const twoColGrid = css({ display: "grid", gridTemplateColumns: { base: "1fr", sm: "1fr 1fr" }, gap: "16px" });
const twoColGridRepeat = css({ display: "grid", gridTemplateColumns: { base: "1fr", sm: "repeat(2, 1fr)" }, gap: "16px" });
const portfolioCard = cva({
  base: { borderWidth: "1px", borderStyle: "solid", borderColor: "hairline", borderRadius: "14px", overflow: "hidden", bg: "surface", transition: "box-shadow .15s, transform .12s, border-color .15s", _hover: { boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 12px 30px rgba(0,0,0,0.08)", transform: "translateY(-2px)", borderColor: "hairlineStrong" } },
  variants: { clickable: { true: { cursor: "pointer" }, false: { cursor: "default" } } },
});
const portfolioCover = css({ position: "relative", aspectRatio: "16 / 10", bg: "rgba(0,0,0,0.04)" });
const coverImg = css({ w: "100%", h: "100%", objectFit: "cover", display: "block" });
const coverPlaceholder = css({ w: "100%", h: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "ink3" });
const coverCount = css({ position: "absolute", top: "10px", right: "10px", display: "inline-flex", alignItems: "center", gap: "4px", h: "26px", px: "9px", borderRadius: "pill", bg: "rgba(0,0,0,0.6)", color: "#fff", fontSize: "11.5px", fontWeight: 600 });
const portfolioText = css({ p: "13px 15px" });
const portfolioTitle = css({ fontSize: "14.5px", fontWeight: 600, letterSpacing: "-0.01em" });
const portfolioDesc = css({ fontSize: "12.5px", color: "ink2", mt: "5px", lineClamp: 1 });
const portfolioMeta = css({ display: "flex", alignItems: "center", gap: "12px", mt: "9px" });
const portfolioDateText = css({ fontSize: "12px", color: "ink3", fontFamily: "mono" });
const projectLink = css({ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "12px", fontWeight: 600, color: "var(--colors-accent) !important", textDecoration: "none", _hover: { textDecoration: "underline !important" } });

const reviewsHead = css({ display: "flex", flexDirection: { base: "column", sm: "row" }, gap: { base: "16px", sm: "36px" }, alignItems: { base: "flex-start", sm: "center" }, pb: "24px", mb: "24px", borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "hairline" });
const reviewsScore = css({ textAlign: { base: "left", sm: "center" }, flex: "none" });
const reviewsAvg = css({ fontFamily: "mono", fontSize: "44px", fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1 });
const reviewsStars = css({ mt: "8px" });
const reviewsCount = css({ fontSize: "12.5px", color: "ink2", mt: "6px" });
const reviewsBlurb = css({ fontSize: "13.5px", color: "ink2", lineHeight: 1.6 });
const reviewsLoadingWrap = css({ display: "flex", justifyContent: "center", py: "48px" });
const reviewsErrorWrap = css({ textAlign: "center", py: "32px" });
const reviewsErrorText = css({ fontSize: "14px", color: "ink3" });
const reviewsList = css({ display: "flex", flexDirection: "column", gap: "16px" });
// Selected page is black in this design (was `.Mui-selected` override); nested selector beats the Pager's own accent class.
const pagerWrap = css({ display: "flex", justifyContent: "center", mt: "32px", "& [aria-current=page]": { bg: "#000", color: "#fff", _hover: { bg: "#000", color: "#fff" } } });

/* ── Lightbox ── */
const lightboxRoot = css({ position: "fixed", inset: 0, zIndex: 1400, bg: "rgba(16,14,12,0.92)", backdropFilter: "blur(8px)", display: "flex", flexDirection: "column" });
const lightboxHead = css({ display: "flex", alignItems: "center", justifyContent: "space-between", p: "16px 20px", color: "#fff" });
const lightboxTitle = css({ fontSize: "15px", fontWeight: 600, letterSpacing: "-0.01em" });
const lightboxCounter = css({ fontSize: "12.5px", opacity: 0.6, mt: "2px", fontFamily: "mono" });
const lightboxBtn = css(iconButton.raw({ variant: "ghost", shape: "round" }), { w: "36px", h: "36px", bg: "rgba(255,255,255,0.1)", color: "#fff", _hover: { bg: "rgba(255,255,255,0.2)", color: "#fff" } });
const lightboxNav = css(iconButton.raw({ variant: "ghost", shape: "round" }), { position: "absolute", w: "48px", h: "48px", bg: "rgba(255,255,255,0.1)", color: "#fff", _hover: { bg: "rgba(255,255,255,0.2)", color: "#fff" } });
const lightboxNavLeft = css({ left: "18px" });
const lightboxNavRight = css({ right: "18px" });
const lightboxStage = css({ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", px: { base: "16px", md: "80px" }, minH: 0, position: "relative" });
const lightboxImg = css({ maxW: "100%", maxH: "70vh", objectFit: "contain", borderRadius: "8px" });
const thumbRow = css({ display: "flex", gap: "10px", justifyContent: "center", p: "18px", flexWrap: "wrap" });
const thumb = cva({
  base: { w: "64px", h: "48px", borderRadius: "7px", cursor: "pointer", overflow: "hidden", transition: "opacity .15s, outline-color .15s" },
  variants: { active: { true: { opacity: 1, outline: "2px solid #fff" }, false: { opacity: 0.45, outline: "2px solid transparent" } } },
});
const thumbImg = css({ w: "100%", h: "100%", objectFit: "cover" });

/* ── PPBlock ── */
const ppBlock = css({ pb: "26px", mb: "26px", borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "hairline" });
const ppBlockLast = css({ pb: 0, mb: 0, borderBottom: "none" });
const ppHead = css({ display: "flex", justifyContent: "space-between", alignItems: "center", mb: "16px" });
const ppTitle = css({ fontSize: "17px", fontWeight: 600, letterSpacing: "-0.015em" });

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className={statCol}>
      <p className={statLabel}>{label}</p>
      <div className={statValue}>{children}</div>
    </div>
  );
}
const StatDivider = () => <div className={statDivider} />;

export function FreelancerProfilePage({ profile }: FreelancerProfilePageProps) {
  const router = useRouter();
  const { user: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("about");
  const [isFavorite, setIsFavorite] = useState(false);
  const [messaging, setMessaging] = useState(false);
  const [lightbox, setLightbox] = useState<{ item: PortfolioItem; index: number } | null>(null);

  const [reviews, setReviews] = useState<FreelancerReview[]>([]);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewsLastPage, setReviewsLastPage] = useState(1);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState<string | null>(null);
  const [reviewsFetched, setReviewsFetched] = useState(false);

  const fetchReviews = useCallback(async (page: number) => {
    setReviewsLoading(true);
    setReviewsError(null);
    try {
      const response = await api.getFreelancerReviews(profile.id, page);
      setReviews(response.data);
      setReviewsLastPage(response.meta?.last_page ?? 1);
      setReviewsFetched(true);
    } catch (err) {
      setReviewsError(err instanceof Error ? err.message : "Failed to load reviews.");
    } finally {
      setReviewsLoading(false);
    }
  }, [profile.id]);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    if (tab === "reviews" && !reviewsFetched) fetchReviews(1);
  };
  const handleReviewsPageChange = (page: number) => {
    setReviewsPage(page);
    fetchReviews(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const name = profile.user?.name || "Unknown";
  const avatar = profile.user?.avatar_url || null;
  const isVerified = profile.user?.is_verified_id || false;
  const isPhoneVerified = profile.user?.is_verified_phone || false;
  const ratingAvg = profile.rating_average ? parseFloat(profile.rating_average) : 0;
  const ratingCount = profile.rating_count ?? 0;
  const hasRating = ratingCount > 0;
  const portfolio = profile.portfolio_items ?? [];
  const services = profile.services ?? [];
  const languages = profile.languages ?? [];
  const expertises = profile.expertises ?? [];
  const educations = profile.educations ?? [];
  const certificates = profile.certificates ?? [];
  const isOwner = !!authUser && authUser.id === profile.user_id;
  const counts: Record<Tab, number> = { about: 0, portfolio: portfolio.length, services: services.length, reviews: ratingCount };

  const handleMessage = async () => {
    if (!authUser) { router.push("/auth/sign-in"); return; }
    setMessaging(true);
    try {
      const conv = await api.startConversation(profile.user_id);
      router.push(`/dashboard/client/messages?id=${conv.id}`);
    } catch {
      setMessaging(false);
    }
  };

  /* ── Tab bodies ── */
  const aboutBody = (
    <div className={aboutCol}>
      <PPBlock title="About">
        {profile.about ? <div className={aboutProse}><RichTextDisplay value={profile.about} /></div>
          : <p className={emptyLine}>This freelancer hasn&rsquo;t written a bio yet.</p>}
      </PPBlock>
      <PPBlock title="Languages">
        {languages.length ? <div className={chipWrap}>{languages.map(l => <LangChip key={l.id} name={l.name} proficiency={l.proficiency} />)}</div>
          : <p className={emptyLine}>No languages listed.</p>}
      </PPBlock>
      <PPBlock title="Skills">
        {expertises.length ? <div className={skillWrap}>{expertises.map(s => (
          <span key={s.id} className={skillChip}>{s.expertise_name}</span>
        ))}</div> : <p className={emptyLine}>No skills listed.</p>}
      </PPBlock>
      <PPBlock title="Education">
        {educations.length ? <div>{educations.map((e, i) => <EntryRow key={i} icon={<GraduationCap size={19} />} title={e.studies} sub={e.facility} />)}</div>
          : <p className={emptyLine}>No education listed.</p>}
      </PPBlock>
      <PPBlock title="Certifications" last>
        {certificates.length ? <div>{certificates.map((c, i) => (
          <div key={i} className={certRow}>
            <div className={certMain}>
              <EntryRow icon={<Award size={19} />} title={c.title} sub={c.source} />
            </div>
            {c.file_url && (
              <a href={c.file_url} target="_blank" rel="noopener noreferrer" className={certLink}>
                View certificate
              </a>
            )}
          </div>
        ))}</div>
          : <p className={emptyLine}>No certifications listed.</p>}
      </PPBlock>
    </div>
  );

  const portfolioBody = portfolio.length ? (
    <div className={twoColGrid}>
      {portfolio.map(item => {
        const cover = item.images[0]?.file_url;
        const date = portfolioDate(item.completed_on);
        return (
          <div key={item.id} onClick={() => item.images.length > 0 && setLightbox({ item, index: 0 })} className={portfolioCard({ clickable: item.images.length > 0 })}>
            <div className={portfolioCover}>
              {/* eslint-disable-next-line @next/next/no-img-element -- user-uploaded portfolio images */}
              {cover ? <img src={cover} alt={item.title} className={coverImg} />
                : <div className={coverPlaceholder}><Images size={30} /></div>}
              {item.images.length > 1 && (
                <div className={coverCount}>
                  <ImageIcon size={13} />{item.images.length}
                </div>
              )}
            </div>
            <div className={portfolioText}>
              <p className={portfolioTitle}>{item.title}</p>
              {item.description && <p className={portfolioDesc}>{item.description}</p>}
              <div className={portfolioMeta}>
                {date && <p className={portfolioDateText}>{date}</p>}
                {item.project_url && (
                  <a href={externalUrl(item.project_url)} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className={projectLink}>
                    View project <ExternalLink size={13} />
                  </a>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  ) : <Empty icon={<LayoutGrid size={24} />} title="No portfolio yet" sub="This freelancer hasn't added any projects to show." />;

  const servicesBody = services.length ? (
    <div className={twoColGridRepeat}>
      {services.map((s: FreelancerProfileService) => <ServiceCard key={s.id} service={s as unknown as Service} />)}
    </div>
  ) : <Empty icon={<LayoutGrid size={24} />} title="No services yet" sub="This freelancer hasn't published any services." />;

  const reviewsBody = (
    <div>
      <div className={reviewsHead}>
        <div className={reviewsScore}>
          <p className={reviewsAvg}>{hasRating ? ratingAvg.toFixed(1) : "—"}</p>
          <div className={reviewsStars}><Stars5 rating={ratingAvg} size={16} /></div>
          <p className={reviewsCount}>{ratingCount} review{ratingCount !== 1 ? "s" : ""}</p>
        </div>
        <p className={reviewsBlurb}>
          {hasRating ? "Ratings come from clients after they complete and approve an order, so they reflect real, paid work." : "No reviews yet — they'll appear here once clients complete orders with this freelancer."}
        </p>
      </div>
      {reviewsLoading ? (
        <div className={reviewsLoadingWrap}><Spinner size={28} /></div>
      ) : reviewsError ? (
        <div className={reviewsErrorWrap}>
          <p className={reviewsErrorText}>{reviewsError}</p>
          <button type="button" onClick={() => fetchReviews(reviewsPage)} className={retryBtn}>Try again</button>
        </div>
      ) : reviews.length === 0 ? (
        <Empty icon={<MessageSquareText size={24} />} title="No reviews yet" sub="Reviews from completed orders will appear here." />
      ) : (
        <>
          <div className={reviewsList}>{reviews.map(r => <ReviewCard key={r.id} review={r} />)}</div>
          {reviewsLastPage > 1 && (
            <div className={pagerWrap}>
              <Pager count={reviewsLastPage} page={reviewsPage} onChange={handleReviewsPageChange} />
            </div>
          )}
        </>
      )}
    </div>
  );

  const body = { about: aboutBody, portfolio: portfolioBody, services: servicesBody, reviews: reviewsBody }[activeTab];

  return (
    <div className={page}>
      {/* Back bar */}
      <div className={backBar}>
        <div className={backBarInner}>
          <button type="button" onClick={() => router.back()} className={backBtn}><ChevronLeft size={18} />Back</button>
        </div>
      </div>

      <div className={main}>
        {/* Hero */}
        <div className={heroCard}>
          <div className={heroInner}>
            <div className={heroRow}>
              <div className={avatarRing}>
                <ProfileAvatar name={name} src={avatar} size={104} verified={isVerified} />
              </div>
              <div className={heroText}>
                <div className={nameRow}>
                  <p className={heroName}>{name}</p>
                  {isVerified && profile.level && <LevelBadge level={profile.level} />}
                </div>
                <p className={tagline}>
                  {profile.tagline || <span className={noTagline}>No tagline yet</span>}
                </p>
                <div className={metaRow}>
                  {profile.location && <span className={metaItem}><MapPin size={15} />{profile.location}</span>}
                  {isVerified && <span className={metaVerified}><Shield size={15} />Verified</span>}
                </div>
              </div>
              {/* desktop actions */}
              <div className={desktopActions}>
                {isOwner ? (
                  <button type="button" onClick={() => router.push("/dashboard/freelancer")} className={heroSecBtn}><Pencil size={15} />Edit profile</button>
                ) : (
                  <>
                    <button type="button" onClick={() => setIsFavorite(!isFavorite)} aria-label={isFavorite ? "Remove from saved" : "Save freelancer"} aria-pressed={isFavorite} className={isFavorite ? heroIconFav : heroIconOutline}><Heart size={17} fill={isFavorite ? "currentColor" : "none"} /></button>
                    <button type="button" aria-label="Share" className={heroIconOutline}><Share2 size={17} /></button>
                    <button type="button" onClick={handleMessage} disabled={messaging} className={heroPrimaryBtn}>{messaging ? <Spinner size={15} className={whiteSpinner} /> : <MessageCircle size={15} />}Message</button>
                  </>
                )}
              </div>
            </div>
            {/* stat strip */}
            <div className={statStrip}>
              <Stat label="Rating">{hasRating ? <span className={ratingInline}><StarGlyph size={16} /><span className={monoStat}>{ratingAvg.toFixed(1)}</span><span className={ratingCountText}>({ratingCount})</span></span> : <span className={statNew}>New</span>}</Stat>
              <StatDivider />
              <Stat label="Orders"><span className={monoStat}>{profile.completed_orders_count ?? 0}</span></Stat>
              {profile.level && <><StatDivider /><Stat label="Level"><span className={levelStat}>{profile.level}</span></Stat></>}
              {languages.length > 0 && <div className={langStatWrap}><StatDivider /><Stat label="Languages"><span className={langStat}>{languages.map(l => l.name).join(", ")}</span></Stat></div>}
            </div>
          </div>
        </div>

        {/* Body: content + sticky CTA */}
        <div className={bodyRow}>
          <div className={bodyMain}>
            <div className={tabBar}>
              {TABS.map(t => {
                const on = activeTab === t.id;
                return (
                  <button key={t.id} type="button" onClick={() => handleTabChange(t.id)} className={tabBtn({ on })}>
                    {t.label}{counts[t.id] > 0 && <span className={tabCount}>{counts[t.id]}</span>}
                  </button>
                );
              })}
            </div>
            <div className={tabPanel}>{body}</div>
          </div>

          {/* desktop sticky contact card */}
          <div className={sideCol}>
            <div className={sideCard}>
              {isOwner && <div className={ownerPill}>Owner preview</div>}
              <div className={sideIdRow}>
                <ProfileAvatar name={name} src={avatar} size={48} verified={isVerified} />
                <div className={sideIdText}>
                  <p className={sideName}>{name}</p>
                  <p className={sideTagline}>{profile.tagline || (isVerified ? "Verified freelancer" : "Freelancer on KickAir")}</p>
                </div>
              </div>
              <div className={sideActions}>
                {isOwner ? (
                  <button type="button" onClick={() => router.push("/dashboard/freelancer")} className={heroSecBtnFull}><Pencil size={16} />Edit profile</button>
                ) : (
                  <>
                    <button type="button" onClick={handleMessage} disabled={messaging} className={heroPrimaryBtnFull}>{messaging ? <Spinner size={16} className={whiteSpinner} /> : <MessageCircle size={16} />}Message {name.split(" ")[0]}</button>
                    <div className={sideActionRow}>
                      <button type="button" onClick={() => setIsFavorite(!isFavorite)} aria-pressed={isFavorite} className={heroSecBtnFlex}><Heart size={16} fill={isFavorite ? "currentColor" : "none"} />Save</button>
                      <button type="button" className={heroSecBtnFlex}><Share2 size={16} />Share</button>
                    </div>
                  </>
                )}
              </div>
              <div className={sideChecks}>
                {([["Identity verified", isVerified], ["Phone verified", isPhoneVerified]] as const).map(([label, ok]) => (
                  <div key={label} className={checkRow}>
                    <div className={checkIcon({ ok })}>{ok ? <Check size={16} /> : <X size={16} />}</div>
                    <p className={checkLabel({ ok })}>{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* mobile bottom action bar */}
      {!isOwner && (
        <div className={mobileBar}>
          <button type="button" onClick={() => setIsFavorite(!isFavorite)} aria-label={isFavorite ? "Remove from saved" : "Save freelancer"} aria-pressed={isFavorite} className={isFavorite ? barIconBtnFav : barIconBtn}><Heart size={18} fill={isFavorite ? "currentColor" : "none"} /></button>
          <button type="button" onClick={handleMessage} disabled={messaging} className={heroPrimaryBtnBar}>{messaging ? <Spinner size={16} className={whiteSpinner} /> : <MessageCircle size={16} />}Message</button>
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (() => {
        const imgs = lightbox.item.images;
        const cur = imgs[lightbox.index];
        const go = (delta: number, e: React.MouseEvent) => { e.stopPropagation(); setLightbox(lb => (lb ? { ...lb, index: (lb.index + delta + imgs.length) % imgs.length } : lb)); };
        return (
          <div onClick={() => setLightbox(null)} className={lightboxRoot}>
            <div className={lightboxHead} onClick={e => e.stopPropagation()}>
              <div>
                <p className={lightboxTitle}>{lightbox.item.title}</p>
                <p className={lightboxCounter}>{lightbox.index + 1} / {imgs.length}</p>
              </div>
              <button type="button" onClick={() => setLightbox(null)} aria-label="Close" className={lightboxBtn}><X size={24} /></button>
            </div>
            <div className={lightboxStage} onClick={e => e.stopPropagation()}>
              {imgs.length > 1 && <button type="button" onClick={e => go(-1, e)} aria-label="Previous image" className={cx(lightboxNav, lightboxNavLeft)}><ChevronLeft size={24} /></button>}
              {/* eslint-disable-next-line @next/next/no-img-element -- user-uploaded portfolio images */}
              <img src={cur?.file_url} alt={lightbox.item.title} className={lightboxImg} />
              {imgs.length > 1 && <button type="button" onClick={e => go(1, e)} aria-label="Next image" className={cx(lightboxNav, lightboxNavRight)}><ChevronRight size={24} /></button>}
            </div>
            {imgs.length > 1 && (
              <div className={thumbRow} onClick={e => e.stopPropagation()}>
                {imgs.map((im, i) => (
                  <div key={im.id} onClick={() => setLightbox(lb => (lb ? { ...lb, index: i } : lb))} className={thumb({ active: i === lightbox.index })}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- user-uploaded portfolio images */}
                    <img src={im.file_url} alt="" className={thumbImg} />
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}

/* Content block within a tab (title + divider) */
function PPBlock({ title, action, children, last }: { title: string; action?: React.ReactNode; children: React.ReactNode; last?: boolean }) {
  return (
    <div className={last ? ppBlockLast : ppBlock}>
      <div className={ppHead}>
        <p className={ppTitle}>{title}</p>
        {action}
      </div>
      {children}
    </div>
  );
}
