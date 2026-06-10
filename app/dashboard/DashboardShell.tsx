"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { AppSidebar } from "../components/AppSidebar";
import { ContentTransition } from "../components/ContentTransition";
import { DashboardTopbarTools } from "../components/DashboardTopbarTools";
import {
  DashboardRole,
  moduleMeta,
  roleLabels,
  roleModules,
} from "../data/dashboard";
import { brand } from "../data/site";
import {
  AUTH_KEY,
  getStoredName,
  syncRoleAfterLandlordApproval,
} from "../data/roles";

function primaryActionForRole(role: DashboardRole): { label: string; href: string } | null {
  if (role === "owner") {
    return { label: "Apply to Become Landlord", href: "/dashboard/landlord-application" };
  }
  if (role === "landlord") {
    return { label: "New Lease", href: "/dashboard/leases" };
  }
  if (role === "admin" || role === "manager") {
    return { label: "New Property", href: "/dashboard/properties" };
  }
  if (role === "tenant") {
    return { label: "New Maintenance Request", href: "/dashboard/maintenance" };
  }
  return null;
}

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [role, setRole] = useState<DashboardRole>("admin");
  const displayName = getStoredName();
  const year = new Date().getFullYear();

  useEffect(() => {
    const authed = window.localStorage.getItem(AUTH_KEY) === "true";
    if (!authed) {
      router.replace("/login?next=/dashboard");
      return;
    }

    const activeRole = syncRoleAfterLandlordApproval();
    setRole(activeRole);
    setReady(true);
  }, [router]);

  const navItems = roleModules[role].map((module) => moduleMeta[module]);
  const canAccess = roleModules[role].some((module) => moduleMeta[module].href === pathname);
  const primaryAction = primaryActionForRole(role);

  useEffect(() => {
    if (ready && !canAccess) {
      router.replace("/dashboard");
    }
  }, [canAccess, ready, router]);

  function signOut() {
    window.localStorage.removeItem(AUTH_KEY);
    document.cookie = "mock_auth=; Max-Age=0; path=/";
    router.replace("/");
  }

  if (!ready) {
    return (
      <main className="dashboard-loading">
        <div className="dashboard-card">Preparing your dashboard...</div>
      </main>
    );
  }

  return (
    <div className="dashboard-shell">
      <AppSidebar
        brandHref="/"
        brandIcon="◇"
        brandTitle="REMS"
        brandSubtitle="Estate Management"
        primaryAction={primaryAction ?? undefined}
        mobileNavLabel={`${roleLabels[role]} dashboard navigation`}
        navItems={navItems.map((item) => ({
          href: item.href,
          label: item.label,
          icon: item.icon,
          active: pathname === item.href,
        }))}
        footer={
          <>
            {role !== "maintenance" ? <Link href="/community">Resident Services</Link> : null}
            <Link href="/contact">Support</Link>
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
            roleLabel={roleLabels[role]}
            initials={displayName.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()}
            searchPlaceholder="Search properties, tenants, invoices..."
          />
        </header>

        <main className="dashboard-main">
          <ContentTransition>{children}</ContentTransition>

          <footer className="dashboard-app-footer">
            <span>© {year} {brand.name}</span>
            <nav aria-label="Dashboard footer">
              <Link href="/contact">Support</Link>
              <Link href="/">Public Site</Link>
              <Link href="/community">Resident Services</Link>
            </nav>
          </footer>
        </main>
      </div>
    </div>
  );
}
