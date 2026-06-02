import Footer from "@/components/layout/main/Footer";
import Navbar from "@/components/layout/main/navbar";
import GlobalNotificationToast from "@/components/layout/GlobalNotificationToast";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <Navbar />
      <GlobalNotificationToast />
      {children}
      <Footer />
    </div>
  );
}
