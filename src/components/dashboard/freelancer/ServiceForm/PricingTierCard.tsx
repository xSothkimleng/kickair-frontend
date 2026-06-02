import { Box, Typography, TextField, Switch, FormControlLabel } from "@mui/material";
import RichTextEditor from "@/components/ui/RichTextEditor";
import { PricingTier, smallTextFieldSx } from "../types";

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
        <Typography
          sx={{
            fontSize: 13,
            fontWeight: 600,
            color: disabled ? "rgba(0, 0, 0, 0.3)" : "black",
            textTransform: "capitalize",
          }}>
          {tier}
        </Typography>
        <FormControlLabel
            control={
              <Switch
                checked={data.enabled}
                onChange={e => onToggle(e.target.checked)}
                size="small"
                sx={{
                  "& .MuiSwitch-switchBase.Mui-checked": { color: "black" },
                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: "black" },
                }}
              />
            }
            label={<Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.5)" }}>{data.enabled ? "On" : "Off"}</Typography>}
            sx={{ mr: 0 }}
          />
      </Box>

      {!disabled && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Box>
            <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)", mb: 0.5 }}>Name</Typography>
            <TextField fullWidth value={data.name} onChange={e => onChange({ ...data, name: e.target.value })} sx={smallTextFieldSx} />
          </Box>

          <Box>
            <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)", mb: 0.5 }}>Description <span style={{ opacity: 0.4 }}>(optional)</span></Typography>
            <RichTextEditor
              value={data.description}
              onChange={html => onChange({ ...data, description: html })}
              placeholder="What's included?"
              minHeight={80}
            />
          </Box>

          <Box>
            <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)", mb: 0.5 }}>
              Revisions <Typography component="span" sx={{ color: "#DC2626" }}>*</Typography>
            </Typography>
            <TextField
              fullWidth
              value={data.revisions}
              onChange={e => { onChange({ ...data, revisions: e.target.value }); onClearError?.("revisions"); }}
              placeholder="e.g., 3 or Unlimited"
              error={!!errors?.revisions}
              helperText={errors?.revisions}
              sx={smallTextFieldSx}
            />
          </Box>

          <Box>
            <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)", mb: 0.5 }}>
              Delivery Time (days) <Typography component="span" sx={{ color: "#DC2626" }}>*</Typography>
            </Typography>
            <TextField
              fullWidth
              type="number"
              value={data.deliveryTime}
              onChange={e => { onChange({ ...data, deliveryTime: e.target.value }); onClearError?.("delivery"); }}
              error={!!errors?.delivery}
              helperText={errors?.delivery}
              sx={smallTextFieldSx}
            />
          </Box>

          <Box>
            <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)", mb: 0.5 }}>
              Price (USD) <Typography component="span" sx={{ color: "#DC2626" }}>*</Typography>
            </Typography>
            <Box sx={{ position: "relative" }}>
              <Typography
                sx={{
                  position: "absolute",
                  left: 12,
                  top: errors?.price ? "38%" : "50%",
                  transform: "translateY(-50%)",
                  fontSize: 12,
                  color: errors?.price ? "#DC2626" : "rgba(0, 0, 0, 0.6)",
                  zIndex: 1,
                }}>
                $
              </Typography>
              <TextField
                fullWidth
                type="number"
                value={data.price}
                onChange={e => { onChange({ ...data, price: e.target.value }); onClearError?.("price"); }}
                error={!!errors?.price}
                helperText={errors?.price}
                sx={{
                  ...smallTextFieldSx,
                  "& .MuiOutlinedInput-root": {
                    ...smallTextFieldSx["& .MuiOutlinedInput-root"],
                    "& input": { pl: 2.5 },
                  },
                }}
              />
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
}
