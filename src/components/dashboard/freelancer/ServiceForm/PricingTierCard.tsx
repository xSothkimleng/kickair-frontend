import { Box, Typography, TextField } from "@mui/material";
import RichTextEditor from "@/components/ui/RichTextEditor";
import { PricingTier, smallTextFieldSx } from "../types";

interface PricingTierCardProps {
  tier: "basic" | "standard" | "premium";
  data: PricingTier;
  onChange: (data: PricingTier) => void;
}

export default function PricingTierCard({ tier, data, onChange }: PricingTierCardProps) {
  return (
    <Box sx={{ p: 2, border: "1px solid rgba(0, 0, 0, 0.1)", borderRadius: 3 }}>
      <Typography sx={{ fontSize: 13, fontWeight: 600, color: "black", mb: 2, textTransform: "capitalize" }}>{tier}</Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        <Box>
          <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)", mb: 0.5 }}>Name</Typography>
          <TextField fullWidth value={data.name} onChange={e => onChange({ ...data, name: e.target.value })} sx={smallTextFieldSx} />
        </Box>

        <Box>
          <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)", mb: 0.5 }}>Description</Typography>
          <RichTextEditor
            value={data.description}
            onChange={html => onChange({ ...data, description: html })}
            placeholder="What's included?"
            minHeight={80}
          />
        </Box>

        <Box>
          <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)", mb: 0.5 }}>Revisions</Typography>
          <TextField
            fullWidth
            value={data.revisions}
            onChange={e => onChange({ ...data, revisions: e.target.value })}
            placeholder="e.g., 3 or Unlimited"
            sx={smallTextFieldSx}
          />
        </Box>

        <Box>
          <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)", mb: 0.5 }}>Delivery Time (days)</Typography>
          <TextField
            fullWidth
            type="number"
            value={data.deliveryTime}
            onChange={e => onChange({ ...data, deliveryTime: e.target.value })}
            sx={smallTextFieldSx}
          />
        </Box>

        <Box>
          <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)", mb: 0.5 }}>Price (USD) *</Typography>
          <Box sx={{ position: "relative" }}>
            <Typography
              sx={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: 12,
                color: "rgba(0, 0, 0, 0.6)",
                zIndex: 1,
              }}>
              $
            </Typography>
            <TextField
              fullWidth
              type="number"
              value={data.price}
              onChange={e => onChange({ ...data, price: e.target.value })}
              sx={{
                ...smallTextFieldSx,
                "& .MuiOutlinedInput-root": {
                  ...smallTextFieldSx["& .MuiOutlinedInput-root"],
                  "& input": {
                    pl: 2.5,
                  },
                },
              }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
