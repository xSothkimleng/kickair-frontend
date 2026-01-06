import { Box, Typography, Button, Chip } from "@mui/material";
import { MenuBook as BookOpenIcon, ArrowForward } from "@mui/icons-material";

export default function KickAirUniversitySection() {
  return (
    <Box
      component='section'
      sx={{
        background: "linear-gradient(to bottom right, #0071e3, #0077ed)",
        py: 10,
      }}>
      <Box
        sx={{
          maxWidth: "1200px",
          mx: "auto",
          px: { xs: 3, sm: 6 },
          textAlign: "center",
          color: "white",
        }}>
        <Chip
          icon={<BookOpenIcon sx={{ fontSize: 14, color: "white" }} />}
          label='FREE EDUCATION'
          sx={{
            bgcolor: "rgba(255, 255, 255, 0.2)",
            backdropFilter: "blur(8px)",
            color: "white",
            fontSize: "11px",
            fontWeight: 600,
            height: "auto",
            py: 0.5,
            px: 1.5,
            mb: 3,
            "& .MuiChip-label": { px: 1 },
            "& .MuiChip-icon": { ml: 0.5 },
          }}
        />
        <Typography
          component='h2'
          sx={{
            fontSize: "40px",
            fontWeight: 600,
            letterSpacing: "-0.02em",
            mb: 2,
          }}>
          KickAir University
        </Typography>
        <Typography
          sx={{
            fontSize: "19px",
            color: "rgba(255, 255, 255, 0.8)",
            maxWidth: "672px",
            mx: "auto",
            mb: 4,
          }}>
          Master freelancing with free courses on pricing, client management, marketing, and more
        </Typography>
        <Button
          //   onClick={() => onNavigate("university")}
          variant='contained'
          endIcon={<ArrowForward sx={{ fontSize: 16 }} />}
          sx={{
            px: 4,
            py: 1.75,
            bgcolor: "white",
            color: "#0071e3",
            borderRadius: "50px",
            fontSize: "15px",
            fontWeight: 600,
            textTransform: "none",
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
            "&:hover": {
              bgcolor: "rgba(255, 255, 255, 0.9)",
            },
          }}>
          Start Learning Free
        </Button>
      </Box>
    </Box>
  );
}
