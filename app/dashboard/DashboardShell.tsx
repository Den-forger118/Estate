"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useMemo, useState } from "react";
import {
  DashboardRole,
  moduleMeta,
  roleLabels,
  roleModules,
} from "../data/dashboard";
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

  const activeModule = useMemo(() => {
    if (pathname === "/dashboard") return "dashboard";
    return pathname.split("/").filter(Boolean).at(-1) ?? "dashboard";
  }, [pathname]);

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
    router.replace("/login");
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
      <aside className="dashboard-sidebar">
        <Link href="/" className="dashboard-brand" aria-label="Ernest Ofori home">
          <span>EO</span>
          <div>
            <strong>Ernest Ofori</strong>
            <small>Estate Management</small>
          </div>
        </Link>

        {primaryAction ? (
          <Link href={primaryAction.href} className="btn btn-primary dashboard-primary-action">
            {primaryAction.label}
          </Link>
        ) : null}

        <nav className="dashboard-nav" aria-label={`${roleLabels[role]} dashboard navigation`}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={pathname === item.href ? "dashboard-nav-active" : ""}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="dashboard-sidebar-footer">
          {role !== "maintenance" ? <Link href="/community">Resident Services</Link> : null}
          <Link href="/contact">Support</Link>
          <button type="button" onClick={signOut}>
            Sign Out
          </button>
        </div>
      </aside>

      <div className="dashboard-workspace">
        <header className="dashboard-topbar">
          <div className="dashboard-search">
            <span aria-hidden="true">/</span>
            <input placeholder="Search properties, tenants, invoices..." />
          </div>

          <div className="dashboard-user-tools">
            <div className="dashboard-avatar" aria-hidden="true">
              {displayName
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div className="dashboard-user-copy">
              <strong>{displayName}</strong>
              <span>{roleLabels[role]}</span>
            </div>
          </div>
        </header>

        <main className="dashboard-main page-transition">
          <div className="dashboard-mobile-nav">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={pathname === item.href ? "dashboard-nav-active" : ""}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="dashboard-context">
            <span className="eyebrow">Role based access</span>
            <strong>{roleLabels[role]}</strong>
            <span>{moduleMeta[activeModule as keyof typeof moduleMeta]?.summary}</span>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
