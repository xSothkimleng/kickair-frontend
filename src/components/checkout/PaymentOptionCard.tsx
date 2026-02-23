import { Box, Typography } from "@mui/material";

export type PaymentMethod = "card" | "bank" | "ewallet";

interface PaymentOptionProps {
  value: PaymentMethod;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  selected: boolean;
  onSelect: (value: PaymentMethod) => void;
}

export default function PaymentOption({
  value,
  icon,
  title,
  subtitle,
  selected,
  onSelect,
}: PaymentOptionProps) {
  return (
    <Box
      component='button'
      type='button'
      onClick={() => onSelect(value)}
      sx={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 2,
        p: 2,
        borderRadius: 2,
        border: "2px solid",
        borderColor: selected ? "primary.main" : "divider",
        bgcolor: selected ? "rgba(0, 113, 227, 0.05)" : "background.paper",
        textAlign: "left",
        cursor: "pointer",
        transition: "all 0.2s",
        "&:hover": {
          borderColor: "primary.main",
          bgcolor: selected ? "rgba(0, 113, 227, 0.08)" : "action.hover",
        },
        outline: "none",
      }}>
      <Box
        sx={{
          width: 20,
          height: 20,
          borderRadius: "50%",
          border: "2px solid",
          borderColor: selected ? "primary.main" : "divider",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}>
        {selected && (
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              bgcolor: "primary.main",
            }}
          />
        )}
      </Box>
      <Box sx={{ color: "text.primary", display: "flex", alignItems: "center", gap: 1.5 }}>
        {icon}
        <Box>
          <Typography variant='body1'>{title}</Typography>
          <Typography variant='body2' color='text.secondary'>
            {subtitle}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}