import { Box, Typography, Grid, Chip } from "@mui/material";
import { Security as ShieldIcon, CheckCircle, Star, People as UsersIcon } from "@mui/icons-material";

export default function TrustReviewSystemSection() {
  return (
    <Box
      component='section'
      sx={{
        bgcolor: "white",
        py: 10,
      }}>
      <Box
        sx={{
          maxWidth: "1200px",
          mx: "auto",
          px: { xs: 3, sm: 6 },
        }}>
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Chip
            icon={<ShieldIcon sx={{ fontSize: 14, color: "rgba(0, 0, 0, 0.6)" }} />}
            label='TRUST & TRANSPARENCY'
            sx={{
              bgcolor: "rgba(0, 0, 0, 0.05)",
              color: "rgba(0, 0, 0, 0.6)",
              fontSize: "11px",
              fontWeight: 600,
              height: "auto",
              py: 0.5,
              px: 1.5,
              mb: 2,
              "& .MuiChip-label": { px: 1 },
              "& .MuiChip-icon": { ml: 0.5 },
            }}
          />
          <Typography
            component='h2'
            sx={{
              fontSize: "40px",
              fontWeight: 600,
              color: "black",
              letterSpacing: "-0.02em",
              mb: 1.5,
            }}>
            Only Real Reviews. Verified Clients.
          </Typography>
          <Typography
            sx={{
              fontSize: "19px",
              color: "rgba(0, 0, 0, 0.6)",
              maxWidth: "768px",
              mx: "auto",
            }}>
            Our review system ensures authenticity and builds trust between freelancers and clients
          </Typography>
        </Box>

        {/* Feature Cards */}
        <Grid container spacing={4} sx={{ mb: 6 }}>
          {/* Verified Reviews */}
          <Grid size={6}>
            <Box
              sx={{
                background: "linear-gradient(to bottom right, rgba(0, 113, 227, 0.05), rgba(0, 113, 227, 0.1))",
                borderRadius: "16px",
                p: 4,
                border: "1px solid rgba(0, 113, 227, 0.2)",
              }}>
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    bgcolor: "#0071e3",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}>
                  <CheckCircle sx={{ fontSize: 24, color: "white", strokeWidth: 2.5 }} />
                </Box>
                <Box>
                  <Typography
                    sx={{
                      fontSize: "21px",
                      fontWeight: 600,
                      color: "black",
                      mb: 1,
                    }}>
                    Verified Reviews Only
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "15px",
                      color: "rgba(0, 0, 0, 0.7)",
                      lineHeight: 1.6,
                      mb: 2,
                    }}>
                    Reviews can only be left by clients who have actually hired and paid for services. No fake reviews, no
                    manipulation.
                  </Typography>
                  <Box component='ul' sx={{ listStyle: "none", p: 0, m: 0 }}>
                    <Box component='li' sx={{ display: "flex", alignItems: "flex-start", gap: 1, mb: 1 }}>
                      <CheckCircle sx={{ fontSize: 16, color: "#0071e3", flexShrink: 0, mt: 0.25 }} />
                      <Typography sx={{ fontSize: "13px", color: "rgba(0, 0, 0, 0.7)" }}>
                        Reviews locked until payment is completed
                      </Typography>
                    </Box>
                    <Box component='li' sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                      <CheckCircle sx={{ fontSize: 16, color: "#0071e3", flexShrink: 0, mt: 0.25 }} />
                      <Typography sx={{ fontSize: "13px", color: "rgba(0, 0, 0, 0.7)" }}>
                        Both freelancers and clients review each other
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* No Review = 5 Stars */}
          <Grid size={6}>
            <Box
              sx={{
                background: "linear-gradient(to bottom right, #f0fdf4, rgba(220, 252, 231, 0.5))",
                borderRadius: "16px",
                p: 4,
                border: "1px solid #bbf7d0",
              }}>
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    bgcolor: "#16a34a",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}>
                  <Star sx={{ fontSize: 24, color: "white", fill: "white", strokeWidth: 2.5 }} />
                </Box>
                <Box>
                  <Typography
                    sx={{
                      fontSize: "21px",
                      fontWeight: 600,
                      color: "black",
                      mb: 1,
                    }}>
                    No Review = 5 Stars
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "15px",
                      color: "rgba(0, 0, 0, 0.7)",
                      lineHeight: 1.6,
                      mb: 2,
                    }}>
                    If a client doesn&apos;t leave a review within 7 days, the freelancer automatically receives 5 stars. This
                    ensures freelancers aren&apos;t penalized by busy clients.
                  </Typography>
                  <Box component='ul' sx={{ listStyle: "none", p: 0, m: 0 }}>
                    <Box component='li' sx={{ display: "flex", alignItems: "flex-start", gap: 1, mb: 1 }}>
                      <CheckCircle sx={{ fontSize: 16, color: "#16a34a", flexShrink: 0, mt: 0.25 }} />
                      <Typography sx={{ fontSize: "13px", color: "rgba(0, 0, 0, 0.7)" }}>Silence means satisfaction</Typography>
                    </Box>
                    <Box component='li' sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                      <CheckCircle sx={{ fontSize: 16, color: "#16a34a", flexShrink: 0, mt: 0.25 }} />
                      <Typography sx={{ fontSize: "13px", color: "rgba(0, 0, 0, 0.7)" }}>
                        Fair to hardworking freelancers
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Two-Way Rating System */}
        <Box
          sx={{
            bgcolor: "rgba(0, 0, 0, 0.05)",
            borderRadius: "16px",
            p: 4,
            textAlign: "center",
          }}>
          <Typography
            sx={{
              fontSize: "21px",
              fontWeight: 600,
              color: "black",
              mb: 1,
            }}>
            Two-Way Rating System
          </Typography>
          <Typography
            sx={{
              fontSize: "15px",
              color: "rgba(0, 0, 0, 0.6)",
              maxWidth: "672px",
              mx: "auto",
              mb: 3,
            }}>
            Freelancers have public ratings visible to everyone. Clients have private ratings only visible to freelancers, helping
            talent choose who they want to work with.
          </Typography>
          <Grid container spacing={2} sx={{ maxWidth: "768px", mx: "auto" }}>
            <Grid size={6}>
              <Box
                sx={{
                  bgcolor: "white",
                  borderRadius: "12px",
                  p: 2,
                  border: "1px solid rgba(0, 0, 0, 0.08)",
                }}>
                <UsersIcon sx={{ fontSize: 24, color: "rgba(0, 0, 0, 0.6)", mb: 1 }} />
                <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "black", mb: 0.5 }}>Freelancer Rating</Typography>
                <Typography sx={{ fontSize: "12px", color: "rgba(0, 0, 0, 0.6)" }}>Public • Visible to all clients</Typography>
              </Box>
            </Grid>
            <Grid size={6}>
              <Box
                sx={{
                  bgcolor: "white",
                  borderRadius: "12px",
                  p: 2,
                  border: "1px solid rgba(0, 0, 0, 0.08)",
                }}>
                <ShieldIcon sx={{ fontSize: 24, color: "rgba(0, 0, 0, 0.6)", mb: 1 }} />
                <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "black", mb: 0.5 }}>Client Rating</Typography>
                <Typography sx={{ fontSize: "12px", color: "rgba(0, 0, 0, 0.6)" }}>
                  Private • Only visible to freelancers
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
}
