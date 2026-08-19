"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  BookOpen,
  DollarSign,
  Users,
  Star,
  TrendingUp,
  MessagesSquare,
  Shield,
  CheckCircle,
  PlayCircle,
  FileText,
  Trophy,
} from "lucide-react";
import { css } from "styled-system/css";
import { Box, Stack } from "styled-system/jsx";

interface KickAirUniversityPageProps {
  userType?: "freelancer" | "client";
}

// Text-style link/action (marketing "Start Learning →" etc.)
const textLink = css({
  fontSize: "13px",
  fontWeight: 600,
  color: "accent",
  fontFamily: "inherit",
  bg: "transparent",
  border: "none",
  p: "0",
  minW: "auto",
  cursor: "pointer",
  _hover: { textDecoration: "underline" },
});

export default function KickAirUniversityPage({ userType = "freelancer" }: KickAirUniversityPageProps) {
  const [activeTab, setActiveTab] = useState<"freelancer" | "client">(userType);

  const courseCards =
    activeTab === "freelancer"
      ? [
          {
            icon: <PlayCircle size={24} />,
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
            icon: <DollarSign size={24} />,
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
            icon: <Users size={24} />,
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
            icon: <TrendingUp size={24} />,
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
            icon: <Users size={24} />,
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
            icon: <FileText size={24} />,
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
            icon: <Shield size={24} />,
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
            icon: <Star size={24} />,
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
            icon: <FileText size={24} />,
            title: "Templates & Tools",
            description: "Download free contract templates, proposal formats, and invoicing tools",
            buttonText: "Browse Resources →",
            onClick: () => {},
          },
          {
            icon: <MessagesSquare size={24} />,
            title: "Community Forum",
            description: "Connect with other freelancers, share tips, and get advice",
            buttonText: "Join Discussion →",
            onClick: () => {},
          },
          {
            icon: <Trophy size={24} />,
            title: "Success Stories",
            description: "Learn from freelancers who built six-figure careers on KickAir",
            buttonText: "Read Stories →",
            // onClick: () => onNavigate("why-kickair", { scrollTo: "success-stories" }),
          },
        ]
      : [
          {
            icon: <FileText size={24} />,
            title: "Templates & Guides",
            description: "Download job post templates, project briefs, and evaluation checklists",
            buttonText: "Browse Resources →",
            onClick: () => {},
          },
          {
            icon: <MessagesSquare size={24} />,
            title: "Client Community",
            description: "Connect with other clients and share best practices for hiring",
            buttonText: "Join Discussion →",
            onClick: () => {},
          },
          {
            icon: <Trophy size={24} />,
            title: "Case Studies",
            description: "See how businesses grew with KickAir's freelance talent",
            buttonText: "Read Case Studies →",
            // onClick: () => onNavigate("why-kickair", { scrollTo: "success-stories" }),
          },
        ];

  return (
    <Box minH="100vh" bg="canvas">
      {/* Header */}
      <Box bg="surface" borderBottomWidth="1px" borderBottomStyle="solid" borderBottomColor="hairline">
        <Box maxW="1200px" mx="auto" px="6" py="8">
          <Link
            href="/"
            className={css({
              display: "inline-flex",
              alignItems: "center",
              gap: "1.5",
              fontSize: "12px",
              color: "ink2",
              fontFamily: "inherit",
              textDecoration: "none",
              mb: "4",
              cursor: "pointer",
              _hover: { color: "ink" },
            })}>
            <ChevronLeft size={16} />
            Back to Home
          </Link>
          <Box mb="6">
            <Box
              as="span"
              className={css({
                display: "inline-flex",
                alignItems: "center",
                gap: "1.5",
                bg: "rgba(0,0,0,0.05)",
                color: "ink2",
                fontSize: "11px",
                fontWeight: 600,
                borderRadius: "pill",
                py: "1",
                px: "3",
                mb: "4",
              })}>
              <BookOpen size={14} />
              EDUCATION
            </Box>
            <Box
              as="h1"
              className={css({
                fontSize: { base: "32px", md: "48px" },
                fontWeight: 600,
                color: "ink",
                letterSpacing: "-0.02em",
                mb: "2",
              })}>
              KickAir University
            </Box>
            <Box
              as="p"
              className={css({
                fontSize: "19px",
                color: "ink2",
                maxW: "600px",
              })}>
              Master the skills you need to succeed. Free courses and resources for freelancers and clients.
            </Box>
          </Box>

          {/* Tab Switcher */}
          <Box
            className={css({
              display: "inline-flex",
              bg: "rgba(0,0,0,0.05)",
              p: "1",
              borderRadius: "12px",
              gap: "2",
            })}>
            <button
              type="button"
              onClick={() => setActiveTab("freelancer")}
              className={css({
                px: "6",
                py: "2",
                fontSize: "13px",
                fontWeight: 500,
                borderRadius: "8px",
                fontFamily: "inherit",
                border: "none",
                cursor: "pointer",
                transition: "background-color .15s, color .15s, box-shadow .15s",
                bg: activeTab === "freelancer" ? "surface" : "transparent",
                color: activeTab === "freelancer" ? "ink" : "ink2",
                boxShadow: activeTab === "freelancer" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                _hover: {
                  bg: activeTab === "freelancer" ? "surface" : "rgba(0,0,0,0.02)",
                  color: "ink",
                },
              })}>
              For Freelancers
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("client")}
              className={css({
                px: "6",
                py: "2",
                fontSize: "13px",
                fontWeight: 500,
                borderRadius: "8px",
                fontFamily: "inherit",
                border: "none",
                cursor: "pointer",
                transition: "background-color .15s, color .15s, box-shadow .15s",
                bg: activeTab === "client" ? "surface" : "transparent",
                color: activeTab === "client" ? "ink" : "ink2",
                boxShadow: activeTab === "client" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                _hover: {
                  bg: activeTab === "client" ? "surface" : "rgba(0,0,0,0.02)",
                  color: "ink",
                },
              })}>
              For Clients
            </button>
          </Box>
        </Box>
      </Box>

      {/* Main Content */}
      <Box maxW="1200px" mx="auto" px="6" py="16">
        <Box mb="16">
          <Box
            as="h2"
            className={css({
              fontSize: "32px",
              fontWeight: 600,
              color: "ink",
              letterSpacing: "-0.01em",
              mb: "3",
            })}>
            {activeTab === "freelancer" ? "Build Your Freelance Career" : "Hire Smarter, Work Better"}
          </Box>
          <Box
            as="p"
            className={css({
              fontSize: "17px",
              color: "ink2",
              mb: "12",
            })}>
            {activeTab === "freelancer"
              ? "Everything you need to know to launch, grow, and scale your freelancing business"
              : "Master the art of working with freelancers and get the most value from every project"}
          </Box>

          {/* Course Grid */}
          <Box
            display="grid"
            gridTemplateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
            gap="6"
            mb="12">
            {courseCards.map((course, index) => (
              <Box
                key={index}
                className={css({
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  bg: "surface",
                  borderRadius: "card",
                  borderWidth: "1px",
                  borderStyle: "solid",
                  borderColor: "hairline",
                  overflow: "hidden",
                  transition: "box-shadow 0.3s",
                  _hover: { boxShadow: "0 8px 24px rgba(0,0,0,0.12)" },
                })}>
                <Box p="8" flex="1">
                  <Box
                    className={css({
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      bg: "rgba(0,113,227,0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "accent",
                      mb: "4",
                    })}>
                    {course.icon}
                  </Box>
                  <Box
                    as="h3"
                    className={css({
                      fontSize: "21px",
                      fontWeight: 600,
                      color: "ink",
                      mb: "2",
                    })}>
                    {course.title}
                  </Box>
                  <Box
                    as="p"
                    className={css({
                      fontSize: "14px",
                      color: "ink2",
                      mb: "6",
                      lineHeight: 1.5,
                    })}>
                    {course.description}
                  </Box>
                  <Stack gap="3">
                    {course.items.map((item, idx) => (
                      <Box
                        key={idx}
                        className={css({ display: "flex", gap: "3", alignItems: "flex-start" })}>
                        <CheckCircle
                          size={16}
                          color="#0071e3"
                          className={css({ flexShrink: 0, mt: "0.5" })}
                        />
                        <Box as="span" className={css({ fontSize: "13px", color: "rgba(0,0,0,0.8)" })}>
                          {item}
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                </Box>
                <Box
                  className={css({
                    px: "8",
                    py: "4",
                    bg: "rgba(0,0,0,0.02)",
                    borderTopWidth: "1px",
                    borderTopStyle: "solid",
                    borderTopColor: "hairline",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  })}>
                  <Box as="span" className={css({ fontSize: "12px", color: "ink2" })}>
                    {course.lessons} • {course.duration}
                  </Box>
                  <button type="button" className={textLink}>
                    Start Learning →
                  </button>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Additional Resources */}
        <Box mb="16">
          <Box
            as="h2"
            className={css({
              fontSize: "32px",
              fontWeight: 600,
              color: "ink",
              letterSpacing: "-0.01em",
              mb: "8",
            })}>
            Additional Resources
          </Box>

          <Box display="grid" gridTemplateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap="6">
            {resourceCards.map((resource, index) => (
              <Box
                key={index}
                className={css({
                  bg: "surface",
                  borderRadius: "card",
                  borderWidth: "1px",
                  borderStyle: "solid",
                  borderColor: "hairline",
                  p: "6",
                })}>
                <Box className={css({ color: "ink2", mb: "3", display: "flex" })}>{resource.icon}</Box>
                <Box
                  as="h4"
                  className={css({
                    fontSize: "17px",
                    fontWeight: 600,
                    color: "ink",
                    mb: "2",
                  })}>
                  {resource.title}
                </Box>
                <Box
                  as="p"
                  className={css({
                    fontSize: "13px",
                    color: "ink2",
                    mb: "4",
                    lineHeight: 1.5,
                  })}>
                  {resource.description}
                </Box>
                <button type="button" onClick={resource.onClick} className={textLink}>
                  {resource.buttonText}
                </button>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Stats Section */}
        <Box
          className={css({
            bg: "surface",
            borderRadius: "card",
            borderWidth: "1px",
            borderStyle: "solid",
            borderColor: "hairline",
            p: "12",
            textAlign: "center",
          })}>
          <Box
            as="h2"
            className={css({
              fontSize: "28px",
              fontWeight: 600,
              color: "ink",
              mb: "8",
            })}>
            Join Thousands Learning on KickAir
          </Box>
          <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap="8">
            <Box>
              <Box
                as="p"
                className={css({
                  fontSize: "48px",
                  fontWeight: 600,
                  color: "ink",
                  mb: "2",
                })}>
                15,000+
              </Box>
              <Box as="p" className={css({ fontSize: "14px", color: "ink2" })}>
                Active Students
              </Box>
            </Box>
            <Box>
              <Box
                as="p"
                className={css({
                  fontSize: "48px",
                  fontWeight: 600,
                  color: "ink",
                  mb: "2",
                })}>
                50+
              </Box>
              <Box as="p" className={css({ fontSize: "14px", color: "ink2" })}>
                Free Courses
              </Box>
            </Box>
            <Box>
              <Box
                as="p"
                className={css({
                  fontSize: "48px",
                  fontWeight: 600,
                  color: "ink",
                  mb: "2",
                })}>
                4.8/5
              </Box>
              <Box as="p" className={css({ fontSize: "14px", color: "ink2" })}>
                Average Rating
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
