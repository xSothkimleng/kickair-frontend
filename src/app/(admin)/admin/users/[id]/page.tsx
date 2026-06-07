"use client";

import { useParams } from "next/navigation";
import UserDetailPage from "@/components/admin/users/UserDetailPage";

export default function AdminUserDetailRoute() {
  const params = useParams();
  return <UserDetailPage userId={Number(params.id)} />;
}
