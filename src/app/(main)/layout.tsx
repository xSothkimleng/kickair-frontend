"use client";
import Footer from "@/components/layout/main/Footer";
import Navbar from "@/components/layout/main/Navbar";
import { User } from "@/types/user";
import { useState } from "react";

const mockUserLoggedIn: User = {
  isLoggedIn: true,
  name: "Lim Souvith",
  profilePicture: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
  currentMode: "freelancer",
  hasFreelancerProfile: true,
  hasClientProfile: true,
};

const mockUserLoggedOut: User = {
  isLoggedIn: false,
  name: "",
  profilePicture: "",
  currentMode: "client",
  hasFreelancerProfile: false,
  hasClientProfile: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [currentUser, setCurrentUser] = useState<User>(mockUserLoggedIn);
  const handleSwitchMode = (mode: "freelancer" | "client") => {
    setCurrentUser(prev => ({ ...prev, currentMode: mode }));
  };

  const handleLogout = () => {
    setCurrentUser(mockUserLoggedOut);
  };
  return (
    <div>
      <Navbar user={currentUser} onSwitchMode={handleSwitchMode} onLogout={handleLogout} />
      {children}
      <Footer />
    </div>
  );
}
