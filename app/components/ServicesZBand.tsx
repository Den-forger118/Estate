"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type ServiceItem = {
  title: string;
  text: string;
};

type ServicesZBandProps = {
  id: string;
  eyebrow: string;
  title: string;
  lead: string;
  image: string;
  reverse?: boolean;
  services: readonly ServiceItem[];
  showCta?: boolean;
};

export function ServicesZBand({
  id,
  eyebrow,
  title,
  lead,
  image,
  reverse = false,
  services,
  showCta = false,
}: ServicesZBandProps) {
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
      { threshold: 0.18, rootMargin: "0px 0px -6% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const contentDirection = reverse ? "services-z-from-left" : "services-z-from-right";

  return (
    <section
      ref={sectionRef}
      id={id}
      className={`services-z-band${reverse ? " services-z-band-reverse" : ""}${visible ? " is-visible" : ""}`}
      aria-labelledby={`${id}-heading`}
    >
      <div className="services-z-media services-z-animate services-z-animate-media" aria-hidden="true">
        <Image src={image} alt="" fill sizes="(max-width: 980px) 100vw, 50vw" className="services-z-media-image" />
        <div className="services-z-media-overlay" />
      </div>

      <div className={`services-z-content ${contentDirection}`}>
        <span className="eyebrow services-z-animate services-z-animate-1">{eyebrow}</span>
        <h2 id={`${id}-heading`} className="font-headline-section services-z-title services-z-animate services-z-animate-2">
          {title}
        </h2>
        <p className="services-z-lead services-z-animate services-z-animate-3">{lead}</p>

        <div className="services-z-items">
          {services.map((service, index) => (
            <article
              key={service.title}
              className={`services-z-item services-z-animate services-z-animate-${index + 4}`}
            >
              <span className="services-z-item-index font-data-md">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h3>{service.title}</h3>
                <p>{service.text}</p>
              </div>
            </article>
          ))}
        </div>

        {showCta ? (
          <div className="services-z-cta services-z-animate services-z-animate-6">
            <Link href="/contact" className="btn btn-primary">
              Request a consultation
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
