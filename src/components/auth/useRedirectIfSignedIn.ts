"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/context/AuthContext";

/**
 * Sends someone who is already signed in away from the sign-in / sign-up forms.
 * It only looks once, at the moment the session check finishes: a sign-in made on
 * the page itself is routed by that page (role-based landing, `?redirect=`).
 */
export function useRedirectIfSignedIn(redirectTo: string | null) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const checked = useRef(false);

  useEffect(() => {
    if (loading || checked.current) return;
    checked.current = true;
    if (!user) return;
    router.replace(redirectTo ?? (user.is_admin ? "/admin" : user.is_freelancer && !user.is_client ? "/dashboard/freelancer" : "/dashboard/client"));
  }, [loading, user, redirectTo, router]);
}
