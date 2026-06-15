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
  ROLE_KEY,
  getStoredName,
  syncRoleAfterLandlordApproval,
} from "../data/roles";
import { useMockAuth } from "../hooks/useMockAuth";

function primaryActionForRole(role: DashboardRole): { label: string; href: string } | null {
  if (role === "SUPER_ADMIN" || role === "ADMIN") {
    return { label: "New Property", href: "/dashboard/properties" };
  }
  if (role === "OWNER") {
    return { label: "My Rentals", href: "/dashboard/tenant-management" };
  }
  if (role === "TENANT") {
    return { label: "New Maintenance Request", href: "/dashboard/maintenance" };
  }
  return null;
}

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [role, setRole] = useState<DashboardRole>("SUPER_ADMIN");
  const { isAuthenticated, isLoading: authLoading, logout: clearAuthState } = useMockAuth();
  const displayName = getStoredName();
  const year = new Date().getFullYear();

  // Auth guard: wait for localStorage read, then redirect or initialise role.
  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      router.replace("/login?next=/dashboard");
      return;
    }

    const activeRole = syncRoleAfterLandlordApproval();
    setRole(activeRole);
    setReady(true);
  }, [authLoading, isAuthenticated, router]); // eslint-disable-line react-hooks/exhaustive-deps

  // Admin-approval event: clear sessions for non-admin/manager roles.
  useEffect(() => {
    if (!ready) return;

    function handleForceLogout() {
      const storedRole = window.localStorage.getItem(ROLE_KEY);
      if (storedRole !== "SUPER_ADMIN" && storedRole !== "ADMIN") {
        signOut();
      }
    }

    window.addEventListener("force_logout_event", handleForceLogout);
    return () => window.removeEventListener("force_logout_event", handleForceLogout);
  }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps

  const navItems = roleModules[role].map((module) => moduleMeta[module]);
  const isAdminSubRoute = pathname.startsWith("/dashboard/admin");
  const canAccess =
    role === "PROSPECT" ||
    (isAdminSubRoute && (role === "SUPER_ADMIN" || role === "ADMIN")) ||
    (!isAdminSubRoute && roleModules[role].some((m) => moduleMeta[m].href === pathname));
  const primaryAction = primaryActionForRole(role);

  useEffect(() => {
    if (ready && !canAccess) {
      router.replace("/dashboard");
    }
  }, [canAccess, ready, router]);

  function signOut() {
    clearAuthState();
    router.replace("/");
  }

  if (!ready) {
    return (
      <main className="dashboard-loading">
        <div className="dashboard-card">Preparing your dashboard...</div>
      </main>
    );
  }

  if (role === "PROSPECT") {
    return (
      <div className="dashboard-workspace">
        <main className="dashboard-main">
          <div className="dashboard-page-header">
            <div>
              <span className="eyebrow">Welcome</span>
              <h1>Prospect Portal</h1>
              <p>Your registration is under review. An administrator will approve your account shortly.</p>
            </div>
          </div>
          <ContentTransition>{children}</ContentTransition>
        </main>
      </div>
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
            {(role === "OWNER" || role === "TENANT") ? <Link href="/community">Resident Services</Link> : null}
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
