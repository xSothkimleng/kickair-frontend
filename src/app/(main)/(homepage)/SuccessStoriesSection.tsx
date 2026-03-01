import { Box, Typography, Grid, Chip, Button } from "@mui/material";
import { TrendingUp, CheckCircle } from "@mui/icons-material";

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
          <Chip
            icon={<TrendingUp sx={{ fontSize: 14, color: "rgba(0, 0, 0, 0.6)" }} />}
            label='SUCCESS STORIES'
            sx={{
              bgcolor: "rgba(0, 0, 0, 0.05)",
              color: "rgba(0, 0, 0, 0.6)",
              fontSize: "11px",
              fontWeight: 600,
              height: "auto",
              py: 0.5,
              px: 1.5,
              mb: 2,
              "& .MuiChip-label": { px: 1 },
              "& .MuiChip-icon": { ml: 0.5 },
            }}
          />
          <Typography
            component='h2'
            sx={{
              fontSize: { xs: "28px", md: "40px" },
              fontWeight: 600,
              color: "black",
              letterSpacing: "-0.02em",
              mb: 1.5,
            }}>
            Made on KickAir
          </Typography>
          <Typography sx={{ fontSize: { xs: "16px", md: "19px" }, color: "rgba(0, 0, 0, 0.6)" }}>Real brands, real results, real success</Typography>
        </Box>

        {/* Story Cards */}
        <Grid container spacing={4}>
          {stories.map((story, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
              <Box
                sx={{
                  bgcolor: "#F5F5F7",
                  borderRadius: "16px",
                  overflow: "hidden",
                  border: "1px solid rgba(0, 0, 0, 0.08)",
                  transition: "box-shadow 0.3s ease",
                  "&:hover": {
                    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
                  },
                }}>
                <Box
                  sx={{
                    height: 192,
                    background: story.gradient,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                  <Typography
                    sx={{
                      fontSize: "32px",
                      fontWeight: 700,
                      color: story.textColor,
                    }}>
                    {story.name}
                  </Typography>
                </Box>
                <Box sx={{ p: 3 }}>
                  <Typography
                    sx={{
                      fontSize: "19px",
                      fontWeight: 600,
                      color: "black",
                      mb: 1,
                    }}>
                    {story.title}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "13px",
                      color: "rgba(0, 0, 0, 0.6)",
                      mb: 2,
                      lineHeight: 1.6,
                    }}>
                    {story.description}
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    {story.services.map((service, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 1,
                        }}>
                        <CheckCircle sx={{ fontSize: 14, color: "#0071e3" }} />
                        <Typography sx={{ fontSize: "12px", color: "rgba(0, 0, 0, 0.7)" }}>{service}</Typography>
                      </Box>
                    ))}
                  </Box>
                  <Button
                    // onClick={() => onNavigate("why-kickair", { scrollTo: "success-stories" })}
                    sx={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#0071e3",
                      textTransform: "none",
                      p: 0,
                      minWidth: "auto",
                      "&:hover": {
                        bgcolor: "transparent",
                        textDecoration: "underline",
                      },
                    }}>
                    Read Full Story →
                  </Button>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}
