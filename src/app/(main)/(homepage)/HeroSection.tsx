"use client";

import { useState } from "react";
import { Search, X, CheckCircle } from "lucide-react";
import { css, cx } from "styled-system/css";
import { Box, Flex, Wrap } from "styled-system/jsx";

// Pill search-submit button (marketing-specific — not the shared Button recipe).
const searchBtn = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  px: "6",
  py: "2.5",
  bg: "accent",
  color: "white",
  borderRadius: "pill",
  borderWidth: "0",
  fontSize: "13px",
  fontWeight: 600,
  fontFamily: "inherit",
  cursor: "pointer",
  transition: "background-color .15s",
  _hover: { bg: "accentHover" },
});

// Bespoke pill CTAs (match FinalCTASection, sized to the hero).
const ctaBase = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minW: "200px",
  px: "8",
  py: "3.5",
  borderRadius: "pill",
  borderWidth: "2px",
  borderStyle: "solid",
  fontSize: "15px",
  fontWeight: 600,
  fontFamily: "inherit",
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

export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    // Your search logic here
  };

  return (
    <Box
      as="section"
      bg="canvas"
      mx="auto"
      px={{ base: "6", sm: "12" }}
      pt={{ base: "16", md: "24" }}
      pb={{ base: "24", md: "32" }}
      textAlign="center"
    >
      <Flex direction="column" gap="8">
        {/* Hero Text */}
        <Flex justify="center" direction="column" gap="4">
          <Box
            as="h1"
            className={css({
              fontSize: { base: "32px", sm: "48px", md: "72px" },
              fontWeight: 600,
              color: "ink",
              letterSpacing: "-0.02em",
              lineHeight: 1.05,
            })}
          >
            Hire Cambodia&apos;s
            <br />
            Top Freelance Talent.
          </Box>
          <Flex justify="center">
            <Box
              as="p"
              className={css({
                fontSize: { base: "21px", md: "24px" },
                color: "ink2",
                maxW: "740px",
                mx: "auto",
                lineHeight: 1.4,
              })}
            >
              Work with skilled professionals at transparent prices. Browse ready-to-buy services or hire freelancers for your next project.
            </Box>
          </Flex>
        </Flex>

        {/* Search Bar */}
        <Box maxW="768px" mx="auto" w="100%">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className={css({ display: "flex", alignItems: "stretch", gap: "3" })}
          >
            <Box position="relative" flex="1" display="flex" alignItems="center">
              <Box
                position="absolute"
                left="3.5"
                display="inline-flex"
                color="muted"
                pointerEvents="none"
              >
                <Search size={18} />
              </Box>
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
                placeholder="Search for any service..."
                className={css({
                  w: "full",
                  h: "46px",
                  pl: "10",
                  pr: searchQuery ? "10" : "3.5",
                  bg: "field",
                  borderWidth: "1px",
                  borderStyle: "solid",
                  borderColor: "border",
                  borderRadius: "input",
                  fontSize: "15px",
                  fontFamily: "inherit",
                  color: "heading",
                  outline: "none",
                  transition: "border-color .15s, box-shadow .15s",
                  _placeholder: { color: "placeholder" },
                  _hover: { borderColor: "borderStrong" },
                  _focus: { borderColor: "accent", boxShadow: "focusRing" },
                })}
              />
              {searchQuery && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setSearchQuery("")}
                  className={css({
                    position: "absolute",
                    right: "3",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "muted",
                    bg: "transparent",
                    border: "none",
                    cursor: "pointer",
                    p: "1",
                    _hover: { color: "body" },
                  })}
                >
                  <X size={16} />
                </button>
              )}
            </Box>
            <button type="submit" className={searchBtn}>
              Search
            </button>
          </form>
          <Box
            as="p"
            className={css({
              mt: "2.5",
              fontSize: "13px",
              color: "rgba(0, 0, 0, 0.5)",
            })}
          >
            Popular: Web Design, Logo Design, WordPress, Mobile App, Video Editing
          </Box>
        </Box>

        {/* CTA Buttons */}
        <Flex direction={{ base: "column", sm: "row" }} align="center" justify="center" gap="4" pt="4">
          <button type="button" className={ctaSolid}>
            Explore Freelancers
          </button>
          <button type="button" className={ctaOutline}>
            Become a Freelancer
          </button>
        </Flex>

        {/* Trust Indicators */}
        <Wrap align="center" justify="center" gap="8" pt="8">
          <Flex align="center" gap="2">
            <CheckCircle size={16} color="#0071e3" />
            <Box as="span" className={css({ fontSize: "13px", color: "ink2" })}>
              15,000+ Active Freelancers
            </Box>
          </Flex>
          <Flex align="center" gap="2">
            <CheckCircle size={16} color="#0071e3" />
            <Box as="span" className={css({ fontSize: "13px", color: "ink2" })}>
              50,000+ Projects Completed
            </Box>
          </Flex>
          <Flex align="center" gap="2">
            <CheckCircle size={16} color="#0071e3" />
            <Box as="span" className={css({ fontSize: "13px", color: "ink2" })}>
              4.9/5 Average Rating
            </Box>
          </Flex>
        </Wrap>
      </Flex>
    </Box>
  );
}
