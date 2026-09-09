"use client";

import { css } from "styled-system/css";
import { Avatar, Rating } from "@/components/ds";
import { FreelancerReview } from "@/lib/api";

interface ReviewCardProps {
  review: FreelancerReview;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const cardCss = css({ bg: "white", borderRadius: "12px", borderWidth: "1px", borderStyle: "solid", borderColor: "rgba(0,0,0,0.08)", p: "24px" });
const headRow = css({ display: "flex", alignItems: "flex-start", gap: "16px" });
const headRowSpaced = css({ display: "flex", alignItems: "flex-start", gap: "16px", mb: "16px" });
const bodyCol = css({ flex: 1, minW: 0 });
const nameRow = css({ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", mb: "4px" });
const nameCss = css({ fontSize: "14px", fontWeight: 600, color: "black" });
const dateCss = css({ fontSize: "11px", color: "rgba(0,0,0,0.4)", flexShrink: 0 });
const commentCss = css({ fontSize: "13px", color: "rgba(0,0,0,0.7)", lineHeight: 1.65, pl: "56px" });

export default function ReviewCard({ review }: ReviewCardProps) {
  const client = review.client_profile?.user;
  const name = client?.name || "Anonymous";
  const avatar = client?.avatar_url || undefined;

  return (
    <div className={cardCss}>
      <div className={review.comment ? headRowSpaced : headRow}>
        <Avatar src={avatar} name={name} px={40} />
        <div className={bodyCol}>
          <div className={nameRow}>
            <p className={nameCss}>{name}</p>
            <p className={dateCss}>{formatDate(review.created_at)}</p>
          </div>
          <Rating value={review.rating} size={14} readOnly />
        </div>
      </div>
      {review.comment && <p className={commentCss}>{review.comment}</p>}
    </div>
  );
}
