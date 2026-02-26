import { Box, Typography, Button, Container } from "@mui/material";

export default function FinalCtaSection() {
  return (
    <Box component="section" sx={{ bgcolor: "#F5F5F7" }}>
      <Container sx={{ px: { xs: 3, sm: 6 }, py: 10 }}>
        <Box
          sx={{
            bgcolor: "white",
            borderRadius: "24px",
            border: "1px solid rgba(0, 0, 0, 0.08)",
            p: { xs: 6, md: 8 },
            textAlign: "center",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Typography
            component="h2"
            sx={{
              fontSize: "40px",
              fontWeight: 600,
              color: "black",
              letterSpacing: "-0.02em",
              mb: 2,
            }}
          >
            Ready to Start Your Journey?
          </Typography>
          <Typography
            sx={{
              fontSize: "19px",
              color: "rgba(0, 0, 0, 0.6)",
              maxWidth: "672px",
              mx: "auto",
              mb: 5,
            }}
          >
            Join thousands of freelancers building their brands and clients finding premium talent
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
            }}
          >
            <Button
              // onClick={() => onNavigate("register")}
              variant="contained"
              sx={{
                px: 4,
                py: 1.75,
                bgcolor: "#0071e3",
                color: "white",
                borderRadius: "50px",
                minWidth: "220px",
                fontSize: "15px",
                fontWeight: 600,
                textTransform: "none",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                "&:hover": {
                  bgcolor: "#0077ed",
                },
              }}
            >
              Sign Up Now
            </Button>
            <Button
              // onClick={() => onNavigate("services")}
              variant="outlined"
              sx={{
                px: 4,
                py: 1.75,
                border: "2px solid #0071e3",
                color: "#0071e3",
                borderRadius: "50px",
                minWidth: "220px",
                fontSize: "15px",
                fontWeight: 600,
                textTransform: "none",
                "&:hover": {
                  border: "2px solid #0071e3",
                  bgcolor: "#0071e3",
                  color: "white",
                },
              }}
            >
              Explore Freelancers
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
