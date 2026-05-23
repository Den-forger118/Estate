import Link from "next/link";
import { notFound } from "next/navigation";
import { PropertyCard } from "../../components/Cards";
import { PageShell } from "../../components/SiteChrome";
import { brand, properties } from "../../data/site";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return properties.map((property) => ({ slug: property.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const property = properties.find((item) => item.slug === slug);
  return {
    title: property ? `${property.name} | Aster Grove Estates` : "Property | Aster Grove Estates",
    description: property?.description,
  };
}

export default async function PropertyDetailsPage({ params }: Props) {
  const { slug } = await params;
  const property = properties.find((item) => item.slug === slug);

  if (!property) {
    notFound();
  }

  const similar = properties.filter((item) => item.slug !== property.slug).slice(0, 3);

  return (
    <PageShell>
      <section className="page-hero">
        <div className="page-hero-inner reveal">
          <div className="stack">
            <Link href="/properties" className="btn btn-secondary">Back to Listings</Link>
            <span className="eyebrow">{property.type} / {property.location}</span>
            <h1>{property.name}</h1>
          </div>
          <div className="stat-grid">
            <div className="stat-card"><strong>{property.price}</strong><span>guide price</span></div>
            <div className="stat-card"><strong>{property.beds}</strong><span>bedrooms</span></div>
            <div className="stat-card"><strong>{property.baths}</strong><span>bathrooms</span></div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="gallery-main reveal">
          <img src={property.gallery[0]} alt={`${property.name} main view`} />
        </div>
        <div className="gallery-strip reveal">
          {property.gallery.map((image, index) => (
            <div key={image}>
              <img src={image} alt={`${property.name} gallery ${index + 1}`} />
            </div>
          ))}
        </div>
      </section>

      <section className="section detail-layout">
        <div className="detail-main">
          <article className="floor-card reveal">
            <span className="eyebrow">Overview</span>
            <h2>Designed for secure, comfortable, modern living.</h2>
            <p>{property.description}</p>
            <div className="property-stats">
              <span>{property.area}</span>
              <span>{property.availability}</span>
              {property.highlights.map((highlight) => (
                <span key={highlight}>{highlight}</span>
              ))}
            </div>
          </article>

          <article className="floor-card reveal">
            <span className="eyebrow">Floor plan</span>
            <h2>Practical layout with generous everyday spaces.</h2>
            <p>{property.floorPlan}</p>
          </article>

          <article className="floor-card reveal">
            <span className="eyebrow">Features and amenities</span>
            <div className="amenity-grid">
              {property.amenities.map((amenity) => (
                <div className="amenity-card" key={amenity}>{amenity}</div>
              ))}
            </div>
          </article>

          <article className="floor-card reveal">
            <span className="eyebrow">Location</span>
            <h2>{property.location}</h2>
            <p>Positioned within Aster Grove&apos;s managed residential corridor with controlled access, landscaped roads, and convenient resident services.</p>
            <div className="map-placeholder">Map placeholder for {property.location}</div>
          </article>
        </div>

        <aside className="detail-side">
          <form className="form-card reveal">
            <h3>Enquire about {property.name}</h3>
            <label>Name<input placeholder="Your name" /></label>
            <label>Email<input type="email" placeholder="you@example.com" /></label>
            <label>Phone<input placeholder="+1 (555) 000-0000" /></label>
            <label>Message<textarea rows={4} defaultValue={`I would like to book an inspection for ${property.name}.`} /></label>
            <button className="btn btn-primary" type="button">Send Inquiry</button>
          </form>
          <div className="contact-card reveal">
            <h3>Speak with management</h3>
            <a href={`tel:${brand.phone}`}>{brand.phone}</a>
            <a href={`mailto:${brand.email}`}>{brand.email}</a>
          </div>
        </aside>
      </section>

      <section className="section">
        <div className="section-intro reveal">
          <span className="eyebrow">Similar properties</span>
          <h2>More residences to compare</h2>
          <p>Explore other available homes with the same calm, premium estate experience.</p>
        </div>
        <div className="property-grid">
          {similar.map((item) => (
            <PropertyCard key={item.slug} property={item} />
          ))}
        </div>
      </section>
    </PageShell>
  );
}
