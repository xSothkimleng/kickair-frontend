"use client";

import { Box, Typography, Avatar } from "@mui/material";
import { Star } from "@mui/icons-material";
import { FreelancerReview } from "@/lib/api";

interface ReviewCardProps {
  review: FreelancerReview;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <Box sx={{ display: "flex", gap: 0.25 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          sx={{
            fontSize: 14,
            color: star <= rating ? "#f59e0b" : "rgba(0,0,0,0.15)",
          }}
        />
      ))}
    </Box>
  );
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const client = review.client_profile?.user;
  const name = client?.name || "Anonymous";
  const avatar = client?.profile_image || undefined;
  const initials = name.charAt(0).toUpperCase();

  return (
    <Box
      sx={{
        bgcolor: "white",
        borderRadius: 3,
        border: "1px solid rgba(0,0,0,0.08)",
        p: 3,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, mb: review.comment ? 2 : 0 }}>
        <Avatar
          src={avatar}
          alt={name}
          sx={{ width: 40, height: 40, fontSize: 15, bgcolor: "rgba(0,113,227,0.12)", color: "#0071e3", flexShrink: 0 }}
        >
          {initials}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, mb: 0.5 }}>
            <Typography sx={{ fontSize: 14, fontWeight: 600, color: "black" }}>{name}</Typography>
            <Typography sx={{ fontSize: 11, color: "rgba(0,0,0,0.4)", flexShrink: 0 }}>
              {formatDate(review.created_at)}
            </Typography>
          </Box>
          <StarRating rating={review.rating} />
        </Box>
      </Box>
      {review.comment && (
        <Typography sx={{ fontSize: 13, color: "rgba(0,0,0,0.7)", lineHeight: 1.65, pl: 7 }}>
          {review.comment}
        </Typography>
      )}
    </Box>
  );
}
