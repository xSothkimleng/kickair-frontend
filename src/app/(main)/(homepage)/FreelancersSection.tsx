import { ArrowRight } from "lucide-react";
import { css } from "styled-system/css";
import { Box } from "styled-system/jsx";

interface Freelancer {
  id: string;
  name: string;
  role: string;
  profileImage: string;
  rating: number;
  reviewCount: number;
  tiers: Array<{ price: number }>;
}

interface ExploreFreelancersSectionProps {
  freelancers: Freelancer[];
}

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

export default function ExploreFreelancersSection({ freelancers }: ExploreFreelancersSectionProps) {
  return (
    <Box as="section" bg="white" py={{ base: "12", md: "20" }}>
      <Box maxW="1200px" mx="auto" px={{ base: "6", sm: "12" }}>
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
            Meet Top Freelancers
          </Box>
          <Box
            as="p"
            className={css({
              fontSize: { base: "16px", md: "19px" },
              color: "ink2",
            })}
          >
            Premium talent with proven portfolios and verified reviews
          </Box>
        </Box>

        {/* Freelancer cards — responsive CSS grid (1 → 2 → 3 → 5 columns). */}
        <Box
          display="grid"
          gridTemplateColumns={{
            base: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
            lg: "repeat(5, 1fr)",
          }}
          gap="6"
        >
          {freelancers.slice(0, 10).map((freelancer) => (
            <Box
              key={freelancer.id}
              position="relative"
              bg="white"
              borderRadius="card"
              p="6"
              borderWidth="1px"
              borderStyle="solid"
              borderColor="hairline"
              textAlign="center"
              cursor="pointer"
              transition="border-color 0.2s ease, box-shadow 0.2s ease"
              _hover={{
                zIndex: 1,
                borderColor: "rgba(0, 0, 0, 0.12)",
                boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
              }}
            >
              <Box display="flex" flexDirection="column" alignItems="center" gap="4">
                <Box
                  position="relative"
                  w="96px"
                  h="96px"
                  borderRadius="full"
                  overflow="hidden"
                  bg="rgba(0, 0, 0, 0.05)"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  flexShrink={0}
                >
                  <Box as="span" fontSize="32px" fontWeight={500} color="ink2">
                    {freelancer.name.charAt(0)}
                  </Box>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={freelancer.profileImage}
                    alt={freelancer.name}
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </Box>
                <Box display="flex" flexDirection="column" gap="2" w="100%">
                  <Box as="h3" fontSize="18px" color="ink" fontWeight={500}>
                    {freelancer.name}
                  </Box>
                  <Box as="p" fontSize="14px" color="ink2">
                    {freelancer.role}
                  </Box>
                  <Box pt="2">
                    <Box as="p" fontSize="12px" color="ink2">
                      Starting at
                    </Box>
                    <Box as="p" fontSize="18px" color="ink" fontWeight={500}>
                      ${freelancer.tiers[0].price}
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>

        {/* View All Button */}
        <Box textAlign="center" mt="12">
          <button className={ctaPill}>
            View All Freelancers
            <ArrowRight size={16} />
          </button>
        </Box>
      </Box>
    </Box>
  );
}
