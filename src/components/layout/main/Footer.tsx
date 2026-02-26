"use client";

import { Box, Typography, Grid, Button, IconButton } from "@mui/material";

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "black",
        color: "white",
      }}
    >
      <Box
        sx={{
          maxWidth: "1200px",
          mx: "auto",
          px: { xs: 3, sm: 6 },
          py: 8,
        }}
      >
        <Grid container spacing={6} sx={{ mb: 6 }}>
          {/* Column 1 - KickAir Branding */}
          <Grid size={2.4}>
            <Box sx={{ mb: 2 }}>
              <Box
                component="img"
                src="/assets/images/kickair-logo.png"
                alt="KickAir"
                sx={{
                  height: 32,
                  width: "auto",
                  mb: 1,
                }}
              />
              <Typography
                sx={{
                  fontSize: "11px",
                  color: "rgba(255, 255, 255, 0.4)",
                  fontWeight: 500,
                  letterSpacing: "0.05em",
                  mt: 0.5,
                }}
              >
                PREMIUM FREELANCING
              </Typography>
            </Box>
            <Typography
              sx={{
                fontSize: "13px",
                color: "rgba(255, 255, 255, 0.6)",
                lineHeight: 1.6,
                mb: 3,
              }}
            >
              Cambodia&apos;s premier marketplace for freelancers and clients. Build your brand, earn your way.
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <IconButton
                component="a"
                href="#"
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  bgcolor: "rgba(255, 255, 255, 0.1)",
                  color: "white",
                  fontSize: "12px",
                  "&:hover": {
                    bgcolor: "rgba(255, 255, 255, 0.2)",
                  },
                }}
              >
                f
              </IconButton>
              <IconButton
                component="a"
                href="#"
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  bgcolor: "rgba(255, 255, 255, 0.1)",
                  color: "white",
                  fontSize: "12px",
                  "&:hover": {
                    bgcolor: "rgba(255, 255, 255, 0.2)",
                  },
                }}
              >
                in
              </IconButton>
              <IconButton
                component="a"
                href="#"
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  bgcolor: "rgba(255, 255, 255, 0.1)",
                  color: "white",
                  fontSize: "12px",
                  "&:hover": {
                    bgcolor: "rgba(255, 255, 255, 0.2)",
                  },
                }}
              >
                ig
              </IconButton>
            </Box>
          </Grid>

          {/* Column 2 - Platform */}
          <Grid size={2.4}>
            <Typography sx={{ fontSize: "15px", fontWeight: 600, mb: 2 }}>Platform</Typography>
            <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0 }}>
              {[
                { label: "Browse Services", page: "services" },
                { label: "Find Jobs", page: "jobs" },
                { label: "Why KickAir", page: "why-kickair" },
                { label: "KickAir University", page: "university" },
                { label: "KickAir Pro", page: "why-kickair" },
              ].map((item, index) => (
                <Box key={index} component="li" sx={{ mb: 1.5 }}>
                  <Button
                    // onClick={() => onNavigate(item.page)}
                    sx={{
                      fontSize: "13px",
                      color: "rgba(255, 255, 255, 0.6)",
                      textTransform: "none",
                      p: 0,
                      minWidth: "auto",
                      justifyContent: "flex-start",
                      "&:hover": {
                        color: "white",
                        bgcolor: "transparent",
                      },
                    }}
                  >
                    {item.label}
                  </Button>
                </Box>
              ))}
            </Box>
          </Grid>

          {/* Column 3 - For Freelancers */}
          <Grid size={2.4}>
            <Typography sx={{ fontSize: "15px", fontWeight: 600, mb: 2 }}>For Freelancers</Typography>
            <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0 }}>
              {[
                { label: "Sign Up Free", page: "register" },
                { label: "Find Work", page: "jobs" },
                { label: "Learn & Grow", page: "university", params: { userType: "freelancer" } },
                { label: "Success Stories", page: "why-kickair", params: { scrollTo: "success-stories" } },
              ].map((item, index) => (
                <Box key={index} component="li" sx={{ mb: 1.5 }}>
                  <Button
                    // onClick={() => onNavigate(item.page, item.params)}
                    sx={{
                      fontSize: "13px",
                      color: "rgba(255, 255, 255, 0.6)",
                      textTransform: "none",
                      p: 0,
                      minWidth: "auto",
                      justifyContent: "flex-start",
                      "&:hover": {
                        color: "white",
                        bgcolor: "transparent",
                      },
                    }}
                  >
                    {item.label}
                  </Button>
                </Box>
              ))}
            </Box>
          </Grid>

          {/* Column 4 - For Clients */}
          <Grid size={2.4}>
            <Typography sx={{ fontSize: "15px", fontWeight: 600, mb: 2 }}>For Clients</Typography>
            <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0 }}>
              {[
                { label: "Hire Talent", page: "services" },
                { label: "Post a Job", page: "jobs" },
                { label: "Upgrade to Pro", page: "why-kickair" },
                { label: "Hiring Guides", page: "university", params: { userType: "client" } },
              ].map((item, index) => (
                <Box key={index} component="li" sx={{ mb: 1.5 }}>
                  <Button
                    // onClick={() => onNavigate(item.page, item.params)}
                    sx={{
                      fontSize: "13px",
                      color: "rgba(255, 255, 255, 0.6)",
                      textTransform: "none",
                      p: 0,
                      minWidth: "auto",
                      justifyContent: "flex-start",
                      "&:hover": {
                        color: "white",
                        bgcolor: "transparent",
                      },
                    }}
                  >
                    {item.label}
                  </Button>
                </Box>
              ))}
            </Box>
          </Grid>

          {/* Column 5 - Company */}
          <Grid size={2.4}>
            <Typography sx={{ fontSize: "15px", fontWeight: 600, mb: 2 }}>Company</Typography>
            <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0 }}>
              {[
                { label: "About Us", page: "why-kickair" },
                { label: "Reviews", page: "why-kickair", params: { scrollTo: "reviews" } },
                { label: "Terms & Conditions", href: "#" },
                { label: "Privacy Policy", href: "#" },
                { label: "Contact Support", href: "#" },
              ].map((item, index) => (
                <Box key={index} component="li" sx={{ mb: 1.5 }}>
                  {item.page ? (
                    <Button
                      //   onClick={() => onNavigate(item.page, item.params)}
                      sx={{
                        fontSize: "13px",
                        color: "rgba(255, 255, 255, 0.6)",
                        textTransform: "none",
                        p: 0,
                        minWidth: "auto",
                        justifyContent: "flex-start",
                        "&:hover": {
                          color: "white",
                          bgcolor: "transparent",
                        },
                      }}
                    >
                      {item.label}
                    </Button>
                  ) : (
                    <Box
                      component="a"
                      href={item.href}
                      sx={{
                        fontSize: "13px",
                        color: "rgba(255, 255, 255, 0.6)",
                        textDecoration: "none",
                        "&:hover": {
                          color: "white",
                        },
                      }}
                    >
                      {item.label}
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
