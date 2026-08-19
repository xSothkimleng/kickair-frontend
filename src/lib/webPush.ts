import { api } from "@/lib/api";

/**
 * Browser (web push) notification helpers — built on the native Push API,
 * no npm dependencies. Pairs with public/sw.js and the Laravel
 * laravel-notification-channels/webpush backend.
 */

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

// Set when the user explicitly turns browser notifications off in the UI while the
// browser permission stays "granted" — stops ensureSubscribed() from re-enabling them.
const OPT_OUT_KEY = "push_opted_out";

export function isSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export function getPermission(): NotificationPermission | null {
  return isSupported() ? Notification.permission : null;
}

/** Web push VAPID keys are URL-safe base64; PushManager wants raw bytes. */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
  return output;
}

async function getRegistration(): Promise<ServiceWorkerRegistration> {
  const registration = await navigator.serviceWorker.register("/sw.js");
  await navigator.serviceWorker.ready;
  return registration;
}

async function subscribeAndSync(registration: ServiceWorkerRegistration): Promise<void> {
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY).buffer as ArrayBuffer,
  });

  const json = subscription.toJSON();
  if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
    throw new Error("Browser returned an incomplete push subscription");
  }

  await api.storePushSubscription({
    endpoint: json.endpoint,
    keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
  });
}

/** Returns whether this browser currently holds an active push subscription. */
export async function isSubscribed(): Promise<boolean> {
  if (!isSupported() || Notification.permission !== "granted") return false;
  const registration = await navigator.serviceWorker.getRegistration("/sw.js");
  if (!registration) return false;
  const subscription = await registration.pushManager.getSubscription();
  return !!subscription;
}

/**
 * Ask for permission (if needed), subscribe this browser, and register the
 * subscription with the API. Returns true when notifications are enabled.
 */
export async function subscribe(): Promise<boolean> {
  if (!isSupported() || !VAPID_PUBLIC_KEY) return false;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return false;

  const registration = await getRegistration();
  await subscribeAndSync(registration);
  try {
    localStorage.removeItem(OPT_OUT_KEY);
  } catch {}
  return true;
}

/** Unsubscribe this browser and remove the subscription from the API. */
export async function unsubscribe(): Promise<void> {
  if (!isSupported()) return;

  const registration = await navigator.serviceWorker.getRegistration("/sw.js");
  const subscription = await registration?.pushManager.getSubscription();

  if (subscription) {
    try {
      await api.deletePushSubscription(subscription.endpoint);
    } catch {
      // Server cleanup is best-effort; still detach the browser subscription.
    }
    await subscription.unsubscribe();
  }

  try {
    localStorage.setItem(OPT_OUT_KEY, "1");
  } catch {}
}

/**
 * Silent keep-alive: when the user already granted permission (and hasn't opted
 * out in the UI), re-register the service worker and re-post the subscription so
 * the backend always holds a fresh endpoint. Safe to fire-and-forget on app load.
 */
export async function ensureSubscribed(): Promise<void> {
  if (!isSupported() || !VAPID_PUBLIC_KEY) return;
  if (Notification.permission !== "granted") return;

  try {
    if (localStorage.getItem(OPT_OUT_KEY) === "1") return;
  } catch {}

  const registration = await getRegistration();
  await subscribeAndSync(registration);
}
