import { Box, Typography, SvgIconProps } from "@mui/material";
import { ArrowRight } from "@mui/icons-material";

interface StatsCardProps {
  icon: React.ComponentType<SvgIconProps>;
  iconColor: string;
  value: string | number;
  label: string;
  gradient?: boolean;
  gradientColors?: string;
  hasNotification?: boolean;
  onClick?: () => void;
}

export default function StatsCard({
  icon: Icon,
  iconColor,
  value,
  label,
  gradient = false,
  gradientColors,
  hasNotification = false,
  onClick,
}: StatsCardProps) {
  return (
    <Box
      onClick={onClick}
      sx={{
        bgcolor: gradient ? "transparent" : "white",
        background: gradient ? gradientColors : undefined,
        borderRadius: 4,
        border: gradient ? "1px solid rgba(34, 197, 94, 0.2)" : "1px solid rgba(0, 0, 0, 0.08)",
        p: 3,
        cursor: onClick ? "pointer" : "default",
        position: "relative",
        transition: "all 0.3s",
        "&:hover": onClick
          ? {
              borderColor: gradient ? "rgba(34, 197, 94, 0.3)" : "rgba(0, 0, 0, 0.2)",
              "& .arrow-icon": {
                opacity: 1,
              },
            }
          : undefined,
      }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Icon sx={{ fontSize: 20, color: iconColor }} />
        <ArrowRight
          className='arrow-icon'
          sx={{
            fontSize: 16,
            color: gradient ? "rgba(22, 163, 74, 0.4)" : "rgba(0, 0, 0, 0.4)",
            opacity: 0,
            transition: "opacity 0.3s",
          }}
        />
      </Box>

      <Typography
        sx={{
          fontSize: 28,
          fontWeight: 600,
          color: gradient ? "rgb(21, 128, 61)" : "black",
          mb: 0.5,
        }}>
        {value}
      </Typography>

      <Typography
        sx={{
          fontSize: 11,
          color: gradient ? "rgba(21, 128, 61, 0.7)" : "rgba(0, 0, 0, 0.6)",
        }}>
        {label}
      </Typography>

      {hasNotification && (
        <Box
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            width: 8,
            height: 8,
            bgcolor: iconColor,
            borderRadius: "50%",
          }}
        />
      )}
    </Box>
  );
}
