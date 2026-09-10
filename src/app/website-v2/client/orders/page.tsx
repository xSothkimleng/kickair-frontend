"use client";

import AppShell from "../../components/AppShell";
import OrdersList from "../../components/OrdersList";
import { CLIENT_ORDERS } from "../../components/orders";
import { CLIENT } from "../../components/spaces";

export default function ClientOrdersPage() {
  return (
    <AppShell {...CLIENT} activeTab="Orders">
      <OrdersList role="client" orders={CLIENT_ORDERS} basePath="/website-v2/client/orders" />
    </AppShell>
  );
}
