import { BookOpen, ArrowRight } from "lucide-react";
import { css } from "styled-system/css";
import { Box } from "styled-system/jsx";

// Solid white pill CTA on the blue gradient (marketing-specific — not the shared Button recipe).
const ctaSolid = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "2",
  px: "8",
  py: "3.5",
  borderRadius: "pill",
  borderWidth: "0",
  bg: "white",
  color: "accent",
  fontSize: "15px",
  fontWeight: 600,
  fontFamily: "inherit",
  cursor: "pointer",
  boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
  transition: "background-color .15s",
  _hover: { bg: "rgba(255, 255, 255, 0.9)" },
});

const badgePill = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "1.5",
  borderRadius: "pill",
  bg: "rgba(255, 255, 255, 0.2)",
  backdropFilter: "blur(8px)",
  color: "white",
  fontSize: "11px",
  fontWeight: 600,
  py: "1",
  px: "3",
  mb: "6",
});

export default function KickAirUniversitySection() {
  return (
    <Box
      as="section"
      bg="linear-gradient(to bottom right, #0071e3, #0077ed)"
      py={{ base: "12", md: "20" }}
    >
      <Box maxW="1200px" mx="auto" px={{ base: "6", sm: "12" }} textAlign="center" color="white">
        <span className={badgePill}>
          <BookOpen size={14} color="white" />
          FREE EDUCATION
        </span>
        <Box
          as="h2"
          className={css({
            fontSize: { base: "28px", md: "40px" },
            fontWeight: 600,
            letterSpacing: "-0.02em",
            mb: "4",
          })}
        >
          KickAir University
        </Box>
        <Box display="flex" justifyContent="center" mb="8">
          <Box
            as="p"
            className={css({
              fontSize: { base: "16px", md: "19px" },
              color: "rgba(255, 255, 255, 0.8)",
              maxW: "672px",
              mx: "auto",
            })}
          >
            Master freelancing with free courses on pricing, client management, marketing, and more
          </Box>
        </Box>
        <button className={ctaSolid}>
          Start Learning Free
          <ArrowRight size={16} />
        </button>
      </Box>
    </Box>
  );
}
