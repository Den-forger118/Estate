"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { estateImages } from "../data/images";

const reasons = [
  ["Managed with care", "Clear communication, reliable reporting, and a resident-first maintenance culture."],
  ["Secure by design", "Layered access control, patrol coordination, visitor protocols, and calm community planning."],
  ["Built for daily ease", "Homes, gardens, roads, and shared spaces planned around comfort and long-term value."],
] as const;

export function WhyChooseBand() {
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
      className={`home-why-band${visible ? " is-visible" : ""}`}
      aria-labelledby="why-choose-heading"
    >
      <div className="home-why-media" aria-hidden="true">
        <Image
          src={estateImages.contemporaryHome}
          alt=""
          fill
          sizes="(max-width: 980px) 100vw, 55vw"
          className="home-why-media-image"
        />
        <div className="home-why-media-overlay" />
      </div>

      <div className="home-why-content">
        <span className="eyebrow home-why-animate home-why-animate-1">Why choose us</span>
        <h2 id="why-choose-heading" className="font-headline-section home-why-title home-why-animate home-why-animate-2">
          Estate living that feels polished from the front gate to the front door.
        </h2>
        <div className="home-why-features">
          {reasons.map(([title, text], index) => (
            <div
              className={`feature-row home-why-animate home-why-animate-${index + 3}`}
              key={title}
            >
              <span aria-hidden="true" />
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
