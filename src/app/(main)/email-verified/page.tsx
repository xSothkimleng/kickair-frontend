import Link from "next/link";
import { Box, Paper, Typography, Button } from "@mui/material";
import { CheckCircle } from "@mui/icons-material";

export default function EmailVerifiedPage() {
  return (
    <Box
      sx={{
        bgcolor: "#F5F5F7",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: { xs: 3, sm: 6 },
      }}>
      <Box sx={{ width: "100%", maxWidth: 448 }}>
        <Paper
          elevation={0}
          sx={{ borderRadius: 6, border: 1, borderColor: "divider", p: { xs: 4, md: 6 }, textAlign: "center" }}>
          {/* Icon with outer ring */}
          <Box sx={{ position: "relative", width: 88, height: 88, mx: "auto", mb: 4 }}>
            <Box
              sx={{
                position: "absolute",
                inset: -10,
                borderRadius: "50%",
                bgcolor: "success.main",
                opacity: 0.1,
              }}
            />
            <Box
              sx={{
                width: 88,
                height: 88,
                borderRadius: "50%",
                bgcolor: "success.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
              <CheckCircle sx={{ fontSize: 44, color: "white" }} />
            </Box>
          </Box>

          <Typography variant="h4" fontWeight={700} mb={1.5} color="text.primary">
            Email verified!
          </Typography>

          <Typography variant="body1" color="text.secondary" mb={1} sx={{ lineHeight: 1.75 }}>
            Your account is now active.
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={4} sx={{ lineHeight: 1.75 }}>
            Sign in to start using KickAir.
          </Typography>

          <Link href="/auth/sign-in" style={{ textDecoration: "none" }}>
            <Button
              variant="contained"
              fullWidth
              sx={{
                height: 48,
                borderRadius: 3,
                textTransform: "none",
                fontSize: "1rem",
                fontWeight: 500,
                color: "white !important",
                "&:hover": { backgroundColor: "primary.dark" },
              }}>
              Go to Sign In
            </Button>
          </Link>
        </Paper>
      </Box>
    </Box>
  );
}
