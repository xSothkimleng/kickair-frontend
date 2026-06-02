import { Box, Paper, Typography, Grid } from "@mui/material";
import { ServiceFormData } from "../types";
import PricingTierCard from "./PricingTierCard";

interface PricingSectionProps {
  formData: ServiceFormData;
  onFormDataChange: (data: ServiceFormData) => void;
  fieldErrors?: Record<string, string>;
  onClearTierError?: (key: string) => void;
}

export default function PricingSection({ formData, onFormDataChange, fieldErrors, onClearTierError }: PricingSectionProps) {
  const handleTierChange = (tier: "basic" | "standard" | "premium", data: ServiceFormData["pricing"]["basic"]) => {
    onFormDataChange({
      ...formData,
      pricing: {
        ...formData.pricing,
        [tier]: data,
      },
    });
  };

  const handleTierToggle = (tier: "basic" | "standard" | "premium", enabled: boolean) => {
    onFormDataChange({
      ...formData,
      pricing: {
        ...formData.pricing,
        [tier]: { ...formData.pricing[tier], enabled },
      },
    });
  };

  return (
    <Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(0, 0, 0, 0.08)", p: 4 }}>
      <Typography sx={{ fontSize: 17, fontWeight: 600, color: "black", mb: 1 }}>Pricing Options</Typography>
      <Typography sx={{ fontSize: 11, color: fieldErrors?.noTier ? "#ef4444" : "rgba(0, 0, 0, 0.6)", fontWeight: fieldErrors?.noTier ? 600 : 400, mb: 3 }}>
        {fieldErrors?.noTier || "Enable the tiers you want to offer. At least one tier is required."}
      </Typography>

      <Grid container spacing={2}>
        {(["basic", "standard", "premium"] as const).map(tier => (
          <Grid size={{ xs: 12, md: 4 }} key={tier}>
            <PricingTierCard
              tier={tier}
              data={formData.pricing[tier]}
              onChange={data => handleTierChange(tier, data)}
              onToggle={enabled => handleTierToggle(tier, enabled)}
              errors={{
                price:    fieldErrors?.[`${tier}_price`],
                revisions: fieldErrors?.[`${tier}_revisions`],
                delivery: fieldErrors?.[`${tier}_delivery`],
              }}
              onClearError={(field) => onClearTierError?.(`${tier}_${field}`)}
            />
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 2, p: 2, bgcolor: "rgba(37, 99, 235, 0.05)", borderRadius: 3 }}>
        <Typography sx={{ fontSize: 11, color: "rgb(29, 78, 216)" }}>
          <strong>Note:</strong> You can update pricing anytime, but edits to a live service go back to admin review and the
          listing is hidden until approved. Existing orders keep the exact price and details they were purchased with — only
          new orders use the updated pricing.
        </Typography>
      </Box>
    </Paper>
  );
}
