"use client";
import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { css } from "styled-system/css";
import { Container } from "styled-system/jsx";
import DashboardHeader from "@/components/layout/dashboard/DashboardHeader";
import DashboardTabs from "@/components/layout/dashboard/DashboardTabs";
import DashboardContent from "./DsahboardContent";
import ProfileContent from "./ProfileContent";
import PostProjectContent from "./PostServiceContent";
import FinanceContent from "./FinanceContent";
import OrdersContent from "./OrdersContent";
import KycBanner from "@/components/dashboard/KycBanner";

export type Tab = "dashboard" | "profile" | "service" | "orders" | "finance";

const tabs: { value: string; label: string }[] = [
  { value: "dashboard", label: "Dashboard" },
  { value: "profile",   label: "Profile" },
  { value: "orders",    label: "Orders" },
  { value: "service",   label: "Jobs" },
  { value: "finance",   label: "Finance" },
];

const VALID_TABS = tabs.map(t => t.value);

// Custom orders merged into Orders — honor old links.
const resolveTab = (raw: string | null): Tab => {
  if (raw === "custom-orders") return "orders";
  return raw && VALID_TABS.includes(raw) ? (raw as Tab) : "dashboard";
};

const pageCss = css({ minH: "100vh", bg: "page" });

function ClientSpace() {
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
    <div className={pageCss}>
      <DashboardHeader title='Client Space' description='Manage your projects, orders, and freelancers' />
      {/* @ts-expect-error type unknown */}
      <DashboardTabs activeTab={activeTab} onTabChange={handleTabChange} tabs={tabs} />
      <Container maxW="1200px" px="24px" py="32px" boxSizing="border-box">
        <KycBanner />
        {activeTab === "dashboard" && <DashboardContent onTabChange={handleTabChange} />}
        {activeTab === "profile"   && <ProfileContent />}
        {activeTab === "orders"    && <OrdersContent />}
        {activeTab === "service"   && <PostProjectContent />}
        {activeTab === "finance"   && <FinanceContent />}
      </Container>
    </div>
  );
}

export default function ClientSpacePage() {
  return (
    <Suspense fallback={<div className={pageCss} />}>
      <ClientSpace />
    </Suspense>
  );
}
