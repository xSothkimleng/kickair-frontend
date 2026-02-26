import { Box, Typography, Button, Container } from "@mui/material";
import { ChevronLeft } from "@mui/icons-material";

type DashboardHeaderProps = {
  title: string;
  description?: string;
};

export default function DashboardHeader({ title, description }: DashboardHeaderProps) {
  return (
    <Box
      sx={{
        bgcolor: "white",
        borderBottom: 1,
        borderColor: "rgba(0, 0, 0, 0.08)",
      }}>
      <Container sx={{ px: 3, py: 3 }}>
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
            {title}
          </Typography>
          <Typography sx={{ fontSize: 14, color: "rgba(0, 0, 0, 0.6)" }}>{description}</Typography>
        </Box>
      </Container>
    </Box>
  );
}
