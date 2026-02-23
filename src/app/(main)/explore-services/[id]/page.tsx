import { ServiceDetailPage } from "@/components/service/ServiceDetailPage";

interface DetailServicePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function DetailServicesPage({ params }: DetailServicePageProps) {
  const { id } = await params;

  // Convert id to number if needed
  const serviceId = Number(id);

  return <ServiceDetailPage serviceId={serviceId} />;
}
