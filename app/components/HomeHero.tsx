import Image from "next/image";
import Link from "next/link";
import { brand } from "../data/site";
import { estateImages } from "../data/images";

export function HomeHero() {
  return (
    <section className="home-hero-cinematic" aria-label={brand.name}>
      <div className="home-hero-bg" aria-hidden="true">
        <Image
          src={estateImages.heroHome}
          alt=""
          fill
          priority
          sizes="100vw"
          className="home-hero-bg-image"
        />
      </div>
      <div className="home-hero-overlay" aria-hidden="true" />
      <div className="home-hero-content">
        <h1 className="home-hero-title font-display-h1">Quiet luxury. Expertly managed.</h1>
        <p className="home-hero-lead">
          Premium residences across Accra&apos;s finest gated communities — with institutional estate
          management you can trust from first viewing to long-term residency.
        </p>
        <div className="home-hero-actions">
          <Link href="/contact" className="btn btn-primary btn-hero">
            Book Inspection
          </Link>
          <Link href="/properties" className="btn btn-secondary btn-hero-outline">
            Browse Properties
          </Link>
        </div>
      </div>
    </section>
  );
}
