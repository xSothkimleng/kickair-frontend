import type { Metadata } from "next";
import "./globals.css";

import { Inter, Kantumruy_Pro } from "next/font/google";
import { AuthProvider } from "@/components/context/AuthContext";
import Providers from "./providers";
import { AppToaster } from "@/components/ds/Toast";

export const metadata: Metadata = {
  title: "KickAir",
  description: "Kicking Air Activity Enjoyer",
};

// The site font. One family for everything, including numbers (tabular figures
// come from `fontVariantNumeric`, not from a second face). To swap it, change
// the import and the constructor here; the CSS variable name stays the same.
const sans = Inter({
  subsets: ["latin"],
  weight: "variable",
  axes: ["opsz"],
  variable: "--font-sans",
  display: "swap",
});

// Khmer fallback: any Khmer text (names, listings, messages) renders in this
// instead of whatever Khmer font the device happens to have.
const khmer = Kantumruy_Pro({
  subsets: ["khmer"],
  weight: "variable",
  variable: "--font-khmer",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' className={`${sans.variable} ${khmer.variable}`}>
      <body>
        <Providers>
          <AuthProvider>{children}</AuthProvider>
          <AppToaster />
        </Providers>
      </body>
    </html>
  );
}
