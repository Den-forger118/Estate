import Link from "next/link";
import type { ReactNode } from "react";
import { brand } from "../data/site";
import { Header } from "./Header";

const footerItems = [
  ["About", "/about"],
  ["Services", "/services"],
  ["Properties", "/properties"],
  ["Blog", "/blog"],
  ["Contact", "/contact"],
];

export function Footer() {
  return (
    <footer className="site-footer">
      <div>
        <Link href="/" className="brand-mark footer-brand">
          <span>EO</span>
          <strong>{brand.name}</strong>
        </Link>
        <p>Secure, comfortable, modern living across beautifully managed estate communities.</p>
      </div>
      <div className="footer-grid">
        <div>
          <h3>Explore</h3>
          {footerItems.map(([label, href]) => (
            <Link key={href} href={href}>
              {label}
            </Link>
          ))}
        </div>
        <div>
          <h3>Contact</h3>
          <a href={`tel:${brand.phone}`}>{brand.phone}</a>
          <a href={`mailto:${brand.email}`}>{brand.email}</a>
          <span>{brand.address}</span>
        </div>
      </div>
    </footer>
  );
}

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main className="page-transition">{children}</main>
      <Footer />
    </>
  );
}

export function SectionIntro({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text: string;
}) {
  return (
    <div className="section-intro reveal">
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      <p>{text}</p>
    </div>
  );
}
