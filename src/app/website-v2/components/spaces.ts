import type { Tab } from "./AppShell";

/**
 * Tab strips for the two spaces — the same set the live site uses, so nobody has
 * to relearn where anything lives (§16 Familiarity).
 */
export const CLIENT = {
  title: "Client Space",
  subtitle: "Manage your orders, requests, and payments",
  user: "Nita Sar",
  balance: 2000,
  tabs: [
    { label: "Dashboard", href: "/website-v2/client" },
    { label: "Profile" },
    { label: "Orders", href: "/website-v2/client/orders" },
    { label: "Requests" },
    { label: "Finance" },
    { label: "Messages" },
  ] as Tab[],
};

export const FREELANCER = {
  title: "Freelancer Space",
  subtitle: "Manage your profile, services, and earnings",
  user: "Sokha Chan",
  balance: 2000,
  tabs: [
    { label: "Dashboard", href: "/website-v2/freelancer" },
    { label: "Profile" },
    { label: "My Services" },
    { label: "Orders", href: "/website-v2/freelancer/orders" },
    { label: "Finance" },
    { label: "Level" },
    { label: "Proposals" },
  ] as Tab[],
};
