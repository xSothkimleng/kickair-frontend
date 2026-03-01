"use client";

import { useState, useCallback } from "react";
import RichTextDisplay from "@/components/ui/RichTextDisplay";
import ReviewCard from "@/components/ui/ReviewCard";
import {
  Box,
  Typography,
  Avatar,
  Button,
  Chip,
  Card,
  CardContent,
  IconButton,
  Pagination,
  CircularProgress,
} from "@mui/material";
import {
  ChevronLeft,
  LocationOn,
  Verified,
  Message,
  Favorite,
  FavoriteBorder,
  Share,
  ChevronRight,
  WorkspacePremium,
  Translate,
  School,
  ShoppingBag,
  ImageNotSupported,
  Star as StarIcon,
  RateReview as ReviewIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FreelancerProfile } from "@/types/user";
import { api, FreelancerReview } from "@/lib/api";

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

const PROFICIENCY_LABELS: Record<string, string> = {
  basic: "Basic",
  conversational: "Conversational",
  fluent: "Fluent",
  native: "Native",
};

function StatBadge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
      {icon}
      <Typography sx={{ fontSize: 13, color: "rgba(0,0,0,0.6)" }}>{label}</Typography>
    </Box>
  );
}

export function FreelancerProfilePage({ profile }: FreelancerProfilePageProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("about");
  const [isFavorite, setIsFavorite] = useState(false);

  // Reviews state
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
    if (tab === "reviews" && !reviewsFetched) {
      fetchReviews(1);
    }
  };

  const handleReviewsPageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    setReviewsPage(page);
    fetchReviews(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const name = profile.user?.name || "Unknown";
  const avatar = profile.user?.avatar_url || "";
  const isVerified = profile.user?.is_verified_id || false;

  const ratingAvg = profile.rating_average ? parseFloat(profile.rating_average) : null;
  const hasRating = typeof profile.rating_count === "number" && profile.rating_count > 0 && ratingAvg !== null;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#F5F5F7" }}>
      {/* Back bar */}
      <Box sx={{ bgcolor: "white", borderBottom: "1px solid rgba(0, 0, 0, 0.08)" }}>
        <Box sx={{ maxWidth: 1440, mx: "auto", px: 3, py: 1.5 }}>
          <Button
            onClick={() => router.back()}
            startIcon={<ChevronLeft sx={{ fontSize: 18 }} />}
            sx={{
              fontSize: 12, color: "rgba(0, 0, 0, 0.6)", textTransform: "none",
              "&:hover": { color: "black", bgcolor: "transparent" },
            }}
          >
            Back to Freelancers
          </Button>
        </Box>
      </Box>

      {/* Profile header */}
      <Box sx={{ bgcolor: "white", borderBottom: "1px solid rgba(0, 0, 0, 0.08)" }}>
        <Box sx={{ maxWidth: 1440, mx: "auto", px: { xs: 3, md: 6 }, py: 5 }}>
          <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 4, alignItems: "flex-start" }}>
            {/* Avatar */}
            <Box sx={{ position: "relative", flexShrink: 0 }}>
              <Avatar
                src={avatar}
                alt={name}
                sx={{ width: 120, height: 120, fontSize: 40, bgcolor: "rgba(0,0,0,0.08)" }}
              >
                {name.charAt(0)}
              </Avatar>
              {isVerified && (
                <Box
                  sx={{
                    position: "absolute", bottom: 2, right: 2,
                    width: 32, height: 32,
                    bgcolor: "#0071e3", borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    border: "3px solid white",
                  }}
                >
                  <Verified sx={{ fontSize: 16, color: "white" }} />
                </Box>
              )}
            </Box>

            {/* Info */}
            <Box sx={{ flex: 1 }}>
              {/* Name row */}
              <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2, mb: 1.5 }}>
                <Box>
                  <Typography sx={{ fontSize: 28, fontWeight: 600, color: "black", lineHeight: 1.2 }}>
                    {name}
                  </Typography>
                  {profile.tagline && (
                    <Typography sx={{ fontSize: 16, color: "rgba(0,0,0,0.65)", mt: 0.5 }}>
                      {profile.tagline}
                    </Typography>
                  )}
                  {profile.location && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 1 }}>
                      <LocationOn sx={{ fontSize: 14, color: "rgba(0,0,0,0.4)" }} />
                      <Typography sx={{ fontSize: 13, color: "rgba(0,0,0,0.5)" }}>{profile.location}</Typography>
                    </Box>
                  )}
                </Box>

                {/* Action icons */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <IconButton
                    onClick={() => setIsFavorite(!isFavorite)}
                    sx={{
                      width: 40, height: 40,
                      border: "1px solid",
                      borderColor: isFavorite ? "rgba(239,68,68,0.3)" : "rgba(0,0,0,0.1)",
                      bgcolor: isFavorite ? "rgba(239,68,68,0.06)" : "white",
                      color: isFavorite ? "#ef4444" : "rgba(0,0,0,0.4)",
                      "&:hover": { borderColor: isFavorite ? "rgba(239,68,68,0.5)" : "rgba(0,0,0,0.2)" },
                    }}
                  >
                    {isFavorite ? <Favorite sx={{ fontSize: 18 }} /> : <FavoriteBorder sx={{ fontSize: 18 }} />}
                  </IconButton>
                  <IconButton
                    sx={{
                      width: 40, height: 40,
                      border: "1px solid rgba(0,0,0,0.1)", bgcolor: "white",
                      color: "rgba(0,0,0,0.4)",
                      "&:hover": { borderColor: "rgba(0,0,0,0.2)" },
                    }}
                  >
                    <Share sx={{ fontSize: 18 }} />
                  </IconButton>
                </Box>
              </Box>

              {/* Expertise chips */}
              {profile.expertises && profile.expertises.length > 0 && (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mb: 2 }}>
                  {profile.expertises.map(exp => (
                    <Chip
                      key={exp.id}
                      label={exp.expertise_name}
                      sx={{
                        height: 26, fontSize: 12,
                        bgcolor: "rgba(0,113,227,0.08)", color: "#0071e3",
                        "& .MuiChip-label": { px: 1.5 },
                      }}
                    />
                  ))}
                </Box>
              )}

              {/* Stats row */}
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2.5, mb: 2.5 }}>
                {hasRating ? (
                  <StatBadge
                    icon={<StarIcon sx={{ fontSize: 15, color: "#f59e0b" }} />}
                    label={`${ratingAvg!.toFixed(2)} (${profile.rating_count} review${profile.rating_count !== 1 ? "s" : ""})`}
                  />
                ) : (
                  <StatBadge
                    icon={<ReviewIcon sx={{ fontSize: 15, color: "rgba(0,0,0,0.3)" }} />}
                    label="No reviews yet"
                  />
                )}
                {profile.completed_orders_count > 0 && (
                  <StatBadge
                    icon={<CheckCircleIcon sx={{ fontSize: 15, color: "#16a34a" }} />}
                    label={`${profile.completed_orders_count} completed order${profile.completed_orders_count !== 1 ? "s" : ""}`}
                  />
                )}
              </Box>

              {/* CTA */}
              <Box sx={{ display: "flex", gap: 1.5 }}>
                <Button
                  startIcon={<Message sx={{ fontSize: 16 }} />}
                  sx={{
                    px: 3, height: 44, fontSize: 13, fontWeight: 500,
                    bgcolor: "#0071e3", color: "white", borderRadius: 25,
                    textTransform: "none",
                    "&:hover": { bgcolor: "#0077ED" },
                  }}
                >
                  Contact Me
                </Button>
                <Button
                  onClick={() => handleTabChange("services")}
                  sx={{
                    px: 3, height: 44, fontSize: 13, fontWeight: 500,
                    bgcolor: "white", color: "black",
                    border: "1px solid rgba(0,0,0,0.12)", borderRadius: 25,
                    textTransform: "none",
                    "&:hover": { borderColor: "rgba(0,0,0,0.25)", bgcolor: "white" },
                  }}
                >
                  View Services
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Tabs */}
      <Box
        sx={{
          bgcolor: "white", borderBottom: "1px solid rgba(0,0,0,0.08)",
          position: "sticky", top: 0, zIndex: 10,
        }}
      >
        <Box sx={{ maxWidth: 1440, mx: "auto", px: { xs: 3, md: 6 } }}>
          <Box sx={{ display: "flex", gap: 0 }}>
            {TABS.map(tab => (
              <Button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                disableRipple
                sx={{
                  px: 2, py: 2, fontSize: 13, fontWeight: 500,
                  textTransform: "none", borderRadius: 0,
                  color: activeTab === tab.id ? "black" : "rgba(0,0,0,0.55)",
                  borderBottom: activeTab === tab.id ? "2px solid #0071e3" : "2px solid transparent",
                  "&:hover": { bgcolor: "transparent", color: "black" },
                }}
              >
                {tab.label}
                {tab.id === "reviews" && profile.rating_count > 0 && (
                  <Box
                    component="span"
                    sx={{
                      ml: 0.75, px: 0.75, py: 0.1,
                      bgcolor: activeTab === "reviews" ? "#0071e3" : "rgba(0,0,0,0.1)",
                      color: activeTab === "reviews" ? "white" : "rgba(0,0,0,0.5)",
                      borderRadius: 10, fontSize: 10, fontWeight: 600,
                    }}
                  >
                    {profile.rating_count}
                  </Box>
                )}
              </Button>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Tab content */}
      <Box sx={{ maxWidth: 1440, mx: "auto", px: { xs: 3, md: 6 }, py: 5 }}>
        <Box sx={{ maxWidth: 900 }}>

          {/* ── ABOUT ── */}
          {activeTab === "about" && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {profile.about && (
                <Box sx={{ bgcolor: "white", borderRadius: 3, border: "1px solid rgba(0,0,0,0.08)", p: 4 }}>
                  <Typography sx={{ fontSize: 17, fontWeight: 600, color: "black", mb: 2 }}>About</Typography>
                  <Box sx={{ fontSize: 14, color: "rgba(0,0,0,0.75)", lineHeight: 1.75 }}>
                    <RichTextDisplay value={profile.about} />
                  </Box>
                </Box>
              )}

              {profile.languages && profile.languages.length > 0 && (
                <Box sx={{ bgcolor: "white", borderRadius: 3, border: "1px solid rgba(0,0,0,0.08)", p: 4 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2.5 }}>
                    <Translate sx={{ fontSize: 20, color: "rgba(0,0,0,0.5)" }} />
                    <Typography sx={{ fontSize: 17, fontWeight: 600, color: "black" }}>Languages</Typography>
                  </Box>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                    {profile.languages.map(lang => (
                      <Box key={lang.id} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <Typography sx={{ fontSize: 14, color: "black", fontWeight: 500 }}>{lang.name}</Typography>
                        <Typography sx={{ fontSize: 13, color: "rgba(0,0,0,0.5)" }}>
                          {PROFICIENCY_LABELS[lang.proficiency] || lang.proficiency}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              {profile.educations && profile.educations.length > 0 && (
                <Box sx={{ bgcolor: "white", borderRadius: 3, border: "1px solid rgba(0,0,0,0.08)", p: 4 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2.5 }}>
                    <School sx={{ fontSize: 20, color: "rgba(0,0,0,0.5)" }} />
                    <Typography sx={{ fontSize: 17, fontWeight: 600, color: "black" }}>Education</Typography>
                  </Box>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {profile.educations.map((edu, idx) => (
                      <Box key={idx} sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
                        <Typography sx={{ fontSize: 14, fontWeight: 500, color: "black" }}>{edu.studies}</Typography>
                        <Typography sx={{ fontSize: 13, color: "rgba(0,0,0,0.6)" }}>{edu.facility}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              {profile.certificates && profile.certificates.length > 0 && (
                <Box sx={{ bgcolor: "white", borderRadius: 3, border: "1px solid rgba(0,0,0,0.08)", p: 4 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2.5 }}>
                    <WorkspacePremium sx={{ fontSize: 20, color: "#0071e3" }} />
                    <Typography sx={{ fontSize: 17, fontWeight: 600, color: "black" }}>Certifications</Typography>
                  </Box>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {profile.certificates.map((cert, idx) => (
                      <Box key={idx} sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
                        <Typography sx={{ fontSize: 14, fontWeight: 500, color: "black" }}>{cert.title}</Typography>
                        <Typography sx={{ fontSize: 13, color: "rgba(0,0,0,0.6)" }}>{cert.source}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              {!profile.about && (!profile.languages || profile.languages.length === 0) &&
                (!profile.educations || profile.educations.length === 0) &&
                (!profile.certificates || profile.certificates.length === 0) && (
                <Box sx={{ bgcolor: "white", borderRadius: 3, border: "1px solid rgba(0,0,0,0.08)", p: 6, textAlign: "center" }}>
                  <Typography sx={{ fontSize: 14, color: "rgba(0,0,0,0.4)" }}>
                    This freelancer hasn&apos;t filled in their profile yet.
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {/* ── PORTFOLIO (placeholder) ── */}
          {activeTab === "portfolio" && (
            <Box sx={{ bgcolor: "white", borderRadius: 3, border: "1px solid rgba(0,0,0,0.08)", p: 6, textAlign: "center" }}>
              <ImageNotSupported sx={{ fontSize: 48, color: "rgba(0,0,0,0.15)", mb: 2 }} />
              <Typography sx={{ fontSize: 15, fontWeight: 500, color: "rgba(0,0,0,0.5)", mb: 1 }}>
                No portfolio yet
              </Typography>
              <Typography sx={{ fontSize: 13, color: "rgba(0,0,0,0.35)" }}>
                Portfolio items will appear here once the freelancer adds them.
              </Typography>
            </Box>
          )}

          {/* ── SERVICES ── */}
          {activeTab === "services" && (
            <Box>
              {profile.services && profile.services.length > 0 ? (
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" },
                    gap: 3,
                  }}
                >
                  {profile.services.map(service => {
                    const lowestPrice = service.pricing_options?.length
                      ? Math.min(...service.pricing_options.map(p => p.price_raw))
                      : null;
                    const fastestDelivery = service.pricing_options?.length
                      ? Math.min(...service.pricing_options.map(p => p.delivery_time ?? Infinity))
                      : null;

                    return (
                      <Link key={service.id} href={`/explore-services/${service.id}`} style={{ textDecoration: "none" }}>
                        <Card
                          elevation={0}
                          sx={{
                            borderRadius: 3,
                            border: "1px solid rgba(0,0,0,0.08)",
                            overflow: "hidden",
                            cursor: "pointer",
                            transition: "all 0.3s",
                            "&:hover": {
                              border: "1px solid rgba(0,0,0,0.18)",
                              boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
                            },
                          }}
                        >
                          <CardContent sx={{ p: 2.5 }}>
                            <Typography
                              sx={{
                                fontSize: 14, fontWeight: 500, color: "black",
                                mb: 2, lineHeight: 1.45,
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                              }}
                            >
                              {service.title}
                            </Typography>

                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 2 }}>
                              <ShoppingBag sx={{ fontSize: 13, color: "rgba(0,0,0,0.5)" }} />
                              <Typography sx={{ fontSize: 12, color: "rgba(0,0,0,0.5)" }}>
                                {service.orders_count} order{service.orders_count !== 1 ? "s" : ""}
                              </Typography>
                            </Box>

                            <Box
                              sx={{
                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                pt: 2, borderTop: "1px solid rgba(0,0,0,0.07)",
                              }}
                            >
                              <Box>
                                {lowestPrice != null ? (
                                  <>
                                    <Typography sx={{ fontSize: 11, color: "rgba(0,0,0,0.5)", mb: 0.25 }}>Starting at</Typography>
                                    <Typography sx={{ fontSize: 17, fontWeight: 600, color: "black" }}>${lowestPrice}</Typography>
                                  </>
                                ) : (
                                  <Typography sx={{ fontSize: 13, color: "rgba(0,0,0,0.4)" }}>Price on request</Typography>
                                )}
                              </Box>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                {fastestDelivery != null && isFinite(fastestDelivery) && (
                                  <Typography sx={{ fontSize: 12, color: "rgba(0,0,0,0.5)" }}>
                                    {fastestDelivery}d delivery
                                  </Typography>
                                )}
                                <ChevronRight sx={{ fontSize: 18, color: "rgba(0,0,0,0.3)" }} />
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </Box>
              ) : (
                <Box sx={{ bgcolor: "white", borderRadius: 3, border: "1px solid rgba(0,0,0,0.08)", p: 6, textAlign: "center" }}>
                  <Typography sx={{ fontSize: 15, fontWeight: 500, color: "rgba(0,0,0,0.5)", mb: 1 }}>
                    No services yet
                  </Typography>
                  <Typography sx={{ fontSize: 13, color: "rgba(0,0,0,0.35)" }}>
                    This freelancer hasn&apos;t listed any services yet.
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {/* ── REVIEWS ── */}
          {activeTab === "reviews" && (
            <Box>
              {/* Summary bar */}
              {hasRating && (
                <Box
                  sx={{
                    display: "flex", alignItems: "center", gap: 2,
                    bgcolor: "white", borderRadius: 3, border: "1px solid rgba(0,0,0,0.08)",
                    p: 3, mb: 3,
                  }}
                >
                  <Typography sx={{ fontSize: 40, fontWeight: 700, color: "black", lineHeight: 1 }}>
                    {ratingAvg!.toFixed(2)}
                  </Typography>
                  <Box>
                    <Box sx={{ display: "flex", gap: 0.25, mb: 0.5 }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarIcon
                          key={star}
                          sx={{
                            fontSize: 18,
                            color: star <= Math.round(ratingAvg!) ? "#f59e0b" : "rgba(0,0,0,0.15)",
                          }}
                        />
                      ))}
                    </Box>
                    <Typography sx={{ fontSize: 13, color: "rgba(0,0,0,0.5)" }}>
                      {profile.rating_count} review{profile.rating_count !== 1 ? "s" : ""}
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* Loading */}
              {reviewsLoading && (
                <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                  <CircularProgress size={28} />
                </Box>
              )}

              {/* Error */}
              {reviewsError && !reviewsLoading && (
                <Box sx={{ bgcolor: "white", borderRadius: 3, border: "1px solid rgba(0,0,0,0.08)", p: 6, textAlign: "center" }}>
                  <Typography sx={{ fontSize: 14, color: "rgba(0,0,0,0.4)" }}>{reviewsError}</Typography>
                  <Button
                    onClick={() => fetchReviews(reviewsPage)}
                    sx={{ mt: 2, fontSize: 13, textTransform: "none", color: "#0071e3" }}
                  >
                    Try again
                  </Button>
                </Box>
              )}

              {/* Reviews list */}
              {!reviewsLoading && !reviewsError && reviewsFetched && (
                <>
                  {reviews.length === 0 ? (
                    <Box sx={{ bgcolor: "white", borderRadius: 3, border: "1px solid rgba(0,0,0,0.08)", p: 6, textAlign: "center" }}>
                      <Typography sx={{ fontSize: 15, fontWeight: 500, color: "rgba(0,0,0,0.5)", mb: 1 }}>
                        No reviews yet
                      </Typography>
                      <Typography sx={{ fontSize: 13, color: "rgba(0,0,0,0.35)" }}>
                        Reviews will appear here once clients complete orders with this freelancer.
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      {reviews.map((review) => (
                        <ReviewCard key={review.id} review={review} />
                      ))}
                    </Box>
                  )}

                  {reviewsLastPage > 1 && (
                    <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                      <Pagination
                        count={reviewsLastPage}
                        page={reviewsPage}
                        onChange={handleReviewsPageChange}
                        shape="rounded"
                        sx={{
                          "& .MuiPaginationItem-root": { fontSize: 13 },
                          "& .Mui-selected": { bgcolor: "#0071e3 !important", color: "white" },
                        }}
                      />
                    </Box>
                  )}
                </>
              )}
            </Box>
          )}

        </Box>
      </Box>
    </Box>
  );
}
