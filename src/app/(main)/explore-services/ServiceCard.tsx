"use client";

import { useState } from "react";
import { Heart, ShoppingBag, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { css, cx } from "styled-system/css";
import { Avatar } from "@/components/ds";
import { Service } from "@/types/service";
import { serviceCoverUrl } from "@/lib/serviceCover";

interface ServiceCardProps {
  service: Service;
}

const linkCss = css({ textDecoration: "none" });

const cardCss = css({
  bg: "surface",
  borderRadius: "8px",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "hairline",
  overflow: "hidden",
  cursor: "pointer",
  transition: "all 0.3s",
  _hover: {
    borderColor: "rgba(0, 0, 0, 0.2)",
    boxShadow: "0px 3px 3px -2px rgba(0,0,0,0.2), 0px 3px 4px 0px rgba(0,0,0,0.14), 0px 1px 8px 0px rgba(0,0,0,0.12)",
    "& .service-image": { transform: "scale(1.05)" },
    "& .favorite-button": { opacity: 1 },
  },
});

const mediaCss = css({ position: "relative", aspectRatio: "4/3", bg: "rgba(0, 0, 0, 0.05)" });
const noImageCss = css({
  w: "100%",
  h: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  bg: "rgba(0, 0, 0, 0.05)",
  fontSize: "13px",
  color: "ink3",
});
const categoryBadgeCss = css({
  position: "absolute",
  top: "12px",
  left: "12px",
  px: "12px",
  py: "4px",
  bg: "rgba(0, 0, 0, 0.7)",
  color: "white",
  fontSize: "10px",
  fontWeight: 500,
  borderRadius: "100px",
});
const favBtnCss = css({
  position: "absolute",
  top: "12px",
  right: "12px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  boxSizing: "border-box",
  w: "32px",
  h: "32px",
  p: 0,
  m: 0,
  border: "none",
  borderRadius: "50%",
  bg: "rgba(255, 255, 255, 0.9)",
  backdropFilter: "blur(4px)",
  color: "ink2",
  cursor: "pointer",
  fontFamily: "inherit",
  opacity: { base: 1, md: 0 },
  transition: "all 0.3s",
  _hover: { bg: "white" },
  "& svg": { display: "block" },
});

const contentCss = css({ p: "16px 16px 24px" });
const sellerRowCss = css({ display: "flex", alignItems: "center", gap: "8px", mb: "12px" });
const sellerNameCss = css({ fontSize: "11px", fontWeight: 500, lineHeight: 1.5 });
const titleCss = css({
  fontSize: "14px",
  fontWeight: 500,
  lineClamp: 2,
  lineHeight: 1.4,
  color: "ink",
});
const statsRowCss = css({ display: "flex", alignItems: "center", gap: "12px", mb: "12px" });
const statCss = css({ display: "flex", alignItems: "center", gap: "4px" });
const ratingValueCss = css({ fontSize: "11px", fontWeight: 600, color: "ink", lineHeight: 1.5 });
const mutedSmCss = css({ fontSize: "11px", color: "rgba(0, 0, 0, 0.5)", lineHeight: 1.5 });
const footerCss = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  pt: "12px",
  borderTopWidth: "1px",
  borderTopStyle: "solid",
  borderTopColor: "hairline",
});
const footerLabelCss = css({ fontSize: "11px", color: "ink2", lineHeight: 1.5 });
const priceCss = css({ fontSize: "17px", fontWeight: 600, color: "ink", lineHeight: 1.5 });
const deliveryCss = css({ fontSize: "13px", fontWeight: 500, color: "ink", lineHeight: 1.5 });
const rightCss = css({ textAlign: "right" });
const starCss = css({ color: "#f59e0b", fill: "#f59e0b" });
const mutedIconCss = css({ color: "rgba(0, 0, 0, 0.5)" });

export default function ServiceCard({ service }: ServiceCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Extract display data from service
  const freelancerName = service.freelancer_profile?.user?.name || "Unknown";
  const freelancerAvatar = service.freelancer_profile?.user?.avatar_url || "";
  const categoryName = service.category?.category_name || "Uncategorized";
  const image = serviceCoverUrl(service) || "";

  // Get the lowest price from pricing options
  const lowestPrice = service.pricing_options?.length ? Math.min(...service.pricing_options.map(p => Number(p.price_raw))) : 0;

  // Get the fastest delivery time (delivery_time may be "3 days" string or a number)
  const fastestDelivery = service.pricing_options?.length
    ? Math.min(...service.pricing_options.map(p => parseInt(String(p.delivery_time))))
    : 0;

  return (
    <Link href={`/explore-services/${service.id}`} className={linkCss}>
      <div className={cardCss}>
        {/* Service Image */}
        <div className={mediaCss}>
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
            <div className={noImageCss}>No image</div>
          )}

          {/* Category Badge */}
          <div className={categoryBadgeCss}>{categoryName}</div>

          <button
            type='button'
            aria-label={isFavorited ? "Remove from favourites" : "Add to favourites"}
            className={cx("favorite-button", favBtnCss)}
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              setIsFavorited(!isFavorited);
            }}>
            {isFavorited ? (
              <Heart size={16} className={css({ color: "red", fill: "red" })} />
            ) : (
              <Heart size={16} />
            )}
          </button>
        </div>

        {/* Service Info */}
        <div className={contentCss}>
          {/* Freelancer */}
          <div className={sellerRowCss}>
            <Avatar name={freelancerName} src={freelancerAvatar || null} px={24} />
            <span className={sellerNameCss}>{freelancerName}</span>
          </div>

          {/* Title */}
          <p className={titleCss}>{service.title}</p>

          {/* Rating & Orders */}
          <div className={statsRowCss}>
            {service.rating_count > 0 && (
              <div className={statCss}>
                <Star size={13} className={starCss} />
                <span className={ratingValueCss}>{parseFloat(service.rating_average!).toFixed(1)}</span>
                <span className={mutedSmCss}>({service.rating_count})</span>
              </div>
            )}
            <div className={statCss}>
              <ShoppingBag size={12} className={mutedIconCss} />
              <span className={mutedSmCss}>{service.orders_count} orders</span>
            </div>
          </div>

          {/* Price & Delivery */}
          <div className={footerCss}>
            <div>
              <p className={footerLabelCss}>Starting at</p>
              <p className={priceCss}>${lowestPrice}</p>
            </div>
            {fastestDelivery > 0 && (
              <div className={rightCss}>
                <p className={footerLabelCss}>Delivery</p>
                <p className={deliveryCss}>
                  {fastestDelivery} day{fastestDelivery !== 1 ? "s" : ""}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
