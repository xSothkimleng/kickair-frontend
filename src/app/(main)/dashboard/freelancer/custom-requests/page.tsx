import { redirect } from "next/navigation";

// Custom requests now render inline as a tab in the Freelancer Space so the
// dashboard chrome (header + tabs) stays visible. This route only exists for old links.
export default function FreelancerCustomRequestsPage() {
  redirect("/dashboard/freelancer?tab=custom-requests");
}
