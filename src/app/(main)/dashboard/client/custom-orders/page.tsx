import { redirect } from "next/navigation";

// Custom orders now render inline as a tab in the Client Space so the dashboard
// chrome (header + tabs) stays visible. This route only exists for old links.
export default function ClientCustomOrdersPage() {
  redirect("/dashboard/client?tab=custom-orders");
}
