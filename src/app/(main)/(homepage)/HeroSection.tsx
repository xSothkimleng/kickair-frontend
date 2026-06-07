"use client";

import { useState } from "react";
import { Box, Typography, Button } from "@mui/material";
import { CheckCircle } from "@mui/icons-material";
import { SearchInput } from "@/components/ui/inputs";

export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    // Your search logic here
  };

  return (
    <Box
      component="section"
      sx={{
        bgcolor: "#F5F5F7",
        mx: "auto",
        px: { xs: 3, sm: 6 },
        pt: { xs: 8, md: 12 },
        pb: { xs: 12, md: 16 },
        textAlign: "center",
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {/* Hero Text */}
        <Box sx={{ display: "flex", justifyContent: "center", flexDirection: "column", gap: 2 }}>
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: "32px", sm: "48px", md: "72px" },
              fontWeight: 600,
              color: "black",
              letterSpacing: "-0.02em",
              lineHeight: 1.05,
            }}
          >
            Hire Cambodia's
            <br />
            Top Freelance Talent.
          </Typography>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Typography
              sx={{
                fontSize: { xs: "21px", md: "24px" },
                color: "rgba(0, 0, 0, 0.6)",
                maxWidth: "740px",
                mx: "auto",
                lineHeight: 1.4,
              }}
            >
              Work with skilled professionals at transparent prices. Browse ready-to-buy services or hire freelancers for your next project.
            </Typography>
          </div>
        </Box>

        {/* Search Bar */}
        <Box sx={{ maxWidth: "768px", mx: "auto", width: "100%" }}>
          <Box
            component="form"
            onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
            sx={{ display: "flex", alignItems: "stretch", gap: 1.5 }}
          >
            <Box sx={{ flex: 1 }}>
              <SearchInput
                placeholder="Search for any service..."
                value={searchQuery}
                onChange={setSearchQuery}
                onEnter={handleSearch}
              />
            </Box>
            <Button
              type="submit"
              variant="contained"
              sx={{
                px: 3,
                py: 1.25,
                bgcolor: "#0071e3",
                color: "white",
                borderRadius: "50px",
                fontSize: "13px",
                fontWeight: 600,
                textTransform: "none",
                boxShadow: "none",
                flexShrink: 0,
                "&:hover": {
                  bgcolor: "#0077ed",
                  boxShadow: "none",
                },
              }}
            >
              Search
            </Button>
          </Box>
          <Typography
            sx={{
              marginTop: "10px !important",
              fontSize: "13px",
              color: "rgba(0, 0, 0, 0.5)",
            }}
          >
            Popular: Web Design, Logo Design, WordPress, Mobile App, Video Editing
          </Typography>
        </Box>

        {/* CTA Buttons */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            pt: 2,
          }}
        >
          <Button
            // onClick={() => onNavigate("services")}
            variant="contained"
            sx={{
              px: 4,
              py: 1.75,
              bgcolor: "#0071e3",
              color: "white",
              borderRadius: "50px",
              minWidth: "200px",
              fontSize: "15px",
              fontWeight: 600,
              textTransform: "none",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
              "&:hover": {
                bgcolor: "#0077ed",
              },
            }}
          >
            Explore Freelancers
          </Button>
          <Button
            // onClick={() => onNavigate("register")}
            variant="outlined"
            sx={{
              px: 4,
              py: 1.75,
              border: "2px solid #0071e3",
              color: "#0071e3",
              borderRadius: "50px",
              minWidth: "200px",
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
            Become a Freelancer
          </Button>
        </Box>

        {/* Trust Indicators */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            pt: 4,
            fontSize: "13px",
            color: "rgba(0, 0, 0, 0.6)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CheckCircle sx={{ fontSize: 16, color: "#0071e3" }} />
            <Typography component="span" sx={{ fontSize: "13px" }}>
              15,000+ Active Freelancers
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CheckCircle sx={{ fontSize: 16, color: "#0071e3" }} />
            <Typography component="span" sx={{ fontSize: "13px" }}>
              50,000+ Projects Completed
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CheckCircle sx={{ fontSize: 16, color: "#0071e3" }} />
            <Typography component="span" sx={{ fontSize: "13px" }}>
              4.9/5 Average Rating
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
