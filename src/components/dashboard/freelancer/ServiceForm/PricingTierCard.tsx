import { Box, Typography, TextField } from "@mui/material";
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
          <TextField
            fullWidth
            multiline
            rows={3}
            value={data.description}
            onChange={e => onChange({ ...data, description: e.target.value })}
            placeholder="What's included?"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                bgcolor: "white",
                fontSize: 12,
                "& fieldset": {
                  borderColor: "rgba(0, 0, 0, 0.1)",
                },
                "&:hover fieldset": {
                  borderColor: "rgba(0, 0, 0, 0.2)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "rgba(0, 0, 0, 0.2)",
                  borderWidth: 1,
                },
              },
            }}
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
