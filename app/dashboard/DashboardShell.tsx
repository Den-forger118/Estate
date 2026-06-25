"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { AppSidebar } from "../components/AppSidebar";
import { ContentTransition } from "../components/ContentTransition";
import { DashboardTopbarTools } from "../components/DashboardTopbarTools";
import { DashboardRole, moduleMeta, roleLabels, roleModules } from "../data/dashboard";
import { brand } from "../data/site";

function primaryActionForRole(role: DashboardRole): { label: string; href: string } | null {
  if (role === "admin" || role === "manager") {
    return { label: "New Property", href: "/dashboard/properties" };
  }
  if (role === "maintenance") {
    return { label: "New Maintenance Request", href: "/dashboard/maintenance" };
  }
  return null;
}

type Props = {
  children: ReactNode;
  displayName: string;
  role: DashboardRole;
};

export function DashboardShell({ children, displayName, role }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const year = new Date().getFullYear();

  const navItems = roleModules[role].map((module) => moduleMeta[module]);
  const canAccess = roleModules[role].some((module) => moduleMeta[module].href === pathname);
  const primaryAction = primaryActionForRole(role);

  // Client-side guard: redirect to dashboard root if role can't access the current module
  useEffect(() => {
    if (!canAccess) router.replace("/dashboard");
  }, [canAccess, router]);

  async function signOut() {
    await fetch("/api/v1/auth/logout", { method: "POST" });
    router.replace("/");
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
            searchPlaceholder="Search properties, buyers, payments..."
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
