"use client";

import Link from "next/link";
import { ArrowRight, MapPin, Star } from "lucide-react";
import { css, cx } from "styled-system/css";
import { FreelancerProfile } from "@/types/user";
import * as k from "./freelancerCardKit";

const MAX_VISIBLE_SKILLS = 4;

const card = css({ gap: "16px", p: "16px" });
const topRow = css({ display: "flex", alignItems: "center", gap: "12px", mb: "4px" });
const tagline = css({ fontSize: "13px", color: "ink2", lineHeight: 1.4, mb: "8px", lineClamp: 1 });
const metaRow = css({ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" });
const skillsRow = css({ display: "flex", alignItems: "center", gap: "6px", flexWrap: "nowrap", overflow: "hidden" });
const skillChip = css({ h: "22px", px: "8px", fontSize: "11px" });

interface FreelancerListCardProps {
  profile: FreelancerProfile;
}

export function FreelancerListCard({ profile }: FreelancerListCardProps) {
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
        {/* Avatar */}
        <div className={css({ flexShrink: 0, pt: "2px" })}>
          {avatarUrl
            // eslint-disable-next-line @next/next/no-img-element -- remote avatar
            ? <img src={avatarUrl} alt="" className={k.avatarImg} />
            : <span className={k.avatarFallback}>{k.initials(name)}</span>}
        </div>

        {/* Main content */}
        <div className={css({ flex: 1, minW: 0 })}>
          <div className={topRow}>
            <span className={k.name}>{name}</span>
            {profile.location && (
              <span className={cx(k.row, css({ gap: "4px", color: "ink3" }))}>
                <MapPin size={13} />
                <span className={k.muted}>{profile.location}</span>
              </span>
            )}
          </div>

          {profile.tagline && <div className={tagline}>{profile.tagline}</div>}

          <div className={metaRow}>
            {hasReviews ? (
              <span className={cx(k.row, css({ gap: "4px" }))}>
                <span className={k.starRow}>
                  <Star size={13} fill="currentColor" strokeWidth={0} />
                  <span className={k.ratingValue}>{rating.toFixed(1)}</span>
                </span>
                <span className={k.muted}>({profile.rating_count})</span>
                <span className={cx(k.dot, css({ mx: "2px" }))} />
                <span className={k.secondary}>
                  {profile.completed_orders_count} {profile.completed_orders_count === 1 ? "order" : "orders"}
                </span>
              </span>
            ) : (
              <span className={cx(k.row, css({ gap: "6px" }))}>
                <span className={k.newPill}>New</span>
                <span className={k.muted}>No reviews yet</span>
              </span>
            )}

            {visibleSkills.length > 0 && (
              <>
                <span className={k.dot} />
                <span className={skillsRow}>
                  {visibleSkills.map((s) => <span key={s} className={cx(k.skill, skillChip)}>{s}</span>)}
                  {overflow > 0 && <span className={cx(k.muted, css({ fontWeight: 500 }))}>+{overflow}</span>}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Right: View profile button */}
        <div className={css({ flexShrink: 0, display: "flex", alignItems: "center" })}>
          <span className={cx("view-btn", k.viewBtn)}>
            View profile
            <ArrowRight size={14} />
          </span>
        </div>
      </div>
    </Link>
  );
}
