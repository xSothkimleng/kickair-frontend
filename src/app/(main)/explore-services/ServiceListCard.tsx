"use client";

import { useState } from "react";
import { Clock, ShoppingBag, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { css } from "styled-system/css";
import { Avatar } from "@/components/ds";
import { Service } from "@/types/service";
import { serviceCoverUrl } from "@/lib/serviceCover";

interface ServiceListCardProps {
  service: Service;
}

const linkCss = css({ textDecoration: "none" });
const rowCss = css({
  display: "flex",
  gap: "16px",
  p: "16px",
  bg: "white",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "hairline",
  borderRadius: "12px",
  transition: "all 0.2s",
  _hover: {
    borderColor: "rgba(0,0,0,0.2)",
    boxShadow: "0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12)",
  },
});
const thumbCss = css({
  flexShrink: 0,
  w: "140px",
  h: "100px",
  borderRadius: "8px",
  overflow: "hidden",
  bg: "rgba(0,0,0,0.05)",
  position: "relative",
});
const noImageCss = css({
  w: "100%",
  h: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "11px",
  color: "rgba(0,0,0,0.3)",
});
const detailsCss = css({ flex: 1, minW: 0, display: "flex", flexDirection: "column", justifyContent: "space-between" });
const sellerRowCss = css({ display: "flex", alignItems: "center", gap: "8px", mb: "6px" });
const sellerNameCss = css({ fontSize: "12px", fontWeight: 500, lineHeight: 1.5, color: "rgba(0,0,0,0.7)" });
const dotCss = css({ fontSize: "11px", lineHeight: 1.5, color: "rgba(0,0,0,0.3)" });
const chipCss = css({
  display: "inline-flex",
  alignItems: "center",
  boxSizing: "border-box",
  h: "20px",
  px: "8px",
  borderRadius: "pill",
  bg: "rgba(0,0,0,0.05)",
  color: "ink2",
  fontSize: "10px",
  whiteSpace: "nowrap",
});
const titleCss = css({
  fontSize: "14px",
  fontWeight: 500,
  color: "ink",
  lineClamp: 2,
  lineHeight: 1.4,
});
const bottomRowCss = css({ display: "flex", alignItems: "center", justifyContent: "space-between", mt: "8px" });
const statsCss = css({ display: "flex", alignItems: "center", gap: "16px" });
const statCss = css({ display: "flex", alignItems: "center", gap: "4px" });
const ratingValueCss = css({ fontSize: "12px", fontWeight: 600, color: "ink", lineHeight: 1.5 });
const ratingCountCss = css({ fontSize: "11px", color: "rgba(0,0,0,0.4)", lineHeight: 1.5 });
const mutedSmCss = css({ fontSize: "11px", color: "rgba(0,0,0,0.5)", lineHeight: 1.5 });
const mutedIconCss = css({ color: "rgba(0,0,0,0.4)" });
const starCss = css({ color: "#f59e0b", fill: "#f59e0b" });
const priceColCss = css({ textAlign: "right" });
const priceCss = css({ fontSize: "16px", fontWeight: 600, color: "ink", lineHeight: 1.5 });

export default function ServiceListCard({ service }: ServiceListCardProps) {
  const [imageError, setImageError] = useState(false);

  const freelancerName = service.freelancer_profile?.user?.name || "Unknown";
  const freelancerAvatar = service.freelancer_profile?.user?.avatar_url || "";
  const categoryName = service.category?.category_name || "Uncategorized";
  const image = serviceCoverUrl(service) || "";
  const lowestPrice = service.pricing_options?.length ? Math.min(...service.pricing_options.map(p => Number(p.price_raw))) : 0;
  const fastestDelivery = service.pricing_options?.length
    ? Math.min(...service.pricing_options.map(p => parseInt(String(p.delivery_time))))
    : 0;

  return (
    <Link href={`/explore-services/${service.id}`} className={linkCss}>
      <div className={rowCss}>
        {/* Thumbnail */}
        <div className={thumbCss}>
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
            <div className={noImageCss}>No image</div>
          )}
        </div>

        {/* Details */}
        <div className={detailsCss}>
          <div>
            {/* Seller + category */}
            <div className={sellerRowCss}>
              <Avatar name={freelancerName} src={freelancerAvatar || null} px={20} />
              <span className={sellerNameCss}>{freelancerName}</span>
              <span className={dotCss}>·</span>
              <span className={chipCss}>{categoryName}</span>
            </div>

            {/* Title */}
            <p className={titleCss}>{service.title}</p>
          </div>

          {/* Bottom row: rating, orders, delivery, price */}
          <div className={bottomRowCss}>
            <div className={statsCss}>
              {service.rating_count > 0 && (
                <div className={statCss}>
                  <Star size={13} className={starCss} />
                  <span className={ratingValueCss}>{parseFloat(service.rating_average!).toFixed(1)}</span>
                  <span className={ratingCountCss}>({service.rating_count})</span>
                </div>
              )}
              <div className={statCss}>
                <ShoppingBag size={12} className={mutedIconCss} />
                <span className={mutedSmCss}>{service.orders_count} orders</span>
              </div>
              {fastestDelivery > 0 && (
                <div className={statCss}>
                  <Clock size={12} className={mutedIconCss} />
                  <span className={mutedSmCss}>{fastestDelivery} day{fastestDelivery !== 1 ? "s" : ""}</span>
                </div>
              )}
            </div>

            <div className={priceColCss}>
              <p className={mutedSmCss}>Starting at</p>
              <p className={priceCss}>${lowestPrice}</p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
