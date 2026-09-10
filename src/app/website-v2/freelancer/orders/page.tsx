"use client";

import AppShell from "../../components/AppShell";
import OrdersList from "../../components/OrdersList";
import { FREELANCER_ORDERS } from "../../components/orders";
import { FREELANCER } from "../../components/spaces";

export default function FreelancerOrdersPage() {
  return (
    <AppShell {...FREELANCER} activeTab="Orders">
      <OrdersList role="freelancer" orders={FREELANCER_ORDERS} basePath="/website-v2/freelancer/orders" />
    </AppShell>
  );
}
