"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, Container } from "@mui/material";
import DashboardHeader from "@/components/layout/dashboard/DashboardHeader";
import DashboardTabs from "@/components/layout/dashboard/DashboardTabs";
import DashboardContent from "./DashboardContent";
import ProfileContent from "./ProfileContent";
import ServicesContent from "./ServicesContent";
import OrdersContent from "./OrdersContent";
import FinanceContent from "./FinanceContent";
import LevelContent from "./LevelContent";
import ProposalsContent from "./ProposalsContent";
import CustomRequestsInbox from "@/components/customOrders/CustomRequestsInbox";
import KycBanner from "@/components/dashboard/KycBanner";

export type Tab = "dashboard" | "profile" | "services" | "orders" | "finance" | "level" | "proposals" | "custom-requests";

const tabs: { value: string; label: string }[] = [
  { value: "dashboard",  label: "Dashboard" },
  { value: "profile",    label: "Profile" },
  { value: "services",   label: "My Services" },
  { value: "orders",     label: "Orders" },
  { value: "custom-requests", label: "Custom Requests" },
  { value: "finance",    label: "Finance" },
  { value: "level",      label: "Level" },
  { value: "proposals",  label: "Proposals" },
];

const VALID_TABS = tabs.map(t => t.value);

export default function FreelancerSpacePage() {
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
      <DashboardHeader title='Freelancer Space' description='Manage your profile, services, and earnings' />
      {/* @ts-expect-error type unknown */}
      <DashboardTabs activeTab={activeTab} onTabChange={handleTabChange} tabs={tabs} />
      <Container maxWidth='lg' sx={{ px: 3, py: 4 }}>
        <KycBanner />
        {activeTab === "dashboard"  && <DashboardContent onTabChange={handleTabChange} />}
        {activeTab === "profile"    && <ProfileContent />}
        {activeTab === "services"   && <ServicesContent />}
        {activeTab === "orders"     && <OrdersContent />}
        {activeTab === "custom-requests" && <CustomRequestsInbox />}
        {activeTab === "finance"    && <FinanceContent />}
        {activeTab === "level"      && <LevelContent />}
        {activeTab === "proposals"  && <ProposalsContent />}
      </Container>
    </Box>
  );
}
