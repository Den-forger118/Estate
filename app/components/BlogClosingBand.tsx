import Link from "next/link";

export function BlogClosingBand() {
  return (
    <section className="blog-closing-band" aria-labelledby="blog-closing-heading">
      <div className="blog-closing-inner">
        <span className="eyebrow blog-closing-eyebrow">Next step</span>
        <h2 id="blog-closing-heading" className="font-headline-section blog-closing-title">
          Considering a move to Special Gardens?
        </h2>
        <p className="blog-closing-lead">
          Browse available residences or speak with our estate team about inspections and management
          support.
        </p>
        <div className="blog-closing-actions">
          <Link href="/properties" className="btn btn-primary">
            Browse properties
          </Link>
          <Link href="/contact" className="btn btn-secondary btn-hero-outline blog-closing-secondary">
            Contact management
          </Link>
        </div>
      </div>
    </section>
  );
}
