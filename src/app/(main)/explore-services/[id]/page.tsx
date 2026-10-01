import { notFound } from "next/navigation";
import { ServiceDetailPage } from "@/components/service/ServiceDetailPage";

interface DetailServicePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function DetailServicesPage({ params }: DetailServicePageProps) {
  const { id } = await params;

  // Anything that is not a whole number cannot be a service: answer with the 404 page
  // instead of a spinner that never ends.
  if (!/^\d+$/.test(id)) notFound();
  const serviceId = Number(id);

  return <ServiceDetailPage serviceId={serviceId} />;
}
