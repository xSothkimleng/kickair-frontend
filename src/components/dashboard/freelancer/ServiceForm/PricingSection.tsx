import { Box, Paper, Typography, Grid } from "@mui/material";
import { ServiceFormData } from "../types";
import PricingTierCard from "./PricingTierCard";

interface PricingSectionProps {
  formData: ServiceFormData;
  onFormDataChange: (data: ServiceFormData) => void;
}

export default function PricingSection({ formData, onFormDataChange }: PricingSectionProps) {
  const handleTierChange = (tier: "basic" | "standard" | "premium", data: ServiceFormData["pricing"]["basic"]) => {
    onFormDataChange({
      ...formData,
      pricing: {
        ...formData.pricing,
        [tier]: data,
      },
    });
  };

  return (
    <Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(0, 0, 0, 0.08)", p: 4 }}>
      <Typography sx={{ fontSize: 17, fontWeight: 600, color: "black", mb: 1 }}>Pricing Options</Typography>
      <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)", mb: 3 }}>
        Offer three pricing tiers to give clients flexibility
      </Typography>

      <Grid container spacing={2}>
        {(["basic", "standard", "premium"] as const).map(tier => (
          <Grid size={{ xs: 12, md: 4 }} key={tier}>
            <PricingTierCard tier={tier} data={formData.pricing[tier]} onChange={data => handleTierChange(tier, data)} />
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 2, p: 2, bgcolor: "rgba(37, 99, 235, 0.05)", borderRadius: 3 }}>
        <Typography sx={{ fontSize: 11, color: "rgb(29, 78, 216)" }}>
          <strong>Note:</strong> Once published, customers who purchase at a certain price will keep that price even if you edit it
          later.
        </Typography>
      </Box>
    </Paper>
  );
}
