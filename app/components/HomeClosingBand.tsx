import Image from "next/image";
import Link from "next/link";
import { estateImages } from "../data/images";

export function HomeClosingBand() {
  return (
    <section className="home-closing-band" aria-labelledby="closing-heading">
      <div className="home-closing-bg" aria-hidden="true">
        <Image
          src={estateImages.estateAerial}
          alt=""
          fill
          sizes="100vw"
          className="home-closing-bg-image"
        />
      </div>
      <div className="home-closing-overlay" aria-hidden="true" />
      <div className="home-closing-inner">
        <span className="eyebrow home-closing-eyebrow">Contact management</span>
        <h2 id="closing-heading" className="font-headline-section home-closing-title">
          Ready to visit or discuss estate management?
        </h2>
        <p className="home-closing-lead">
          Book an inspection, ask about availability, or speak with our team about property management support.
        </p>
        <div className="home-closing-actions">
          <Link href="/contact" className="btn btn-primary btn-hero">
            Contact Management
          </Link>
          <Link href="/properties" className="btn btn-secondary btn-hero-outline">
            Browse Properties
          </Link>
        </div>
      </div>
    </section>
  );
}
