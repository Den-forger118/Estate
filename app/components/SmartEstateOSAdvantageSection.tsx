"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { techPillars } from "../data/site";

export function SmartEstateOSAdvantageSection() {
  const bandRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = bandRef.current;
    if (!node) return;

    if (node.getBoundingClientRect().top < window.innerHeight) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.08 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={bandRef}
      id="smart-estate-os"
      className={`tech-pillars-band${visible ? " is-visible" : ""}`}
      aria-labelledby="tech-pillars-band-heading"
    >
      <div className="tech-pillars-band-inner">
        <div className="tech-pillars-band-header">
          <div>
            <span className="eyebrow tech-pillars-band-eyebrow">
              Smart Estate OS Advantage
            </span>
            <h2
              id="tech-pillars-band-heading"
              className="font-headline-section tech-pillars-band-title"
            >
              The infrastructure that makes your investment fraud-proof, frictionless, and fully managed
            </h2>
          </div>
          <p className="tech-pillars-band-lead">
            Three interconnected systems — running quietly behind every transaction, every
            gate scan, and every maintenance request — eliminate the risk and friction that
            define conventional property management in West Africa.
          </p>
        </div>

        <div className="tech-pillars-band-grid">
          {techPillars.map((pillar) => (
            <article
              key={pillar.id}
              className="tech-pillar-band-card"
              aria-labelledby={`pillar-${pillar.id}`}
            >
              <span className="tech-pillar-band-num" aria-hidden="true">
                {pillar.num}
              </span>
              <h3 id={`pillar-${pillar.id}`} className="tech-pillar-band-heading">
                {pillar.heading}
              </h3>
              <p className="tech-pillar-band-text">{pillar.body}</p>
              <Link href={pillar.learnMoreHref} className="tech-pillar-band-link">
                Learn more →
              </Link>
            </article>
          ))}
        </div>

        <div className="tech-pillars-band-cta">
          <Link href="/verify" className="btn btn-primary">
            Verify a transaction now
          </Link>
          <Link
            href="/blog/diaspora-fraud-protection-ledger"
            className="btn btn-secondary"
          >
            Read the Trust Layer explainer
          </Link>
        </div>
      </div>
    </section>
  );
}
