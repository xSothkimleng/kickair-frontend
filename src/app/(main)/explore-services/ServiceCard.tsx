"use client";

import { useState } from "react";
import { Box, Card, CardContent, Typography, IconButton, Avatar } from "@mui/material";
import { FavoriteBorder, Favorite, ShoppingBag, StarRounded } from "@mui/icons-material";
import Image from "next/image";
import Link from "next/link";
import { Service } from "@/types/service";

interface ServiceCardProps {
  service: Service;
}

export default function ServiceCard({ service }: ServiceCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Extract display data from service
  const freelancerName = service.freelancer_profile?.user?.name || "Unknown";
  const freelancerAvatar = service.freelancer_profile?.user?.profile_image || "";
  const categoryName = service.category?.name || "Uncategorized";
  const image = service.feature_image?.file_url || service.media?.[0]?.file_url || "";

  // Get the lowest price from pricing options
  const lowestPrice = service.pricing_options?.length ? Math.min(...service.pricing_options.map(p => Number(p.price_raw))) : 0;

  // Get the fastest delivery time (delivery_time may be "3 days" string or a number)
  const fastestDelivery = service.pricing_options?.length
    ? Math.min(...service.pricing_options.map(p => parseInt(String(p.delivery_time))))
    : 0;

  return (
    <Link href={`/explore-services/${service.id}`} style={{ textDecoration: "none" }}>
      <Card
        sx={{
          borderRadius: 2,
          border: "1px solid rgba(0, 0, 0, 0.08)",
          overflow: "hidden",
          cursor: "pointer",
          transition: "all 0.3s",
          "&:hover": {
            border: "1px solid rgba(0, 0, 0, 0.2)",
            boxShadow: 3,
            "& .service-image": {
              transform: "scale(1.05)",
            },
            "& .favorite-button": {
              opacity: 1,
            },
          },
        }}
        elevation={0}>
        {/* Service Image */}
        <Box sx={{ position: "relative", aspectRatio: "4/3", bgcolor: "rgba(0, 0, 0, 0.05)" }}>
          {image && !imageError ? (
            <Image
              unoptimized={true}
              src={image}
              alt={service.title}
              fill
              style={{ objectFit: "cover", transition: "transform 0.3s" }}
              className='service-image'
              onError={() => setImageError(true)}
              sizes='(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw'
            />
          ) : (
            <Box
              sx={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "rgba(0, 0, 0, 0.05)",
              }}>
              <Typography sx={{ fontSize: 13, color: "rgba(0, 0, 0, 0.4)" }}>No image</Typography>
            </Box>
          )}

          {/* Category Badge */}
          <Box
            sx={{
              position: "absolute",
              top: 12,
              left: 12,
              px: 1.5,
              py: 0.5,
              bgcolor: "rgba(0, 0, 0, 0.7)",
              color: "white",
              fontSize: 10,
              fontWeight: 500,
              borderRadius: 25,
            }}>
            {categoryName}
          </Box>

          <IconButton
            className='favorite-button'
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              setIsFavorited(!isFavorited);
            }}
            sx={{
              position: "absolute",
              top: 12,
              right: 12,
              width: 32,
              height: 32,
              bgcolor: "rgba(255, 255, 255, 0.9)",
              backdropFilter: "blur(4px)",
              opacity: { xs: 1, md: 0 },
              transition: "all 0.3s",
              "&:hover": {
                bgcolor: "white",
              },
            }}>
            {isFavorited ? (
              <Favorite sx={{ fontSize: 16, color: "red" }} />
            ) : (
              <FavoriteBorder sx={{ fontSize: 16, color: "rgba(0, 0, 0, 0.6)" }} />
            )}
          </IconButton>
        </Box>

        {/* Service Info */}
        <CardContent sx={{ p: 2 }}>
          {/* Freelancer */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
            <Avatar src={freelancerAvatar} alt={freelancerName} sx={{ width: 24, height: 24 }}>
              {freelancerName.charAt(0)}
            </Avatar>
            <Typography sx={{ fontSize: 11, fontWeight: 500 }}>{freelancerName}</Typography>
          </Box>

          {/* Title */}
          <Typography
            sx={{
              fontSize: 14,
              fontWeight: 500,
              mb: 1.5,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              lineHeight: 1.4,
              color: "black",
            }}>
            {service.title}
          </Typography>

          {/* Rating & Orders */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
            {service.rating_count > 0 && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <StarRounded sx={{ fontSize: 13, color: "#f59e0b" }} />
                <Typography sx={{ fontSize: 11, fontWeight: 600, color: "black" }}>
                  {parseFloat(service.rating_average!).toFixed(1)}
                </Typography>
                <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.5)" }}>({service.rating_count})</Typography>
              </Box>
            )}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <ShoppingBag sx={{ fontSize: 12, color: "rgba(0, 0, 0, 0.5)" }} />
              <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.5)" }}>{service.orders_count} orders</Typography>
            </Box>
          </Box>

          {/* Price & Delivery */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              pt: 1.5,
              borderTop: "1px solid rgba(0, 0, 0, 0.08)",
            }}>
            <Box>
              <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)", mb: 0.25 }}>Starting at</Typography>
              <Typography sx={{ fontSize: 17, fontWeight: 600, color: "black" }}>${lowestPrice}</Typography>
            </Box>
            {fastestDelivery > 0 && (
              <Box sx={{ textAlign: "right" }}>
                <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)", mb: 0.25 }}>Delivery</Typography>
                <Typography sx={{ fontSize: 13, fontWeight: 500, color: "black" }}>
                  {fastestDelivery} day{fastestDelivery !== 1 ? "s" : ""}
                </Typography>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>
    </Link>
  );
}
