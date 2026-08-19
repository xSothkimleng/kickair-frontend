import { api } from "@/lib/api";

/**
 * Downloads a delivered-order attachment through the authenticated API
 * endpoint (a plain <a href> can't send the bearer token, and cross-origin
 * `download` attributes are ignored by browsers).
 */
export async function downloadOrderAttachment(orderId: number, fileUrl: string, fileName: string): Promise<void> {
  const blob = await api.downloadOrderAttachment(orderId, fileUrl);
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
}
