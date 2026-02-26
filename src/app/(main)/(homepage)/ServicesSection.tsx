import { Box, Typography, Button, Grid, Container } from "@mui/material";
import { ArrowForward } from "@mui/icons-material";
import { ServiceCard } from "@/components/layout/card/ServiceCard";

interface ServicesSectionProps {
  serviceCategories: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
  }>;
}

export default function ServicesSection({ serviceCategories }: ServicesSectionProps) {
  return (
    <Box
      component="section"
      sx={{
        bgcolor: "#F5F5F7",
      }}
    >
      <Container sx={{ mx: "auto", px: { xs: 3, sm: 6 }, py: 10 }}>
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography
            component="h2"
            sx={{
              fontSize: "40px",
              fontWeight: 600,
              color: "black",
              letterSpacing: "-0.02em",
              mb: 1.5,
            }}
          >
            Browse Services
          </Typography>
          <Typography
            sx={{
              fontSize: "19px",
              color: "rgba(0, 0, 0, 0.6)",
            }}
          >
            Click any category to find the perfect freelancer
          </Typography>
        </Box>

        {/* Service Cards Grid - Show only first 6 */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {serviceCategories.slice(0, 6).map((category) => (
            <Grid size={4} key={category.id}>
              <ServiceCard
                name={category.name}
                description={category.description}
                icon={category.icon}
                //   onClick={() => onNavigate("services", { category: category.id })}
              />
            </Grid>
          ))}
        </Grid>

        {/* View All Services Button */}
        <Box sx={{ textAlign: "center" }}>
          <Button
            //   onClick={() => onNavigate("services")}
            variant="outlined"
            endIcon={<ArrowForward sx={{ fontSize: 16 }} />}
            sx={{
              px: 4,
              py: 1.75,
              bgcolor: "white",
              border: "2px solid rgba(0, 0, 0, 0.1)",
              color: "black",
              borderRadius: "50px",
              fontSize: "15px",
              fontWeight: 600,
              textTransform: "none",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
              "&:hover": {
                border: "2px solid #0071e3",
                color: "#0071e3",
                bgcolor: "white",
              },
            }}
          >
            View All {serviceCategories.length} Services
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
