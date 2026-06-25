"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useScrollCompressed } from "../hooks/useScrollCompressed";
import { brand } from "../data/site";

const navItems: { label: string; href: string; mobile?: boolean }[] = [
  { label: "Properties", href: "/properties", mobile: true },
  { label: "Services", href: "/services" },
  { label: "About", href: "/about", mobile: true },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact", mobile: true },
  { label: "Resident Services", href: "/community" },
  { label: "Dashboard", href: "/dashboard" },
];

export function Header() {
  const pathname = usePathname();
  const compressed = useScrollCompressed();

  return (
    <header className={`site-header${compressed ? " site-header-compressed" : ""}`}>
      <Link href="/" className="brand-mark" aria-label={`${brand.name} home`}>
        {brand.name}
      </Link>
      <nav className="nav-links" aria-label="Primary navigation">
        {navItems.map(({ label, href, mobile }) => (
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
      <div className="header-cta-group">
        <Link className="btn btn-secondary" href="/login">
          My Portal
        </Link>
        <Link className="btn btn-primary" href="/contact">
          Book an Inspection
        </Link>
      </div>
    </header>
  );
}
