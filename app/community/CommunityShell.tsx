"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useMemo } from "react";
import { AppSidebar } from "../components/AppSidebar";
import { ContentTransition } from "../components/ContentTransition";
import { DashboardTopbarTools } from "../components/DashboardTopbarTools";
import { communityModuleMeta, communityNavItems } from "../data/community";
import { brand } from "../data/site";

type Props = {
  children: ReactNode;
  displayName: string;
};

export function CommunityShell({ children, displayName }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const year = new Date().getFullYear();

  const searchPlaceholder = useMemo(() => {
    if (pathname === "/community") return "Search services, events, or documents…";
    const module = pathname.split("/").filter(Boolean).at(-1);
    if (module && module in communityModuleMeta) {
      return communityModuleMeta[module as keyof typeof communityModuleMeta].searchPlaceholder;
    }
    return "Search…";
  }, [pathname]);

  const initials = displayName
    .split(/[\s._-]/)
    .map((p) => p[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();

  async function signOut() {
    await fetch("/api/v1/auth/logout", { method: "POST" });
    router.replace("/");
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
          return { href: item.href, label: item.label, icon: item.icon, active };
        })}
        residentCard={
          <>
            <div className="dashboard-avatar" aria-hidden="true">{initials}</div>
            <div>
              <strong>{displayName}</strong>
              <span>Resident</span>
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
            displayName={displayName}
            roleLabel="Resident"
            initials={initials}
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
