import { ArrowRight } from "lucide-react";
import { css } from "styled-system/css";
import { Box, Grid } from "styled-system/jsx";

// Bespoke outline pill CTA (marketing-specific — not the shared Button recipe).
const ctaOutline = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "2",
  px: "8",
  py: "3.5",
  borderRadius: "pill",
  borderWidth: "2px",
  borderStyle: "solid",
  borderColor: "accent",
  bg: "transparent",
  color: "accent",
  fontSize: "15px",
  fontWeight: 600,
  fontFamily: "inherit",
  cursor: "pointer",
  transition: "background-color .15s, color .15s, border-color .15s",
  _hover: { bg: "accent", color: "white" },
});

const stepCircle = css({
  flexShrink: 0,
  w: "40px",
  h: "40px",
  borderRadius: "50%",
  bg: "accent",
  color: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "15px",
  fontWeight: 600,
});

type Step = { number: number; title: string; description: string };

function StepColumn({ heading, steps }: { heading: string; steps: Step[] }) {
  return (
    <Box
      bg="surface"
      borderRadius="16px"
      borderWidth="1px"
      borderStyle="solid"
      borderColor="hairline"
      p="8"
      boxShadow="0 1px 3px rgba(0, 0, 0, 0.1)"
    >
      <Box
        as="h3"
        className={css({
          fontSize: "24px",
          fontWeight: 600,
          color: "ink",
          mb: "6",
          textAlign: "center",
        })}
      >
        {heading}
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
                {step.description}
              </Box>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default function HowItWorksSection() {
  const clientSteps: Step[] = [
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

  const freelancerSteps: Step[] = [
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
    <Box as="section" bg="canvas">
      <Box maxW="1200px" mx="auto" px={{ base: "6", sm: "12" }} py={{ base: "12", md: "20" }}>
        {/* Header */}
        <Box textAlign="center" mb="12">
          <Box
            as="h2"
            className={css({
              fontSize: { base: "28px", md: "40px" },
              fontWeight: 600,
              color: "ink",
              letterSpacing: "-0.02em",
              mb: "3",
            })}
          >
            How It Works
          </Box>
          <Box as="p" className={css({ fontSize: { base: "16px", md: "19px" }, color: "ink2" })}>
            Get started in minutes, hire in hours
          </Box>
        </Box>

        {/* Steps Grid */}
        <Grid columns={{ base: 1, md: 2 }} gap={{ base: "6", md: "12" }} mb="12">
          <StepColumn heading="For Clients" steps={clientSteps} />
          <StepColumn heading="For Freelancers" steps={freelancerSteps} />
        </Grid>

        {/* CTA Button */}
        <Box textAlign="center">
          <button className={ctaOutline}>
            Learn More About Our Process
            <ArrowRight size={16} />
          </button>
        </Box>
      </Box>
    </Box>
  );
}
