import Image from "next/image";
import { properties } from "../data/site";

const carouselSlides = properties.flatMap((property) =>
  property.gallery.map((src, index) => ({
    src,
    alt: `${property.name} — view ${index + 1}`,
    key: `${property.slug}-${index}`,
  })),
);

export function PropertiesHero() {
  const track = [...carouselSlides, ...carouselSlides];

  return (
    <section className="properties-hero" aria-labelledby="properties-hero-heading">
      <div className="properties-hero-carousel" aria-hidden="true">
        <div className="properties-hero-track">
          {track.map((slide, index) => (
            <div key={`${slide.key}-${index}`} className="properties-hero-slide">
              <Image
                src={slide.src}
                alt=""
                fill
                sizes="(max-width: 768px) 80vw, 420px"
                className="properties-hero-slide-image"
                priority={index < 4}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="properties-hero-overlay" aria-hidden="true" />

      <div className="properties-hero-content">
        <span className="eyebrow properties-hero-eyebrow">Properties</span>
        <h1 id="properties-hero-heading" className="properties-hero-title font-display-h1">
          Browse available units across our estate portfolio.
        </h1>
        <p className="properties-hero-lead">
          Search by price, bedrooms, property type, location, and availability. Each listing includes
          clear details and a direct path to book an inspection.
        </p>
      </div>
    </section>
  );
}
