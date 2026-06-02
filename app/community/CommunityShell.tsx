"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useMemo, useState } from "react";
import {
  communityModuleMeta,
  communityNavItems,
  residentProfile,
} from "../data/community";
import {
  AUTH_KEY,
  canAccessCommunity,
  syncRoleAfterLandlordApproval,
  type UserRole,
} from "../data/roles";

export function CommunityShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [role, setRole] = useState<UserRole>("tenant");

  useEffect(() => {
    const authed = window.localStorage.getItem(AUTH_KEY) === "true";
    if (!authed) {
      const next = pathname === "/community" ? "/community" : pathname;
      router.replace(`/login?next=${encodeURIComponent(next)}`);
      return;
    }

    const activeRole = syncRoleAfterLandlordApproval();
    setRole(activeRole);

    if (!canAccessCommunity(activeRole)) {
      router.replace("/dashboard");
      return;
    }

    setReady(true);
  }, [pathname, router]);

  const searchPlaceholder = useMemo(() => {
    if (pathname === "/community") return "Search services, events, or documents…";
    const module = pathname.split("/").filter(Boolean).at(-1);
    if (module && module in communityModuleMeta) {
      return communityModuleMeta[module as keyof typeof communityModuleMeta].searchPlaceholder;
    }
    return "Search…";
  }, [pathname]);

  function signOut() {
    window.localStorage.removeItem(AUTH_KEY);
    document.cookie = "mock_auth=; Max-Age=0; path=/";
    router.replace("/login");
  }

  if (!ready) {
    return (
      <main className="dashboard-loading">
        <div className="dashboard-card">Preparing resident services…</div>
      </main>
    );
  }

  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <Link href="/community" className="dashboard-brand" aria-label="Resident services home">
          <span>EO</span>
          <div>
            <strong>Resident OS</strong>
            <small>{residentProfile.estate}</small>
          </div>
        </Link>

        <Link href="/community/report" className="btn btn-primary dashboard-primary-action">
          New Request
        </Link>

        <nav className="dashboard-nav" aria-label="Resident services navigation">
          {communityNavItems.map((item) => {
            const active =
              item.href === "/community"
                ? pathname === "/community"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={active ? "dashboard-nav-active" : ""}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="dashboard-sidebar-resident">
          <div className="dashboard-avatar" aria-hidden="true">
            {residentProfile.initials}
          </div>
          <div>
            <strong>{residentProfile.name}</strong>
            <span>{residentProfile.unit}</span>
          </div>
        </div>

        <div className="dashboard-sidebar-footer">
          <Link href="/dashboard">REMS dashboard</Link>
          <Link href="/">Public site</Link>
          <button type="button" onClick={signOut}>
            Sign Out
          </button>
        </div>
      </aside>

      <div className="dashboard-workspace">
        <header className="dashboard-topbar">
          <div className="dashboard-search">
            <span aria-hidden="true">⌕</span>
            <input placeholder={searchPlaceholder} aria-label="Search resident services" />
          </div>
          <div className="dashboard-user-tools">
            <span className="community-notify-dot" aria-hidden="true" />
            <div className="dashboard-avatar" aria-hidden="true">
              {residentProfile.initials}
            </div>
            <div className="dashboard-user-copy">
              <strong>{residentProfile.name}</strong>
              <span>{residentProfile.unit}</span>
            </div>
          </div>
        </header>

        <main className="dashboard-main page-transition">
          <div className="dashboard-mobile-nav">
            {communityNavItems.map((item) => {
              const active =
                item.href === "/community"
                  ? pathname === "/community"
                  : pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={active ? "dashboard-nav-active" : ""}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
