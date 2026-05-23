import Link from "next/link";
import { BlogCard, PropertyCard } from "./components/Cards";
import { PageShell, SectionIntro } from "./components/SiteChrome";
import { blogPosts, properties, testimonials } from "./data/site";

const amenities = ["Gated access", "Landscaped roads", "Resident lounge", "Family parks", "Maintenance desk", "Backup power"];
const reasons = [
  ["Managed with care", "Clear communication, reliable reporting, and a resident-first maintenance culture."],
  ["Secure by design", "Layered access control, patrol coordination, visitor protocols, and calm community planning."],
  ["Built for daily ease", "Homes, gardens, roads, and shared spaces planned around comfort and long-term value."],
];

export default function Home() {
  return (
    <PageShell>
      <section className="hero">
        <div className="hero-copy reveal">
          <span className="eyebrow">Secure, Comfortable, Modern Living</span>
          <h1>Find Your Perfect Home in a beautifully managed estate.</h1>
          <p>
            Premium homes, attentive property management, and peaceful community spaces for families, owners, and residents who value comfort without compromise.
          </p>
          <div className="hero-actions">
            <Link href="/properties" className="btn btn-primary">Browse Available Units</Link>
            <Link href="/contact" className="btn btn-secondary">Book an Inspection</Link>
          </div>
        </div>
        <div className="hero-media reveal">
          <img src="https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1600&q=84" alt="Premium estate home exterior" />
          <div className="hero-stat">
            <strong>96%</strong>
            <span>resident satisfaction across managed communities</span>
          </div>
        </div>
      </section>

      <section className="section">
        <SectionIntro eyebrow="Featured properties" title="Residences ready for inspection" text="Explore a curated selection of villas, townhomes, duplexes, and apartments with transparent details and guided viewings." />
        <div className="property-grid">
          {properties.slice(0, 3).map((property) => (
            <PropertyCard key={property.slug} property={property} />
          ))}
        </div>
      </section>

      <section className="section split-section">
        <div className="image-panel reveal">
          <img src="https://images.unsplash.com/photo-1600047509358-9dc75507daeb?auto=format&fit=crop&w=1400&q=82" alt="Landscaped estate walkway" />
        </div>
        <div className="stack reveal">
          <span className="eyebrow">Why choose us</span>
          <h2>Estate living that feels polished from the front gate to the front door.</h2>
          {reasons.map(([title, text]) => (
            <div className="feature-row" key={title}>
              <span />
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section amenities-band">
        <SectionIntro eyebrow="Estate amenities" title="Everything residents expect, quietly handled" text="A balanced blend of services, green space, access control, and resident support keeps daily life simple." />
        <div className="amenity-grid">
          {amenities.map((amenity) => (
            <div className="amenity-card reveal" key={amenity}>{amenity}</div>
          ))}
        </div>
      </section>

      <section className="section">
        <SectionIntro eyebrow="Resident voices" title="Trusted by residents, owners, and families" text="Real estate is personal. Our work is to make the experience feel clear, secure, and well looked after." />
        <div className="testimonial-grid">
          {testimonials.map((item) => (
            <article className="testimonial-card reveal" key={item.name}>
              <p>&ldquo;{item.quote}&rdquo;</p>
              <strong>{item.name}</strong>
              <span>{item.role}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <SectionIntro eyebrow="News and guides" title="Estate insights for better living" text="Helpful updates on maintenance, secure living, property trends, and community life." />
        <div className="blog-grid">
          {blogPosts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      </section>

      <section className="cta-section reveal">
        <div>
          <span className="eyebrow">Contact management</span>
          <h2>Ready to visit or discuss estate management?</h2>
          <p>Book an inspection, ask about availability, or speak with our team about property management support.</p>
        </div>
        <Link href="/contact" className="btn btn-primary">Contact Management</Link>
      </section>
    </PageShell>
  );
}
