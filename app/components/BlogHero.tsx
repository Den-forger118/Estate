import Image from "next/image";
import { estateImages } from "../data/images";

export function BlogHero() {
  return (
    <section className="blog-hero" aria-labelledby="blog-hero-heading">
      <div className="blog-hero-bg" aria-hidden="true">
        <Image
          src={estateImages.estateInterior}
          alt=""
          fill
          priority
          sizes="100vw"
          className="blog-hero-bg-image"
        />
      </div>
      <div className="blog-hero-overlay" aria-hidden="true" />
      <div className="blog-hero-content">
        <span className="eyebrow blog-hero-eyebrow">Journal</span>
        <h1 id="blog-hero-heading" className="font-display-h1 blog-hero-title">
          Insights for estate living in Accra.
        </h1>
        <p className="blog-hero-lead">
          Housing tips, maintenance guidance, and community living — written for residents, owners,
          and families comparing well-managed estates.
        </p>
      </div>
    </section>
  );
}
