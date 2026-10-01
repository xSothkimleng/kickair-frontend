import { toast } from "@/components/ds";

/**
 * Shares the current page: the device's own share sheet on phones and tablets,
 * otherwise the link is copied and a toast says so.
 */
export async function sharePage(title: string): Promise<void> {
  const url = window.location.href;

  // The share sheet belongs on touch devices; on a computer copying the link is what people expect.
  const onTouchDevice = window.matchMedia("(pointer: coarse)").matches;

  if (onTouchDevice && typeof navigator.share === "function") {
    try {
      await navigator.share({ title, url });
    } catch {
      // The visitor closed the share sheet; nothing to report.
    }
    return;
  }

  if (await copyText(url)) {
    toast.success("Link copied");
  } else {
    toast.error("Could not copy the link. Copy it from the address bar instead.");
  }
}

// The clipboard API needs a secure page and permission; the selection-based copy is
// the fallback for browsers or settings where it is refused.
async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const field = document.createElement("textarea");
    field.value = text;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.appendChild(field);
    field.select();
    let copied = false;
    try {
      copied = document.execCommand("copy");
    } catch {
      copied = false;
    }
    field.remove();
    return copied;
  }
}
