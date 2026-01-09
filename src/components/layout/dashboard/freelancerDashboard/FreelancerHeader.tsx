import { Box, Typography, Button } from "@mui/material";
import { ChevronLeft } from "@mui/icons-material";

export default function FreelancerHeader() {
  return (
    <Box
      sx={{
        bgcolor: "white",
        borderBottom: 1,
        borderColor: "rgba(0, 0, 0, 0.08)",
      }}>
      <Box sx={{ maxWidth: 1440, mx: "auto", px: 3, py: 3 }}>
        <Button
          //   onClick={() => onNavigate("home")}
          startIcon={<ChevronLeft sx={{ fontSize: 16 }} />}
          sx={{
            fontSize: 12,
            color: "rgba(0, 0, 0, 0.6)",
            textTransform: "none",
            mb: 2,
            "&:hover": {
              color: "black",
              bgcolor: "transparent",
            },
          }}>
          Back to Home
        </Button>

        <Box>
          <Typography
            variant='h4'
            sx={{
              fontSize: 32,
              fontWeight: 600,
              color: "black",
              letterSpacing: "-0.01em",
              mb: 1,
            }}>
            Freelancer Space
          </Typography>
          <Typography sx={{ fontSize: 14, color: "rgba(0, 0, 0, 0.6)" }}>Manage your profile, services, and earnings</Typography>
        </Box>
      </Box>
    </Box>
  );
}
