"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { css } from "styled-system/css";
import { Spinner } from "@/components/ds";
import { useAuth } from "@/components/context/AuthContext";
import { withRedirect } from "@/lib/redirect";

const waitCss = css({ minH: "60vh", display: "flex", alignItems: "center", justifyContent: "center", color: "accent" });

/**
 * Wraps the pages that only make sense signed in (the spaces, orders, settings,
 * notifications). A signed-out visitor, including someone whose session expired or
 * who pressed Back after logging out, is sent to sign-in and brought back afterwards.
 * Without it those pages rendered half-empty with a raw "Unauthenticated." from the API.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading, emailVerificationPending } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  // An account waiting for email verification has no `user` yet; the provider shows its own wall.
  const signedOut = !loading && !user && !emailVerificationPending;

  useEffect(() => {
    if (signedOut) router.replace(withRedirect("/auth/sign-in", `${pathname}${window.location.search}`));
  }, [signedOut, pathname, router]);

  if (loading || signedOut) {
    return (
      <div className={waitCss}>
        <Spinner size={32} />
      </div>
    );
  }

  return <>{children}</>;
}
