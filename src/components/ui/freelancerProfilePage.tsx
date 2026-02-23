"use client";

import { useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  Button,
  Chip,
  Card,
  CardContent,
  IconButton,
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
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FreelancerProfile } from "@/types/user";

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

export function FreelancerProfilePage({ profile }: FreelancerProfilePageProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("about");
  const [isFavorite, setIsFavorite] = useState(false);

  const name = profile.user?.name || "Unknown";
  const avatar = profile.user?.profile_image || "";
  const isVerified = profile.user?.is_verified_id || false;

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
            }}>
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
                sx={{ width: 120, height: 120, fontSize: 40, bgcolor: "rgba(0,0,0,0.08)" }}>
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
                  }}>
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
                    }}>
                    {isFavorite
                      ? <Favorite sx={{ fontSize: 18 }} />
                      : <FavoriteBorder sx={{ fontSize: 18 }} />
                    }
                  </IconButton>
                  <IconButton
                    sx={{
                      width: 40, height: 40,
                      border: "1px solid rgba(0,0,0,0.1)", bgcolor: "white",
                      color: "rgba(0,0,0,0.4)",
                      "&:hover": { borderColor: "rgba(0,0,0,0.2)" },
                    }}>
                    <Share sx={{ fontSize: 18 }} />
                  </IconButton>
                </Box>
              </Box>

              {/* Expertise chips */}
              {profile.expertises && profile.expertises.length > 0 && (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mb: 2.5 }}>
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

              {/* CTA */}
              <Box sx={{ display: "flex", gap: 1.5 }}>
                <Button
                  startIcon={<Message sx={{ fontSize: 16 }} />}
                  sx={{
                    px: 3, height: 44, fontSize: 13, fontWeight: 500,
                    bgcolor: "#0071e3", color: "white", borderRadius: 25,
                    textTransform: "none",
                    "&:hover": { bgcolor: "#0077ED" },
                  }}>
                  Contact Me
                </Button>
                <Button
                  onClick={() => setActiveTab("services")}
                  sx={{
                    px: 3, height: 44, fontSize: 13, fontWeight: 500,
                    bgcolor: "white", color: "black",
                    border: "1px solid rgba(0,0,0,0.12)", borderRadius: 25,
                    textTransform: "none",
                    "&:hover": { borderColor: "rgba(0,0,0,0.25)", bgcolor: "white" },
                  }}>
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
        }}>
        <Box sx={{ maxWidth: 1440, mx: "auto", px: { xs: 3, md: 6 } }}>
          <Box sx={{ display: "flex", gap: 0 }}>
            {TABS.map(tab => (
              <Button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                disableRipple
                sx={{
                  px: 2, py: 2, fontSize: 13, fontWeight: 500,
                  textTransform: "none", borderRadius: 0,
                  color: activeTab === tab.id ? "black" : "rgba(0,0,0,0.55)",
                  borderBottom: activeTab === tab.id ? "2px solid #0071e3" : "2px solid transparent",
                  "&:hover": { bgcolor: "transparent", color: "black" },
                }}>
                {tab.label}
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

              {/* Bio */}
              {profile.about && (
                <Box sx={{ bgcolor: "white", borderRadius: 3, border: "1px solid rgba(0,0,0,0.08)", p: 4 }}>
                  <Typography sx={{ fontSize: 17, fontWeight: 600, color: "black", mb: 2 }}>About</Typography>
                  <Typography sx={{ fontSize: 14, color: "rgba(0,0,0,0.75)", lineHeight: 1.75, whiteSpace: "pre-wrap" }}>
                    {profile.about}
                  </Typography>
                </Box>
              )}

              {/* Languages */}
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

              {/* Education */}
              {profile.educations && profile.educations.length > 0 && (
                <Box sx={{ bgcolor: "white", borderRadius: 3, border: "1px solid rgba(0,0,0,0.08)", p: 4 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2.5 }}>
                    <School sx={{ fontSize: 20, color: "rgba(0,0,0,0.5)" }} />
                    <Typography sx={{ fontSize: 17, fontWeight: 600, color: "black" }}>Education</Typography>
                  </Box>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {profile.educations.map((edu, idx) => (
                      <Box key={idx} sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
                        <Typography sx={{ fontSize: 14, fontWeight: 500, color: "black" }}>{edu.degree}</Typography>
                        <Typography sx={{ fontSize: 13, color: "rgba(0,0,0,0.6)" }}>{edu.school}</Typography>
                        {(edu.from || edu.to !== undefined) && (
                          <Typography sx={{ fontSize: 12, color: "rgba(0,0,0,0.4)" }}>
                            {edu.from}{edu.from && (edu.to !== undefined) ? " – " : ""}{edu.to ?? "Present"}
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              {/* Certificates */}
              {profile.certificates && profile.certificates.length > 0 && (
                <Box sx={{ bgcolor: "white", borderRadius: 3, border: "1px solid rgba(0,0,0,0.08)", p: 4 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2.5 }}>
                    <WorkspacePremium sx={{ fontSize: 20, color: "#0071e3" }} />
                    <Typography sx={{ fontSize: 17, fontWeight: 600, color: "black" }}>Certifications</Typography>
                  </Box>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {profile.certificates.map((cert, idx) => (
                      <Box key={idx} sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
                        <Typography sx={{ fontSize: 14, fontWeight: 500, color: "black" }}>{cert.name}</Typography>
                        <Typography sx={{ fontSize: 13, color: "rgba(0,0,0,0.6)" }}>{cert.issuer}</Typography>
                        {cert.year && (
                          <Typography sx={{ fontSize: 12, color: "rgba(0,0,0,0.4)" }}>{cert.year}</Typography>
                        )}
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              {/* Empty about state */}
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
                  }}>
                  {profile.services.map(service => {
                    const lowestPrice = service.pricing_options?.length
                      ? Math.min(...service.pricing_options.map(p => p.price_raw))
                      : null;
                    const fastestDelivery = service.pricing_options?.length
                      ? Math.min(...service.pricing_options.map(p => p.delivery_time ?? Infinity))
                      : null;

                    return (
                      <Link
                        key={service.id}
                        href={`/explore-services/${service.id}`}
                        style={{ textDecoration: "none" }}>
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
                          }}>
                          <CardContent sx={{ p: 2.5 }}>
                            <Typography
                              sx={{
                                fontSize: 14, fontWeight: 500, color: "black",
                                mb: 2, lineHeight: 1.45,
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                              }}>
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
                              }}>
                              <Box>
                                {lowestPrice != null ? (
                                  <>
                                    <Typography sx={{ fontSize: 11, color: "rgba(0,0,0,0.5)", mb: 0.25 }}>
                                      Starting at
                                    </Typography>
                                    <Typography sx={{ fontSize: 17, fontWeight: 600, color: "black" }}>
                                      ${lowestPrice}
                                    </Typography>
                                  </>
                                ) : (
                                  <Typography sx={{ fontSize: 13, color: "rgba(0,0,0,0.4)" }}>
                                    Price on request
                                  </Typography>
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

          {/* ── REVIEWS (placeholder) ── */}
          {activeTab === "reviews" && (
            <Box sx={{ bgcolor: "white", borderRadius: 3, border: "1px solid rgba(0,0,0,0.08)", p: 6, textAlign: "center" }}>
              <Typography sx={{ fontSize: 15, fontWeight: 500, color: "rgba(0,0,0,0.5)", mb: 1 }}>
                No reviews yet
              </Typography>
              <Typography sx={{ fontSize: 13, color: "rgba(0,0,0,0.35)" }}>
                Reviews will appear here once clients complete orders with this freelancer.
              </Typography>
            </Box>
          )}

        </Box>
      </Box>
    </Box>
  );
}
