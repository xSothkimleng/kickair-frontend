"use client";
import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import KycBanner from "@/components/dashboard/KycBanner";

export type Tab = "dashboard" | "profile" | "services" | "orders" | "finance" | "level" | "proposals";

const tabs: { value: string; label: string }[] = [
  { value: "dashboard",  label: "Dashboard" },
  { value: "profile",    label: "Profile" },
  { value: "services",   label: "My Services" },
  { value: "orders",     label: "Orders" },
  { value: "finance",    label: "Finance" },
  { value: "level",      label: "Level" },
  { value: "proposals",  label: "Proposals" },
];

const VALID_TABS = tabs.map(t => t.value);

// Custom requests merged into Orders — honor old links.
const resolveTab = (raw: string | null): Tab => {
  if (raw === "custom-requests") return "orders";
  return raw && VALID_TABS.includes(raw) ? (raw as Tab) : "dashboard";
};

function FreelancerSpace() {
  const router = useRouter();
  const tabParam = useSearchParams().get("tab");
  const [activeTab, setActiveTab] = useState<Tab>(() => resolveTab(tabParam));

  // Follow the URL after mount too: in-app links that only change `?tab=`
  // (notification "View", dashboard shortcuts) must switch tabs while this
  // page is already on screen.
  useEffect(() => {
    setActiveTab(resolveTab(tabParam));
  }, [tabParam]);

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
        {activeTab === "finance"    && <FinanceContent />}
        {activeTab === "level"      && <LevelContent />}
        {activeTab === "proposals"  && <ProposalsContent />}
      </Container>
    </Box>
  );
}

export default function FreelancerSpacePage() {
  return (
    <Suspense fallback={<Box sx={{ minHeight: "100vh", bgcolor: "#F5F5F7" }} />}>
      <FreelancerSpace />
    </Suspense>
  );
}
