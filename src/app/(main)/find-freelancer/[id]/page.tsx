"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { css } from "styled-system/css";
import { Spinner } from "@/components/ds";
import { api } from "@/lib/api";
import { FreelancerProfile } from "@/types/user";
import { FreelancerProfilePage } from "@/components/ui/freelancerProfilePage";

const screen = css({
  minH: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  bg: "#F5F5F7",
});
const spinnerAccent = css({ color: "#0071e3" });
const errorBox = css({ textAlign: "center" });
// The Typography's `mb` never applied (globals.css `p { margin: 0 }` is unlayered).
const errorText = css({ textStyle: "body", color: "ink2" });
const backLink = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  px: "32px",
  h: "40px",
  minW: "64px",
  textStyle: "ui",
  fontWeight: 500,
  bg: "#0071e3",
  // globals.css sets an unlayered `a { color: inherit }`, which beats utilities.
  color: "white !important",
  borderRadius: "100px",
  border: "none",
  cursor: "pointer",
  textDecoration: "none",
  boxSizing: "border-box",
  _hover: { bg: "#0077ED" },
  _focusVisible: { outline: "none", boxShadow: "focusRing" },
});

export default function FreelancerProfileRoute() {
  const params = useParams();
  const id = Number(params.id);

  const [profile, setProfile] = useState<FreelancerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getFreelancerProfile(id);
        setProfile(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [id]);

  if (loading) {
    return (
      <div className={screen}>
        <Spinner size={40} className={spinnerAccent} />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className={screen}>
        <div className={errorBox}>
          <p className={errorText}>{error || "Freelancer not found"}</p>
          <Link href="/find-freelancer" className={backLink}>
            Back to Freelancers
          </Link>
        </div>
      </div>
    );
  }

  return <FreelancerProfilePage profile={profile} />;
}
