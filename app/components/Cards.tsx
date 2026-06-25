import Link from "next/link";
import { Property } from "../data/site";
import { availabilityClass } from "./statusBadge";

export function PropertyCard({ property }: { property: Property }) {
  return (
    <article className="property-card card-interactive">
      <Link href={`/properties/${property.slug}`} className="image-frame">
        <img src={property.image} alt={property.name} loading="lazy" decoding="async" />
        <span className={`badge status-chip ${availabilityClass(property.availability)}`}>
          {property.availability}
        </span>
      </Link>
      <div className="property-card-body">
        <div>
          <p className="meta">
            {property.type} · {property.location}
          </p>
          <h3>{property.name}</h3>
        </div>
        <strong className="font-data-lg">{property.price}</strong>
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

export function AmenityImageCard({ name, image }: { name: string; image: string }) {
  return (
    <article className="amenity-image-card card-interactive">
      <div className="amenity-image-card-media">
        <img src={image} alt={name} loading="lazy" decoding="async" />
        <div className="amenity-image-card-shade" aria-hidden="true" />
        <p className="amenity-image-card-label">{name}</p>
      </div>
    </article>
  );
}

export function BlogCard({
  post,
}: {
  post: { slug: string; title: string; category: string; date: string; excerpt: string; image: string };
}) {
  return (
    <Link href={`/blog/${post.slug}`} className="blog-card card-interactive">
      <div className="image-frame">
        <img src={post.image} alt={post.title} loading="lazy" decoding="async" />
      </div>
      <div className="property-card-body">
        <p className="meta">
          <span className="font-data-md">{post.date}</span> · {post.category}
        </p>
        <h3>{post.title}</h3>
        <p>{post.excerpt}</p>
        <span className="community-inline-link">Read more →</span>
      </div>
    </Link>
  );
}
