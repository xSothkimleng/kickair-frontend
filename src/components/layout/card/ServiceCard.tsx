"use client";

import { Box, Typography } from "@mui/material";
import {
  Palette as PaletteIcon,
  Code as CodeIcon,
  TrendingUp as TrendingUpIcon,
  VideoLibrary as VideoIcon,
  Edit as PenToolIcon,
  BusinessCenter as BriefcaseIcon,
  SvgIconComponent,
} from "@mui/icons-material";

interface ServiceCardProps {
  name: string;
  description: string;
  icon: string;
}

const iconMap: Record<string, SvgIconComponent> = {
  Palette: PaletteIcon,
  Code: CodeIcon,
  TrendingUp: TrendingUpIcon,
  Video: VideoIcon,
  PenTool: PenToolIcon,
  Briefcase: BriefcaseIcon,
};

export function ServiceCard({ name, description, icon }: ServiceCardProps) {
  const IconComponent = iconMap[icon] || PaletteIcon;

  return (
    <Box
      component='button'
      //   onClick={onClick}
      sx={{
        width: "100%",
        bgcolor: "#f5f5f7",
        borderRadius: "16px",
        p: { xs: 4, md: 5 },
        border: "1px solid transparent",
        textAlign: "left",
        cursor: "pointer",
        transition: "all 0.3s ease",
        "&:hover": {
          bgcolor: "white",
          borderColor: "rgba(0, 0, 0, 0.1)",
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
          "& .icon-wrapper": {
            bgcolor: "rgba(0, 113, 227, 0.1)",
          },
          "& .icon": {
            color: "#0071e3",
          },
        },
      }}>
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2 }}>
        <Box
          className='icon-wrapper'
          sx={{
            p: 1.5,
            bgcolor: "rgba(0, 0, 0, 0.05)",
            borderRadius: "12px",
            transition: "background-color 0.3s ease",
          }}>
          <IconComponent
            className='icon'
            sx={{
              fontSize: 24,
              color: "rgba(0, 0, 0, 0.7)",
              transition: "color 0.3s ease",
            }}
          />
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          <Typography
            component='h3'
            sx={{
              fontSize: "20px",
              color: "black",
              fontWeight: 500,
            }}>
            {name}
          </Typography>
          <Typography
            sx={{
              fontSize: "14px",
              color: "rgba(0, 0, 0, 0.6)",
            }}>
            {description}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
