import { Box, Typography, Container } from "@mui/material";

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
