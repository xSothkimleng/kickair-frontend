import { notFound } from "next/navigation";
import AppShell from "../../../components/AppShell";
import OrderDetail from "../../../components/OrderDetail";
import { findOrder } from "../../../components/orders";
import { CLIENT } from "../../../components/spaces";

export default async function ClientOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = findOrder("client", id);
  if (!order) notFound();

  return (
    <AppShell {...CLIENT} activeTab="Orders">
      <OrderDetail role="client" order={order} backHref="/website-v2/client/orders" />
    </AppShell>
  );
}
