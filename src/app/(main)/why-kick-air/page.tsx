import { Box, Typography, Grid, Avatar, Button } from "@mui/material";
import { ChevronLeft, Star, TrendingUp, Security as Shield, Bolt as Zap, CheckCircle } from "@mui/icons-material";
import Link from "next/link";

export default function WhyKickAirPage() {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#F5F5F7" }}>
      {/* Header */}
      <Box
        sx={{
          bgcolor: "white",
          borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
        }}>
        <Box
          sx={{
            maxWidth: "1440px",
            mx: "auto",
            px: { xs: 3, sm: 6 },
            py: 4,
          }}>
          <Link href='/' passHref>
            <Button
              startIcon={<ChevronLeft sx={{ fontSize: 16 }} />}
              sx={{
                fontSize: "12px",
                color: "rgba(0, 0, 0, 0.6)",
                textTransform: "none",
                p: 0,
                mb: 2,
                minWidth: "auto",
                "&:hover": {
                  bgcolor: "transparent",
                  color: "black",
                },
              }}>
              Back to Home
            </Button>
          </Link>
          <Box>
            <Typography
              component='h1'
              sx={{
                fontSize: "40px",
                fontWeight: 600,
                color: "black",
                letterSpacing: "-0.02em",
                mb: 1,
              }}>
              Why KickAir
            </Typography>
            <Typography sx={{ fontSize: "17px", color: "rgba(0, 0, 0, 0.6)" }}>
              Premium freelancing made simple for Cambodia and the world
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Main Content */}
      <Box
        sx={{
          maxWidth: "980px",
          mx: "auto",
          px: { xs: 3, sm: 6 },
          py: 8,
        }}>
        {/* How It Works Section */}
        <Box
          component='section'
          id='how-it-works'
          sx={{
            mb: 12,
            scrollMarginTop: "96px",
          }}>
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Typography
              component='h2'
              sx={{
                fontSize: "32px",
                fontWeight: 600,
                color: "black",
                letterSpacing: "-0.02em",
                mb: 1.5,
              }}>
              How It Works
            </Typography>
            <Typography
              sx={{
                fontSize: "17px",
                color: "rgba(0, 0, 0, 0.6)",
                maxWidth: "672px",
                mx: "auto",
              }}>
              Simple, transparent, and designed for both clients and freelancers
            </Typography>
          </Box>

          <Grid container spacing={6}>
            {/* For Clients */}
            <Grid size={6}>
              <Box
                sx={{
                  bgcolor: "white",
                  borderRadius: "16px",
                  border: "1px solid rgba(0, 0, 0, 0.08)",
                  p: 4,
                }}>
                <Box sx={{ textAlign: "center", mb: 4 }}>
                  <Typography
                    component='h3'
                    sx={{
                      fontSize: "24px",
                      fontWeight: 600,
                      color: "black",
                      mb: 1,
                    }}>
                    For Clients
                  </Typography>
                  <Typography sx={{ fontSize: "14px", color: "rgba(0, 0, 0, 0.6)" }}>
                    Get work done with trusted talent
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {[
                    {
                      number: 1,
                      title: "Post Your Project",
                      desc: "Describe what you need, set your budget, and choose between one-off jobs or long-term gigs",
                    },
                    {
                      number: 2,
                      title: "Review Proposals",
                      desc: "Browse freelancer profiles, check ratings and portfolios, then select the perfect match",
                    },
                    {
                      number: 3,
                      title: "Get Work Delivered",
                      desc: "Collaborate seamlessly, track progress, and receive high-quality results on time",
                    },
                  ].map(step => (
                    <Box key={step.number} sx={{ display: "flex", gap: 2 }}>
                      <Box
                        sx={{
                          flexShrink: 0,
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          bgcolor: "black",
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
                          {step.desc}
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
                }}>
                <Box sx={{ textAlign: "center", mb: 4 }}>
                  <Typography
                    component='h3'
                    sx={{
                      fontSize: "24px",
                      fontWeight: 600,
                      color: "black",
                      mb: 1,
                    }}>
                    For Freelancers
                  </Typography>
                  <Typography sx={{ fontSize: "14px", color: "rgba(0, 0, 0, 0.6)" }}>
                    Build your career and earn on your terms
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {[
                    {
                      number: 1,
                      title: "Create Your Profile",
                      desc: "Showcase your skills, set your rates with three-tier pricing, and build your portfolio",
                    },
                    {
                      number: 2,
                      title: "Find Opportunities",
                      desc: "Browse one-off jobs or apply for stable part-time and full-time positions",
                    },
                    {
                      number: 3,
                      title: "Earn and Grow",
                      desc: "Deliver great work, earn reviews, and scale your freelance business globally",
                    },
                  ].map(step => (
                    <Box key={step.number} sx={{ display: "flex", gap: 2 }}>
                      <Box
                        sx={{
                          flexShrink: 0,
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          bgcolor: "black",
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
                          {step.desc}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Trust & Payment Security Section */}
        <Box
          component='section'
          id='payment-security'
          sx={{
            mb: 12,
            scrollMarginTop: "96px",
          }}>
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Typography
              component='h2'
              sx={{
                fontSize: "32px",
                fontWeight: 600,
                color: "black",
                letterSpacing: "-0.02em",
                mb: 1.5,
              }}>
              Your Money is Protected
            </Typography>
            <Typography
              sx={{
                fontSize: "17px",
                color: "rgba(0, 0, 0, 0.6)",
                maxWidth: "672px",
                mx: "auto",
              }}>
              Our secure payment system ensures fair transactions for both clients and freelancers
            </Typography>
          </Box>

          {/* Payment Flow Diagram - Due to complexity, simplified version */}
          <Box
            sx={{
              background: "linear-gradient(to bottom right, white, rgba(0, 0, 0, 0.02))",
              borderRadius: "24px",
              border: "1px solid rgba(0, 0, 0, 0.08)",
              p: { xs: 4, md: 6 },
              mb: 4,
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            }}>
            <Typography
              sx={{
                fontSize: "21px",
                fontWeight: 600,
                color: "black",
                mb: 6,
                textAlign: "center",
              }}>
              How Our Secure Payment System Works
            </Typography>

            {/* Simplified Flow - You can add the complex SVG arrows if needed */}
            <Box sx={{ maxWidth: "800px", mx: "auto" }}>
              <Grid container spacing={3}>
                {[
                  { num: 1, title: "Find Freelancer", desc: "Browse profiles and select the perfect talent for your project" },
                  { num: 2, title: "Review & Quote", desc: "Check tier options and get detailed project quote" },
                  { num: 3, title: "Client Pays", desc: "Secure payment via Wing, ABA Bank, or Pi Pay" },
                  { num: 4, title: "Money Held Securely", desc: "Payment protected in KickAir escrow system", gradient: true },
                  { num: 5, title: "Freelancer Delivers", desc: "Project completed and submitted for review" },
                  { num: 6, title: "Payment Released", desc: "Freelancer receives full payment instantly", success: true },
                ].map(step => (
                  <Grid size={4} key={step.num}>
                    <Box
                      sx={{
                        bgcolor: step.gradient ? "rgba(0, 113, 227, 0.05)" : step.success ? "rgba(52, 199, 89, 0.05)" : "white",
                        borderRadius: "16px",
                        border: step.gradient
                          ? "1px solid rgba(0, 113, 227, 0.2)"
                          : step.success
                          ? "1px solid rgba(52, 199, 89, 0.2)"
                          : "1px solid rgba(0, 0, 0, 0.08)",
                        p: 3,
                        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                      }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: "50%",
                          background: step.success
                            ? "linear-gradient(to bottom right, #34c759, #30d158)"
                            : "linear-gradient(to bottom right, #0071e3, #0077ed)",
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "17px",
                          fontWeight: 600,
                          mb: 2,
                          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                        }}>
                        {step.num}
                      </Box>
                      <Typography sx={{ fontSize: "15px", fontWeight: 600, color: "black", mb: 1 }}>{step.title}</Typography>
                      <Typography sx={{ fontSize: "13px", color: "rgba(0, 0, 0, 0.6)", lineHeight: 1.6 }}>{step.desc}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Box>

          {/* Trust Features */}
          <Grid container spacing={3}>
            {[
              {
                icon: Shield,
                title: "Secure Escrow",
                desc: "Your payment is held safely until work is completed and approved. Never worry about losing money.",
              },
              {
                icon: CheckCircle,
                title: "Fair Disputes",
                desc: "KickAir mediates all disputes professionally, ensuring both parties are treated fairly.",
              },
              {
                icon: Star,
                title: "Quality Guarantee",
                desc: "Our review system ensures high standards. Get your money back if work doesn't meet expectations.",
              },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Grid size={4} key={index}>
                  <Box
                    sx={{
                      bgcolor: "white",
                      borderRadius: "16px",
                      border: "1px solid rgba(0, 0, 0, 0.08)",
                      p: 3,
                      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                    }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: "50%",
                        background: "linear-gradient(to bottom right, rgba(0, 113, 227, 0.1), rgba(0, 113, 227, 0.05))",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: 2,
                      }}>
                      <Icon sx={{ fontSize: 24, color: "#0071e3", strokeWidth: 2 }} />
                    </Box>
                    <Typography sx={{ fontSize: "17px", fontWeight: 600, color: "black", mb: 1 }}>{feature.title}</Typography>
                    <Typography sx={{ fontSize: "13px", color: "rgba(0, 0, 0, 0.6)", lineHeight: 1.6 }}>
                      {feature.desc}
                    </Typography>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </Box>

        {/* Success Stories Section */}
        <Box
          component='section'
          id='success-stories'
          sx={{
            mb: 12,
            scrollMarginTop: "96px",
          }}>
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Typography
              component='h2'
              sx={{
                fontSize: "32px",
                fontWeight: 600,
                color: "black",
                letterSpacing: "-0.02em",
                mb: 1.5,
              }}>
              Success Stories
            </Typography>
            <Typography
              sx={{
                fontSize: "17px",
                color: "rgba(0, 0, 0, 0.6)",
                maxWidth: "672px",
                mx: "auto",
              }}>
              Real results from clients and freelancers on KickAir
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {[
              {
                icon: TrendingUp,
                title: "Startup Growth",
                text: '"KickAir helped us scale from 2 to 20 team members in just 6 months. We found developers, designers, and marketers all in one place. The quality has been exceptional."',
                name: "Sovann Keo",
                role: "Tech Startup CEO, Phnom Penh",
                img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
              },
              {
                icon: Zap,
                title: "Freelance Career",
                text: '"I went from earning $500/month to over $6,000/month in one year. KickAir\'s platform made it easy to showcase my work and connect with international clients."',
                name: "Sreymom Chan",
                role: "UI/UX Designer, Cambodia",
                img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
              },
              {
                icon: Shield,
                title: "Global Reach",
                text: '"As a developer from Siem Reap, I now work with clients from Singapore, Australia, and the US. KickAir opened doors I never thought possible."',
                name: "Rattanak Pich",
                role: "Full-Stack Developer, Siem Reap",
                img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
              },
            ].map((story, index) => {
              const Icon = story.icon;
              return (
                <Grid size={4} key={index}>
                  <Box
                    sx={{
                      bgcolor: "white",
                      borderRadius: "16px",
                      border: "1px solid rgba(0, 0, 0, 0.08)",
                      p: 4,
                    }}>
                    <Box sx={{ mb: 3 }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: "50%",
                          bgcolor: "rgba(0, 0, 0, 0.05)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          mb: 2,
                        }}>
                        <Icon sx={{ fontSize: 24, color: "black" }} />
                      </Box>
                      <Typography sx={{ fontSize: "19px", fontWeight: 600, color: "black", mb: 1 }}>{story.title}</Typography>
                      <Typography sx={{ fontSize: "13px", color: "rgba(0, 0, 0, 0.6)", lineHeight: 1.6 }}>
                        {story.text}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        pt: 2,
                        borderTop: "1px solid rgba(0, 0, 0, 0.08)",
                      }}>
                      <Avatar src={story.img} alt={story.name} sx={{ width: 40, height: 40 }} />
                      <Box>
                        <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "black" }}>{story.name}</Typography>
                        <Typography sx={{ fontSize: "11px", color: "rgba(0, 0, 0, 0.6)" }}>{story.role}</Typography>
                      </Box>
                    </Box>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </Box>

        {/* Reviews Section */}
        <Box
          component='section'
          id='reviews'
          sx={{
            scrollMarginTop: "96px",
          }}>
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Typography
              component='h2'
              sx={{
                fontSize: "32px",
                fontWeight: 600,
                color: "black",
                letterSpacing: "-0.02em",
                mb: 1.5,
              }}>
              What People Say
            </Typography>
            <Typography
              sx={{
                fontSize: "17px",
                color: "rgba(0, 0, 0, 0.6)",
                maxWidth: "672px",
                mx: "auto",
              }}>
              Trusted by thousands of freelancers and clients worldwide
            </Typography>
          </Box>

          {/* Overall Rating */}
          <Box
            sx={{
              bgcolor: "white",
              borderRadius: "16px",
              border: "1px solid rgba(0, 0, 0, 0.08)",
              p: 4,
              mb: 4,
              textAlign: "center",
            }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, mb: 2 }}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} sx={{ fontSize: 28, fill: "black", color: "black" }} />
              ))}
            </Box>
            <Typography sx={{ fontSize: "48px", fontWeight: 600, color: "black", mb: 0.5 }}>4.9</Typography>
            <Typography sx={{ fontSize: "14px", color: "rgba(0, 0, 0, 0.6)" }}>Based on 12,450+ reviews</Typography>
          </Box>

          {/* Review Cards */}
          <Grid container spacing={3}>
            {[
              {
                text: '"The platform is incredibly easy to use. I found the perfect developer for my e-commerce project within hours. The three-tier pricing system helped me choose the right package for my budget."',
                name: "Jessica Wong",
                role: "E-commerce Owner",
                img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
              },
              {
                text: "\"Best freelancing platform for Cambodia. Clean interface, fair fees, and great support. I've built my entire business on KickAir and couldn't be happier.\"",
                name: "David Nguyen",
                role: "Video Editor",
                img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
              },
              {
                text: '"Fast, reliable, and professional. The payment system with Wing and ABA makes it so convenient for local transactions. Highly recommend to any Cambodian freelancer."',
                name: "Sophia Lim",
                role: "Content Writer",
                img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
              },
              {
                text: '"Professional service and quality freelancers. I\'ve hired multiple people for different projects and they all exceeded expectations. The team workspace feature is a game-changer."',
                name: "Michael Chen",
                role: "Agency Owner",
                img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100",
              },
            ].map((review, index) => (
              <Grid size={6} key={index}>
                <Box
                  sx={{
                    bgcolor: "white",
                    borderRadius: "16px",
                    border: "1px solid rgba(0, 0, 0, 0.08)",
                    p: 3,
                  }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1.5 }}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} sx={{ fontSize: 14, fill: "black", color: "black" }} />
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
                    <Avatar src={review.img} alt={review.name} sx={{ width: 40, height: 40 }} />
                    <Box>
                      <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "black" }}>{review.name}</Typography>
                      <Typography sx={{ fontSize: "11px", color: "rgba(0, 0, 0, 0.6)" }}>{review.role}</Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    </Box>
  );
}
