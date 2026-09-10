import { notFound } from "next/navigation";
import AppShell from "../../../components/AppShell";
import OrderDetail from "../../../components/OrderDetail";
import { findOrder } from "../../../components/orders";
import { FREELANCER } from "../../../components/spaces";

export default async function FreelancerOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = findOrder("freelancer", id);
  if (!order) notFound();

  return (
    <AppShell {...FREELANCER} activeTab="Orders">
      <OrderDetail role="freelancer" order={order} backHref="/website-v2/freelancer/orders" />
    </AppShell>
  );
}
