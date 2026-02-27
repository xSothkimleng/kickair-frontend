import Link from "next/link";
import { Box, Paper, Typography, Button } from "@mui/material";
import { CheckCircleOutline } from "@mui/icons-material";

export default function EmailVerifiedPage() {
  return (
    <Box
      sx={{
        minHeight: "90vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: { xs: 3, sm: 6 },
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 448, textAlign: "center" }}>
        <Paper
          elevation={0}
          sx={{ borderRadius: 6, border: 1, borderColor: "divider", p: { xs: 4, md: 6 } }}
        >
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              bgcolor: "success.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 3,
            }}
          >
            <CheckCircleOutline sx={{ fontSize: 40, color: "white" }} />
          </Box>

          <Typography variant="h5" fontWeight={600} mb={1} color="text.primary">
            Email verified!
          </Typography>

          <Typography variant="body1" color="text.secondary" mb={4}>
            Your account is now active. You can sign in and start using KickAir.
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
              }}
            >
              Go to Sign In
            </Button>
          </Link>
        </Paper>
      </Box>
    </Box>
  );
}
