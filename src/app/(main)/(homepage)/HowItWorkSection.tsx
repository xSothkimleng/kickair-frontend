"use client";

import { Box, Typography, Grid, Button } from "@mui/material";
import { ArrowForward } from "@mui/icons-material";

export default function HowItWorksSection() {
  const clientSteps = [
    {
      number: 1,
      title: "Browse or Post",
      description: "Search freelancer profiles or post a job and let talent come to you",
    },
    {
      number: 2,
      title: "Choose & Hire",
      description: "Review portfolios, compare pricing tiers, and hire the perfect match",
    },
    {
      number: 3,
      title: "Pay Securely",
      description: "Payment held in escrow until you're satisfied with the work",
    },
  ];

  const freelancerSteps = [
    {
      number: 1,
      title: "Create Profile",
      description: "Build your brand with portfolio, skills, and three-tier pricing",
    },
    {
      number: 2,
      title: "Find Work",
      description: "Browse jobs or let clients find you through your optimized profile",
    },
    {
      number: 3,
      title: "Get Paid",
      description: "Deliver great work and receive payment directly to Wing, ABA, or Pi Pay",
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
          How It Works
        </Typography>
        <Typography sx={{ fontSize: "19px", color: "rgba(0, 0, 0, 0.6)" }}>Get started in minutes, hire in hours</Typography>
      </Box>

      {/* Steps Grid */}
      <Grid container spacing={6} sx={{ mb: 6 }}>
        {/* For Clients */}
        <Grid size={6}>
          <Box
            sx={{
              bgcolor: "white",
              borderRadius: "16px",
              border: "1px solid rgba(0, 0, 0, 0.08)",
              p: 4,
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            }}>
            <Typography
              component='h3'
              sx={{
                fontSize: "24px",
                fontWeight: 600,
                color: "black",
                mb: 3,
                textAlign: "center",
              }}>
              For Clients
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {clientSteps.map(step => (
                <Box key={step.number} sx={{ display: "flex", gap: 2 }}>
                  <Box
                    sx={{
                      flexShrink: 0,
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      bgcolor: "#0071e3",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "15px",
                      fontWeight: 600,
                    }}>
                    {step.number}
                  </Box>
                  <Box>
                    <Typography
                      sx={{
                        fontSize: "15px",
                        fontWeight: 600,
                        color: "black",
                        mb: 0.5,
                      }}>
                      {step.title}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "13px",
                        color: "rgba(0, 0, 0, 0.6)",
                        lineHeight: 1.6,
                      }}>
                      {step.description}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Grid>

        {/* For Freelancers */}
        <Grid size={6}>
          <Box
            sx={{
              bgcolor: "white",
              borderRadius: "16px",
              border: "1px solid rgba(0, 0, 0, 0.08)",
              p: 4,
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            }}>
            <Typography
              component='h3'
              sx={{
                fontSize: "24px",
                fontWeight: 600,
                color: "black",
                mb: 3,
                textAlign: "center",
              }}>
              For Freelancers
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {freelancerSteps.map(step => (
                <Box key={step.number} sx={{ display: "flex", gap: 2 }}>
                  <Box
                    sx={{
                      flexShrink: 0,
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      bgcolor: "#0071e3",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "15px",
                      fontWeight: 600,
                    }}>
                    {step.number}
                  </Box>
                  <Box>
                    <Typography
                      sx={{
                        fontSize: "15px",
                        fontWeight: 600,
                        color: "black",
                        mb: 0.5,
                      }}>
                      {step.title}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "13px",
                        color: "rgba(0, 0, 0, 0.6)",
                        lineHeight: 1.6,
                      }}>
                      {step.description}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* CTA Button */}
      <Box sx={{ textAlign: "center" }}>
        <Button
          //   onClick={() => onNavigate("why-kickair", { scrollTo: "how-it-works" })}
          variant='outlined'
          endIcon={<ArrowForward sx={{ fontSize: 16 }} />}
          sx={{
            px: 4,
            py: 1.75,
            border: "2px solid #0071e3",
            color: "#0071e3",
            borderRadius: "50px",
            fontSize: "15px",
            fontWeight: 600,
            textTransform: "none",
            "&:hover": {
              border: "2px solid #0071e3",
              bgcolor: "#0071e3",
              color: "white",
            },
          }}>
          Learn More About Our Process
        </Button>
      </Box>
    </Box>
  );
}
