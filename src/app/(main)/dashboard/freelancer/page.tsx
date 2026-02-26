"use client";
import { useState } from "react";
import { Box, Container } from "@mui/material";
import DashboardHeader from "@/components/layout/dashboard/DashboardHeader";
import DashboardTabs from "@/components/layout/dashboard/DashboardTabs";
import DashboardContent from "./DashboardContent";
import ProfileContent from "./ProfileContent";
import ServicesContent from "./ServicesContent";
import OrdersContent from "./OrdersContent";
import FinanceContent from "./FinanceContent";
import MessagesContent from "./MessagesContent";
import LevelContent from "./LevelContent";

export type Tab = "dashboard" | "profile" | "services" | "orders" | "finance" | "messages" | "level";

const tabs: { value: string; label: string }[] = [
  { value: "dashboard", label: "Dashboard" },
  { value: "profile", label: "Profile" },
  { value: "services", label: "My Services" },
  { value: "orders", label: "Orders" },
  { value: "finance", label: "Finance" },
  { value: "messages", label: "Messages" },
  { value: "level", label: "Level" },
];

export default function FreelancerSpacePage() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#F5F5F7" }}>
      <DashboardHeader title='Freelancer Space' description='Manage your profile, services, and earnings' />
      {/* @ts-expect-error type unknown */}
      <DashboardTabs activeTab={activeTab} onTabChange={setActiveTab} tabs={tabs} />
      <Container maxWidth='lg' sx={{ px: 3, py: 4 }}>
        {activeTab === "dashboard" && <DashboardContent />}
        {activeTab === "profile" && <ProfileContent />}
        {activeTab === "services" && <ServicesContent />}
        {activeTab === "orders" && <OrdersContent />}
        {activeTab === "finance" && <FinanceContent />}
        {activeTab === "messages" && <MessagesContent />}
        {activeTab === "level" && <LevelContent />}
      </Container>
    </Box>
  );
}
