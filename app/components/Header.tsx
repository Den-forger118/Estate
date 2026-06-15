"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMockAuth } from "../hooks/useMockAuth";
import { useScrollCompressed } from "../hooks/useScrollCompressed";
import { brand } from "../data/site";
import type { UserRole } from "../data/roles";

const publicNavItems: { label: string; href: string; mobile?: boolean }[] = [
  { label: "Properties", href: "/properties", mobile: true },
  { label: "Services", href: "/services" },
  { label: "About", href: "/about", mobile: true },
  { label: "Blog", href: "/blog" },
  { label: "Verify", href: "/verify", mobile: true },
  { label: "Contact", href: "/contact", mobile: true },
];

function resolvePortalHref(role: UserRole): string {
  if (role === "SUPER_ADMIN" || role === "ADMIN") return "/dashboard/admin";
  if (role === "OWNER") return "/community/portal";
  if (role === "TENANT_STAFF") return "/community";
  return "/login";
}

function resolvePortalLabel(role: UserRole): string {
  if (role === "SUPER_ADMIN" || role === "ADMIN") return "Go to REMS";
  return "Resident Portal";
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const compressed = useScrollCompressed();
  const { isAuthenticated, userRole, isLoading, logout } = useMockAuth();

  function handleLogout() {
    logout();
    router.push("/");
  }

  function renderAuthControl() {
    if (isLoading) {
      return <div className="header-auth-placeholder" aria-hidden="true" />;
    }
    if (!isAuthenticated || !userRole) {
      return (
        <Link className="btn btn-primary header-cta" href="/login">
          Login / Register
        </Link>
      );
    }
    if (userRole === "PROSPECT") {
      return (
        <button type="button" className="btn btn-secondary header-cta" onClick={handleLogout}>
          Logout
        </button>
      );
    }
    return (
      <Link className="btn btn-primary header-cta" href={resolvePortalHref(userRole)}>
        {resolvePortalLabel(userRole)}
      </Link>
    );
  }

  return (
    <header className={`site-header${compressed ? " site-header-compressed" : ""}`}>
      <Link href="/" className="brand-mark" aria-label={`${brand.name} home`}>
        {brand.name}
      </Link>
      <nav className="nav-links" aria-label="Primary navigation">
        {publicNavItems.map(({ label, href, mobile }) => (
          <Link
            key={href}
            href={href}
            className={mobile ? "nav-link-mobile" : "nav-link-desktop"}
            style={
              pathname === href || (href !== "/" && pathname.startsWith(href))
                ? { color: "var(--primary)", borderBottom: "2px solid var(--primary)", paddingBottom: "2px" }
                : undefined
            }
          >
            {label}
          </Link>
        ))}
      </nav>
      {renderAuthControl()}
    </header>
  );
}
