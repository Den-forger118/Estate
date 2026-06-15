"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { AppSidebar } from "../../components/AppSidebar";
import { ContentTransition } from "../../components/ContentTransition";
import { DashboardTopbarTools } from "../../components/DashboardTopbarTools";
import { brand } from "../../data/site";
import { getStoredName } from "../../data/roles";
import { KioskModeContext } from "./KioskModeContext";

const STAFF_NAV_ITEMS = [
  { href: "/staff", label: "Overview", icon: "◈" },
  { href: "/staff/gate-scanner", label: "Gate Terminal", icon: "⊞" },
  { href: "/dashboard/admin/maintenance", label: "Operations", icon: "◱" },
];

export default function StaffPortalLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [kioskMode, setKioskMode] = useState(false);
  const [displayName, setDisplayName] = useState("Staff");
  const year = new Date().getFullYear();

  useEffect(() => {
    setDisplayName(getStoredName() || "Staff");
  }, []);

  const navItems = STAFF_NAV_ITEMS.map((item) => ({
    ...item,
    active: pathname === item.href,
  }));

  const initials = displayName
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (kioskMode) {
    return (
      <KioskModeContext.Provider value={{ kioskMode, setKioskMode }}>
        <div className="staff-kiosk-shell">{children}</div>
      </KioskModeContext.Provider>
    );
  }

  return (
    <KioskModeContext.Provider value={{ kioskMode, setKioskMode }}>
      <div className="dashboard-shell">
        <AppSidebar
          brandHref="/staff"
          brandIcon="◇"
          brandTitle="Staff OS"
          brandSubtitle="On-site Operations"
          mobileNavLabel="Staff portal navigation"
          navItems={navItems}
          footer={
            <>
              <Link href="/">Public Site</Link>
              <Link href="/contact">Support</Link>
            </>
          }
        />

        <div className="dashboard-workspace">
          <header className="dashboard-topbar">
            <DashboardTopbarTools
              displayName={displayName}
              roleLabel="Staff · On-site"
              initials={initials}
              searchPlaceholder="Search gate passes, maintenance tasks..."
              settingsHref="/staff"
            />
          </header>

          <main className="dashboard-main">
            <ContentTransition>{children}</ContentTransition>

            <footer className="dashboard-app-footer">
              <span>
                © {year} {brand.name}
              </span>
              <nav aria-label="Staff portal footer">
                <Link href="/contact">Support</Link>
                <Link href="/">Public Site</Link>
              </nav>
            </footer>
          </main>
        </div>
      </div>
    </KioskModeContext.Provider>
  );
}
