import {
  blogPosts as mockBlogPosts,
  brand as mockBrand,
  properties as mockProperties,
  testimonials as mockTestimonials,
} from "./mockData";
import { estateImages } from "./images";

export type Property = {
  id: string;
  slug: string;
  name: string;
  type: string;
  location: string;
  price: string;
  priceValue: number;
  beds: number;
  baths: number;
  sqft: number;
  area: string;
  availability: "Available" | "Inspection Open" | "Limited Units" | "Reserved";
  listedDate: string;
  image: string;
  gallery: string[];
  description: string;
  highlights: string[];
  amenities: string[];
  floorPlan: string;
  coordinates: { lat: number; lng: number };
};

export const brand = mockBrand;

/** Ghana cedis — use across public property UI */
export function formatGhs(amount: number) {
  return `GH₵ ${amount.toLocaleString("en-GH")}`;
}

export const imagePrompts = [
  "Photorealistic premium gated estate entrance at golden hour, landscaped road, calm high-end residential community, no text or logos.",
  "Modern villa homes with soft neutral facade, mature gardens, warm interior lighting, premium real estate website photography.",
  "Aerial view of a secure planned estate with tree-lined roads, community spaces, and contemporary homes, realistic luxury development.",
  "Elegant modern home interior with natural stone, warm wood, wide windows, refined residential living, editorial real estate photography.",
];

export const properties: Property[] = mockProperties.map((p) => ({
  id: p.id,
  slug: p.slug,
  name: p.name,
  type: p.type,
  location: p.location,
  price: formatGhs(p.price),
  priceValue: p.price,
  beds: p.beds,
  baths: p.baths,
  sqft: p.sqft,
  area: `${p.sqft.toLocaleString()} sq ft`,
  availability: p.status,
  listedDate: p.listedDate,
  image: p.images[0],
  gallery: p.gallery,
  description: p.description,
  highlights: p.highlights,
  amenities: p.amenities,
  floorPlan: p.floorPlan,
  coordinates: p.coordinates,
}));

export const estateAmenities = [
  { name: "Gated access", image: estateImages.gatedEntrance },
  { name: "Landscaped roads", image: estateImages.gardenWalkway },
  { name: "Resident lounge", image: estateImages.communityLobby },
  { name: "Family parks", image: estateImages.familyParks },
  { name: "Maintenance desk", image: estateImages.maintenance },
  { name: "Backup power", image: estateImages.duskResidence },
] as const;

export const serviceGroups = [
  {
    id: "operations",
    eyebrow: "Operations",
    title: "Running the estate, day in and day out",
    lead: "Vendor oversight, reporting rhythms, and landscape cycles keep shared infrastructure predictable.",
    image: estateImages.estateAerial,
    reverse: false,
    services: [
      {
        title: "Property management",
        text: "Structured operations, owner reporting, resident communications, and vendor supervision.",
      },
      {
        title: "Estate maintenance",
        text: "Preventive maintenance for roads, utilities, landscaping, common areas, and shared facilities.",
      },
    ],
  },
  {
    id: "leasing",
    eyebrow: "Leasing & handover",
    title: "From listing to keys in hand",
    lead: "Every viewing, application, and move-in is coordinated with clarity for owners and residents alike.",
    image: estateImages.keysHandover,
    reverse: true,
    services: [
      {
        title: "Leasing support",
        text: "Listing preparation, guided inspections, application handling, and move-in coordination.",
      },
      {
        title: "Property inspections",
        text: "Detailed condition checks, handover reports, and routine quality audits.",
      },
    ],
  },
  {
    id: "resident",
    eyebrow: "Resident life",
    title: "Support and security residents feel every day",
    lead: "Responsive help when something breaks, and calm protocols when access matters most.",
    image: estateImages.communityLobby,
    reverse: false,
    services: [
      {
        title: "Tenant support",
        text: "Responsive helpdesk support for repairs, access, billing questions, and resident requests.",
      },
      {
        title: "Security coordination",
        text: "Access protocols, patrol coordination, visitor control, and incident escalation.",
      },
    ],
  },
  {
    id: "advisory",
    eyebrow: "Advisory",
    title: "Guidance before and after you move in",
    lead: "For owners, investors, and families choosing the right estate residence with confidence.",
    image: estateImages.briefing,
    reverse: true,
    services: [
      {
        title: "Client advisory services",
        text: "Guidance for owners, investors, and families choosing the right estate residence.",
      },
    ],
    showCta: true,
  },
] as const;

export type BlogPost = {
  slug: string;
  title: string;
  category: string;
  date: string;
  excerpt: string;
  readTime: string;
  image: string;
  content: string[];
};

export const blogPosts: BlogPost[] = mockBlogPosts.map((post) => ({
  slug: post.slug,
  title: post.title,
  category: post.category,
  date: post.date,
  excerpt: post.excerpt,
  readTime: post.readTime,
  image: post.image,
  content: post.content,
}));

export const blogCategories = [
  "All",
  ...Array.from(new Set(blogPosts.map((post) => post.category))),
] as const;

export function formatBlogDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function getFeaturedBlogPost() {
  return [...blogPosts].sort((a, b) => b.date.localeCompare(a.date))[0];
}

export const testimonials = mockTestimonials.map((t) => ({
  name: t.name,
  role: `${t.role} · ${t.unit}`,
  quote: t.quote,
  avatar: t.avatar,
}));
