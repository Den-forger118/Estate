import Link from "next/link";
import type { ReactNode } from "react";
import { brand } from "../data/site";
import { ContentTransition } from "./ContentTransition";
import { Header } from "./Header";

const footerLinks = [
  ["About", "/about"],
  ["Privacy Policy", "/privacy"],
  ["Terms", "/terms"],
  ["Contact Support", "/contact"],
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer-main">
        <div className="site-footer-brand">
          <Link href="/" className="footer-title">
            {brand.name}
          </Link>
          <p>Secure, comfortable, modern living across beautifully managed estate communities.</p>
        </div>
        <nav className="site-footer-links" aria-label="Footer navigation">
          {footerLinks.map(([label, href]) => (
            <Link key={label} href={href}>
              {label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="site-footer-bottom">
        <span>
          © {year} {brand.name}. All rights reserved.
        </span>
      </div>
    </footer>
  );
}

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main>
        <ContentTransition>{children}</ContentTransition>
      </main>
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
    <div className="section-intro">
      <span className="eyebrow">{eyebrow}</span>
      <h2 className="font-headline-section">{title}</h2>
      <p>{text}</p>
    </div>
  );
}
