"use client";

import { Box, Typography, Avatar } from "@mui/material";
import { Star } from "@mui/icons-material";

interface Freelancer {
  id: string;
  name: string;
  role: string;
  profileImage: string;
  rating: number;
  reviewCount: number;
  tiers: Array<{ price: number }>;
}

interface FreelancerCardProps {
  freelancer: Freelancer;
}

export function FreelancerCard({ freelancer }: FreelancerCardProps) {
  return (
    <Box
      component='button'
      //   onClick={onClick}
      sx={{
        width: "100%",
        bgcolor: "white",
        borderRadius: "16px",
        p: 3,
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
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
        {/* Profile Image */}
        <Avatar
          src={freelancer.profileImage}
          alt={freelancer.name}
          sx={{
            width: 96,
            height: 96,
            bgcolor: "rgba(0, 0, 0, 0.05)",
          }}
        />

        {/* Info */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, width: "100%" }}>
          <Typography
            component='h3'
            sx={{
              fontSize: "18px",
              color: "black",
              fontWeight: 500,
            }}>
            {freelancer.name}
          </Typography>
          <Typography
            sx={{
              fontSize: "14px",
              color: "rgba(0, 0, 0, 0.6)",
            }}>
            {freelancer.role}
          </Typography>

          {/* Rating */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.75 }}>
            <Star
              sx={{
                fontSize: 16,
                color: "#0071e3",
                fill: "#0071e3",
              }}
            />
            <Typography component='span' sx={{ fontSize: "14px", color: "black" }}>
              {freelancer.rating.toFixed(1)}
            </Typography>
            <Typography component='span' sx={{ fontSize: "14px", color: "rgba(0, 0, 0, 0.6)" }}>
              ({freelancer.reviewCount})
            </Typography>
          </Box>

          {/* Starting Price */}
          <Box sx={{ pt: 1 }}>
            <Typography sx={{ fontSize: "12px", color: "rgba(0, 0, 0, 0.6)" }}>Starting at</Typography>
            <Typography sx={{ fontSize: "18px", color: "black", fontWeight: 500 }}>${freelancer.tiers[0].price}</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
