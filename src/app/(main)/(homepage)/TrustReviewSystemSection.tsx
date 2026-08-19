import { Shield, CheckCircle, Star, Users } from "lucide-react";
import { css } from "styled-system/css";
import { Box, Flex, Grid } from "styled-system/jsx";

// Small "eyebrow" chip — icon + uppercase label on a faint neutral fill.
const chip = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "1.5",
  px: "3",
  py: "1",
  mb: "4",
  borderRadius: "pill",
  bg: "rgba(0, 0, 0, 0.05)",
  color: "ink2",
  fontSize: "11px",
  fontWeight: 600,
});

export default function TrustReviewSystemSection() {
  return (
    <Box as="section" py={{ base: "12", md: "20" }}>
      <Box maxW="1200px" mx="auto" px={{ base: "6", sm: "12" }}>
        {/* Header */}
        <Box textAlign="center" mb="12">
          <Box as="span" className={chip}>
            <Shield size={14} />
            TRUST &amp; TRANSPARENCY
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
            Only Real Reviews. Verified Clients.
          </Box>
          <Box as="p" className={css({ fontSize: { base: "16px", md: "19px" }, color: "ink2", mx: "auto" })}>
            Our review system ensures authenticity and builds trust between freelancers and clients
          </Box>
        </Box>

        {/* Feature Cards */}
        <Grid columns={{ base: 1, md: 2 }} gap="8" mb="12">
          {/* Verified Reviews */}
          <Box
            borderRadius="card"
            p="8"
            borderWidth="1px"
            borderStyle="solid"
            borderColor="rgba(0, 113, 227, 0.2)"
            style={{ background: "linear-gradient(to bottom right, rgba(0, 113, 227, 0.05), rgba(0, 113, 227, 0.1))" }}
          >
            <Flex align="flex-start" gap="4">
              <Flex
                w="48px"
                h="48px"
                borderRadius="pill"
                bg="accent"
                align="center"
                justify="center"
                flexShrink="0"
              >
                <CheckCircle size={24} color="white" strokeWidth={2.5} />
              </Flex>
              <Box>
                <Box as="h3" className={css({ fontSize: "21px", fontWeight: 600, color: "ink", mb: "2" })}>
                  Verified Reviews Only
                </Box>
                <Box as="p" className={css({ fontSize: "15px", color: "rgba(0, 0, 0, 0.7)", lineHeight: 1.6, mb: "4" })}>
                  Reviews can only be left by clients who have actually hired and paid for services. No fake reviews, no manipulation.
                </Box>
                <Box as="ul" listStyle="none" py="0" m="0">
                  <Flex as="li" align="flex-start" gap="2" mb="2">
                    <CheckCircle size={16} color="#0071e3" style={{ flexShrink: 0, marginTop: "2px" }} />
                    <Box as="span" className={css({ fontSize: "13px", color: "rgba(0, 0, 0, 0.7)" })}>
                      Reviews locked until payment is completed
                    </Box>
                  </Flex>
                  <Flex as="li" align="flex-start" gap="2">
                    <CheckCircle size={16} color="#0071e3" style={{ flexShrink: 0, marginTop: "2px" }} />
                    <Box as="span" className={css({ fontSize: "13px", color: "rgba(0, 0, 0, 0.7)" })}>
                      Both freelancers and clients review each other
                    </Box>
                  </Flex>
                </Box>
              </Box>
            </Flex>
          </Box>

          {/* No Review = 5 Stars */}
          <Box
            borderRadius="card"
            p="8"
            borderWidth="1px"
            borderStyle="solid"
            borderColor="#bbf7d0"
            style={{ background: "linear-gradient(to bottom right, #f0fdf4, rgba(220, 252, 231, 0.5))" }}
          >
            <Flex align="flex-start" gap="4">
              <Flex
                w="48px"
                h="48px"
                borderRadius="pill"
                bg="success"
                align="center"
                justify="center"
                flexShrink="0"
              >
                <Star size={24} color="white" fill="white" strokeWidth={2.5} />
              </Flex>
              <Box>
                <Box as="h3" className={css({ fontSize: "21px", fontWeight: 600, color: "ink", mb: "2" })}>
                  No Review = 5 Stars
                </Box>
                <Box as="p" className={css({ fontSize: "15px", color: "rgba(0, 0, 0, 0.7)", lineHeight: 1.6, mb: "4" })}>
                  If a client doesn&apos;t leave a review within 7 days, the freelancer automatically receives 5 stars. This ensures freelancers aren&apos;t penalized by busy
                  clients.
                </Box>
                <Box as="ul" listStyle="none" p="0" m="0">
                  <Flex as="li" align="flex-start" gap="2" mb="2">
                    <CheckCircle size={16} color="#16a34a" style={{ flexShrink: 0, marginTop: "2px" }} />
                    <Box as="span" className={css({ fontSize: "13px", color: "rgba(0, 0, 0, 0.7)" })}>
                      Silence means satisfaction
                    </Box>
                  </Flex>
                  <Flex as="li" align="flex-start" gap="2">
                    <CheckCircle size={16} color="#16a34a" style={{ flexShrink: 0, marginTop: "2px" }} />
                    <Box as="span" className={css({ fontSize: "13px", color: "rgba(0, 0, 0, 0.7)" })}>
                      Fair to hardworking freelancers
                    </Box>
                  </Flex>
                </Box>
              </Box>
            </Flex>
          </Box>
        </Grid>

        {/* Two-Way Rating System */}
        <Box bg="rgba(0, 0, 0, 0.05)" borderRadius="card" p="8" textAlign="center">
          <Box as="h3" className={css({ fontSize: "21px", fontWeight: 600, color: "ink", mb: "2" })}>
            Two-Way Rating System
          </Box>
          <Flex justify="center" gap="2" mb="4">
            <Box
              as="p"
              className={css({
                fontSize: "15px",
                color: "ink2",
                maxW: "672px",
                textAlign: "center",
                mx: "auto",
                mb: "6",
              })}
            >
              Freelancers have public ratings visible to everyone. Clients have private ratings only visible to freelancers, helping talent choose who they want to work with.
            </Box>
          </Flex>
          <Grid columns={{ base: 1, sm: 2 }} gap="4" maxW="768px" mx="auto">
            <Box bg="surface" borderRadius="cardSm" p="4" borderWidth="1px" borderStyle="solid" borderColor="hairline">
              <Box mb="2" color="ink2">
                <Users size={24} />
              </Box>
              <Box as="p" className={css({ fontSize: "13px", fontWeight: 600, color: "ink", mb: "1" })}>
                Freelancer Rating
              </Box>
              <Box as="p" className={css({ fontSize: "12px", color: "ink2" })}>
                Public • Visible to all clients
              </Box>
            </Box>
            <Box bg="surface" borderRadius="cardSm" p="4" borderWidth="1px" borderStyle="solid" borderColor="hairline">
              <Box mb="2" color="ink2">
                <Shield size={24} />
              </Box>
              <Box as="p" className={css({ fontSize: "13px", fontWeight: 600, color: "ink", mb: "1" })}>
                Client Rating
              </Box>
              <Box as="p" className={css({ fontSize: "12px", color: "ink2" })}>
                Private • Only visible to freelancers
              </Box>
            </Box>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
}
