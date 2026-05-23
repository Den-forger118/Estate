"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { brand } from "../data/site";

const navItems = [
  ["Home", "/"],
  ["About", "/about"],
  ["Services", "/services"],
  ["Properties", "/properties"],
  ["Blog", "/blog"],
  ["Contact", "/contact"],
];

export function Header() {
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    const onScroll = () => {
      setHidden(window.scrollY > 0);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: false });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`site-header ${hidden ? "site-header-hidden" : ""}`}>
      <Link href="/" className="brand-mark" aria-label={`${brand.name} home`}>
        <span>EO</span>
        <strong>{brand.name}</strong>
      </Link>
      <nav className="nav-links" aria-label="Primary navigation">
        {navItems.map(([label, href]) => (
          <Link key={href} href={href}>
            {label}
          </Link>
        ))}
      </nav>
      <Link className="btn btn-primary header-cta" href="/contact">
        Book an Inspection
      </Link>
    </header>
  );
}
