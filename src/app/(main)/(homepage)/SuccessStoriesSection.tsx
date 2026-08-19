import { TrendingUp, CheckCircle } from "lucide-react";
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

// Text-only link button ("Read Full Story →"), underline on hover.
const storyLink = css({
  fontSize: "13px",
  fontWeight: 600,
  color: "accent",
  bg: "transparent",
  border: "none",
  p: "0",
  cursor: "pointer",
  fontFamily: "inherit",
  _hover: { textDecoration: "underline" },
});

export default function SuccessStoriesSection() {
  const stories = [
    {
      name: "TechFlow",
      title: "TechFlow App",
      description: "A Cambodian startup that used KickAir to build their entire mobile app from scratch",
      gradient: "linear-gradient(to bottom right, #e9d5ff, #ddd6fe)",
      textColor: "#9333ea",
      services: ["Mobile App Development", "UI/UX Design", "Brand Identity"],
    },
    {
      name: "ShopKH",
      title: "ShopKH E-commerce",
      description: "Built a complete e-commerce platform with 50+ freelancers through KickAir Pro",
      gradient: "linear-gradient(to bottom right, #dbeafe, #bfdbfe)",
      textColor: "#2563eb",
      services: ["Web Development", "Product Photography", "Content Writing"],
    },
    {
      name: "GreenLife",
      title: "GreenLife Organics",
      description: "Scaled their brand presence with video marketing and social media from KickAir talent",
      gradient: "linear-gradient(to bottom right, #dcfce7, #bbf7d0)",
      textColor: "#16a34a",
      services: ["Video Production", "Social Media Management", "Graphic Design"],
    },
  ];

  return (
    <Box as="section" bg="surface" py={{ base: "12", md: "20" }}>
      <Box maxW="1200px" mx="auto" px={{ base: "6", sm: "12" }}>
        {/* Header */}
        <Box textAlign="center" mb="12">
          <Box as="span" className={chip}>
            <TrendingUp size={14} />
            SUCCESS STORIES
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
            Made on KickAir
          </Box>
          <Box as="p" className={css({ fontSize: { base: "16px", md: "19px" }, color: "ink2" })}>
            Real brands, real results, real success
          </Box>
        </Box>

        {/* Story Cards */}
        <Grid columns={{ base: 1, sm: 2, md: 3 }} gap="8">
          {stories.map((story, index) => (
            <Box
              key={index}
              bg="canvas"
              borderRadius="card"
              overflow="hidden"
              borderWidth="1px"
              borderStyle="solid"
              borderColor="hairline"
              transition="box-shadow 0.3s ease"
              _hover={{ boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)" }}
            >
              <Box
                h="192px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                style={{ background: story.gradient }}
              >
                <Box as="span" className={css({ fontSize: "32px", fontWeight: 700 })} style={{ color: story.textColor }}>
                  {story.name}
                </Box>
              </Box>
              <Box p="6">
                <Box as="h3" className={css({ fontSize: "19px", fontWeight: 600, color: "ink", mb: "2" })}>
                  {story.title}
                </Box>
                <Box as="p" className={css({ fontSize: "13px", color: "ink2", mb: "4", lineHeight: 1.6 })}>
                  {story.description}
                </Box>
                <Box mb="4">
                  {story.services.map((service, idx) => (
                    <Flex key={idx} align="center" gap="2" mb="2">
                      <CheckCircle size={14} color="#0071e3" style={{ flexShrink: 0 }} />
                      <Box as="span" className={css({ fontSize: "12px", color: "rgba(0, 0, 0, 0.7)" })}>
                        {service}
                      </Box>
                    </Flex>
                  ))}
                </Box>
                <button
                  type="button"
                  // onClick={() => onNavigate("why-kickair", { scrollTo: "success-stories" })}
                  className={storyLink}
                >
                  Read Full Story →
                </button>
              </Box>
            </Box>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}
