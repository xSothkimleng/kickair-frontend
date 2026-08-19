import { Crown, Users, Shield, Award, ArrowRight } from "lucide-react";
import { css } from "styled-system/css";
import { Box, Grid } from "styled-system/jsx";

// Solid pill CTA on dark surface (marketing-specific — not the shared Button recipe).
const ctaSolid = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "2",
  px: "8",
  py: "3.5",
  borderRadius: "pill",
  borderWidth: "0",
  bg: "accent",
  color: "white",
  fontSize: "15px",
  fontWeight: 600,
  fontFamily: "inherit",
  cursor: "pointer",
  boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
  transition: "background-color .15s",
  _hover: { bg: "accentHover" },
});

const badgePill = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "1.5",
  borderRadius: "pill",
  bg: "rgba(255, 255, 255, 0.1)",
  backdropFilter: "blur(8px)",
  color: "rgba(255, 255, 255, 0.8)",
  fontSize: "11px",
  fontWeight: 600,
  py: "1",
  px: "3",
  mb: "6",
});

const features = [
  { Icon: Users, title: "Team Workspace", description: "Manage multiple freelancers on one visual canvas" },
  { Icon: Shield, title: "Priority Support", description: "Get help when you need it with 24/7 dedicated support" },
  { Icon: Award, title: "Exclusive Talent", description: "Access to pre-vetted, top 1% freelancers only" },
];

export default function KickAirProSection() {
  return (
    <Box as="section" bg="canvas">
      <Box maxW="1200px" mx="auto" px={{ base: "6", sm: "12" }} py={{ base: "12", md: "20" }}>
        <Box
          bg="linear-gradient(to bottom right, #000000, rgba(0, 0, 0, 0.9))"
          borderRadius="24px"
          p={{ base: "6", sm: "10", md: "16" }}
          textAlign="center"
          color="white"
          position="relative"
          overflow="hidden"
        >
          {/* Radial Gradient Overlays */}
          <Box
            position="absolute"
            inset="0"
            bg="radial-gradient(circle at 30% 20%, rgba(0, 113, 227, 0.15), transparent 50%)"
          />
          <Box
            position="absolute"
            inset="0"
            bg="radial-gradient(circle at 70% 80%, rgba(0, 113, 227, 0.1), transparent 50%)"
          />

          <Box position="relative" zIndex={10}>
            {/* Badge */}
            <span className={badgePill}>
              <Crown size={14} color="#0071e3" />
              ENTERPRISE SOLUTION
            </span>

            <Box
              as="h2"
              className={css({
                fontSize: { base: "28px", md: "40px", lg: "48px" },
                fontWeight: 600,
                letterSpacing: "-0.02em",
                mb: "4",
              })}
            >
              Introducing KickAir Pro
            </Box>

            <Box
              as="p"
              className={css({
                fontSize: { base: "16px", md: "19px" },
                color: "rgba(255, 255, 255, 0.7)",
                maxW: "672px",
                mx: "auto",
                mb: "8",
              })}
            >
              Scale your business with advanced team management, priority support, and exclusive access to top-tier
              freelancers
            </Box>

            {/* Features Grid */}
            <Grid columns={{ base: 1, sm: 2, md: 3 }} gap="6" maxW="896px" mx="auto" mb="10">
              {features.map(({ Icon, title, description }) => (
                <Box
                  key={title}
                  bg="rgba(255, 255, 255, 0.05)"
                  backdropFilter="blur(8px)"
                  borderRadius="16px"
                  p="6"
                  borderWidth="1px"
                  borderStyle="solid"
                  borderColor="rgba(255, 255, 255, 0.1)"
                >
                  <Box display="flex" justifyContent="center" mb="3">
                    <Icon size={32} color="#0071e3" />
                  </Box>
                  <Box as="p" className={css({ fontSize: "17px", fontWeight: 600, mb: "2" })}>
                    {title}
                  </Box>
                  <Box as="p" className={css({ fontSize: "13px", color: "rgba(255, 255, 255, 0.6)" })}>
                    {description}
                  </Box>
                </Box>
              ))}
            </Grid>

            <button className={ctaSolid}>
              Learn More About Pro
              <ArrowRight size={16} />
            </button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
