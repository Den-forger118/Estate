"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { estateImages } from "../data/images";

export function ServicesScopeBand() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`services-scope-band${visible ? " is-visible" : ""}`}
      aria-labelledby="services-scope-heading"
    >
      <div className="services-scope-media" aria-hidden="true">
        <Image
          src={estateImages.estateInterior}
          alt=""
          fill
          sizes="(max-width: 980px) 100vw, 50vw"
          className="services-scope-media-image"
        />
        <div className="services-scope-media-overlay" />
      </div>

      <div className="services-scope-content services-z-from-right">
        <span className="eyebrow services-z-animate services-z-animate-1">What we handle</span>
        <h2 id="services-scope-heading" className="font-headline-section services-z-animate services-z-animate-2">
          Complete estate support for owners, residents, and teams.
        </h2>
        <p className="services-scope-lead services-z-animate services-z-animate-3">
          Choose focused support for a single property or a broader management program for a full
          estate community — with one accountable team behind it.
        </p>
        <div className="services-scope-stats services-z-animate services-z-animate-4">
          <div>
            <strong className="font-data-lg">7</strong>
            <span>Service lines</span>
          </div>
          <div>
            <strong className="font-data-lg">24/7</strong>
            <span>Resident desk</span>
          </div>
        </div>
      </div>
    </section>
  );
}
