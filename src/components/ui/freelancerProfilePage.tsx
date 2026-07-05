"use client";

import { useState, useCallback } from "react";
import RichTextDisplay from "@/components/ui/RichTextDisplay";
import ReviewCard from "@/components/ui/ReviewCard";
import { Box, Typography, Button, IconButton, Pagination, CircularProgress } from "@mui/material";
import {
  ChevronLeft, ChevronRight, Close, RoomOutlined, ShieldOutlined, ChatBubbleOutline,
  FavoriteBorder, Favorite, ShareOutlined, SchoolOutlined, WorkspacePremiumOutlined,
  GridViewOutlined, ImageOutlined, OpenInNewOutlined, PhotoLibrary, CheckRounded, CloseRounded,
  EditOutlined, RateReviewOutlined,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { FreelancerProfile, FreelancerProfileService, PortfolioItem } from "@/types/user";
import { Service } from "@/types/service";
import ServiceCard from "@/app/(main)/explore-services/ServiceCard";
import { api, FreelancerReview } from "@/lib/api";
import { useAuth } from "@/components/context/AuthContext";
import { tokens } from "@/theme";
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

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.375, minWidth: 0 }}>
      <Typography sx={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: tokens.text3 }}>{label}</Typography>
      <Box sx={{ lineHeight: 1.1 }}>{children}</Box>
    </Box>
  );
}
const StatDivider = () => <Box sx={{ width: "1px", height: 30, bgcolor: tokens.border, flex: "none" }} />;

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
  const handleReviewsPageChange = (_: React.ChangeEvent<unknown>, page: number) => {
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
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      <PPBlock title="About">
        {profile.about ? <Box sx={{ fontSize: 15, lineHeight: 1.65, color: tokens.text }}><RichTextDisplay value={profile.about} /></Box>
          : <Typography sx={{ color: tokens.text3, fontSize: 14 }}>This freelancer hasn&rsquo;t written a bio yet.</Typography>}
      </PPBlock>
      <PPBlock title="Languages">
        {languages.length ? <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.125 }}>{languages.map(l => <LangChip key={l.id} name={l.name} proficiency={l.proficiency} />)}</Box>
          : <Typography sx={{ color: tokens.text3, fontSize: 14 }}>No languages listed.</Typography>}
      </PPBlock>
      <PPBlock title="Skills">
        {expertises.length ? <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>{expertises.map(s => (
          <Box key={s.id} component="span" sx={{ display: "inline-flex", alignItems: "center", height: 32, px: 1.625, borderRadius: "999px", bgcolor: "rgba(0,0,0,0.045)", fontSize: 13, fontWeight: 500 }}>{s.expertise_name}</Box>
        ))}</Box> : <Typography sx={{ color: tokens.text3, fontSize: 14 }}>No skills listed.</Typography>}
      </PPBlock>
      <PPBlock title="Education">
        {educations.length ? <Box>{educations.map((e, i) => <EntryRow key={i} icon={<SchoolOutlined sx={{ fontSize: 19 }} />} title={e.studies} sub={e.facility} />)}</Box>
          : <Typography sx={{ color: tokens.text3, fontSize: 14 }}>No education listed.</Typography>}
      </PPBlock>
      <PPBlock title="Certifications" last>
        {certificates.length ? <Box>{certificates.map((c, i) => <EntryRow key={i} icon={<WorkspacePremiumOutlined sx={{ fontSize: 19 }} />} title={c.title} sub={c.source} />)}</Box>
          : <Typography sx={{ color: tokens.text3, fontSize: 14 }}>No certifications listed.</Typography>}
      </PPBlock>
    </Box>
  );

  const portfolioBody = portfolio.length ? (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
      {portfolio.map(item => {
        const cover = item.images[0]?.file_url;
        const date = portfolioDate(item.completed_on);
        return (
          <Box key={item.id} onClick={() => item.images.length > 0 && setLightbox({ item, index: 0 })}
            sx={{ border: `1px solid ${tokens.border}`, borderRadius: "14px", overflow: "hidden", cursor: item.images.length ? "pointer" : "default", bgcolor: tokens.surface, transition: "box-shadow .15s, transform .12s, border-color .15s", "&:hover": { boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 12px 30px rgba(0,0,0,0.08)", transform: "translateY(-2px)", borderColor: tokens.borderStrong } }}>
            <Box sx={{ position: "relative", aspectRatio: "16 / 10", bgcolor: "rgba(0,0,0,0.04)" }}>
              {cover ? <Box component="img" src={cover} alt={item.title} sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                : <Box sx={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: tokens.text3 }}><PhotoLibrary sx={{ fontSize: 30 }} /></Box>}
              {item.images.length > 1 && (
                <Box sx={{ position: "absolute", top: 10, right: 10, display: "inline-flex", alignItems: "center", gap: 0.5, height: 26, px: 1.125, borderRadius: "999px", bgcolor: "rgba(0,0,0,0.6)", color: "#fff", fontSize: 11.5, fontWeight: 600 }}>
                  <ImageOutlined sx={{ fontSize: 13 }} />{item.images.length}
                </Box>
              )}
            </Box>
            <Box sx={{ p: "13px 15px" }}>
              <Typography sx={{ fontSize: 14.5, fontWeight: 600, letterSpacing: "-0.01em" }}>{item.title}</Typography>
              {item.description && <Typography sx={{ fontSize: 12.5, color: tokens.text2, mt: 0.625, display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{item.description}</Typography>}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mt: 1.125 }}>
                {date && <Typography sx={{ fontSize: 12, color: tokens.text3, fontFamily: tokens.mono }}>{date}</Typography>}
                {item.project_url && (
                  <Box component="a" href={item.project_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                    sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, fontSize: 12, fontWeight: 600, color: tokens.accent, textDecoration: "none", "&:hover": { textDecoration: "underline" } }}>
                    View project <OpenInNewOutlined sx={{ fontSize: 13 }} />
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        );
      })}
    </Box>
  ) : <Empty icon={<GridViewOutlined sx={{ fontSize: 24 }} />} title="No portfolio yet" sub="This freelancer hasn't added any projects to show." />;

  const servicesBody = services.length ? (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" }, gap: 2 }}>
      {services.map((s: FreelancerProfileService) => <ServiceCard key={s.id} service={s as unknown as Service} />)}
    </Box>
  ) : <Empty icon={<GridViewOutlined sx={{ fontSize: 24 }} />} title="No services yet" sub="This freelancer hasn't published any services." />;

  const reviewsBody = (
    <Box>
      <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: { xs: 2, sm: 4.5 }, alignItems: { xs: "flex-start", sm: "center" }, pb: 3, mb: 3, borderBottom: `1px solid ${tokens.border}` }}>
        <Box sx={{ textAlign: { xs: "left", sm: "center" }, flex: "none" }}>
          <Typography sx={{ fontFamily: tokens.mono, fontSize: 44, fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1 }}>{hasRating ? ratingAvg.toFixed(1) : "—"}</Typography>
          <Box sx={{ mt: 1 }}><Stars5 rating={ratingAvg} size={16} /></Box>
          <Typography sx={{ fontSize: 12.5, color: tokens.text2, mt: 0.75 }}>{ratingCount} review{ratingCount !== 1 ? "s" : ""}</Typography>
        </Box>
        <Typography sx={{ fontSize: 13.5, color: tokens.text2, lineHeight: 1.6 }}>
          {hasRating ? "Ratings come from clients after they complete and approve an order, so they reflect real, paid work." : "No reviews yet — they'll appear here once clients complete orders with this freelancer."}
        </Typography>
      </Box>
      {reviewsLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}><CircularProgress size={28} /></Box>
      ) : reviewsError ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography sx={{ fontSize: 14, color: tokens.text3 }}>{reviewsError}</Typography>
          <Button onClick={() => fetchReviews(reviewsPage)} sx={{ mt: 1.5, fontSize: 13, textTransform: "none", color: tokens.accent }}>Try again</Button>
        </Box>
      ) : reviews.length === 0 ? (
        <Empty icon={<RateReviewOutlined sx={{ fontSize: 24 }} />} title="No reviews yet" sub="Reviews from completed orders will appear here." />
      ) : (
        <>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>{reviews.map(r => <ReviewCard key={r.id} review={r} />)}</Box>
          {reviewsLastPage > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Pagination count={reviewsLastPage} page={reviewsPage} onChange={handleReviewsPageChange} shape="rounded" sx={{ "& .Mui-selected": { bgcolor: "#000 !important", color: "#fff" } }} />
            </Box>
          )}
        </>
      )}
    </Box>
  );

  const body = { about: aboutBody, portfolio: portfolioBody, services: servicesBody, reviews: reviewsBody }[activeTab];

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: tokens.canvas }}>
      {/* Back bar */}
      <Box sx={{ bgcolor: tokens.surface, borderBottom: `1px solid ${tokens.border}` }}>
        <Box sx={{ maxWidth: 1000, mx: "auto", px: { xs: 2, md: 3 }, py: 1.25 }}>
          <Button onClick={() => router.back()} startIcon={<ChevronLeft sx={{ fontSize: 18 }} />} sx={{ fontSize: 12.5, color: tokens.text2, textTransform: "none", "&:hover": { color: tokens.text, bgcolor: "transparent" } }}>Back</Button>
        </Box>
      </Box>

      <Box sx={{ maxWidth: 1000, mx: "auto", px: { xs: 1.75, md: 3 }, py: { xs: 2, md: 3.5 } }}>
        {/* Hero */}
        <Box sx={{ bgcolor: tokens.surface, border: `1px solid ${tokens.border}`, borderRadius: `${tokens.radius.card}px`, overflow: "hidden" }}>
          <Box sx={{ px: { xs: 2.25, md: 3.25 }, pt: { xs: 2.5, md: 3 }, pb: { xs: 2.5, md: 3 } }}>
            <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, alignItems: { xs: "flex-start", md: "center" }, gap: { xs: 1.75, md: 2.5 } }}>
              <Box sx={{ borderRadius: "50%", border: `4px solid ${tokens.surface}`, bgcolor: tokens.surface }}>
                <ProfileAvatar name={name} src={avatar} size={104} verified={isVerified} />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0, pb: { md: 0.5 } }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.125, flexWrap: "wrap" }}>
                  <Typography sx={{ fontSize: { xs: 23, md: 27 }, fontWeight: 600, letterSpacing: "-0.025em" }}>{name}</Typography>
                  {isVerified && profile.level && <LevelBadge level={profile.level} />}
                </Box>
                <Typography sx={{ fontSize: { xs: 14.5, md: 16 }, color: tokens.text, mt: 0.75, lineHeight: 1.4 }}>
                  {profile.tagline || <Box component="span" sx={{ color: tokens.text3 }}>No tagline yet</Box>}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.75, mt: 1.25, flexWrap: "wrap", fontSize: 13.5, color: tokens.text2 }}>
                  {profile.location && <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.625 }}><RoomOutlined sx={{ fontSize: 15 }} />{profile.location}</Box>}
                  {isVerified && <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.625, color: tokens.accent }}><ShieldOutlined sx={{ fontSize: 15 }} />Verified</Box>}
                </Box>
              </Box>
              {/* desktop actions */}
              <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1.125, flex: "none", pb: 0.5 }}>
                {isOwner ? (
                  <Button onClick={() => router.push("/dashboard/freelancer")} startIcon={<EditOutlined sx={{ fontSize: 15 }} />} sx={heroSecBtn}>Edit profile</Button>
                ) : (
                  <>
                    <IconButton onClick={() => setIsFavorite(!isFavorite)} sx={{ width: 40, height: 40, border: `1px solid ${isFavorite ? "rgba(220,38,38,0.3)" : tokens.borderStrong}`, color: isFavorite ? tokens.error : tokens.text2, bgcolor: isFavorite ? tokens.errorTint : tokens.surface }}>{isFavorite ? <Favorite sx={{ fontSize: 17 }} /> : <FavoriteBorder sx={{ fontSize: 17 }} />}</IconButton>
                    <IconButton sx={{ width: 40, height: 40, border: `1px solid ${tokens.borderStrong}`, color: tokens.text2, bgcolor: tokens.surface }}><ShareOutlined sx={{ fontSize: 17 }} /></IconButton>
                    <Button onClick={handleMessage} disabled={messaging} startIcon={messaging ? <CircularProgress size={15} sx={{ color: "#fff" }} /> : <ChatBubbleOutline sx={{ fontSize: 15 }} />} sx={{ ...heroPrimaryBtn, px: 2.75 }}>Message</Button>
                  </>
                )}
              </Box>
            </Box>
            {/* stat strip */}
            <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 2, md: 3.25 }, mt: 2.25, pt: 2, borderTop: `1px solid ${tokens.border}`, flexWrap: "wrap" }}>
              <Stat label="Rating">{hasRating ? <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.75 }}><StarGlyph size={16} /><Typography component="span" sx={{ fontSize: 16, fontWeight: 600, fontFamily: tokens.mono }}>{ratingAvg.toFixed(1)}</Typography><Typography component="span" sx={{ fontSize: 12.5, color: tokens.text2 }}>({ratingCount})</Typography></Box> : <Typography sx={{ fontSize: 14, color: tokens.text3 }}>New</Typography>}</Stat>
              <StatDivider />
              <Stat label="Orders"><Typography component="span" sx={{ fontSize: 16, fontWeight: 600, fontFamily: tokens.mono }}>{profile.completed_orders_count ?? 0}</Typography></Stat>
              {profile.level && <><StatDivider /><Stat label="Level"><Typography component="span" sx={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em" }}>{profile.level}</Typography></Stat></>}
              {languages.length > 0 && <Box sx={{ display: { xs: "none", md: "contents" } }}><StatDivider /><Stat label="Languages"><Typography component="span" sx={{ fontSize: 14.5, fontWeight: 500 }}>{languages.map(l => l.name).join(", ")}</Typography></Stat></Box>}
            </Box>
          </Box>
        </Box>

        {/* Body: content + sticky CTA */}
        <Box sx={{ display: "flex", gap: 3, mt: 2.25, alignItems: "flex-start" }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: "flex", gap: 3.25, borderBottom: `1px solid ${tokens.border}`, mb: 2.75, overflowX: "auto" }}>
              {TABS.map(t => {
                const on = activeTab === t.id;
                return (
                  <Box key={t.id} component="button" onClick={() => handleTabChange(t.id)}
                    sx={{ position: "relative", height: 40, px: 0.5, border: 0, bgcolor: "transparent", cursor: "pointer", fontFamily: "inherit", fontSize: 14.5, fontWeight: on ? 600 : 500, color: on ? tokens.text : tokens.text2, whiteSpace: "nowrap", "&:hover": { color: tokens.text }, "&::after": on ? { content: '""', position: "absolute", left: 0, right: 0, bottom: -1, height: 2, bgcolor: "#000", borderRadius: "2px" } : {} }}>
                    {t.label}{counts[t.id] > 0 && <Box component="span" sx={{ ml: 0.75, fontSize: 12, color: tokens.text3 }}>{counts[t.id]}</Box>}
                  </Box>
                );
              })}
            </Box>
            <Box sx={{ bgcolor: tokens.surface, border: `1px solid ${tokens.border}`, borderRadius: `${tokens.radius.card}px`, p: { xs: 2.25, md: 3.25 } }}>{body}</Box>
          </Box>

          {/* desktop sticky contact card */}
          <Box sx={{ display: { xs: "none", md: "block" }, width: 290, flex: "none", position: "sticky", top: 20 }}>
            <Box sx={{ bgcolor: tokens.surface, border: `1px solid ${tokens.border}`, borderRadius: `${tokens.radius.card}px`, p: 2.75 }}>
              {isOwner && <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.875, px: 1.375, py: 0.75, borderRadius: "999px", bgcolor: tokens.accentFill, color: tokens.accent, fontSize: 11.5, fontWeight: 600, mb: 1.75 }}>Owner preview</Box>}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <ProfileAvatar name={name} src={avatar} size={48} verified={isVerified} />
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em" }}>{name}</Typography>
                  <Typography sx={{ fontSize: 12.5, color: tokens.text2, mt: 0.25, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{profile.tagline || (isVerified ? "Verified freelancer" : "Freelancer on KickAir")}</Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.125, mt: 2.25 }}>
                {isOwner ? (
                  <Button onClick={() => router.push("/dashboard/freelancer")} startIcon={<EditOutlined sx={{ fontSize: 16 }} />} sx={{ ...heroSecBtn, width: "100%", height: 44 }}>Edit profile</Button>
                ) : (
                  <>
                    <Button onClick={handleMessage} disabled={messaging} startIcon={messaging ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : <ChatBubbleOutline sx={{ fontSize: 16 }} />} sx={{ ...heroPrimaryBtn, width: "100%", height: 44 }}>Message {name.split(" ")[0]}</Button>
                    <Box sx={{ display: "flex", gap: 1.125 }}>
                      <Button onClick={() => setIsFavorite(!isFavorite)} startIcon={isFavorite ? <Favorite sx={{ fontSize: 16 }} /> : <FavoriteBorder sx={{ fontSize: 16 }} />} sx={{ ...heroSecBtn, flex: 1 }}>Save</Button>
                      <Button startIcon={<ShareOutlined sx={{ fontSize: 16 }} />} sx={{ ...heroSecBtn, flex: 1 }}>Share</Button>
                    </Box>
                  </>
                )}
              </Box>
              <Box sx={{ mt: 2.25, pt: 2, borderTop: `1px solid ${tokens.border}`, display: "flex", flexDirection: "column", gap: 1.375 }}>
                {([["Identity verified", isVerified], ["Phone verified", isPhoneVerified]] as const).map(([label, ok]) => (
                  <Box key={label} sx={{ display: "flex", alignItems: "center", gap: 1.125, fontSize: 13 }}>
                    <Box sx={{ color: ok ? tokens.success : tokens.text3, display: "flex" }}>{ok ? <CheckRounded sx={{ fontSize: 16 }} /> : <CloseRounded sx={{ fontSize: 16 }} />}</Box>
                    <Typography sx={{ fontSize: 13, color: ok ? tokens.text : tokens.text3 }}>{label}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* mobile bottom action bar */}
      {!isOwner && (
        <Box sx={{ display: { xs: "flex", md: "none" }, position: "sticky", bottom: 0, gap: 1.125, p: "12px 14px", bgcolor: "rgba(255,255,255,0.9)", backdropFilter: "saturate(1.4) blur(16px)", borderTop: `1px solid ${tokens.border}` }}>
          <IconButton onClick={() => setIsFavorite(!isFavorite)} sx={{ width: 46, height: 46, flex: "none", border: `1px solid ${tokens.borderStrong}`, color: isFavorite ? tokens.error : tokens.text2 }}>{isFavorite ? <Favorite sx={{ fontSize: 18 }} /> : <FavoriteBorder sx={{ fontSize: 18 }} />}</IconButton>
          <Button onClick={handleMessage} disabled={messaging} startIcon={messaging ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : <ChatBubbleOutline sx={{ fontSize: 16 }} />} sx={{ ...heroPrimaryBtn, flex: 1, height: 46 }}>Message</Button>
        </Box>
      )}

      {/* Lightbox */}
      {lightbox && (() => {
        const imgs = lightbox.item.images;
        const cur = imgs[lightbox.index];
        const go = (delta: number, e: React.MouseEvent) => { e.stopPropagation(); setLightbox(lb => (lb ? { ...lb, index: (lb.index + delta + imgs.length) % imgs.length } : lb)); };
        return (
          <Box onClick={() => setLightbox(null)} sx={{ position: "fixed", inset: 0, zIndex: 1400, bgcolor: "rgba(16,14,12,0.92)", backdropFilter: "blur(8px)", display: "flex", flexDirection: "column" }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: "16px 20px", color: "#fff" }} onClick={e => e.stopPropagation()}>
              <Box>
                <Typography sx={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em" }}>{lightbox.item.title}</Typography>
                <Typography sx={{ fontSize: 12.5, opacity: 0.6, mt: 0.25, fontFamily: tokens.mono }}>{lightbox.index + 1} / {imgs.length}</Typography>
              </Box>
              <IconButton onClick={() => setLightbox(null)} sx={{ width: 36, height: 36, bgcolor: "rgba(255,255,255,0.1)", color: "#fff", "&:hover": { bgcolor: "rgba(255,255,255,0.2)" } }}><Close /></IconButton>
            </Box>
            <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", px: { xs: 2, md: 10 }, minHeight: 0, position: "relative" }} onClick={e => e.stopPropagation()}>
              {imgs.length > 1 && <IconButton onClick={e => go(-1, e)} sx={{ position: "absolute", left: 18, width: 48, height: 48, bgcolor: "rgba(255,255,255,0.1)", color: "#fff", "&:hover": { bgcolor: "rgba(255,255,255,0.2)" } }}><ChevronLeft sx={{ fontSize: 24 }} /></IconButton>}
              <Box component="img" src={cur?.file_url} alt={lightbox.item.title} sx={{ maxWidth: "100%", maxHeight: "70vh", objectFit: "contain", borderRadius: 2 }} />
              {imgs.length > 1 && <IconButton onClick={e => go(1, e)} sx={{ position: "absolute", right: 18, width: 48, height: 48, bgcolor: "rgba(255,255,255,0.1)", color: "#fff", "&:hover": { bgcolor: "rgba(255,255,255,0.2)" } }}><ChevronRight sx={{ fontSize: 24 }} /></IconButton>}
            </Box>
            {imgs.length > 1 && (
              <Box sx={{ display: "flex", gap: 1.25, justifyContent: "center", p: 2.25, flexWrap: "wrap" }} onClick={e => e.stopPropagation()}>
                {imgs.map((im, i) => (
                  <Box key={im.id} onClick={() => setLightbox(lb => (lb ? { ...lb, index: i } : lb))} sx={{ width: 64, height: 48, borderRadius: "7px", cursor: "pointer", overflow: "hidden", opacity: i === lightbox.index ? 1 : 0.45, outline: i === lightbox.index ? "2px solid #fff" : "2px solid transparent", transition: "opacity .15s, outline-color .15s" }}>
                    <Box component="img" src={im.file_url} alt="" sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        );
      })()}
    </Box>
  );
}

/* Content block within a tab (title + divider) */
function PPBlock({ title, action, children, last }: { title: string; action?: React.ReactNode; children: React.ReactNode; last?: boolean }) {
  return (
    <Box sx={{ pb: last ? 0 : 3.25, mb: last ? 0 : 3.25, borderBottom: last ? "none" : `1px solid ${tokens.border}` }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography sx={{ fontSize: 17, fontWeight: 600, letterSpacing: "-0.015em" }}>{title}</Typography>
        {action}
      </Box>
      {children}
    </Box>
  );
}

const heroPrimaryBtn = { height: 40, borderRadius: "999px", textTransform: "none", fontSize: 14, fontWeight: 600, bgcolor: "#000", color: "#fff", boxShadow: "none", "&:hover": { bgcolor: "rgba(0,0,0,0.8)", boxShadow: "none" } } as const;
const heroSecBtn = { height: 40, px: 2, borderRadius: "999px", textTransform: "none", fontSize: 13.5, fontWeight: 600, border: `1px solid ${tokens.borderStrong}`, color: tokens.text, bgcolor: tokens.surface, "&:hover": { bgcolor: tokens.surface2 } } as const;
