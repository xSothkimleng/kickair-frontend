import { Box, Typography } from "@mui/material";
import RichTextEditor from "@/components/ui/RichTextEditor";
import { TextInput, Switch } from "@/components/ui/inputs";
import { PricingTier } from "../types";

interface PricingTierCardProps {
  tier: "basic" | "standard" | "premium";
  data: PricingTier;
  onChange: (data: PricingTier) => void;
  onToggle: (enabled: boolean) => void;
  errors?: { price?: string; revisions?: string; delivery?: string };
  onClearError?: (field: "price" | "revisions" | "delivery") => void;
}

export default function PricingTierCard({ tier, data, onChange, onToggle, errors, onClearError }: PricingTierCardProps) {
  const disabled = !data.enabled;

  return (
    <Box
      sx={{
        p: 2,
        border: "1px solid",
        borderColor: disabled ? "rgba(0, 0, 0, 0.06)" : "rgba(0, 0, 0, 0.1)",
        borderRadius: 3,
        bgcolor: disabled ? "rgba(0, 0, 0, 0.02)" : "white",
        transition: "all 0.2s",
      }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: disabled ? 0 : 2 }}>
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: disabled ? "rgba(0, 0, 0, 0.3)" : "black", textTransform: "capitalize" }}>
          {tier}
        </Typography>
        <Switch checked={data.enabled} onChange={onToggle} />
      </Box>

      {!disabled && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <TextInput size="sm" label="Name" value={data.name} onChange={(v) => onChange({ ...data, name: v })} />

          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#334155", mb: 0.875 }}>
              Description <Typography component="span" sx={{ color: "rgba(0,0,0,0.4)" }}>(optional)</Typography>
            </Typography>
            <RichTextEditor value={data.description} onChange={(html) => onChange({ ...data, description: html })} placeholder="What's included?" minHeight={80} />
          </Box>

          <TextInput
            size="sm"
            label="Revisions"
            required
            value={data.revisions}
            onChange={(v) => { onChange({ ...data, revisions: v }); onClearError?.("revisions"); }}
            placeholder="e.g., 3 or Unlimited"
            error={errors?.revisions}
          />

          <TextInput
            size="sm"
            label="Delivery Time (days)"
            required
            inputMode="numeric"
            value={data.deliveryTime}
            onChange={(v) => { onChange({ ...data, deliveryTime: v }); onClearError?.("delivery"); }}
            error={errors?.delivery}
          />

          <TextInput
            size="sm"
            label="Price (USD)"
            required
            inputMode="decimal"
            value={data.price}
            onChange={(v) => { onChange({ ...data, price: v }); onClearError?.("price"); }}
            error={errors?.price}
            startIcon="$"
          />
        </Box>
      )}
    </Box>
  );
}
