"use client";
import { useState } from "react";
import { Box, Container } from "@mui/material";
import DashboardHeader from "@/components/layout/dashboard/DashboardHeader";
import DashboardTabs from "@/components/layout/dashboard/DashboardTabs";
import DashboardContent from "./DsahboardContent";
import ProfileContent from "./ProfileContent";
import PostProjectContent from "./PostServiceContent";
import FinanceContent from "./FinanceContent";
import MessagesContent from "./MessagesContent";
import OrdersContent from "./OrdersContent";

export type Tab = "dashboard" | "profile" | "service" | "orders" | "finance" | "messages";

const tabs: { value: string; label: string }[] = [
  { value: "dashboard", label: "Dashboard" },
  { value: "profile", label: "Profile" },
  { value: "orders", label: "Orders" },
  { value: "service", label: "Post a Service" },
  { value: "finance", label: "Finance" },
  { value: "messages", label: "Messages" },
];

export default function ClientSpacePage() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#F5F5F7" }}>
      <DashboardHeader title='Client Space' description='Manage your projects, orders, and freelancers' />
      {/* @ts-expect-error type unknown */}
      <DashboardTabs activeTab={activeTab} onTabChange={setActiveTab} tabs={tabs} />
      <Container sx={{ px: 3, py: 4 }}>
        {activeTab === "dashboard" && <DashboardContent />}
        {activeTab === "profile" && <ProfileContent />}
        {activeTab === "orders" && <OrdersContent />}
        {activeTab === "service" && <PostProjectContent />}
        {activeTab === "finance" && <FinanceContent />}
        {activeTab === "messages" && <MessagesContent />}
      </Container>
    </Box>
  );
}
