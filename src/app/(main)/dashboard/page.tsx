"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/context/AuthContext";

/**
 * /dashboard has no page of its own: it sends each person to their space. Someone who
 * only sells goes to the Freelancer Space, everyone else to the Client Space.
 */
export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    router.replace(user.is_admin ? "/admin" : user.is_freelancer && !user.is_client ? "/dashboard/freelancer" : "/dashboard/client");
  }, [user, router]);

  return null;
}
