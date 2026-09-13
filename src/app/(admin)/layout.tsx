import type { Metadata } from "next";
import Shell from "@/components/admin/Shell";

export const metadata: Metadata = { title: "KickAir Admin" };

// Every /admin page renders inside the console shell, which owns the admin-only
// guard (redirects non-admins to /admin/login) and the realtime bridge. The
// console uses the site font and text styles from the root layout.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <Shell>{children}</Shell>;
}
