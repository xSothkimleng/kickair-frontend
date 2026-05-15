"use client";

import { useState } from "react";
import { Box, Typography, Avatar, Chip } from "@mui/material";
import { StarRounded, ShoppingBag, AccessTimeOutlined } from "@mui/icons-material";
import Image from "next/image";
import Link from "next/link";
import { Service } from "@/types/service";

interface ServiceListCardProps {
  service: Service;
}

export default function ServiceListCard({ service }: ServiceListCardProps) {
  const [imageError, setImageError] = useState(false);

  const freelancerName = service.freelancer_profile?.user?.name || "Unknown";
  const freelancerAvatar = service.freelancer_profile?.user?.avatar_url || "";
  const categoryName = service.category?.category_name || service.category?.name || "Uncategorized";
  const image = service.feature_image?.file_url || service.media?.[0]?.file_url || "";
  const lowestPrice = service.pricing_options?.length ? Math.min(...service.pricing_options.map(p => Number(p.price_raw))) : 0;
  const fastestDelivery = service.pricing_options?.length
    ? Math.min(...service.pricing_options.map(p => parseInt(String(p.delivery_time))))
    : 0;

  return (
    <Link href={`/explore-services/${service.id}`} style={{ textDecoration: "none" }}>
      <Box
        sx={{
          display: "flex",
          gap: 2,
          p: 2,
          bgcolor: "white",
          border: "1px solid rgba(0,0,0,0.08)",
          borderRadius: 3,
          transition: "all 0.2s",
          "&:hover": { border: "1px solid rgba(0,0,0,0.2)", boxShadow: 2 },
        }}>
        {/* Thumbnail */}
        <Box
          sx={{
            flexShrink: 0,
            width: 140,
            height: 100,
            borderRadius: 2,
            overflow: "hidden",
            bgcolor: "rgba(0,0,0,0.05)",
            position: "relative",
          }}>
          {image && !imageError ? (
            <Image
              unoptimized
              src={image}
              alt={service.title}
              fill
              style={{ objectFit: "cover" }}
              onError={() => setImageError(true)}
              sizes="140px"
            />
          ) : (
            <Box sx={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Typography sx={{ fontSize: 11, color: "rgba(0,0,0,0.3)" }}>No image</Typography>
            </Box>
          )}
        </Box>

        {/* Details */}
        <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <Box>
            {/* Seller + category */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.75 }}>
              <Avatar src={freelancerAvatar} alt={freelancerName} sx={{ width: 20, height: 20, fontSize: 10 }}>
                {freelancerName.charAt(0)}
              </Avatar>
              <Typography sx={{ fontSize: 12, fontWeight: 500, color: "rgba(0,0,0,0.7)" }}>{freelancerName}</Typography>
              <Typography sx={{ fontSize: 11, color: "rgba(0,0,0,0.3)" }}>·</Typography>
              <Chip
                label={categoryName}
                size="small"
                sx={{ height: 20, fontSize: 10, bgcolor: "rgba(0,0,0,0.05)", color: "rgba(0,0,0,0.6)", "& .MuiChip-label": { px: 1 } }}
              />
            </Box>

            {/* Title */}
            <Typography
              sx={{
                fontSize: 14,
                fontWeight: 500,
                color: "black",
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                lineHeight: 1.4,
              }}>
              {service.title}
            </Typography>
          </Box>

          {/* Bottom row: rating, orders, delivery, price */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              {service.rating_count > 0 && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <StarRounded sx={{ fontSize: 13, color: "#f59e0b" }} />
                  <Typography sx={{ fontSize: 12, fontWeight: 600, color: "black" }}>
                    {parseFloat(service.rating_average!).toFixed(1)}
                  </Typography>
                  <Typography sx={{ fontSize: 11, color: "rgba(0,0,0,0.4)" }}>({service.rating_count})</Typography>
                </Box>
              )}
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <ShoppingBag sx={{ fontSize: 12, color: "rgba(0,0,0,0.4)" }} />
                <Typography sx={{ fontSize: 11, color: "rgba(0,0,0,0.5)" }}>{service.orders_count} orders</Typography>
              </Box>
              {fastestDelivery > 0 && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <AccessTimeOutlined sx={{ fontSize: 12, color: "rgba(0,0,0,0.4)" }} />
                  <Typography sx={{ fontSize: 11, color: "rgba(0,0,0,0.5)" }}>{fastestDelivery} day{fastestDelivery !== 1 ? "s" : ""}</Typography>
                </Box>
              )}
            </Box>

            <Box sx={{ textAlign: "right" }}>
              <Typography sx={{ fontSize: 11, color: "rgba(0,0,0,0.5)" }}>Starting at</Typography>
              <Typography sx={{ fontSize: 16, fontWeight: 600, color: "black" }}>${lowestPrice}</Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Link>
  );
}
