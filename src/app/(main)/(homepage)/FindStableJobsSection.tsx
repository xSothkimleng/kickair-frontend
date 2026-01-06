"use client";

import { Box, Typography, Button, Grid, Chip, Card, CardContent } from "@mui/material";
import { BusinessCenter as BriefcaseIcon, CheckCircle, ArrowForward } from "@mui/icons-material";

export default function StableJobsSection() {
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
        <Grid container spacing={6} alignItems='center'>
          {/* Left Content */}
          <Grid size={6}>
            {/* Badge */}
            <Chip
              icon={<BriefcaseIcon sx={{ fontSize: 14, color: "rgba(0, 0, 0, 0.6)" }} />}
              label='STABLE OPPORTUNITIES'
              sx={{
                bgcolor: "rgba(0, 0, 0, 0.05)",
                color: "rgba(0, 0, 0, 0.6)",
                fontSize: "11px",
                fontWeight: 600,
                height: "auto",
                py: 0.5,
                px: 1.5,
                mb: 2,
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
                fontSize: "40px",
                fontWeight: 600,
                color: "black",
                letterSpacing: "-0.02em",
                mb: 2,
              }}>
              Find Clients Posting Stable Jobs
            </Typography>

            <Typography
              sx={{
                fontSize: "17px",
                color: "rgba(0, 0, 0, 0.6)",
                lineHeight: 1.6,
                mb: 3,
              }}>
              Not just one-off gigs. Discover part-time and full-time positions from companies looking for long-term freelance
              partnerships.
            </Typography>

            {/* Benefits List */}
            <Box component='ul' sx={{ listStyle: "none", p: 0, m: 0, mb: 4 }}>
              <Box component='li' sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, mb: 2 }}>
                <CheckCircle sx={{ fontSize: 20, color: "#0071e3", flexShrink: 0, mt: 0.25 }} />
                <Typography component='span' sx={{ fontSize: "15px", color: "rgba(0, 0, 0, 0.8)" }}>
                  Recurring monthly contracts with guaranteed income
                </Typography>
              </Box>
              <Box component='li' sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, mb: 2 }}>
                <CheckCircle sx={{ fontSize: 20, color: "#0071e3", flexShrink: 0, mt: 0.25 }} />
                <Typography component='span' sx={{ fontSize: "15px", color: "rgba(0, 0, 0, 0.8)" }}>
                  Part-time and full-time remote opportunities
                </Typography>
              </Box>
              <Box component='li' sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, mb: 2 }}>
                <CheckCircle sx={{ fontSize: 20, color: "#0071e3", flexShrink: 0, mt: 0.25 }} />
                <Typography component='span' sx={{ fontSize: "15px", color: "rgba(0, 0, 0, 0.8)" }}>
                  Work with international clients from your home
                </Typography>
              </Box>
            </Box>

            <Button
              //   onClick={() => onNavigate("jobs")}
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
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                "&:hover": {
                  bgcolor: "#0077ed",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                },
              }}>
              Browse Job Listings
            </Button>
          </Grid>

          {/* Right Content - Job Cards */}
          <Grid size={6}>
            <Box
              sx={{
                background: "linear-gradient(to bottom right, rgba(0, 113, 227, 0.05), rgba(0, 113, 227, 0.1))",
                borderRadius: "24px",
                p: 4,
                border: "1px solid rgba(0, 113, 227, 0.2)",
              }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {/* Job Card 1 */}
                <Card
                  sx={{
                    borderRadius: "12px",
                    border: "1px solid rgba(0, 0, 0, 0.08)",
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                  }}>
                  <CardContent sx={{ p: 3, "&:last-child": { pb: 3 } }}>
                    <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 1.5 }}>
                      <Box>
                        <Typography sx={{ fontSize: "15px", fontWeight: 600, color: "black", mb: 0.5 }}>
                          Senior Web Developer
                        </Typography>
                        <Typography sx={{ fontSize: "13px", color: "rgba(0, 0, 0, 0.6)" }}>
                          Tech Startup • Full-time Remote
                        </Typography>
                      </Box>
                      <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#0071e3" }}>$3,000/mo</Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                      <Chip
                        label='React'
                        size='small'
                        sx={{ bgcolor: "rgba(0, 0, 0, 0.05)", fontSize: "11px", fontWeight: 500, height: 24 }}
                      />
                      <Chip
                        label='Node.js'
                        size='small'
                        sx={{ bgcolor: "rgba(0, 0, 0, 0.05)", fontSize: "11px", fontWeight: 500, height: 24 }}
                      />
                      <Chip
                        label='MongoDB'
                        size='small'
                        sx={{ bgcolor: "rgba(0, 0, 0, 0.05)", fontSize: "11px", fontWeight: 500, height: 24 }}
                      />
                    </Box>
                  </CardContent>
                </Card>

                {/* Job Card 2 */}
                <Card
                  sx={{
                    borderRadius: "12px",
                    border: "1px solid rgba(0, 0, 0, 0.08)",
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                  }}>
                  <CardContent sx={{ p: 3, "&:last-child": { pb: 3 } }}>
                    <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 1.5 }}>
                      <Box>
                        <Typography sx={{ fontSize: "15px", fontWeight: 600, color: "black", mb: 0.5 }}>
                          UI/UX Designer
                        </Typography>
                        <Typography sx={{ fontSize: "13px", color: "rgba(0, 0, 0, 0.6)" }}>
                          E-commerce Agency • Part-time
                        </Typography>
                      </Box>
                      <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#0071e3" }}>$1,500/mo</Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                      <Chip
                        label='Figma'
                        size='small'
                        sx={{ bgcolor: "rgba(0, 0, 0, 0.05)", fontSize: "11px", fontWeight: 500, height: 24 }}
                      />
                      <Chip
                        label='Adobe XD'
                        size='small'
                        sx={{ bgcolor: "rgba(0, 0, 0, 0.05)", fontSize: "11px", fontWeight: 500, height: 24 }}
                      />
                    </Box>
                  </CardContent>
                </Card>

                {/* Job Card 3 */}
                <Card
                  sx={{
                    borderRadius: "12px",
                    border: "1px solid rgba(0, 0, 0, 0.08)",
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                  }}>
                  <CardContent sx={{ p: 3, "&:last-child": { pb: 3 } }}>
                    <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 1.5 }}>
                      <Box>
                        <Typography sx={{ fontSize: "15px", fontWeight: 600, color: "black", mb: 0.5 }}>
                          Content Writer
                        </Typography>
                        <Typography sx={{ fontSize: "13px", color: "rgba(0, 0, 0, 0.6)" }}>Marketing Firm • Part-time</Typography>
                      </Box>
                      <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#0071e3" }}>$800/mo</Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                      <Chip
                        label='SEO'
                        size='small'
                        sx={{ bgcolor: "rgba(0, 0, 0, 0.05)", fontSize: "11px", fontWeight: 500, height: 24 }}
                      />
                      <Chip
                        label='Copywriting'
                        size='small'
                        sx={{ bgcolor: "rgba(0, 0, 0, 0.05)", fontSize: "11px", fontWeight: 500, height: 24 }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
