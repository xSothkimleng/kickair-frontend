import { Box, Typography, Button, Grid } from "@mui/material";
import { ArrowForward } from "@mui/icons-material";
import { FreelancerCard } from "@/components/layout/card/FreelancerCard";

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

export default function ExploreFreelancersSection({ freelancers }: ExploreFreelancersSectionProps) {
  return (
    <Box
      component='section'
      sx={{
        bgcolor: "white",
        py: 10,
      }}>
      <Box
        sx={{
          maxWidth: "1200px",
          mx: "auto",
          px: { xs: 3, sm: 6 },
        }}>
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography
            component='h2'
            sx={{
              fontSize: "40px",
              fontWeight: 600,
              color: "black",
              letterSpacing: "-0.02em",
              mb: 1.5,
            }}>
            Meet Top Freelancers
          </Typography>
          <Typography
            sx={{
              fontSize: "19px",
              color: "rgba(0, 0, 0, 0.6)",
            }}>
            Premium talent with proven portfolios and verified reviews
          </Typography>
        </Box>

        {/* Freelancer Cards Grid */}
        <Grid container spacing={3}>
          {freelancers.slice(0, 10).map(freelancer => (
            <Grid size={2.4} key={freelancer.id}>
              <FreelancerCard freelancer={freelancer} />
            </Grid>
          ))}
        </Grid>

        {/* View All Button */}
        <Box sx={{ textAlign: "center", mt: 6 }}>
          <Button
            // onClick={() => onNavigate("services")}
            variant='contained'
            endIcon={<ArrowForward sx={{ fontSize: 16 }} />}
            sx={{
              px: 4,
              py: 1.75,
              bgcolor: "#0071e3",
              color: "white",
              borderRadius: "50px",
              fontSize: "15px",
              fontWeight: 600,
              textTransform: "none",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
              "&:hover": {
                bgcolor: "#0077ed",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
              },
            }}>
            View All Freelancers
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
