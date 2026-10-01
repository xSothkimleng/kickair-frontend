import { RequireAuth } from "@/components/auth/RequireAuth";

export default function NotificationsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <RequireAuth>{children}</RequireAuth>;
}
