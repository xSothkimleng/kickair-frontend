"use client";

import Link from "next/link";
import { Box, Stack, Typography, Avatar, Button } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { FreelancerProfile } from "@/types/user";

const MAX_VISIBLE_SKILLS = 4;

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

interface FreelancerListCardProps {
  profile: FreelancerProfile;
}

export function FreelancerListCard({ profile }: FreelancerListCardProps) {
  const name = profile.user?.name || "Unknown";
  const avatarUrl = profile.user?.avatar_url || "";
  const tagline = profile.tagline || "";
  const rating = profile.rating_average ? parseFloat(profile.rating_average) : 0;
  const hasReviews = profile.rating_count > 0;
  const skills = profile.expertises?.map((e) => e.expertise_name) ?? [];
  const visibleSkills = skills.slice(0, MAX_VISIBLE_SKILLS);
  const overflow = skills.length - visibleSkills.length;

  return (
    <Link href={`/find-freelancer/${profile.id}`} style={{ textDecoration: "none" }}>
      <Box
        sx={{
          display: "flex",
          gap: 2,
          p: 2,
          bgcolor: "white",
          border: "1px solid #E2E8F0",
          borderRadius: "10px",
          transition: "border-color 0.15s, box-shadow 0.15s",
          "&:hover": {
            borderColor: "#CBD5E1",
            boxShadow: "0 1px 3px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)",
          },
          "&:hover .view-btn": {
            backgroundColor: "#0F172A",
            color: "#FFFFFF",
            borderColor: "#0F172A",
          },
          "&:hover .view-btn .MuiSvgIcon-root": { transform: "translateX(2px)" },
        }}
      >
        {/* Avatar */}
        <Box sx={{ flexShrink: 0, pt: 0.25 }}>
          <Avatar
            src={avatarUrl}
            sx={{
              width: 52,
              height: 52,
              background: avatarUrl ? undefined : "linear-gradient(135deg, #1E293B, #0F172A)",
              color: "#FFF",
              fontSize: 17,
              fontWeight: 600,
              letterSpacing: "-0.02em",
            }}
          >
            {initials(name)}
          </Avatar>
        </Box>

        {/* Main content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Top row: name + location */}
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 0.5 }}>
            <Typography sx={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em" }}>
              {name}
            </Typography>
            {profile.location && (
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <PlaceOutlinedIcon sx={{ fontSize: 13, color: "text.disabled" }} />
                <Typography sx={{ fontSize: 12, color: "text.disabled" }}>{profile.location}</Typography>
              </Stack>
            )}
          </Stack>

          {/* Tagline */}
          {tagline && (
            <Typography
              sx={{
                fontSize: 13,
                color: "text.secondary",
                lineHeight: 1.4,
                mb: 1,
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: 1,
                WebkitBoxOrient: "vertical",
              }}
            >
              {tagline}
            </Typography>
          )}

          {/* Rating + skills row */}
          <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap">
            {/* Rating */}
            {hasReviews ? (
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <StarIcon sx={{ fontSize: 13, color: "#F59E0B" }} />
                <Typography sx={{ fontSize: 12, fontWeight: 600, color: "text.primary" }}>
                  {rating.toFixed(1)}
                </Typography>
                <Typography sx={{ fontSize: 12, color: "text.disabled" }}>
                  ({profile.rating_count})
                </Typography>
                <Box sx={{ width: 3, height: 3, borderRadius: "50%", backgroundColor: "#CBD5E1", mx: 0.25 }} />
                <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                  {profile.completed_orders_count}{" "}
                  {profile.completed_orders_count === 1 ? "order" : "orders"}
                </Typography>
              </Stack>
            ) : (
              <Stack direction="row" alignItems="center" spacing={0.75}>
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    height: 18,
                    px: 0.875,
                    backgroundColor: "#F1F5F9",
                    color: "text.secondary",
                    borderRadius: "999px",
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                >
                  New
                </Box>
                <Typography sx={{ fontSize: 12, color: "text.disabled" }}>No reviews yet</Typography>
              </Stack>
            )}

            {/* Skills */}
            {visibleSkills.length > 0 && (
              <>
                <Box sx={{ width: 3, height: 3, borderRadius: "50%", backgroundColor: "#CBD5E1", flexShrink: 0 }} />
                <Stack direction="row" alignItems="center" spacing={0.75} sx={{ flexWrap: "nowrap", overflow: "hidden" }}>
                  {visibleSkills.map((s) => (
                    <Box
                      key={s}
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        height: 22,
                        px: 1,
                        backgroundColor: "#F1F5F9",
                        color: "#334155",
                        borderRadius: "6px",
                        fontSize: 11,
                        fontWeight: 500,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {s}
                    </Box>
                  ))}
                  {overflow > 0 && (
                    <Typography sx={{ fontSize: 12, color: "text.disabled", fontWeight: 500 }}>
                      +{overflow}
                    </Typography>
                  )}
                </Stack>
              </>
            )}
          </Stack>
        </Box>

        {/* Right: View profile button */}
        <Box sx={{ flexShrink: 0, display: "flex", alignItems: "center" }}>
          <Button
            className="view-btn"
            variant="outlined"
            endIcon={<ArrowForwardIcon sx={{ fontSize: 14, transition: "transform 0.15s" }} />}
            sx={{
              height: 38,
              px: 2,
              textTransform: "none",
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "-0.005em",
              borderRadius: "8px",
              color: "#0F172A",
              borderColor: "#E2E8F0",
              backgroundColor: "#FFFFFF",
              whiteSpace: "nowrap",
              transition: "background-color 0.12s, border-color 0.12s, color 0.12s",
            }}
          >
            View profile
          </Button>
        </Box>
      </Box>
    </Link>
  );
}
