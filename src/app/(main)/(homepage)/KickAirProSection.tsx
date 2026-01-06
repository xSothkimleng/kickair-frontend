"use client";

import { Box, Typography, Button, Grid, Chip } from "@mui/material";
import {
  EmojiEvents as CrownIcon,
  People as UsersIcon,
  Security as ShieldIcon,
  EmojiEvents as AwardIcon,
  ArrowForward,
} from "@mui/icons-material";

export default function KickAirProSection() {
  return (
    <Box
      component='section'
      sx={{
        maxWidth: "1200px",
        mx: "auto",
        px: { xs: 3, sm: 6 },
        py: 10,
      }}>
      <Box
        sx={{
          background: "linear-gradient(to bottom right, #000000, rgba(0, 0, 0, 0.9))",
          borderRadius: "24px",
          p: { xs: 6, md: 8 },
          textAlign: "center",
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}>
        {/* Radial Gradient Overlays */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(circle at 30% 20%, rgba(0, 113, 227, 0.15), transparent 50%)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(circle at 70% 80%, rgba(0, 113, 227, 0.1), transparent 50%)",
          }}
        />

        <Box sx={{ position: "relative", zIndex: 10 }}>
          {/* Badge */}
          <Chip
            icon={<CrownIcon sx={{ fontSize: 14, color: "#0071e3" }} />}
            label='ENTERPRISE SOLUTION'
            sx={{
              bgcolor: "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(8px)",
              color: "rgba(255, 255, 255, 0.8)",
              fontSize: "11px",
              fontWeight: 600,
              height: "auto",
              py: 0.5,
              px: 1.5,
              mb: 3,
              "& .MuiChip-label": {
                px: 1,
              },
              "& .MuiChip-icon": {
                ml: 0.5,
              },
            }}
          />

          <Typography
            component='h2'
            sx={{
              fontSize: { xs: "40px", md: "48px" },
              fontWeight: 600,
              letterSpacing: "-0.02em",
              mb: 2,
            }}>
            Introducing KickAir Pro
          </Typography>

          <Typography
            sx={{
              fontSize: "19px",
              color: "rgba(255, 255, 255, 0.7)",
              maxWidth: "672px",
              mx: "auto",
              mb: 4,
            }}>
            Scale your business with advanced team management, priority support, and exclusive access to top-tier freelancers
          </Typography>

          {/* Features Grid */}
          <Grid container spacing={3} sx={{ maxWidth: "896px", mx: "auto", mb: 5 }}>
            <Grid size={4}>
              <Box
                sx={{
                  bgcolor: "rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(8px)",
                  borderRadius: "16px",
                  p: 3,
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}>
                <UsersIcon sx={{ fontSize: 32, color: "#0071e3", mb: 1.5, mx: "auto" }} />
                <Typography sx={{ fontSize: "17px", fontWeight: 600, mb: 1 }}>Team Workspace</Typography>
                <Typography sx={{ fontSize: "13px", color: "rgba(255, 255, 255, 0.6)" }}>
                  Manage multiple freelancers on one visual canvas
                </Typography>
              </Box>
            </Grid>

            <Grid size={4}>
              <Box
                sx={{
                  bgcolor: "rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(8px)",
                  borderRadius: "16px",
                  p: 3,
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}>
                <ShieldIcon sx={{ fontSize: 32, color: "#0071e3", mb: 1.5, mx: "auto" }} />
                <Typography sx={{ fontSize: "17px", fontWeight: 600, mb: 1 }}>Priority Support</Typography>
                <Typography sx={{ fontSize: "13px", color: "rgba(255, 255, 255, 0.6)" }}>
                  Get help when you need it with 24/7 dedicated support
                </Typography>
              </Box>
            </Grid>

            <Grid size={4}>
              <Box
                sx={{
                  bgcolor: "rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(8px)",
                  borderRadius: "16px",
                  p: 3,
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}>
                <AwardIcon sx={{ fontSize: 32, color: "#0071e3", mb: 1.5, mx: "auto" }} />
                <Typography sx={{ fontSize: "17px", fontWeight: 600, mb: 1 }}>Exclusive Talent</Typography>
                <Typography sx={{ fontSize: "13px", color: "rgba(255, 255, 255, 0.6)" }}>
                  Access to pre-vetted, top 1% freelancers only
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Button
            variant='contained'
            endIcon={<ArrowForward sx={{ fontSize: 16 }} />}
            sx={{
              px: 4,
              py: 1.75,
              bgcolor: "#0071e3",
              color: "white",
              borderRadius: "50px",
              fontSize: "15px",
              fontWeight: 600,
              textTransform: "none",
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
              "&:hover": {
                bgcolor: "#0077ed",
              },
            }}>
            Learn More About Pro
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
