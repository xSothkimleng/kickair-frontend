import { css } from "styled-system/css";
import { Box, Grid } from "styled-system/jsx";
import { Briefcase, CheckCircle2, ArrowRight } from "lucide-react";

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

const tagChip = css({
  display: "inline-flex",
  alignItems: "center",
  bg: "rgba(0, 0, 0, 0.05)",
  color: "ink",
  borderRadius: "pill",
  px: "2.5",
  height: "24px",
  fontSize: "11px",
  fontWeight: 500,
  whiteSpace: "nowrap",
});

const jobs = [
  {
    title: "Senior Web Developer",
    org: "Tech Startup • Full-time Remote",
    pay: "$3,000/mo",
    tags: ["React", "Node.js", "MongoDB"],
  },
  {
    title: "UI/UX Designer",
    org: "E-commerce Agency • Part-time",
    pay: "$1,500/mo",
    tags: ["Figma", "Adobe XD"],
  },
  {
    title: "Content Writer",
    org: "Marketing Firm • Part-time",
    pay: "$800/mo",
    tags: ["SEO", "Copywriting"],
  },
];

const benefits = [
  "Recurring monthly contracts with guaranteed income",
  "Part-time and full-time remote opportunities",
  "Work with international clients from your home",
];

export default function StableJobsSection() {
  return (
    <Box as="section" bg="white" py={{ base: "12", md: "20" }}>
      <Box maxW="1200px" mx="auto" px={{ base: "6", sm: "12" }}>
        <Grid gridTemplateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={{ base: "8", md: "12" }} alignItems="center">
          {/* Left Content */}
          <Box>
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
              <Briefcase size={14} />
              STABLE OPPORTUNITIES
            </Box>

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
              Find Clients Posting Stable Jobs
            </Box>

            <Box
              as="p"
              className={css({
                fontSize: "17px",
                color: "ink2",
                lineHeight: 1.6,
                mb: "6",
              })}
            >
              Not just one-off gigs. Discover part-time and full-time positions from companies looking for long-term freelance partnerships.
            </Box>

            {/* Benefits List */}
            <Box as="ul" listStyleType="none" p="0" m="0" mb="8">
              {benefits.map((benefit) => (
                <Box key={benefit} as="li" display="flex" alignItems="flex-start" gap="3" mb="4">
                  <Box color="accent" flexShrink={0} mt="0.5" lineHeight={0}>
                    <CheckCircle2 size={20} />
                  </Box>
                  <Box as="span" fontSize="15px" color="rgba(0, 0, 0, 0.8)">
                    {benefit}
                  </Box>
                </Box>
              ))}
            </Box>

            <button className={ctaPill}>
              Browse Job Listings
              <ArrowRight size={16} />
            </button>
          </Box>

          {/* Right Content - Job Cards */}
          <Box
            bg="linear-gradient(to bottom right, rgba(0, 113, 227, 0.05), rgba(0, 113, 227, 0.1))"
            borderRadius="24px"
            p="8"
            borderWidth="1px"
            borderStyle="solid"
            borderColor="rgba(0, 113, 227, 0.2)"
          >
            <Box display="flex" flexDirection="column" gap="4">
              {jobs.map((job) => (
                <Box
                  key={job.title}
                  bg="white"
                  borderRadius="cardSm"
                  borderWidth="1px"
                  borderStyle="solid"
                  borderColor="hairline"
                  boxShadow="0 1px 3px rgba(0, 0, 0, 0.1)"
                  p="6"
                >
                  <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb="3">
                    <Box>
                      <Box as="p" fontSize="15px" fontWeight={600} color="ink" mb="1">
                        {job.title}
                      </Box>
                      <Box as="p" fontSize="13px" color="ink2">
                        {job.org}
                      </Box>
                    </Box>
                    <Box as="p" fontSize="13px" fontWeight={600} color="accent" whiteSpace="nowrap">
                      {job.pay}
                    </Box>
                  </Box>
                  <Box display="flex" alignItems="center" gap="2" flexWrap="wrap">
                    {job.tags.map((tag) => (
                      <span key={tag} className={tagChip}>
                        {tag}
                      </span>
                    ))}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Grid>
      </Box>
    </Box>
  );
}
