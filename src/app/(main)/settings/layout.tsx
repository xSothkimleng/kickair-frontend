import { RequireAuth } from "@/components/auth/RequireAuth";

export default function SettingsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <RequireAuth>{children}</RequireAuth>;
}
