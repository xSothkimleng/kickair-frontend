"use client";

import { Box, Typography, Avatar, Chip } from "@mui/material";
import Link from "next/link";
import { FreelancerProfile } from "@/types/user";

interface FreelancerCardProps {
  profile: FreelancerProfile;
}

export function FreelancerCard({ profile }: FreelancerCardProps) {
  const name = profile.user?.name || "Unknown";
  const avatar = profile.user?.profile_image || "";
  const tagline = profile.tagline || "";

  const lowestPrice = profile.services?.length
    ? Math.min(...profile.services.flatMap(s => s.pricing_options?.map(p => p.price_raw) ?? []).filter(p => p > 0))
    : null;

  return (
    <Link href={`/find-freelancer/${profile.id}`} style={{ textDecoration: "none", display: "flex", height: "100%" }}>
      <Box
        component='div'
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          bgcolor: "white",
          borderRadius: "16px",
          border: "1px solid transparent",
          textAlign: "center",
          cursor: "pointer",
          transition: "all 0.3s ease",
          "&:hover": {
            bgcolor: "white",
            borderColor: "rgba(0, 0, 0, 0.1)",
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
          },
        }}>
        {/* Profile Image */}
        <Avatar src={avatar} alt={name} sx={{ width: 96, height: 96, bgcolor: "rgba(0, 0, 0, 0.05)", mb: 2 }}>
          {name.charAt(0)}
        </Avatar>

        {/* Info — grows to fill available space */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, width: "100%", flex: 1 }}>
          <Typography component='h3' sx={{ fontSize: "18px", color: "black", fontWeight: 500 }}>
            {name}
          </Typography>
          {tagline && <Typography sx={{ fontSize: "14px", color: "rgba(0, 0, 0, 0.6)" }}>{tagline}</Typography>}

          {/* Expertise chips */}
          {profile.expertises && profile.expertises.length > 0 && (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, justifyContent: "center", mt: 0.5 }}>
              {profile.expertises.slice(0, 3).map(exp => (
                <Chip
                  key={exp.id}
                  label={exp.expertise_name}
                  sx={{
                    height: 22,
                    fontSize: 11,
                    bgcolor: "rgba(0, 113, 227, 0.08)",
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
                    bgcolor: "rgba(0, 0, 0, 0.05)",
                    color: "rgba(0, 0, 0, 0.5)",
                    "& .MuiChip-label": { px: 1 },
                  }}
                />
              )}
            </Box>
          )}
        </Box>

        {/* Starting Price — always pinned to the bottom */}
        {lowestPrice != null && isFinite(lowestPrice) && (
          <Box sx={{ pt: 2, width: "100%" }}>
            <Typography sx={{ fontSize: "12px", color: "rgba(0, 0, 0, 0.6)" }}>Starting at</Typography>
            <Typography sx={{ fontSize: "18px", color: "black", fontWeight: 500 }}>${lowestPrice}</Typography>
          </Box>
        )}
      </Box>
    </Link>
  );
}
