import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Shell from "@/components/admin/Shell";

export const metadata: Metadata = { title: "KickAir Admin" };

const sans = Geist({ subsets: ["latin"], weight: "variable", variable: "--td-font" });
const mono = Geist_Mono({ subsets: ["latin"], weight: "variable", variable: "--td-mono" });

// Every /admin page renders inside the console shell, which owns the admin-only
// guard (redirects non-admins to /admin/login) and the realtime bridge.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <Shell fontClass={`${sans.variable} ${mono.variable}`}>{children}</Shell>;
}
