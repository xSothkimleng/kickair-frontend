import { Box, Typography, Button, Grid, Avatar } from "@mui/material";
import { ArrowForward } from "@mui/icons-material";

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
        py: { xs: 6, md: 10 },
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
              fontSize: { xs: "28px", md: "40px" },
              fontWeight: 600,
              color: "black",
              letterSpacing: "-0.02em",
              mb: 1.5,
            }}>
            Meet Top Freelancers
          </Typography>
          <Typography
            sx={{
              fontSize: { xs: "16px", md: "19px" },
              color: "rgba(0, 0, 0, 0.6)",
            }}>
            Premium talent with proven portfolios and verified reviews
          </Typography>
        </Box>

        {/* Freelancer Cards Grid */}
        <Grid container spacing={3}>
          {freelancers.slice(0, 10).map(freelancer => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }} key={freelancer.id}>
              <Box
                sx={{
                  width: "100%",
                  bgcolor: "white",
                  borderRadius: "16px",
                  p: 3,
                  border: "1px solid transparent",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    borderColor: "rgba(0, 0, 0, 0.1)",
                    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
                  },
                }}>
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                  <Avatar
                    src={freelancer.profileImage}
                    alt={freelancer.name}
                    sx={{ width: 96, height: 96, bgcolor: "rgba(0, 0, 0, 0.05)" }}>
                    {freelancer.name.charAt(0)}
                  </Avatar>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1, width: "100%" }}>
                    <Typography component="h3" sx={{ fontSize: "18px", color: "black", fontWeight: 500 }}>
                      {freelancer.name}
                    </Typography>
                    <Typography sx={{ fontSize: "14px", color: "rgba(0, 0, 0, 0.6)" }}>
                      {freelancer.role}
                    </Typography>
                    <Box sx={{ pt: 1 }}>
                      <Typography sx={{ fontSize: "12px", color: "rgba(0, 0, 0, 0.6)" }}>Starting at</Typography>
                      <Typography sx={{ fontSize: "18px", color: "black", fontWeight: 500 }}>
                        ${freelancer.tiers[0].price}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
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
