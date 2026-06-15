import { AmenityImageCard, BlogCard, PropertyCard } from "./components/Cards";
import { HomeClosingBand } from "./components/HomeClosingBand";
import { HomeHero } from "./components/HomeHero";
import { WhyChooseBand } from "./components/WhyChooseBand";
import { SignatureNumber } from "./components/SignatureNumber";
import { PageShell, SectionIntro } from "./components/SiteChrome";
import Image from "next/image";

import { blogPosts, estateAmenities, properties, testimonials } from "./data/site";

export default function PublicMarketingHome() {

  return (

    <PageShell>

      <HomeHero />



      <section className="section signature-anchor">

        <SignatureNumber number="02" />

        <SectionIntro

          eyebrow="Selected portfolio"

          title="Featured residences"

          text="A curated selection of villas, townhomes, duplexes, and apartments with transparent details and guided viewings."

        />

        <div className="property-grid">

          {properties.slice(0, 3).map((property) => (

            <PropertyCard key={property.slug} property={property} />

          ))}

        </div>

      </section>



      <WhyChooseBand />



      <section className="section">

        <SectionIntro

          eyebrow="Estate amenities"

          title="Everything residents expect, quietly handled"

          text="A balanced blend of services, green space, access control, and resident support keeps daily life simple."

        />

        <div className="amenity-grid amenity-image-grid">

          {estateAmenities.map((amenity) => (

            <AmenityImageCard key={amenity.name} name={amenity.name} image={amenity.image} />

          ))}

        </div>

      </section>



      <section className="section">

        <SectionIntro

          eyebrow="Resident voices"

          title="Trusted by residents, owners, and families"

          text="Real estate is personal. Our work is to make the experience feel clear, secure, and well looked after."

        />

        <div className="testimonial-grid">

          {testimonials.map((item) => (

            <article className="testimonial-card card-interactive" key={item.name}>

              <p className="testimonial-quote">&ldquo;{item.quote}&rdquo;</p>

              <div className="testimonial-author">

                <Image
                  className="testimonial-avatar"
                  src={item.avatar}
                  alt={item.name}
                  loading="lazy"
                  decoding="async"
                  width={52}
                  height={52}
                />

                <div className="testimonial-author-meta">

                  <strong>{item.name}</strong>

                  <span className="meta">{item.role}</span>

                </div>

              </div>

            </article>

          ))}

        </div>

      </section>



      <section className="section">

        <SectionIntro

          eyebrow="News and guides"

          title="Estate insights for better living"

          text="Helpful updates on maintenance, secure living, property trends, and community life."

        />

        <div className="blog-grid">

          {blogPosts.map((post) => (

            <BlogCard key={post.slug} post={post} />

          ))}

        </div>

      </section>



      <HomeClosingBand />

    </PageShell>

  );

}

