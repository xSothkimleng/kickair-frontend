import type { Notification } from "@/types/notification";
import { getNotificationRoute } from "@/components/notifications/shared";

/**
 * Where an admin notification opens inside the console. Admin alert types are
 * routed to the queue they belong to; anything else falls back to the shared
 * user-facing routing. The `data.link` the API stores is ignored on purpose:
 * older notifications carry paths from the previous admin panel.
 */
export function adminNotificationRoute(n: Notification): string {
  switch (n.type) {
    case "admin_kyc_pending":
      return "/admin/verifications";
    case "admin_service_pending":
      return "/admin/listings";
    case "admin_job_pending":
      return "/admin/listings?kind=job";
    case "admin_dispute_opened":
      return n.data?.dispute_id ? `/admin/disputes/${n.data.dispute_id}` : "/admin/disputes";
    default:
      return getNotificationRoute(n) ?? "/admin/inbox";
  }
}
