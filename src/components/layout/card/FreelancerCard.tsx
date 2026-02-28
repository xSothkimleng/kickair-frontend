"use client";

import { Box, Card, CardContent, Typography, Avatar, Chip } from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import Link from "next/link";
import { FreelancerProfile } from "@/types/user";

interface FreelancerCardProps {
  profile: FreelancerProfile;
}

export function FreelancerCard({ profile }: FreelancerCardProps) {
  const name = profile.user?.name || "Unknown";
  const avatar = profile.user?.avatar_url || "";
  const tagline = profile.tagline || "";
  const rating = profile.rating_average ? parseFloat(profile.rating_average) : null;

  const lowestPrice = profile.services?.length
    ? Math.min(...profile.services.flatMap(s => s.pricing_options?.map(p => p.price_raw) ?? []).filter(p => p > 0))
    : null;

  return (
    <Link href={`/find-freelancer/${profile.id}`} style={{ textDecoration: "none" }}>
      <Card
        elevation={0}
        sx={{
          borderRadius: 2,
          border: "1px solid rgba(0,0,0,0.08)",
          overflow: "hidden",
          cursor: "pointer",
          transition: "all 0.3s",
          "&:hover": {
            border: "1px solid rgba(0,0,0,0.2)",
            boxShadow: 3,
          },
        }}>
        <CardContent sx={{ p: 2 }}>
          {/* Avatar + Name + Tagline + Location */}
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, mb: 1.5 }}>
            <Avatar src={avatar} alt={name} sx={{ width: 40, height: 40, flexShrink: 0 }}>
              {name.charAt(0)}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: "black", lineHeight: 1.3 }}>
                {name}
              </Typography>
              {tagline && (
                <Typography
                  sx={{
                    fontSize: 12,
                    color: "rgba(0,0,0,0.6)",
                    mt: 0.25,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}>
                  {tagline}
                </Typography>
              )}
              {profile.location && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.25, mt: 0.5 }}>
                  <LocationOnIcon sx={{ fontSize: 12, color: "rgba(0,0,0,0.4)" }} />
                  <Typography sx={{ fontSize: 11, color: "rgba(0,0,0,0.5)" }}>{profile.location}</Typography>
                </Box>
              )}
            </Box>
          </Box>

          {/* Rating + Completed orders */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
            {rating !== null && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <StarRoundedIcon sx={{ fontSize: 13, color: "#f59e0b" }} />
                <Typography sx={{ fontSize: 11, fontWeight: 600, color: "black" }}>{rating.toFixed(1)}</Typography>
                {profile.rating_count > 0 && (
                  <Typography sx={{ fontSize: 11, color: "rgba(0,0,0,0.5)" }}>({profile.rating_count})</Typography>
                )}
              </Box>
            )}
            {profile.completed_orders_count > 0 && (
              <Typography sx={{ fontSize: 11, color: "rgba(0,0,0,0.5)" }}>
                {profile.completed_orders_count} order{profile.completed_orders_count !== 1 ? "s" : ""} completed
              </Typography>
            )}
          </Box>

          {/* Expertise chips */}
          {profile.expertises && profile.expertises.length > 0 && (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mb: 1.5 }}>
              {profile.expertises.slice(0, 3).map(exp => (
                <Chip
                  key={exp.id}
                  label={exp.expertise_name}
                  sx={{
                    height: 22,
                    fontSize: 11,
                    bgcolor: "rgba(0,113,227,0.07)",
                    color: "#0071e3",
                    "& .MuiChip-label": { px: 1 },
                  }}
                />
              ))}
              {profile.expertises.length > 3 && (
                <Chip
                  label={`+${profile.expertises.length - 3}`}
                  sx={{
                    height: 22,
                    fontSize: 11,
                    bgcolor: "rgba(0,0,0,0.05)",
                    color: "rgba(0,0,0,0.45)",
                    "& .MuiChip-label": { px: 1 },
                  }}
                />
              )}
            </Box>
          )}

          {/* Footer: price + CTA */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              pt: 1.5,
              borderTop: "1px solid rgba(0,0,0,0.08)",
            }}>
            {lowestPrice != null && isFinite(lowestPrice) ? (
              <Box>
                <Typography sx={{ fontSize: 11, color: "rgba(0,0,0,0.6)", mb: 0.25 }}>Starting at</Typography>
                <Typography sx={{ fontSize: 17, fontWeight: 600, color: "black" }}>${lowestPrice}</Typography>
              </Box>
            ) : (
              <Box />
            )}
            <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#0071e3" }}>View Profile →</Typography>
          </Box>
        </CardContent>
      </Card>
    </Link>
  );
}
