"use client";

import { Box, Typography, Grid, Avatar, Button } from "@mui/material";
import { Star } from "@mui/icons-material";

export default function ReviewsSection() {
  const reviews = [
    {
      text: "KickAir changed my life. I went from working a 9-5 to earning 3x more as a freelancer. The platform is clean, professional, and the clients are serious.",
      name: "Sreymom Chan",
      role: "Freelance Designer",
    },
    {
      text: "Best platform for hiring in Cambodia. The three-tier pricing makes it easy to choose packages, and the escrow system gives me peace of mind.",
      name: "Michael Chen",
      role: "Startup Founder",
    },
    {
      text: "Finally found stable remote work through KickAir. Working with international clients from Phnom Penh has been a dream come true.",
      name: "Rattanak Pich",
      role: "Web Developer",
    },
  ];

  return (
    <Box
      component='section'
      sx={{
        maxWidth: "1200px",
        mx: "auto",
        px: { xs: 3, sm: 6 },
        py: 10,
      }}>
      {/* Header */}
      <Box sx={{ textAlign: "center", mb: 6 }}>
        <Typography
          component='h2'
          sx={{
            fontSize: "40px",
            fontWeight: 600,
            color: "black",
            letterSpacing: "-0.02em",
            mb: 1.5,
          }}>
          Trusted by Thousands
        </Typography>
        <Typography sx={{ fontSize: "19px", color: "rgba(0, 0, 0, 0.6)", mb: 3 }}>
          See what freelancers and clients are saying
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, mb: 4 }}>
          {[...Array(5)].map((_, i) => (
            <Star key={i} sx={{ fontSize: 32, fill: "black", color: "black" }} />
          ))}
          <Typography sx={{ fontSize: "28px", fontWeight: 600, color: "black", ml: 1.5 }}>4.9/5</Typography>
        </Box>
      </Box>

      {/* Review Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {reviews.map((review, index) => (
          <Grid size={4} key={index}>
            <Box
              sx={{
                bgcolor: "white",
                borderRadius: "16px",
                border: "1px solid rgba(0, 0, 0, 0.08)",
                p: 3,
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
              }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 2 }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} sx={{ fontSize: 16, fill: "black", color: "black" }} />
                ))}
              </Box>
              <Typography
                sx={{
                  fontSize: "14px",
                  color: "rgba(0, 0, 0, 0.8)",
                  lineHeight: 1.6,
                  mb: 2,
                }}>
                {review.text}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Avatar sx={{ width: 40, height: 40, bgcolor: "rgba(0, 0, 0, 0.1)" }} />
                <Box>
                  <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "black" }}>{review.name}</Typography>
                  <Typography sx={{ fontSize: "11px", color: "rgba(0, 0, 0, 0.6)" }}>{review.role}</Typography>
                </Box>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ textAlign: "center" }}>
        <Button
          //   onClick={() => onNavigate("why-kickair", { scrollTo: "reviews" })}
          sx={{
            fontSize: "15px",
            fontWeight: 600,
            color: "#0071e3",
            textTransform: "none",
            "&:hover": {
              bgcolor: "transparent",
              textDecoration: "underline",
            },
          }}>
          Read All Reviews →
        </Button>
      </Box>
    </Box>
  );
}
