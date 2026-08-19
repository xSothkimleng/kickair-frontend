import { ArrowRight } from "lucide-react";
import { css } from "styled-system/css";
import { Box, Grid } from "styled-system/jsx";
import { ServiceCard } from "@/components/layout/card/ServiceCard";

interface ServicesSectionProps {
  serviceCategories: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
  }>;
}

// "View All" pill — white surface, hairline border, accent on hover.
const viewAllBtn = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "2",
  px: "8",
  py: "3.5",
  bg: "surface",
  color: "ink",
  borderRadius: "pill",
  borderWidth: "2px",
  borderStyle: "solid",
  borderColor: "rgba(0, 0, 0, 0.1)",
  fontSize: "15px",
  fontWeight: 600,
  fontFamily: "inherit",
  cursor: "pointer",
  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
  transition: "color .15s, border-color .15s",
  _hover: { borderColor: "accent", color: "accent" },
});

export default function ServicesSection({ serviceCategories }: ServicesSectionProps) {
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
            Browse Services
          </Box>
          <Box
            as="p"
            className={css({
              fontSize: { base: "16px", md: "19px" },
              color: "ink2",
            })}
          >
            Click any category to find the perfect freelancer
          </Box>
        </Box>

        {/* Service Cards Grid - Show only first 6 */}
        <Grid columns={{ base: 1, sm: 2, md: 3 }} gap="6" mb="8">
          {serviceCategories.slice(0, 6).map((category) => (
            <ServiceCard
              key={category.id}
              name={category.name}
              description={category.description}
              icon={category.icon}
              //   onClick={() => onNavigate("services", { category: category.id })}
            />
          ))}
        </Grid>

        {/* View All Services Button */}
        <Box textAlign="center">
          <button
            type="button"
            //   onClick={() => onNavigate("services")}
            className={viewAllBtn}
          >
            View All {serviceCategories.length} Services
            <ArrowRight size={16} />
          </button>
        </Box>
      </Box>
    </Box>
  );
}
