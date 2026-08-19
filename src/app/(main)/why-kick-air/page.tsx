import Link from "next/link";
import { ChevronLeft, Star, TrendingUp, Shield, Zap, CheckCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { css } from "styled-system/css";
import { Box, Grid } from "styled-system/jsx";

// Black numbered step badge (how-it-works columns).
const stepCircle = css({
  flexShrink: 0,
  w: "40px",
  h: "40px",
  borderRadius: "50%",
  bg: "ink",
  color: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "15px",
  fontWeight: 600,
});

// Circular avatar image (testimonials / reviews).
const avatarImg = css({
  w: "40px",
  h: "40px",
  borderRadius: "50%",
  objectFit: "cover",
  flexShrink: 0,
});

type Step = { number: number; title: string; desc: string };

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <Box textAlign="center" mb="12">
      <Box
        as="h2"
        className={css({
          fontSize: "32px",
          fontWeight: 600,
          color: "ink",
          letterSpacing: "-0.02em",
          mb: "3",
        })}
      >
        {title}
      </Box>
      <Box as="p" className={css({ fontSize: "17px", color: "ink2", maxW: "672px", mx: "auto" })}>
        {subtitle}
      </Box>
    </Box>
  );
}

function StepColumn({ heading, subtitle, steps }: { heading: string; subtitle: string; steps: Step[] }) {
  return (
    <Box
      bg="surface"
      borderRadius="16px"
      borderWidth="1px"
      borderStyle="solid"
      borderColor="hairline"
      p="8"
    >
      <Box textAlign="center" mb="8">
        <Box as="h3" className={css({ fontSize: "24px", fontWeight: 600, color: "ink", mb: "2" })}>
          {heading}
        </Box>
        <Box as="p" className={css({ fontSize: "14px", color: "ink2" })}>
          {subtitle}
        </Box>
      </Box>

      <Box display="flex" flexDirection="column" gap="6">
        {steps.map((step) => (
          <Box key={step.number} display="flex" gap="4">
            <Box className={stepCircle}>{step.number}</Box>
            <Box>
              <Box as="p" className={css({ fontSize: "15px", fontWeight: 600, color: "ink", mb: "1" })}>
                {step.title}
              </Box>
              <Box as="p" className={css({ fontSize: "13px", color: "ink2", lineHeight: 1.6 })}>
                {step.desc}
              </Box>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default function WhyKickAirPage() {
  const clientSteps: Step[] = [
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
  ];

  const freelancerSteps: Step[] = [
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
  ];

  const paymentSteps: {
    num: number;
    title: string;
    desc: string;
    gradient?: boolean;
    success?: boolean;
  }[] = [
    { num: 1, title: "Find Freelancer", desc: "Browse profiles and select the perfect talent for your project" },
    { num: 2, title: "Review & Quote", desc: "Check tier options and get detailed project quote" },
    { num: 3, title: "Client Pays", desc: "Secure payment via Wing, ABA Bank, or Pi Pay" },
    { num: 4, title: "Money Held Securely", desc: "Payment protected in KickAir escrow system", gradient: true },
    { num: 5, title: "Freelancer Delivers", desc: "Project completed and submitted for review" },
    { num: 6, title: "Payment Released", desc: "Freelancer receives full payment instantly", success: true },
  ];

  const trustFeatures: { icon: LucideIcon; title: string; desc: string }[] = [
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
  ];

  const successStories: { icon: LucideIcon; title: string; text: string; name: string; role: string; img: string }[] = [
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
  ];

  const reviews: { text: string; name: string; role: string; img: string }[] = [
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
  ];

  return (
    <Box minH="100vh" bg="canvas">
      {/* Header */}
      <Box bg="surface" borderBottomWidth="1px" borderBottomStyle="solid" borderBottomColor="hairline">
        <Box maxW="1440px" mx="auto" px={{ base: "6", sm: "12" }} py="8">
          <Link
            href="/"
            className={css({
              display: "inline-flex",
              alignItems: "center",
              gap: "1",
              mb: "4",
              fontSize: "12px",
              color: "ink2",
              textDecoration: "none",
              cursor: "pointer",
              _hover: { color: "ink" },
            })}
          >
            <ChevronLeft size={16} />
            Back to Home
          </Link>
          <Box>
            <Box
              as="h1"
              className={css({
                fontSize: "40px",
                fontWeight: 600,
                color: "ink",
                letterSpacing: "-0.02em",
                mb: "2",
              })}
            >
              Why KickAir
            </Box>
            <Box as="p" className={css({ fontSize: "17px", color: "ink2" })}>
              Premium freelancing made simple for Cambodia and the world
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Main Content */}
      <Box maxW="980px" mx="auto" px={{ base: "6", sm: "12" }} py="16">
        {/* How It Works Section */}
        <Box as="section" id="how-it-works" mb="24" scrollMarginTop="96px">
          <SectionHeader
            title="How It Works"
            subtitle="Simple, transparent, and designed for both clients and freelancers"
          />

          <Grid columns={2} gap="12">
            <StepColumn heading="For Clients" subtitle="Get work done with trusted talent" steps={clientSteps} />
            <StepColumn
              heading="For Freelancers"
              subtitle="Build your career and earn on your terms"
              steps={freelancerSteps}
            />
          </Grid>
        </Box>

        {/* Trust & Payment Security Section */}
        <Box as="section" id="payment-security" mb="24" scrollMarginTop="96px">
          <SectionHeader
            title="Your Money is Protected"
            subtitle="Our secure payment system ensures fair transactions for both clients and freelancers"
          />

          {/* Payment Flow Diagram */}
          <Box
            borderRadius="24px"
            borderWidth="1px"
            borderStyle="solid"
            borderColor="hairline"
            p={{ base: "8", md: "12" }}
            mb="8"
            boxShadow="0 1px 3px rgba(0, 0, 0, 0.1)"
            style={{ background: "linear-gradient(to bottom right, white, rgba(0, 0, 0, 0.02))" }}
          >
            <Box
              as="p"
              className={css({
                fontSize: "21px",
                fontWeight: 600,
                color: "ink",
                mb: "12",
                textAlign: "center",
              })}
            >
              How Our Secure Payment System Works
            </Box>

            <Box maxW="800px" mx="auto">
              <Grid columns={3} gap="6">
                {paymentSteps.map((step) => {
                  const cardBg = step.gradient ? "accentFill" : step.success ? "rgba(52, 199, 89, 0.05)" : "surface";
                  const cardBorder = step.gradient
                    ? "rgba(0, 113, 227, 0.2)"
                    : step.success
                    ? "rgba(52, 199, 89, 0.2)"
                    : "hairline";
                  const circleGradient = step.success
                    ? "linear-gradient(to bottom right, #34c759, #30d158)"
                    : "linear-gradient(to bottom right, #0071e3, #0077ed)";
                  return (
                    <Box
                      key={step.num}
                      bg={cardBg}
                      borderRadius="16px"
                      borderWidth="1px"
                      borderStyle="solid"
                      borderColor={cardBorder}
                      p="6"
                      boxShadow="0 1px 3px rgba(0, 0, 0, 0.1)"
                    >
                      <Box
                        w="48px"
                        h="48px"
                        borderRadius="50%"
                        color="white"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        fontSize="17px"
                        fontWeight={600}
                        mb="4"
                        boxShadow="0 2px 8px rgba(0, 0, 0, 0.1)"
                        style={{ background: circleGradient }}
                      >
                        {step.num}
                      </Box>
                      <Box as="p" className={css({ fontSize: "15px", fontWeight: 600, color: "ink", mb: "2" })}>
                        {step.title}
                      </Box>
                      <Box as="p" className={css({ fontSize: "13px", color: "ink2", lineHeight: 1.6 })}>
                        {step.desc}
                      </Box>
                    </Box>
                  );
                })}
              </Grid>
            </Box>
          </Box>

          {/* Trust Features */}
          <Grid columns={3} gap="6">
            {trustFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Box
                  key={index}
                  bg="surface"
                  borderRadius="16px"
                  borderWidth="1px"
                  borderStyle="solid"
                  borderColor="hairline"
                  p="6"
                  boxShadow="0 1px 3px rgba(0, 0, 0, 0.1)"
                >
                  <Box
                    w="48px"
                    h="48px"
                    borderRadius="50%"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    mb="4"
                    style={{
                      background:
                        "linear-gradient(to bottom right, rgba(0, 113, 227, 0.1), rgba(0, 113, 227, 0.05))",
                    }}
                  >
                    <Icon size={24} color="#0071e3" strokeWidth={2} />
                  </Box>
                  <Box as="p" className={css({ fontSize: "17px", fontWeight: 600, color: "ink", mb: "2" })}>
                    {feature.title}
                  </Box>
                  <Box as="p" className={css({ fontSize: "13px", color: "ink2", lineHeight: 1.6 })}>
                    {feature.desc}
                  </Box>
                </Box>
              );
            })}
          </Grid>
        </Box>

        {/* Success Stories Section */}
        <Box as="section" id="success-stories" mb="24" scrollMarginTop="96px">
          <SectionHeader title="Success Stories" subtitle="Real results from clients and freelancers on KickAir" />

          <Grid columns={3} gap="6">
            {successStories.map((story, index) => {
              const Icon = story.icon;
              return (
                <Box
                  key={index}
                  bg="surface"
                  borderRadius="16px"
                  borderWidth="1px"
                  borderStyle="solid"
                  borderColor="hairline"
                  p="8"
                >
                  <Box mb="6">
                    <Box
                      w="48px"
                      h="48px"
                      borderRadius="50%"
                      bg="rgba(0, 0, 0, 0.05)"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      mb="4"
                    >
                      <Icon size={24} color="black" />
                    </Box>
                    <Box as="p" className={css({ fontSize: "19px", fontWeight: 600, color: "ink", mb: "2" })}>
                      {story.title}
                    </Box>
                    <Box as="p" className={css({ fontSize: "13px", color: "ink2", lineHeight: 1.6 })}>
                      {story.text}
                    </Box>
                  </Box>
                  <Box
                    display="flex"
                    alignItems="center"
                    gap="3"
                    pt="4"
                    borderTopWidth="1px"
                    borderTopStyle="solid"
                    borderTopColor="hairline"
                  >
                    <img src={story.img} alt={story.name} className={avatarImg} />
                    <Box>
                      <Box as="p" className={css({ fontSize: "12px", fontWeight: 600, color: "ink" })}>
                        {story.name}
                      </Box>
                      <Box as="p" className={css({ fontSize: "11px", color: "ink2" })}>
                        {story.role}
                      </Box>
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Grid>
        </Box>

        {/* Reviews Section */}
        <Box as="section" id="reviews" scrollMarginTop="96px">
          <SectionHeader
            title="What People Say"
            subtitle="Trusted by thousands of freelancers and clients worldwide"
          />

          {/* Overall Rating */}
          <Box
            bg="surface"
            borderRadius="16px"
            borderWidth="1px"
            borderStyle="solid"
            borderColor="hairline"
            p="8"
            mb="8"
            textAlign="center"
          >
            <Box display="flex" alignItems="center" justifyContent="center" gap="2" mb="4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={28} fill="black" color="black" />
              ))}
            </Box>
            <Box as="p" className={css({ fontSize: "48px", fontWeight: 600, color: "ink", mb: "1" })}>
              4.9
            </Box>
            <Box as="p" className={css({ fontSize: "14px", color: "ink2" })}>
              Based on 12,450+ reviews
            </Box>
          </Box>

          {/* Review Cards */}
          <Grid columns={2} gap="6">
            {reviews.map((review, index) => (
              <Box
                key={index}
                bg="surface"
                borderRadius="16px"
                borderWidth="1px"
                borderStyle="solid"
                borderColor="hairline"
                p="6"
              >
                <Box display="flex" alignItems="center" gap="1" mb="3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill="black" color="black" />
                  ))}
                </Box>
                <Box
                  as="p"
                  className={css({ fontSize: "14px", color: "rgba(0, 0, 0, 0.8)", lineHeight: 1.6, mb: "4" })}
                >
                  {review.text}
                </Box>
                <Box display="flex" alignItems="center" gap="3">
                  <img src={review.img} alt={review.name} className={avatarImg} />
                  <Box>
                    <Box as="p" className={css({ fontSize: "12px", fontWeight: 600, color: "ink" })}>
                      {review.name}
                    </Box>
                    <Box as="p" className={css({ fontSize: "11px", color: "ink2" })}>
                      {review.role}
                    </Box>
                  </Box>
                </Box>
              </Box>
            ))}
          </Grid>
        </Box>
      </Box>
    </Box>
  );
}
