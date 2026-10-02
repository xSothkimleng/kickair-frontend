import OrderDetailPage from "@/components/admin/OrderDetailPage";
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OrderDetailPage id={Number(id)} />;
}
