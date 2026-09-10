import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import { ThemeProvider } from "@mui/material/styles";
import type { Metadata } from "next";
import theme from "@/theme";
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
  weight: ["400", "500", "600", "700"],
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
        <AppRouterCacheProvider options={{ key: "css", enableCssLayer: true }}>
          <ThemeProvider theme={theme}>
            <Providers>
              <AuthProvider>{children}</AuthProvider>
              <AppToaster />
            </Providers>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
