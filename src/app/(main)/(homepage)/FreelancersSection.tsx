"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { css } from "styled-system/css";
import { Box } from "styled-system/jsx";
import { api } from "@/lib/api";
import type { FreelancerProfile } from "@/types/user";

// How many freelancer cards the homepage shows.
const SHOWN = 10;

// "Starting at": the cheapest package across the freelancer's live services.
function startingPrice(profile: FreelancerProfile): number | null {
  const prices = (profile.services ?? []).flatMap(service => (service.pricing_options ?? []).map(option => Number(option.price_raw)));
  const valid = prices.filter(price => Number.isFinite(price) && price > 0);
  return valid.length ? Math.min(...valid) : null;
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
  color: "white!",
  borderRadius: "pill",
  textStyle: "body",
  fontWeight: 600,
  borderWidth: "0",
  cursor: "pointer",
  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
  transition: "background-color .15s",
  _hover: { bg: "accentHover" },
});

// Card widths that add up to 1, 2, 3 and 5 per row with the 24px gap between them.
const cardLinkCss = css({
  display: "block",
  w: { base: "100%", sm: "calc((100% - 24px) / 2)", md: "calc((100% - 48px) / 3)", lg: "calc((100% - 96px) / 5)" },
});

export default function ExploreFreelancersSection() {
  // Real freelancers from the marketplace: those with something to sell first, then
  // by rating. The section hides itself while there is nobody to show.
  const { data: profiles = [] } = useQuery({
    queryKey: ["freelancer-profiles", "homepage"],
    queryFn: async () => (await api.getFreelancerProfiles(1)).data ?? [],
    staleTime: 5 * 60_000,
  });
  const freelancers = [...profiles]
    .sort((a, b) => {
      const selling = Number((b.services?.length ?? 0) > 0) - Number((a.services?.length ?? 0) > 0);
      return selling || Number(b.rating_average ?? 0) - Number(a.rating_average ?? 0);
    })
    .slice(0, SHOWN);

  if (freelancers.length === 0) return null;

  return (
    <Box as="section" bg="white" py={{ base: "12", md: "20" }}>
      <Box maxW="1200px" mx="auto" px={{ base: "6", sm: "12" }}>
        {/* Header */}
        <Box textAlign="center" mb="12">
          <Box
            as="h2"
            className={css({
              textStyle: { base: "stat", md: "display" },
              fontWeight: 600,
              color: "ink",
              mb: "3",
            })}
          >
            Meet Top Freelancers
          </Box>
          <Box
            as="p"
            className={css({
              textStyle: { base: "lead", md: "title" },
              color: "ink2",
            })}
          >
            Premium talent with proven portfolios and verified reviews
          </Box>
        </Box>

        {/* Freelancer cards: five to a row on desktop, centred when there are fewer. */}
        <Box display="flex" flexWrap="wrap" justifyContent="center" gap="6">
          {freelancers.map(freelancer => {
            const name = freelancer.user?.name ?? "Freelancer";
            const avatar = freelancer.user?.avatar_url;
            const price = startingPrice(freelancer);
            return (
              <Link key={freelancer.id} href={`/find-freelancer/${freelancer.id}`} className={cardLinkCss}>
                <Box
                  position="relative"
                  h="100%"
                  boxSizing="border-box"
                  bg="white"
                  borderRadius="card"
                  p="6"
                  borderWidth="1px"
                  borderStyle="solid"
                  borderColor="hairline"
                  textAlign="center"
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
                      <Box as="span" textStyle="stat" fontWeight={500} color="ink2">
                        {name.charAt(0)}
                      </Box>
                      {avatar && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={avatar}
                          alt=""
                          onError={e => { e.currentTarget.style.display = "none"; }}
                          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      )}
                    </Box>
                    <Box display="flex" flexDirection="column" gap="2" w="100%">
                      <Box as="h3" textStyle="title" color="ink" fontWeight={500}>
                        {name}
                      </Box>
                      {freelancer.tagline && (
                        <Box as="p" textStyle="body" color="ink2" lineClamp={2}>
                          {freelancer.tagline}
                        </Box>
                      )}
                      {price !== null && (
                        <Box pt="2">
                          <Box as="p" textStyle="meta" color="ink2">
                            Starting at
                          </Box>
                          <Box as="p" textStyle="title" color="ink" fontWeight={500}>
                            ${price.toLocaleString()}
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Box>
              </Link>
            );
          })}
        </Box>

        {/* View All Button */}
        <Box textAlign="center" mt="12">
          <Link href="/find-freelancer" className={ctaPill}>
            View All Freelancers
            <ArrowRight size={16} />
          </Link>
        </Box>
      </Box>
    </Box>
  );
}
