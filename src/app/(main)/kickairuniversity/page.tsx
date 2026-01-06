"use client";

import { useState } from "react";
import { Box, Container, Typography, Button, Grid, Card, CardContent, Stack, Chip } from "@mui/material";

// MUI Icons
import {
  ChevronLeft,
  MenuBook,
  AttachMoney,
  People,
  Star,
  TrendingUp,
  Forum,
  Shield,
  CheckCircle,
  PlayCircle,
  Description,
  EmojiEvents,
} from "@mui/icons-material";
import Link from "next/link";

interface KickAirUniversityPageProps {
  userType?: "freelancer" | "client";
}

export default function KickAirUniversityPage({ userType = "freelancer" }: KickAirUniversityPageProps) {
  const [activeTab, setActiveTab] = useState<"freelancer" | "client">(userType);

  const courseCards =
    activeTab === "freelancer"
      ? [
          {
            icon: <PlayCircle sx={{ fontSize: 24 }} />,
            color: "#0071e3",
            title: "Getting Started",
            description:
              "Launch your freelance career with confidence. Learn how to set up your profile, choose your niche, and land your first client.",
            items: [
              "Setting up your KickAir profile",
              "Choosing the right services to offer",
              "Building a portfolio that converts",
              "Writing compelling service descriptions",
            ],
            lessons: "8 lessons",
            duration: "2 hours",
          },
          {
            icon: <AttachMoney sx={{ fontSize: 24 }} />,
            color: "#0071e3",
            title: "Pricing Strategies",
            description:
              "Learn how to price your services competitively while maximizing your income. Master the three-tier pricing system.",
            items: [
              "Understanding value-based pricing",
              "Creating effective package tiers",
              "When and how to raise your rates",
              "Handling price negotiations",
            ],
            lessons: "6 lessons",
            duration: "1.5 hours",
          },
          {
            icon: <People sx={{ fontSize: 24 }} />,
            color: "#0071e3",
            title: "Client Management",
            description:
              "Build lasting relationships with clients. Learn communication best practices and how to exceed expectations.",
            items: [
              "Effective client communication",
              "Setting clear expectations and boundaries",
              "Handling difficult conversations",
              "Getting reviews and referrals",
            ],
            lessons: "10 lessons",
            duration: "3 hours",
          },
          {
            icon: <TrendingUp sx={{ fontSize: 24 }} />,
            color: "#0071e3",
            title: "Marketing & Growth",
            description:
              "Stand out from the competition. Learn how to market your services, build your brand, and scale your income.",
            items: [
              "Optimizing your profile for search",
              "Using social media to attract clients",
              "Building a personal brand",
              "Scaling from freelancer to agency",
            ],
            lessons: "12 lessons",
            duration: "4 hours",
          },
        ]
      : [
          {
            icon: <People sx={{ fontSize: 24 }} />,
            color: "#0071e3",
            title: "Finding the Right Talent",
            description: "Learn how to identify, evaluate, and hire the perfect freelancer for your project needs.",
            items: [
              "Defining your project requirements",
              "Reading portfolios and reviews effectively",
              "Conducting freelancer interviews",
              "Red flags to watch for",
            ],
            lessons: "7 lessons",
            duration: "2 hours",
          },
          {
            icon: <Description sx={{ fontSize: 24 }} />,
            color: "#0071e3",
            title: "Writing Clear Job Posts",
            description: "Craft job descriptions that attract top talent and set clear expectations from the start.",
            items: [
              "Structuring effective job posts",
              "Setting realistic budgets and timelines",
              "Defining deliverables and milestones",
              "Using keywords to attract the right talent",
            ],
            lessons: "5 lessons",
            duration: "1.5 hours",
          },
          {
            icon: <Shield sx={{ fontSize: 24 }} />,
            color: "#0071e3",
            title: "Managing Remote Teams",
            description: "Master remote collaboration and get the best results from your freelance team.",
            items: [
              "Setting up communication systems",
              "Using the Team Workspace effectively",
              "Tracking progress and deadlines",
              "Providing effective feedback",
            ],
            lessons: "9 lessons",
            duration: "3 hours",
          },
          {
            icon: <Star sx={{ fontSize: 24 }} />,
            color: "#0071e3",
            title: "Maximizing Value",
            description: "Learn strategies to get exceptional results while staying within budget.",
            items: [
              "Negotiating rates and packages",
              "Building long-term partnerships",
              "Scaling your team efficiently",
              "Leveraging KickAir Pro features",
            ],
            lessons: "8 lessons",
            duration: "2.5 hours",
          },
        ];

  const resourceCards =
    activeTab === "freelancer"
      ? [
          {
            icon: <Description sx={{ fontSize: 24 }} />,
            title: "Templates & Tools",
            description: "Download free contract templates, proposal formats, and invoicing tools",
            buttonText: "Browse Resources →",
            onClick: () => {},
          },
          {
            icon: <Forum sx={{ fontSize: 24 }} />,
            title: "Community Forum",
            description: "Connect with other freelancers, share tips, and get advice",
            buttonText: "Join Discussion →",
            onClick: () => {},
          },
          {
            icon: <EmojiEvents sx={{ fontSize: 24 }} />,
            title: "Success Stories",
            description: "Learn from freelancers who built six-figure careers on KickAir",
            buttonText: "Read Stories →",
            // onClick: () => onNavigate("why-kickair", { scrollTo: "success-stories" }),
          },
        ]
      : [
          {
            icon: <Description sx={{ fontSize: 24 }} />,
            title: "Templates & Guides",
            description: "Download job post templates, project briefs, and evaluation checklists",
            buttonText: "Browse Resources →",
            onClick: () => {},
          },
          {
            icon: <Forum sx={{ fontSize: 24 }} />,
            title: "Client Community",
            description: "Connect with other clients and share best practices for hiring",
            buttonText: "Join Discussion →",
            onClick: () => {},
          },
          {
            icon: <EmojiEvents sx={{ fontSize: 24 }} />,
            title: "Case Studies",
            description: "See how businesses grew with KickAir's freelance talent",
            buttonText: "Read Case Studies →",
            // onClick: () => onNavigate("why-kickair", { scrollTo: "success-stories" }),
          },
        ];

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#F5F5F7" }}>
      {/* Header */}
      <Box sx={{ bgcolor: "white", borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
        <Container maxWidth='lg' sx={{ px: 3, py: 4 }}>
          <Link href='/' passHref>
            <Button
              startIcon={<ChevronLeft sx={{ fontSize: 16 }} />}
              sx={{
                fontSize: "12px",
                color: "rgba(0,0,0,0.6)",
                textTransform: "none",
                mb: 2,
                "&:hover": {
                  color: "black",
                  bgcolor: "transparent",
                },
              }}>
              Back to Home
            </Button>
          </Link>
          <Box sx={{ mb: 3 }}>
            <Chip
              icon={<MenuBook sx={{ fontSize: 14 }} />}
              label='EDUCATION'
              sx={{
                bgcolor: "rgba(0,0,0,0.05)",
                color: "rgba(0,0,0,0.6)",
                fontSize: "11px",
                fontWeight: 600,
                height: "auto",
                py: 0.5,
                mb: 2,
                "& .MuiChip-icon": {
                  color: "rgba(0,0,0,0.6)",
                },
              }}
            />
            <Typography
              variant='h1'
              sx={{
                fontSize: { xs: "32px", md: "48px" },
                fontWeight: 600,
                color: "black",
                letterSpacing: "-0.02em",
                mb: 1,
              }}>
              KickAir University
            </Typography>
            <Typography
              sx={{
                fontSize: "19px",
                color: "rgba(0,0,0,0.6)",
                maxWidth: "600px",
              }}>
              Master the skills you need to succeed. Free courses and resources for freelancers and clients.
            </Typography>
          </Box>

          {/* Tab Switcher */}
          <Box
            sx={{
              display: "inline-flex",
              bgcolor: "rgba(0,0,0,0.05)",
              p: 0.5,
              borderRadius: "12px",
              gap: 1,
            }}>
            <Button
              onClick={() => setActiveTab("freelancer")}
              sx={{
                px: 3,
                py: 1,
                fontSize: "13px",
                fontWeight: 500,
                borderRadius: "8px",
                textTransform: "none",
                bgcolor: activeTab === "freelancer" ? "white" : "transparent",
                color: activeTab === "freelancer" ? "black" : "rgba(0,0,0,0.6)",
                boxShadow: activeTab === "freelancer" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                "&:hover": {
                  bgcolor: activeTab === "freelancer" ? "white" : "rgba(0,0,0,0.02)",
                  color: "black",
                },
              }}>
              For Freelancers
            </Button>
            <Button
              onClick={() => setActiveTab("client")}
              sx={{
                px: 3,
                py: 1,
                fontSize: "13px",
                fontWeight: 500,
                borderRadius: "8px",
                textTransform: "none",
                bgcolor: activeTab === "client" ? "white" : "transparent",
                color: activeTab === "client" ? "black" : "rgba(0,0,0,0.6)",
                boxShadow: activeTab === "client" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                "&:hover": {
                  bgcolor: activeTab === "client" ? "white" : "rgba(0,0,0,0.02)",
                  color: "black",
                },
              }}>
              For Clients
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth='lg' sx={{ px: 3, py: 8 }}>
        <Box sx={{ mb: 8 }}>
          <Typography
            variant='h2'
            sx={{
              fontSize: "32px",
              fontWeight: 600,
              color: "black",
              letterSpacing: "-0.01em",
              mb: 1.5,
            }}>
            {activeTab === "freelancer" ? "Build Your Freelance Career" : "Hire Smarter, Work Better"}
          </Typography>
          <Typography
            sx={{
              fontSize: "17px",
              color: "rgba(0,0,0,0.6)",
              mb: 6,
            }}>
            {activeTab === "freelancer"
              ? "Everything you need to know to launch, grow, and scale your freelancing business"
              : "Master the art of working with freelancers and get the most value from every project"}
          </Typography>

          {/* Course Grid */}
          <Grid container spacing={3} sx={{ mb: 6 }}>
            {courseCards.map((course, index) => (
              <Grid size={6} key={index}>
                <Card
                  sx={{
                    height: "100%",
                    borderRadius: "16px",
                    border: "1px solid rgba(0,0,0,0.08)",
                    boxShadow: "none",
                    transition: "box-shadow 0.3s",
                    "&:hover": {
                      boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                    },
                  }}>
                  <CardContent sx={{ p: 4 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: "50%",
                        bgcolor: "rgba(0,113,227,0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: course.color,
                        mb: 2,
                      }}>
                      {course.icon}
                    </Box>
                    <Typography
                      variant='h3'
                      sx={{
                        fontSize: "21px",
                        fontWeight: 600,
                        color: "black",
                        mb: 1,
                      }}>
                      {course.title}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "14px",
                        color: "rgba(0,0,0,0.6)",
                        mb: 3,
                        lineHeight: 1.5,
                      }}>
                      {course.description}
                    </Typography>
                    <Stack spacing={1.5}>
                      {course.items.map((item, idx) => (
                        <Box key={idx} sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
                          <CheckCircle sx={{ fontSize: 16, color: "#0071e3", flexShrink: 0, mt: 0.25 }} />
                          <Typography sx={{ fontSize: "13px", color: "rgba(0,0,0,0.8)" }}>{item}</Typography>
                        </Box>
                      ))}
                    </Stack>
                  </CardContent>
                  <Box
                    sx={{
                      px: 4,
                      py: 2,
                      bgcolor: "rgba(0,0,0,0.02)",
                      borderTop: "1px solid rgba(0,0,0,0.08)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}>
                    <Typography sx={{ fontSize: "12px", color: "rgba(0,0,0,0.6)" }}>
                      {course.lessons} • {course.duration}
                    </Typography>
                    <Button
                      sx={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#0071e3",
                        textTransform: "none",
                        p: 0,
                        minWidth: "auto",
                        "&:hover": {
                          bgcolor: "transparent",
                          textDecoration: "underline",
                        },
                      }}>
                      Start Learning →
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Additional Resources */}
        <Box sx={{ mb: 8 }}>
          <Typography
            variant='h2'
            sx={{
              fontSize: "32px",
              fontWeight: 600,
              color: "black",
              letterSpacing: "-0.01em",
              mb: 4,
            }}>
            Additional Resources
          </Typography>

          <Grid container spacing={3}>
            {resourceCards.map((resource, index) => (
              <Grid size={4} key={index}>
                <Card
                  sx={{
                    borderRadius: "16px",
                    border: "1px solid rgba(0,0,0,0.08)",
                    boxShadow: "none",
                    p: 3,
                  }}>
                  <Box sx={{ color: "rgba(0,0,0,0.6)", mb: 1.5 }}>{resource.icon}</Box>
                  <Typography
                    variant='h4'
                    sx={{
                      fontSize: "17px",
                      fontWeight: 600,
                      color: "black",
                      mb: 1,
                    }}>
                    {resource.title}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "13px",
                      color: "rgba(0,0,0,0.6)",
                      mb: 2,
                      lineHeight: 1.5,
                    }}>
                    {resource.description}
                  </Typography>
                  <Button
                    onClick={resource.onClick}
                    sx={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#0071e3",
                      textTransform: "none",
                      p: 0,
                      minWidth: "auto",
                      "&:hover": {
                        bgcolor: "transparent",
                        textDecoration: "underline",
                      },
                    }}>
                    {resource.buttonText}
                  </Button>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Stats Section */}
        <Card
          sx={{
            borderRadius: "16px",
            border: "1px solid rgba(0,0,0,0.08)",
            boxShadow: "none",
            p: 6,
            textAlign: "center",
          }}>
          <Typography
            variant='h2'
            sx={{
              fontSize: "28px",
              fontWeight: 600,
              color: "black",
              mb: 4,
            }}>
            Join Thousands Learning on KickAir
          </Typography>
          <Grid container spacing={4}>
            <Grid size={4}>
              <Typography
                sx={{
                  fontSize: "48px",
                  fontWeight: 600,
                  color: "black",
                  mb: 1,
                }}>
                15,000+
              </Typography>
              <Typography sx={{ fontSize: "14px", color: "rgba(0,0,0,0.6)" }}>Active Students</Typography>
            </Grid>
            <Grid size={4}>
              <Typography
                sx={{
                  fontSize: "48px",
                  fontWeight: 600,
                  color: "black",
                  mb: 1,
                }}>
                50+
              </Typography>
              <Typography sx={{ fontSize: "14px", color: "rgba(0,0,0,0.6)" }}>Free Courses</Typography>
            </Grid>
            <Grid size={4}>
              <Typography
                sx={{
                  fontSize: "48px",
                  fontWeight: 600,
                  color: "black",
                  mb: 1,
                }}>
                4.8/5
              </Typography>
              <Typography sx={{ fontSize: "14px", color: "rgba(0,0,0,0.6)" }}>Average Rating</Typography>
            </Grid>
          </Grid>
        </Card>
      </Container>
    </Box>
  );
}
