import Link from "next/link";
import { Property } from "../data/site";

export function PropertyCard({ property }: { property: Property }) {
  return (
    <article className="property-card reveal">
      <Link href={`/properties/${property.slug}`} className="image-frame">
        <img src={property.image} alt={property.name} />
        <span className={`badge ${property.availability === "Reserved" ? "badge-muted" : ""}`}>
          {property.availability}
        </span>
      </Link>
      <div className="property-card-body">
        <div>
          <p className="meta">{property.type} in {property.location}</p>
          <h3>{property.name}</h3>
        </div>
        <strong>{property.price}</strong>
        <p>{property.description}</p>
        <div className="property-stats" aria-label="Property details">
          <span>{property.beds} beds</span>
          <span>{property.baths} baths</span>
          <span>{property.area}</span>
        </div>
        <Link href={`/properties/${property.slug}`} className="btn btn-secondary">
          View Details
        </Link>
      </div>
    </article>
  );
}

export function BlogCard({
  post,
}: {
  post: { title: string; category: string; date: string; excerpt: string; image: string };
}) {
  return (
    <article className="blog-card reveal">
      <div className="image-frame">
        <img src={post.image} alt={post.title} />
      </div>
      <div>
        <p className="meta">{post.category} / {post.date}</p>
        <h3>{post.title}</h3>
        <p>{post.excerpt}</p>
      </div>
    </article>
  );
}
