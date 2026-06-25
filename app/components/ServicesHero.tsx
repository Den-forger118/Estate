import Image from "next/image";
import { estateImages } from "../data/images";

export function ServicesHero() {
  return (
    <section className="services-hero" aria-labelledby="services-hero-heading">
      <div className="services-hero-bg" aria-hidden="true">
        <Image
          src={estateImages.grandDevelopment}
          alt=""
          fill
          priority
          sizes="100vw"
          className="services-hero-bg-image"
        />
      </div>
      <div className="services-hero-overlay" aria-hidden="true" />
      <div className="services-hero-content">
        <span className="eyebrow services-hero-eyebrow">Services</span>
        <h1 id="services-hero-heading" className="font-display-h1 services-hero-title">
          Everything behind a well-run estate.
        </h1>
        <p className="services-hero-lead">
          Property management, maintenance, leasing, and resident support — handled with the same
          discipline across every Special Gardens community.
        </p>
      </div>
    </section>
  );
}
