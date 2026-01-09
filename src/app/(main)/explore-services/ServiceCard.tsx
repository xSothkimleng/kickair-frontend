// components/services/ServiceCard.tsx
"use client";

import { useState } from "react";
import { Box, Card, CardMedia, CardContent, Typography, IconButton, Avatar } from "@mui/material";
import { Star, FavoriteBorder, Favorite } from "@mui/icons-material";
import Image from "next/image";

interface Service {
  id: number;
  title: string;
  category: string;
  freelancerName: string;
  freelancerAvatar: string;
  image: string;
  price: number;
  rating: number;
  reviewCount: number;
  deliveryDays: number;
  featured: boolean;
}

interface ServiceCardProps {
  service: Service;
}

export default function ServiceCard({ service }: ServiceCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
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
        {!imageError ? (
          <Image
            src={service.image}
            alt={service.title}
            fill
            style={{ objectFit: "cover" }}
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
            <Typography sx={{ fontSize: 13, color: "rgba(0, 0, 0, 0.4)" }}>Image unavailable</Typography>
          </Box>
        )}

        {service.featured && (
          <Box
            sx={{
              position: "absolute",
              top: 12,
              left: 12,
              px: 1.5,
              py: 0.5,
              bgcolor: "#0071e3",
              color: "white",
              fontSize: 10,
              fontWeight: 500,
              borderRadius: 25,
            }}>
            Featured
          </Box>
        )}

        <IconButton
          className='favorite-button'
          onClick={e => {
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
          <Avatar src={service.freelancerAvatar} alt={service.freelancerName} sx={{ width: 24, height: 24 }} />
          <Typography sx={{ fontSize: 11, fontWeight: 500 }}>{service.freelancerName}</Typography>
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
          }}>
          {service.title}
        </Typography>

        {/* Rating */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1.5 }}>
          <Star sx={{ fontSize: 12, color: "#ff9800", fill: "#ff9800" }} />
          <Typography sx={{ fontSize: 12, fontWeight: 600 }}>{service.rating}</Typography>
          <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)" }}>({service.reviewCount})</Typography>
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
            <Typography sx={{ fontSize: 17, fontWeight: 600 }}>${service.price}</Typography>
          </Box>
          <Box sx={{ textAlign: "right" }}>
            <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)", mb: 0.25 }}>Delivery</Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 500 }}>{service.deliveryDays} days</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
