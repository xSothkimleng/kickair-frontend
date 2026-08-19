import type { LucideIcon } from "lucide-react";
import { Target, Crown, DollarSign, Zap, ArrowRight } from "lucide-react";
import { css } from "styled-system/css";
import { Box, Grid } from "styled-system/jsx";

// Marketing pill CTA (matches FinalCTASection's bespoke pills — not the shared Button recipe).
const ctaPill = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "2",
  px: "8",
  py: "3.5",
  bg: "accent",
  color: "white",
  borderRadius: "pill",
  fontSize: "15px",
  fontWeight: 600,
  fontFamily: "inherit",
  borderWidth: "0",
  cursor: "pointer",
  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
  transition: "background-color .15s",
  _hover: { bg: "accentHover" },
});

const features: Array<{ icon: LucideIcon; title: string; body: string }> = [
  {
    icon: Crown,
    title: "Build Your Brand",
    body: "Create a professional profile, showcase your portfolio, and establish yourself as the go-to expert in your field",
  },
  {
    icon: DollarSign,
    title: "Earn Your Way",
    body: "Set your own prices with three-tier packages. Choose between one-off projects or stable long-term contracts",
  },
  {
    icon: Zap,
    title: "Be Your Own Boss",
    body: "Work when you want, where you want. Choose projects that excite you and clients who respect your expertise",
  },
];

export default function FreelancerEmpowermentSection() {
  return (
    <Box as="section" bg="canvas" py={{ base: "12", md: "20" }}>
      <Box maxW="1200px" mx="auto" px={{ base: "6", sm: "12" }}>
        {/* Header */}
        <Box textAlign="center" mb="16">
          {/* Badge */}
          <Box
            display="inline-flex"
            alignItems="center"
            gap="1.5"
            bg="rgba(0, 0, 0, 0.05)"
            color="ink2"
            borderRadius="pill"
            px="3"
            py="1"
            mb="4"
            fontSize="11px"
            fontWeight={600}
          >
            <Target size={14} />
            FOR FREELANCERS
          </Box>

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
            Your Platform, Your Rules
          </Box>
          <Box
            as="p"
            className={css({
              fontSize: { base: "16px", md: "19px" },
              color: "ink2",
            })}
          >
            KickAir empowers you to build your brand, set your own rates, and grow your business on your terms
          </Box>
        </Box>

        {/* Feature Cards */}
        <Grid gridTemplateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }} gap="8" mb="12">
          {features.map(({ icon: Icon, title, body }) => (
            <Box
              key={title}
              bg="white"
              borderRadius="card"
              borderWidth="1px"
              borderStyle="solid"
              borderColor="hairline"
              p="8"
              textAlign="center"
              boxShadow="0 1px 3px rgba(0, 0, 0, 0.1)"
            >
              <Box
                w="64px"
                h="64px"
                borderRadius="full"
                bg="linear-gradient(to bottom right, rgba(0, 113, 227, 0.1), rgba(0, 113, 227, 0.05))"
                display="flex"
                alignItems="center"
                justifyContent="center"
                mx="auto"
                mb="6"
                color="accent"
              >
                <Icon size={32} strokeWidth={2} />
              </Box>
              <Box as="h3" fontSize="21px" fontWeight={600} color="ink" mb="3">
                {title}
              </Box>
              <Box as="p" fontSize="15px" color="ink2" lineHeight={1.6}>
                {body}
              </Box>
            </Box>
          ))}
        </Grid>

        {/* CTA Button */}
        <Box textAlign="center">
          <button className={ctaPill}>
            Start Freelancing Today
            <ArrowRight size={16} />
          </button>
        </Box>
      </Box>
    </Box>
  );
}
