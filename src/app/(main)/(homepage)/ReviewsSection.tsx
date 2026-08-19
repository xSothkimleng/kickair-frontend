import { Star } from "lucide-react";
import { css } from "styled-system/css";
import { Box, Grid } from "styled-system/jsx";

// Bespoke text CTA (marketing-specific — not the shared Button recipe).
const readAllBtn = css({
  bg: "transparent",
  border: "none",
  fontSize: "15px",
  fontWeight: 600,
  color: "accent",
  fontFamily: "inherit",
  cursor: "pointer",
  _hover: { textDecoration: "underline" },
});

export default function ReviewsSection() {
  const reviews = [
    {
      text: "KickAir changed my life. I went from working a 9-5 to earning 3x more as a freelancer. The platform is clean, professional, and the clients are serious.",
      name: "Sreymom Chan",
      role: "Freelance Designer",
    },
    {
      text: "Best platform for hiring in Cambodia. The three-tier pricing makes it easy to choose packages, and the escrow system gives me peace of mind.",
      name: "Michael Chen",
      role: "Startup Founder",
    },
    {
      text: "Finally found stable remote work through KickAir. Working with international clients from Phnom Penh has been a dream come true.",
      name: "Rattanak Pich",
      role: "Web Developer",
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
            Trusted by Thousands
          </Box>
          <Box as="p" className={css({ fontSize: { base: "16px", md: "19px" }, color: "ink2", mb: "6" })}>
            See what freelancers and clients are saying
          </Box>
          <Box display="flex" alignItems="center" justifyContent="center" gap="2" mb="8">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={32} fill="black" color="black" />
            ))}
            <Box as="span" className={css({ fontSize: "28px", fontWeight: 600, color: "ink", ml: "3" })}>
              4.9/5
            </Box>
          </Box>
        </Box>

        {/* Review Cards */}
        <Grid columns={{ base: 1, sm: 2, md: 3 }} gap="6" mb="8">
          {reviews.map((review, index) => (
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
              <Box display="flex" alignItems="center" gap="1" mb="4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="black" color="black" />
                ))}
              </Box>
              <Box
                as="p"
                className={css({ fontSize: "14px", color: "rgba(0, 0, 0, 0.8)", lineHeight: 1.6, mb: "4" })}
              >
                {review.text}
              </Box>
              <Box display="flex" alignItems="center" gap="3">
                <Box w="40px" h="40px" borderRadius="50%" bg="rgba(0, 0, 0, 0.1)" flexShrink={0} />
                <Box>
                  <Box as="p" className={css({ fontSize: "13px", fontWeight: 600, color: "ink" })}>
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

        <Box textAlign="center">
          <button className={readAllBtn}>Read All Reviews →</button>
        </Box>
      </Box>
    </Box>
  );
}
