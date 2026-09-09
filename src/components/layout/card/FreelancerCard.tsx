"use client";

import Link from "next/link";
import { ArrowRight, MapPin, Star } from "lucide-react";
import { css, cx } from "styled-system/css";
import { FreelancerProfile } from "@/types/user";
import * as k from "./freelancerCardKit";

const MAX_VISIBLE_SKILLS = 3;

const card = css({ flexDirection: "column", p: "20px" });
const header = css({ display: "flex", gap: "14px", mb: "16px" });
const tagline = css({ fontSize: "13px", color: "ink2", lineHeight: 1.4, mb: "6px", lineClamp: 2 });
const ratingRow = css({ display: "flex", alignItems: "center", gap: "10px", py: "10px", mb: "14px", borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "fill", borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "fill" });
const skills = css({ display: "flex", flexWrap: "wrap", gap: "6px", mb: "18px", h: "24px", overflow: "hidden" });
const skillChip = css({ h: "24px", fontSize: "12px" });
const overflowCss = css({ display: "inline-flex", alignItems: "center", h: "24px", px: "4px", color: "ink3", fontSize: "12px", fontWeight: 500 });

interface FreelancerCardProps {
  profile: FreelancerProfile;
}

export function FreelancerCard({ profile }: FreelancerCardProps) {
  const name = profile.user?.name || "Unknown";
  const avatarUrl = profile.user?.avatar_url || "";
  const rating = profile.rating_average ? parseFloat(profile.rating_average) : 0;
  const hasReviews = profile.rating_count > 0;
  const allSkills = profile.expertises?.map((e) => e.expertise_name) ?? [];
  const visibleSkills = allSkills.slice(0, MAX_VISIBLE_SKILLS);
  const overflow = allSkills.length - visibleSkills.length;

  return (
    <Link href={`/find-freelancer/${profile.id}`} className={css({ textDecoration: "none" })}>
      <div className={cx(k.shell, card)}>
        {/* Header: avatar + identity */}
        <div className={header}>
          {avatarUrl
            // eslint-disable-next-line @next/next/no-img-element -- remote avatar
            ? <img src={avatarUrl} alt="" className={k.avatarImg} />
            : <span className={k.avatarFallback}>{k.initials(name)}</span>}
          <div className={css({ flex: 1, minW: 0, pt: "1px" })}>
            <div className={cx(k.name, css({ mb: "2px" }))}>{name}</div>
            <div className={tagline}>{profile.tagline || ""}</div>
            {profile.location && (
              <div className={cx(k.row, css({ gap: "4px", color: "ink3" }))}>
                <MapPin size={13} />
                <span className={k.muted}>{profile.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Rating row */}
        <div className={ratingRow}>
          {hasReviews ? (
            <>
              <span className={k.starRow}>
                <Star size={14} fill="currentColor" strokeWidth={0} />
                <span className={k.ratingValue}>{rating.toFixed(1)}</span>
                <span className={k.muted}>({profile.rating_count})</span>
              </span>
              <span className={k.dot} />
              <span className={k.secondary}>
                {profile.completed_orders_count} {profile.completed_orders_count === 1 ? "order" : "orders"} completed
              </span>
            </>
          ) : (
            <span className={cx(k.row, css({ gap: "8px" }))}>
              <span className={k.newPill}>New</span>
              <span className={k.muted}>No reviews yet</span>
            </span>
          )}
        </div>

        {/* Skills — clamped to one row */}
        <div className={skills}>
          {visibleSkills.map((s) => <span key={s} className={cx(k.skill, skillChip)}>{s}</span>)}
          {overflow > 0 && <span className={overflowCss}>+{overflow}</span>}
        </div>

        {/* Footer button */}
        <div className={css({ mt: "16px" })}>
          <span className={cx("view-btn", k.viewBtn, css({ w: "100%", boxSizing: "border-box" }))}>
            View profile
            <ArrowRight size={14} />
          </span>
        </div>
      </div>
    </Link>
  );
}
