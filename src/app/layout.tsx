import type { Metadata } from "next";
import "./globals.css";

import { Geist } from "next/font/google";
import { AuthProvider } from "@/components/context/AuthContext";
import Providers from "./providers";
import { AppToaster } from "@/components/ds/Toast";

export const metadata: Metadata = {
  title: "KickAir",
  description: "Kicking Air Activity Enjoyer",
};

const geist = Geist({
  weight: "400",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' className={geist.className}>
      <body>
        <Providers>
          <AuthProvider>{children}</AuthProvider>
          <AppToaster />
        </Providers>
      </body>
    </html>
  );
}
