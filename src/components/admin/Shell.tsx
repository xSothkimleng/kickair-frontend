"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { css, cx } from "styled-system/css";
import { Bell, ExternalLink, LayoutGrid, LogOut, Scale, Search, ShieldCheck, Store, Tags, Users, Wallet, Inbox } from "lucide-react";
import { useAuth } from "@/components/context/AuthContext";
import GlobalNotificationToast, { registerAdminRefresh, registerBellRefresh } from "@/components/layout/GlobalNotificationToast";
import { api } from "@/lib/api";
import { qk } from "@/lib/queryKeys";
import { ToastProvider } from "./toast";
import { useAdminStats, useNotifications, useUnreadCount } from "./queries";
import { adminNotificationRoute } from "./notify";
import { Avatar, IconBtn, Loading, keyframesCss, row, tdVars, text } from "./ui";
import { ago } from "./format";

const shell = css({ display: "flex", minH: "100vh", bg: "var(--td-canvas)", fontFamily: "var(--td-font)" });
const side = css({
  w: "236px", flexShrink: 0, position: "sticky", top: 0, h: "100vh", display: "flex", flexDirection: "column", px: "12px", py: "14px",
  borderRightWidth: "1px", borderRightStyle: "solid", borderRightColor: "var(--td-line)", bg: "var(--td-canvas)",
});
const brand = css({ display: "flex", alignItems: "center", gap: "10px", px: "8px", h: "40px", mb: "18px" });
const brandMark = css({ w: "28px", h: "28px", borderRadius: "8px", bg: "var(--td-ink)", color: "#fff", display: "grid", placeItems: "center", fontWeight: 700, fontSize: "13px", letterSpacing: "-0.02em" });
const groupLabel = css({ px: "10px", mt: "22px", mb: "6px", fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--td-ink-3)" });
const navItem = css({
  display: "flex", alignItems: "center", gap: "10px", h: "36px", px: "10px", borderRadius: "9px", fontSize: "13.5px", fontWeight: 500, color: "var(--td-ink-2) !important", transition: "background-color .1s, color .1s",
  "& svg": { color: "var(--td-ink-3)" },
  _hover: { bg: "var(--td-hover)", color: "var(--td-ink) !important" },
  "&[data-active=true]": { bg: "var(--td-hover)", color: "var(--td-ink) !important", fontWeight: 600 },
  "&[data-active=true] svg": { color: "var(--td-ink)" },
});
const navCount = css({ ml: "auto", minW: "20px", h: "20px", px: "6px", borderRadius: "999px", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "11.5px", fontWeight: 600, bg: "var(--td-line)", color: "var(--td-ink-2)", fontVariantNumeric: "tabular-nums", "&[data-hot=true]": { bg: "var(--td-ink)", color: "#fff" } });
const main = css({ flex: 1, minW: 0, display: "flex", flexDirection: "column" });
const topbar = css({
  position: "sticky", top: 0, zIndex: 30, h: "56px", display: "flex", alignItems: "center", gap: "12px", px: "24px",
  bg: "rgba(255,255,255,0.85)", backdropFilter: "blur(10px)", borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "var(--td-line)",
});
const searchBox = css({
  display: "flex", alignItems: "center", gap: "8px", h: "34px", w: "320px", px: "10px", borderRadius: "9px", bg: "var(--td-surface)", borderWidth: "1px", borderStyle: "solid", borderColor: "var(--td-line)",
  color: "var(--td-ink-3)", fontSize: "13px", _focusWithin: { borderColor: "var(--td-accent)", boxShadow: "0 0 0 3px var(--td-accent-soft)" },
  "& input": { flex: 1, border: "none", outline: "none", bg: "transparent", fontSize: "13px", color: "var(--td-ink)", minW: 0, _placeholder: { color: "var(--td-ink-3)" } },
});
const bellDot = css({ position: "absolute", top: "7px", right: "7px", w: "7px", h: "7px", borderRadius: "999px", bg: "var(--td-red)", boxShadow: "0 0 0 2px var(--td-canvas)" });
const menuCss = css({ position: "absolute", right: 0, top: "calc(100% + 6px)", w: "360px", bg: "var(--td-surface)", borderRadius: "12px", boxShadow: "var(--td-shadow-lg)", zIndex: 40, overflow: "hidden", animation: "tdPop .16s ease-out" });
const menuItem = css({ display: "flex", gap: "10px", px: "14px", py: "10px", borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "var(--td-line)", _hover: { bg: "var(--td-surface-2)" }, "&[data-unread=true]": { bg: "var(--td-accent-soft)" } });

const NAV = [
  { group: "Work", items: [
    { href: "/admin/verifications", label: "Verifications", icon: ShieldCheck, key: "kyc" as const },
    { href: "/admin/disputes", label: "Disputes", icon: Scale, key: "disputes" as const },
    { href: "/admin/listings", label: "Listings", icon: Store, key: "listings" as const },
    { href: "/admin/finance", label: "Finance", icon: Wallet, key: "payouts" as const },
  ] },
  { group: "Manage", items: [
    { href: "/admin/people", label: "People", icon: Users, key: null },
    { href: "/admin/catalog", label: "Catalog", icon: Tags, key: null },
  ] },
];

function Sidebar() {
  const pathname = usePathname();
  const { data: stats } = useAdminStats();
  const { data: unread = 0 } = useUnreadCount();
  const counts = {
    kyc: stats?.kyc.pending_count ?? 0,
    disputes: stats?.disputes.open_count ?? 0,
    listings: (stats?.listings.pending_services ?? 0) + (stats?.listings.pending_jobs ?? 0),
    payouts: stats?.withdrawals.pending_count ?? 0,
  };
  const isActive = (href: string) => (href === "/admin" ? pathname === href : pathname.startsWith(href));
  return (
    <nav className={side}>
      <div className={brand}>
        <span className={brandMark}>K</span>
        <div>
          <p className={text({ size: "sm", weight: 700 })}>KickAir</p>
          <p className={text({ size: "xs", tone: 3 })}>Admin console</p>
        </div>
      </div>
      <Link href="/admin" className={navItem} data-active={isActive("/admin")}><LayoutGrid size={17} /> Overview</Link>
      {NAV.map((g) => (
        <div key={g.group}>
          <div className={groupLabel}>{g.group}</div>
          {g.items.map((it) => {
            const count = it.key ? counts[it.key] : 0;
            return (
              <Link key={it.href} href={it.href} className={navItem} data-active={isActive(it.href)}>
                <it.icon size={17} /> {it.label}
                {count > 0 ? <span className={navCount} data-hot={it.key === "disputes"}>{count}</span> : null}
              </Link>
            );
          })}
        </div>
      ))}
      <div className={css({ mt: "auto" })}>
        <Link href="/admin/inbox" className={navItem} data-active={isActive("/admin/inbox")}>
          <Inbox size={17} /> Inbox
          {unread > 0 ? <span className={navCount}>{unread}</span> : null}
        </Link>
        <a href="/" target="_blank" rel="noreferrer" className={navItem}><ExternalLink size={17} /> Open the site</a>
      </div>
    </nav>
  );
}

function BellMenu() {
  const qc = useQueryClient();
  const { data: page } = useNotifications(1);
  const { data: unread = 0 } = useUnreadCount();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const notices = page?.data ?? [];
  const refresh = () => {
    qc.invalidateQueries({ queryKey: qk.notifications.list() });
    qc.invalidateQueries({ queryKey: qk.notifications.unreadCount() });
  };
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);
  const markRead = (id: string) => api.markNotificationRead(id).then(refresh).catch(() => {});
  const markAll = () => api.markAllNotificationsRead().then(refresh).catch(() => {});
  return (
    <div ref={ref} className={css({ position: "relative" })}>
      <IconBtn onClick={() => setOpen((o) => !o)} aria-label="Notifications" className={css({ position: "relative" })}>
        <Bell size={18} />
        {unread > 0 ? <span className={bellDot} /> : null}
      </IconBtn>
      {open ? (
        <div className={menuCss}>
          <div className={cx(row({ between: true }), css({ px: "14px", py: "10px", borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "var(--td-line)" }))}>
            <span className={text({ size: "sm", weight: 600 })}>Notifications {unread ? <span className={text({ size: "sm", tone: 3 })}>· {unread} unread</span> : null}</span>
            <button className={cx(text({ size: "sm", tone: "accent", weight: 500 }), css({ bg: "none", border: "none", cursor: "pointer", p: 0 }))} onClick={markAll}>Mark all read</button>
          </div>
          <div className={css({ maxH: "400px", overflowY: "auto" })}>
            {notices.length === 0 ? <p className={cx(text({ size: "sm", tone: 3 }), css({ p: "16px", textAlign: "center" }))}>Nothing yet.</p> : null}
            {notices.slice(0, 6).map((n) => (
              <Link key={n.id} href={adminNotificationRoute(n)} className={menuItem} data-unread={!n.readAt} onClick={() => { if (!n.readAt) markRead(n.id); setOpen(false); }}>
                <div className={css({ minW: 0 })}>
                  <p className={text({ size: "sm", weight: 600, truncate: true })}>{n.title}</p>
                  <p className={text({ size: "sm", tone: 2, truncate: true })}>{n.body}</p>
                  <p className={text({ size: "xs", tone: 3 })}>{ago(n.createdAt)}</p>
                </div>
              </Link>
            ))}
          </div>
          <Link href="/admin/inbox" className={cx(text({ size: "sm", weight: 600, tone: "accent" }), css({ display: "block", textAlign: "center", py: "10px" }))} onClick={() => setOpen(false)}>Open inbox</Link>
        </div>
      ) : null}
    </div>
  );
}

function Topbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [q, setQ] = useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const term = q.trim();
    router.push(term ? `/admin/people?q=${encodeURIComponent(term)}` : "/admin/people");
    setQ("");
  };
  const handleLogout = async () => {
    await logout();
    router.replace("/admin/login");
  };
  return (
    <header className={topbar}>
      <form className={searchBox} onSubmit={submit} role="search">
        <Search size={15} />
        <input placeholder="Search people by name, email or phone" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search people" />
      </form>
      <div className={css({ ml: "auto" })} />
      <BellMenu />
      <span className={cx(row({ gap: 2 }), css({ h: "34px", pl: "4px", pr: "6px" }))}>
        <Avatar name={user?.name ?? "Admin"} size="sm" seed={0} src={user?.avatar_url} />
        <span className={text({ size: "sm", weight: 600 })}>{user?.name ?? "Admin"}</span>
      </span>
      <IconBtn aria-label="Log out" title="Log out" onClick={handleLogout}><LogOut size={17} /></IconBtn>
    </header>
  );
}

/** Keeps the console live: admin alerts and bell pushes refresh the queues and counts. */
function RealtimeBridge() {
  const qc = useQueryClient();
  useEffect(() => {
    const offAdmin = registerAdminRefresh(() => {
      qc.invalidateQueries({ queryKey: qk.admin.all() });
      qc.invalidateQueries({ queryKey: qk.notifications.list() });
      qc.invalidateQueries({ queryKey: qk.notifications.unreadCount() });
    });
    registerBellRefresh(() => {
      qc.invalidateQueries({ queryKey: qk.notifications.list() });
      qc.invalidateQueries({ queryKey: qk.notifications.unreadCount() });
    });
    return () => { offAdmin(); registerBellRefresh(() => {}); };
  }, [qc]);
  return null;
}

export default function Shell({ children, fontClass }: { children: ReactNode; fontClass: string }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // The login page lives inside this route group but renders bare — no shell,
  // no redirect guard (which would loop).
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) return;
    if (!loading && (!user || !user.is_admin)) router.replace("/admin/login");
  }, [user, loading, router, isLoginPage]);

  if (isLoginPage) {
    return (
      <div className={cx(fontClass, tdVars)}>
        <style dangerouslySetInnerHTML={{ __html: keyframesCss }} />
        {children}
      </div>
    );
  }

  if (loading || !user?.is_admin) {
    return (
      <div className={cx(fontClass, tdVars, css({ minH: "100vh", display: "grid", placeItems: "center", bg: "var(--td-canvas)", fontFamily: "var(--td-font)" }))}>
        <style dangerouslySetInnerHTML={{ __html: keyframesCss }} />
        <Loading label="Signing you in…" />
      </div>
    );
  }

  return (
    <ToastProvider>
      <style dangerouslySetInnerHTML={{ __html: keyframesCss }} />
      <GlobalNotificationToast />
      <RealtimeBridge />
      <div className={cx(fontClass, tdVars, shell)}>
        <Sidebar />
        <div className={main}>
          <Topbar />
          <div className={css({ flex: 1 })}>{children}</div>
        </div>
      </div>
    </ToastProvider>
  );
}
