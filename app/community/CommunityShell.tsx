"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { AppSidebar } from "../components/AppSidebar";
import { ContentTransition } from "../components/ContentTransition";
import { DashboardTopbarTools } from "../components/DashboardTopbarTools";
import {
  communityModuleMeta,
  communityNavItems,
  residentProfile,
} from "../data/community";
import { brand } from "../data/site";
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
  const year = new Date().getFullYear();

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
    router.replace("/");
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
      <AppSidebar
        brandHref="/community"
        brandIcon="◇"
        brandTitle="Resident OS"
        brandSubtitle="Premium Living"
        primaryAction={{ href: "/community/report", label: "New Request" }}
        mobileNavLabel="Resident services navigation"
        navItems={communityNavItems.map((item) => {
          const active =
            item.href === "/community"
              ? pathname === "/community"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return {
            href: item.href,
            label: item.label,
            icon: item.icon,
            active,
          };
        })}
        residentCard={
          <>
            <div className="dashboard-avatar" aria-hidden="true">
              {residentProfile.initials}
            </div>
            <div>
              <strong>{residentProfile.name}</strong>
              <span>{residentProfile.unit}</span>
            </div>
          </>
        }
        footer={
          <>
            <Link href="/dashboard">REMS dashboard</Link>
            <Link href="/">Public site</Link>
            <button type="button" onClick={signOut}>
              Sign Out
            </button>
          </>
        }
      />

      <div className="dashboard-workspace">
        <header className="dashboard-topbar">
          <DashboardTopbarTools
            displayName={residentProfile.name}
            roleLabel={residentProfile.unit}
            initials={residentProfile.initials}
            searchPlaceholder={searchPlaceholder}
            settingsHref="/community"
          />
        </header>

        <main className="dashboard-main">
          <ContentTransition>{children}</ContentTransition>

          <footer className="dashboard-app-footer">
            <span>© {year} {brand.name}</span>
            <nav aria-label="Resident services footer">
              <Link href="/contact">Support</Link>
              <Link href="/dashboard">REMS</Link>
              <Link href="/">Public Site</Link>
            </nav>
          </footer>
        </main>
      </div>
    </div>
  );
}
