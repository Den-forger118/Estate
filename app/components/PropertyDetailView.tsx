"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { brand, type Property } from "../data/site";
import { MapEmbed } from "./MapEmbed";
import { PropertyInquiryForm } from "./forms/PropertyInquiryForm";
import { availabilityClass } from "./statusBadge";

const dossierSections = [
  { id: "overview", num: "01", label: "Overview" },
  { id: "layout", num: "02", label: "Layout" },
  { id: "amenities", num: "03", label: "Amenities" },
  { id: "gallery", num: "04", label: "Gallery" },
  { id: "location", num: "05", label: "Location" },
] as const;

function formatListedDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function PropertyDetailView({
  property,
  similar,
  unitId,
}: {
  property: Property;
  similar: Property[];
  /** DB unit UUID — passed once Task 4 wires live availability. Undefined for static listings. */
  unitId?: string;
}) {
  const [activeImage, setActiveImage] = useState(0);
  const gallery = property.gallery;

  function getDossierScrollOffset() {
    const header = document.querySelector<HTMLElement>(".site-header");
    const registry = document.querySelector<HTMLElement>(".property-registry-strip");
    const headerHeight = header?.offsetHeight ?? 72;
    const registryHeight = registry?.offsetHeight ?? 0;
    return headerHeight + registryHeight + 16;
  }

  function scrollTo(id: string) {
    const section = document.getElementById(id);
    if (!section) return;

    const anchor =
      section.querySelector<HTMLElement>(".property-dossier-section-head") ??
      section.querySelector<HTMLElement>(".property-enquiry-copy") ??
      section;

    const top = anchor.getBoundingClientRect().top + window.scrollY - getDossierScrollOffset();
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }

  return (
    <>
      <section className="property-dossier-hero" aria-label={property.name}>
        <div className="property-dossier-hero-media">
          <Image
            src={gallery[activeImage]}
            alt={`${property.name} — photograph ${activeImage + 1}`}
            fill
            priority
            sizes="100vw"
            className="property-dossier-hero-image"
          />
        </div>
        <div className="property-dossier-hero-overlay" aria-hidden="true" />

        <div className="property-dossier-hero-copy">
          <Link href="/properties" className="property-dossier-back">
            ← Portfolio
          </Link>
          <span className="eyebrow property-dossier-eyebrow">
            {property.type} · {property.location}
          </span>
          <h1 className="property-dossier-title font-display-h1">{property.name}</h1>
          <button
            type="button"
            className="btn btn-primary"
            style={{ marginTop: "1.5rem", alignSelf: "flex-start" }}
            onClick={() => scrollTo("enquiry")}
          >
            {property.availability === "Available" || property.availability === "Inspection Open"
              ? "Reserve this unit"
              : "Register interest"}
          </button>
        </div>

        <aside className="property-dossier-margin" aria-label="Listing registry">
          <span className="property-dossier-margin-ref font-data-md">{property.id}</span>
          <span className={`status-chip ${availabilityClass(property.availability)}`}>
            {property.availability}
          </span>
          <strong className="property-dossier-margin-price font-data-lg">{property.price}</strong>
          <span className="property-dossier-margin-note meta">Guide price</span>
        </aside>

        <div className="property-dossier-filmstrip" role="tablist" aria-label="Property photographs">
          {gallery.map((src, index) => (
            <button
              key={src}
              type="button"
              role="tab"
              aria-selected={activeImage === index}
              aria-label={`View photograph ${index + 1}`}
              className={activeImage === index ? "active" : ""}
              onClick={() => setActiveImage(index)}
            >
              <Image src={src} alt="" fill sizes="120px" className="property-filmstrip-thumb" />
            </button>
          ))}
        </div>
      </section>

      <div className="property-registry-strip">
        <div className="property-registry-inner">
          <div className="property-registry-spec" role="table" aria-label="Property specification">
            <div className="property-registry-cell" role="cell">
              <span>Type</span>
              <strong>{property.type}</strong>
            </div>
            <div className="property-registry-cell" role="cell">
              <span>Location</span>
              <strong>{property.location}</strong>
            </div>
            <div className="property-registry-cell" role="cell">
              <span>Beds</span>
              <strong className="font-data-md">{property.beds}</strong>
            </div>
            <div className="property-registry-cell" role="cell">
              <span>Baths</span>
              <strong className="font-data-md">{property.baths}</strong>
            </div>
            <div className="property-registry-cell" role="cell">
              <span>Area</span>
              <strong className="font-data-md">{property.area}</strong>
            </div>
            <div className="property-registry-cell" role="cell">
              <span>Listed</span>
              <strong className="font-data-md">{formatListedDate(property.listedDate)}</strong>
            </div>
            <div className="property-registry-cell property-registry-cell-price" role="cell">
              <span>Guide</span>
              <strong className="font-data-md">{property.price}</strong>
            </div>
          </div>
          <button type="button" className="btn btn-primary" onClick={() => scrollTo("enquiry")}>
            Book Inspection
          </button>
        </div>
      </div>

      <div className="property-dossier-shell">
        <nav className="property-dossier-index" aria-label="Dossier sections">
          {dossierSections.map((section) => (
            <button key={section.id} type="button" onClick={() => scrollTo(section.id)}>
              <span className="font-data-md">{section.num}</span>
              {section.label}
            </button>
          ))}
        </nav>

        <div className="property-dossier-content">
          <section id="overview" className="property-dossier-section">
            <header className="property-dossier-section-head">
              <span className="font-data-md">01</span>
              <h2 className="font-headline-section">Overview</h2>
            </header>
            <p className="property-dossier-prose">{property.description}</p>
            <div className="property-dossier-highlights">
              {property.highlights.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </section>

          <section id="layout" className="property-dossier-section">
            <header className="property-dossier-section-head">
              <span className="font-data-md">02</span>
              <h2 className="font-headline-section">Layout</h2>
            </header>
            <div className="property-blueprint">
              <div className="property-blueprint-rule" aria-hidden="true" />
              <p className="property-blueprint-text font-data-md">{property.floorPlan}</p>
              <div className="property-blueprint-meta font-data-md">
                <span>{property.beds} bedrooms</span>
                <span>{property.baths} bathrooms</span>
                <span>{property.area}</span>
              </div>
            </div>
          </section>

          <section id="amenities" className="property-dossier-section">
            <header className="property-dossier-section-head">
              <span className="font-data-md">03</span>
              <h2 className="font-headline-section">Amenities</h2>
            </header>
            <ul className="property-amenity-checklist">
              {property.amenities.map((amenity) => (
                <li key={amenity}>{amenity}</li>
              ))}
            </ul>
          </section>

          <section id="gallery" className="property-dossier-section">
            <header className="property-dossier-section-head">
              <span className="font-data-md">04</span>
              <h2 className="font-headline-section">Gallery</h2>
            </header>
            <div className="property-masonry">
              {gallery.map((src, index) => (
                <button
                  key={`${src}-${index}`}
                  type="button"
                  className={`property-masonry-item property-masonry-item-${(index % 3) + 1}`}
                  onClick={() => {
                    setActiveImage(index);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  aria-label={`Set hero image to photograph ${index + 1}`}
                >
                  <Image src={src} alt={`${property.name} gallery ${index + 1}`} fill sizes="(max-width: 768px) 100vw, 50vw" />
                </button>
              ))}
            </div>
          </section>

          <section id="location" className="property-dossier-section property-dossier-section-flush">
            <header className="property-dossier-section-head">
              <span className="font-data-md">05</span>
              <h2 className="font-headline-section">{property.location}</h2>
            </header>
            <p className="property-dossier-prose">
              Positioned within Special Gardens&apos; managed residential corridor with controlled access,
              landscaped roads, and convenient resident services.
            </p>
          </section>
        </div>
      </div>

      <div className="property-map-band">
        <MapEmbed
          lat={property.coordinates.lat}
          lng={property.coordinates.lng}
          label={`${property.name}, ${property.location}`}
          variant="content"
          zoom={15}
        />
      </div>

      <section id="enquiry" className="property-enquiry-band">
        <div className="property-enquiry-inner">
          <div className="property-enquiry-copy">
            <span className="eyebrow property-enquiry-eyebrow">Enquiry</span>
            <h2 className="font-headline-section property-enquiry-title">
              {property.availability === "Available" || property.availability === "Inspection Open"
                ? `Reserve ${property.name}`
                : `Register interest — ${property.name}`}
            </h2>
            <p className="property-enquiry-lead">
              Submit your details and our estate team will confirm availability and arrange a private
              viewing. This registers your interest — it is not an instant booking.
            </p>
            <div className="property-enquiry-contact">
              <a href={`tel:${brand.phone}`} className="font-data-md">
                {brand.phone}
              </a>
              <a href={`mailto:${brand.email}`}>{brand.email}</a>
            </div>
          </div>
          <PropertyInquiryForm propertyName={property.name} unitId={unitId} variant="dossier" />
        </div>
      </section>

      {similar.length > 0 ? (
        <section className="property-comparison-rail" aria-labelledby="comparison-heading">
          <div className="property-comparison-head">
            <div>
              <span className="eyebrow">Compare</span>
              <h2 id="comparison-heading" className="font-headline-section">
                Residences in the same portfolio
              </h2>
            </div>
            <Link href="/properties" className="community-inline-link">
              View full collection →
            </Link>
          </div>
          <div className="property-comparison-track">
            {similar.map((item) => (
              <Link key={item.slug} href={`/properties/${item.slug}`} className="property-comparison-card card-interactive">
                <div className="property-comparison-image">
                  <Image src={item.image} alt={item.name} fill sizes="320px" />
                  <span className={`status-chip ${availabilityClass(item.availability)}`}>
                    {item.availability}
                  </span>
                </div>
                <div className="property-comparison-body">
                  <p className="meta">
                    {item.type} · {item.id}
                  </p>
                  <h3>{item.name}</h3>
                  <strong className="font-data-md">{item.price}</strong>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
