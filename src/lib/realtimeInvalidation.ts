import { QueryClient } from "@tanstack/react-query";
import { qk } from "./queryKeys";

/**
 * Map an incoming realtime notification to the query families it should refresh.
 *
 * This is the heart of "the page updates live when someone else acts": the server already
 * pushes a notification (with its `type`) onto the recipient's user channel, so when it
 * arrives we invalidate the matching queries and React Query refetches them — no reload.
 */
const ORDER_TYPES = new Set([
  "order_placed",
  "order_accepted",
  "order_completed",
  "order_cancelled",
  "work_delivered",
  "revision_requested",
  "payment_released",
  "dispute_opened",
  "dispute_resolved",
  "evidence_submitted",
  "review_received",
]);

export function invalidateForNotification(queryClient: QueryClient, type?: string | null): void {
  if (!type) return;

  if (ORDER_TYPES.has(type)) {
    // Anything order-shaped touches the order lists/details, the wallet, and both dashboards.
    queryClient.invalidateQueries({ queryKey: qk.orders.all() });
    queryClient.invalidateQueries({ queryKey: qk.wallet() });
    queryClient.invalidateQueries({ queryKey: qk.dashboard.client() });
    queryClient.invalidateQueries({ queryKey: qk.dashboard.freelancer() });
    if (type.startsWith("dispute")) {
      queryClient.invalidateQueries({ queryKey: qk.disputes.all() });
    }
    return;
  }

  if (type.startsWith("proposal")) {
    queryClient.invalidateQueries({ queryKey: qk.proposals.all() });
    queryClient.invalidateQueries({ queryKey: qk.orders.all() });
    return;
  }

  if (type === "service_approved" || type === "service_rejected" || type === "service_disabled") {
    queryClient.invalidateQueries({ queryKey: qk.services.all() });
    return;
  }

  if (type === "job_approved" || type === "job_rejected") {
    queryClient.invalidateQueries({ queryKey: qk.jobs.all() });
    return;
  }
}
