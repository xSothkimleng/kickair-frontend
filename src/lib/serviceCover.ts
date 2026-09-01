import { Service } from "@/types/service";

/**
 * Cover image for a service card: the chosen feature image, else the first
 * image-type media. Never returns a PDF/video URL — feeding those to an <img>
 * fails and left cards showing "No image" even when the service had pictures.
 */
export function serviceCoverUrl(service: Pick<Service, "feature_image" | "media">): string | null {
  return (
    service.feature_image?.file_url ??
    service.media?.find(m => m.file_type === "image")?.file_url ??
    null
  );
}
