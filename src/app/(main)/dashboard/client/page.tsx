"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, Container } from "@mui/material";
import DashboardHeader from "@/components/layout/dashboard/DashboardHeader";
import DashboardTabs from "@/components/layout/dashboard/DashboardTabs";
import DashboardContent from "./DsahboardContent";
import ProfileContent from "./ProfileContent";
import PostProjectContent from "./PostServiceContent";
import FinanceContent from "./FinanceContent";
import OrdersContent from "./OrdersContent";
import CustomOrdersContent from "./CustomOrdersContent";
import KycBanner from "@/components/dashboard/KycBanner";

export type Tab = "dashboard" | "profile" | "service" | "orders" | "finance" | "custom-orders";

const tabs: { value: string; label: string }[] = [
  { value: "dashboard", label: "Dashboard" },
  { value: "profile",   label: "Profile" },
  { value: "orders",    label: "Orders" },
  { value: "custom-orders", label: "Custom Orders" },
  { value: "service",   label: "Jobs" },
  { value: "finance",   label: "Finance" },
];

const VALID_TABS = tabs.map(t => t.value);

export default function ClientSpacePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  useEffect(() => {
    const tab = new URLSearchParams(window.location.search).get("tab");
    if (tab && VALID_TABS.includes(tab)) setActiveTab(tab as Tab);
  }, []);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    router.replace(`?tab=${tab}`, { scroll: false });
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#F5F5F7" }}>
      <DashboardHeader title='Client Space' description='Manage your projects, orders, and freelancers' />
      {/* @ts-expect-error type unknown */}
      <DashboardTabs activeTab={activeTab} onTabChange={handleTabChange} tabs={tabs} />
      <Container sx={{ px: 3, py: 4 }}>
        <KycBanner />
        {activeTab === "dashboard" && <DashboardContent onTabChange={handleTabChange} />}
        {activeTab === "profile"   && <ProfileContent />}
        {activeTab === "orders"    && <OrdersContent />}
        {activeTab === "custom-orders" && <CustomOrdersContent />}
        {activeTab === "service"   && <PostProjectContent />}
        {activeTab === "finance"   && <FinanceContent />}
      </Container>
    </Box>
  );
}
