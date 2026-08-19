import Link from "next/link";
import { css, cx } from "styled-system/css";
import { Box } from "styled-system/jsx";

// Bespoke pill CTAs (marketing-specific — not part of the shared Button recipe).
const ctaBase = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minW: "220px",
  px: "8",
  py: "3.5",
  borderRadius: "pill",
  borderWidth: "2px",
  borderStyle: "solid",
  fontSize: "15px",
  fontWeight: 600,
  fontFamily: "inherit",
  textDecoration: "none",
  cursor: "pointer",
  transition: "background-color .15s, color .15s, border-color .15s",
});
const ctaSolid = cx(
  ctaBase,
  css({
    bg: "accent",
    color: "white",
    borderColor: "accent",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    _hover: { bg: "accentHover", borderColor: "accentHover" },
  })
);
const ctaOutline = cx(
  ctaBase,
  css({
    bg: "transparent",
    color: "accent",
    borderColor: "accent",
    _hover: { bg: "accent", color: "white" },
  })
);

export default function FinalCtaSection() {
  return (
    <Box as="section" bg="canvas">
      <Box maxW="1200px" mx="auto" px={{ base: "6", sm: "12" }} py={{ base: "12", md: "20" }}>
        <Box
          bg="surface"
          borderRadius="24px"
          borderWidth="1px"
          borderStyle="solid"
          borderColor="hairline"
          boxShadow="0 1px 3px rgba(0, 0, 0, 0.1)"
          textAlign="center"
          p={{ base: "8", sm: "12", md: "16" }}
        >
          <Box
            as="h2"
            className={css({
              fontSize: { base: "28px", md: "40px" },
              fontWeight: 600,
              color: "ink",
              letterSpacing: "-0.02em",
              mb: "4",
            })}
          >
            Ready to Start Your Journey?
          </Box>
          <Box
            as="p"
            className={css({
              fontSize: { base: "16px", md: "19px" },
              color: "ink2",
              maxW: "672px",
              mx: "auto",
              mb: "10",
            })}
          >
            Join thousands of freelancers building their brands and clients finding premium talent
          </Box>
          <Box
            className={css({
              display: "flex",
              flexDirection: { base: "column", sm: "row" },
              alignItems: "center",
              justifyContent: "center",
              gap: "4",
            })}
          >
            <Link href="/auth/sign-up" className={ctaSolid}>
              Sign Up Now
            </Link>
            <Link href="/find-freelancer" className={ctaOutline}>
              Explore Freelancers
            </Link>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
