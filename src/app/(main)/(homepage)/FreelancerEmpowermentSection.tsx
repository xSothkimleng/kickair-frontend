import { Box, Typography, Button, Grid, Chip } from "@mui/material";
import {
  GpsFixed as TargetIcon,
  EmojiEvents as CrownIcon,
  AttachMoney as DollarSignIcon,
  Bolt as ZapIcon,
  ArrowForward,
} from "@mui/icons-material";

export default function FreelancerEmpowermentSection() {
  return (
    <Box
      component='section'
      sx={{
        maxWidth: "1200px",
        mx: "auto",
        px: { xs: 3, sm: 6 },
        py: 10,
      }}>
      {/* Header */}
      <Box sx={{ textAlign: "center", mb: 8 }}>
        {/* Badge */}
        <Chip
          icon={<TargetIcon sx={{ fontSize: 14, color: "rgba(0, 0, 0, 0.6)" }} />}
          label='FOR FREELANCERS'
          sx={{
            bgcolor: "rgba(0, 0, 0, 0.05)",
            color: "rgba(0, 0, 0, 0.6)",
            fontSize: "11px",
            fontWeight: 600,
            height: "auto",
            py: 0.5,
            px: 1.5,
            mb: 2,
            "& .MuiChip-label": {
              px: 1,
            },
            "& .MuiChip-icon": {
              ml: 0.5,
            },
          }}
        />

        <Typography
          component='h2'
          sx={{
            fontSize: "40px",
            fontWeight: 600,
            color: "black",
            letterSpacing: "-0.02em",
            mb: 1.5,
          }}>
          Your Platform, Your Rules
        </Typography>
        <Typography
          sx={{
            fontSize: "19px",
            color: "rgba(0, 0, 0, 0.6)",
            maxWidth: "768px",
            mx: "auto",
          }}>
          KickAir empowers you to build your brand, set your own rates, and grow your business on your terms
        </Typography>
      </Box>

      {/* Feature Cards */}
      <Grid container spacing={4} sx={{ mb: 6 }}>
        {/* Build Your Brand */}
        <Grid size={4}>
          <Box
            sx={{
              bgcolor: "white",
              borderRadius: "16px",
              border: "1px solid rgba(0, 0, 0, 0.08)",
              p: 4,
              textAlign: "center",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "linear-gradient(to bottom right, rgba(0, 113, 227, 0.1), rgba(0, 113, 227, 0.05))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 3,
              }}>
              <CrownIcon sx={{ fontSize: 32, color: "#0071e3", strokeWidth: 2 }} />
            </Box>
            <Typography
              component='h3'
              sx={{
                fontSize: "21px",
                fontWeight: 600,
                color: "black",
                mb: 1.5,
              }}>
              Build Your Brand
            </Typography>
            <Typography
              sx={{
                fontSize: "15px",
                color: "rgba(0, 0, 0, 0.6)",
                lineHeight: 1.6,
              }}>
              Create a professional profile, showcase your portfolio, and establish yourself as the go-to expert in your field
            </Typography>
          </Box>
        </Grid>

        {/* Earn Your Way */}
        <Grid size={4}>
          <Box
            sx={{
              bgcolor: "white",
              borderRadius: "16px",
              border: "1px solid rgba(0, 0, 0, 0.08)",
              p: 4,
              textAlign: "center",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "linear-gradient(to bottom right, rgba(0, 113, 227, 0.1), rgba(0, 113, 227, 0.05))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 3,
              }}>
              <DollarSignIcon sx={{ fontSize: 32, color: "#0071e3", strokeWidth: 2 }} />
            </Box>
            <Typography
              component='h3'
              sx={{
                fontSize: "21px",
                fontWeight: 600,
                color: "black",
                mb: 1.5,
              }}>
              Earn Your Way
            </Typography>
            <Typography
              sx={{
                fontSize: "15px",
                color: "rgba(0, 0, 0, 0.6)",
                lineHeight: 1.6,
              }}>
              Set your own prices with three-tier packages. Choose between one-off projects or stable long-term contracts
            </Typography>
          </Box>
        </Grid>

        {/* Be Your Own Boss */}
        <Grid size={4}>
          <Box
            sx={{
              bgcolor: "white",
              borderRadius: "16px",
              border: "1px solid rgba(0, 0, 0, 0.08)",
              p: 4,
              textAlign: "center",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "linear-gradient(to bottom right, rgba(0, 113, 227, 0.1), rgba(0, 113, 227, 0.05))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 3,
              }}>
              <ZapIcon sx={{ fontSize: 32, color: "#0071e3", strokeWidth: 2 }} />
            </Box>
            <Typography
              component='h3'
              sx={{
                fontSize: "21px",
                fontWeight: 600,
                color: "black",
                mb: 1.5,
              }}>
              Be Your Own Boss
            </Typography>
            <Typography
              sx={{
                fontSize: "15px",
                color: "rgba(0, 0, 0, 0.6)",
                lineHeight: 1.6,
              }}>
              Work when you want, where you want. Choose projects that excite you and clients who respect your expertise
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* CTA Button */}
      <Box sx={{ textAlign: "center" }}>
        <Button
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
          Start Freelancing Today
        </Button>
      </Box>
    </Box>
  );
}
