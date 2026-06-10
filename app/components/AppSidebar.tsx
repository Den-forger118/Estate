"use client";

import Link from "next/link";
import type { ReactNode } from "react";

export type SidebarNavItem = {
  href: string;
  label: string;
  icon: string;
  active: boolean;
};

type AppSidebarProps = {
  brandHref: string;
  brandIcon: string;
  brandTitle: string;
  brandSubtitle: string;
  navItems: SidebarNavItem[];
  primaryAction?: { href: string; label: string };
  footer: ReactNode;
  residentCard?: ReactNode;
  mobileNavLabel: string;
};

export function AppSidebar({
  brandHref,
  brandIcon,
  brandTitle,
  brandSubtitle,
  navItems,
  primaryAction,
  footer,
  residentCard,
  mobileNavLabel,
}: AppSidebarProps) {
  return (
    <>
      <aside className="dashboard-sidebar" aria-label={mobileNavLabel}>
        <div className="dashboard-sidebar-inner">
          <div className="dashboard-sidebar-top">
            <Link href={brandHref} className="dashboard-brand" aria-label={`${brandTitle} home`}>
              <span>{brandIcon}</span>
              <div>
                <strong>{brandTitle}</strong>
                <small>{brandSubtitle}</small>
              </div>
            </Link>

            {primaryAction ? (
              <Link href={primaryAction.href} className="btn btn-primary dashboard-primary-action">
                {primaryAction.label}
              </Link>
            ) : null}
          </div>

          <nav className="dashboard-nav" aria-label={mobileNavLabel}>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={item.active ? "dashboard-nav-active" : ""}
              >
                <span className="dashboard-nav-icon">{item.icon}</span>
                <span className="dashboard-nav-label">{item.label}</span>
              </Link>
            ))}
          </nav>

          {residentCard ? <div className="dashboard-sidebar-resident">{residentCard}</div> : null}

          <div className="dashboard-sidebar-footer">{footer}</div>
        </div>
      </aside>

      <nav className="dashboard-bottom-nav" aria-label={`${mobileNavLabel} (mobile)`}>
        {navItems.slice(0, 5).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={item.active ? "dashboard-bottom-nav-active" : ""}
          >
            <span>{item.icon}</span>
            <small>{item.label}</small>
          </Link>
        ))}
      </nav>
    </>
  );
}
