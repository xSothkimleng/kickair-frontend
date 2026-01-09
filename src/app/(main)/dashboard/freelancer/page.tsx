"use client";
import { useState } from "react";
import { Box } from "@mui/material";
import FreelancerHeader from "@/components/layout/dashboard/freelancerDashboard/FreelancerHeader";
import FreelancerTabs from "@/components/layout/dashboard/freelancerDashboard/FreelancerTabs";
import DashboardContent from "./DashboardContent";
import ProfileContent from "./ProfileContent";
import ServicesContent from "./ServicesContent";
import FinanceContent from "./FinanceContent";
import MessagesContent from "./MessagesContent";
import LevelContent from "./LevelContent";

export type Tab = "dashboard" | "profile" | "services" | "finance" | "messages" | "level";

export default function FreelancerSpacePage() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#F5F5F7" }}>
      <FreelancerHeader />
      {/* @ts-expect-error type unknown */}
      <FreelancerTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <Box sx={{ maxWidth: 1440, mx: "auto", px: 3, py: 4 }}>
        {activeTab === "dashboard" && <DashboardContent />}
        {activeTab === "profile" && <ProfileContent />}
        {activeTab === "services" && <ServicesContent />}
        {activeTab === "finance" && <FinanceContent />}
        {activeTab === "messages" && <MessagesContent />}
        {activeTab === "level" && <LevelContent />}
      </Box>
    </Box>
  );
}
