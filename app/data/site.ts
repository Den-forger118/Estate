export type Property = {
  slug: string;
  name: string;
  type: string;
  location: string;
  price: string;
  priceValue: number;
  beds: number;
  baths: number;
  area: string;
  availability: "Available" | "Inspection Open" | "Limited Units" | "Reserved";
  image: string;
  gallery: string[];
  description: string;
  highlights: string[];
  amenities: string[];
  floorPlan: string;
};

export const brand = {
  name: "Ernest Ofori",
  phone: "+1 (555) 024-8176",
  email: "hello@ernestofori.com",
  whatsapp: "+1 (555) 024-8176",
  address: "1488 Meadowline Avenue, Westhaven, CA 94025",
};

export const imagePrompts = [
  "Photorealistic premium gated estate entrance at golden hour, landscaped road, calm high-end residential community, no text or logos.",
  "Modern villa homes with soft neutral facade, mature gardens, warm interior lighting, premium real estate website photography.",
  "Aerial view of a secure planned estate with tree-lined roads, community spaces, and contemporary homes, realistic luxury development.",
  "Elegant modern home interior with natural stone, warm wood, wide windows, refined residential living, editorial real estate photography.",
];

export const properties: Property[] = [
  {
    slug: "meadowline-villa",
    name: "Meadowline Villa",
    type: "Detached Villa",
    location: "Westhaven Grove",
    price: "$845,000",
    priceValue: 845000,
    beds: 5,
    baths: 4,
    area: "4,280 sq ft",
    availability: "Inspection Open",
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=82",
    gallery: [
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=82",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=82",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=82",
    ],
    description:
      "A refined family villa set along the estate's central green corridor, designed with generous living rooms, a private study, a chef's kitchen, and shaded outdoor dining.",
    highlights: ["Private garden", "Two-car garage", "Smart access control", "Green corridor view"],
    amenities: ["Estate security", "Club lounge", "Fiber internet", "Waste collection", "Backup power"],
    floorPlan: "Ground floor living suite, open kitchen, terrace, four upstairs bedrooms, study, and family lounge.",
  },
  {
    slug: "oak-court-townhome",
    name: "Oak Court Townhome",
    type: "Townhome",
    location: "Oak Court",
    price: "$520,000",
    priceValue: 520000,
    beds: 4,
    baths: 3,
    area: "2,760 sq ft",
    availability: "Available",
    image:
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1400&q=82",
    gallery: [
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1400&q=82",
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1400&q=82",
      "https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=1400&q=82",
    ],
    description:
      "A low-maintenance residence with bright interiors, a flexible den, landscaped frontage, and quick access to the family park and service boulevard.",
    highlights: ["Flexible den", "Covered patio", "Park access", "Managed landscaping"],
    amenities: ["24-hour patrol", "Maintenance desk", "Visitor parking", "Play lawns", "Water treatment"],
    floorPlan: "Open living and dining level, rear patio, three bedrooms upstairs, guest suite, den, and utility room.",
  },
  {
    slug: "cedar-terrace-apartment",
    name: "Cedar Terrace Apartment",
    type: "Apartment",
    location: "Cedar Terrace",
    price: "$315,000",
    priceValue: 315000,
    beds: 3,
    baths: 2,
    area: "1,640 sq ft",
    availability: "Limited Units",
    image:
      "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1400&q=82",
    gallery: [
      "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1400&q=82",
      "https://images.unsplash.com/photo-1600210491369-e753d80a41f3?auto=format&fit=crop&w=1400&q=82",
      "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1400&q=82",
    ],
    description:
      "A sunlit apartment with efficient planning, balcony views toward the gardens, secure lobby entry, and dedicated resident amenities.",
    highlights: ["Garden balcony", "Secure lobby", "Elevator access", "Resident lounge"],
    amenities: ["Gym studio", "Package room", "Concierge desk", "CCTV", "Backup water"],
    floorPlan: "Three bedrooms, two baths, open kitchen, dining balcony, laundry closet, and entry storage.",
  },
  {
    slug: "willow-garden-duplex",
    name: "Willow Garden Duplex",
    type: "Duplex",
    location: "Willow Garden",
    price: "$690,000",
    priceValue: 690000,
    beds: 4,
    baths: 4,
    area: "3,320 sq ft",
    availability: "Reserved",
    image:
      "https://images.unsplash.com/photo-1600607687644-c7171b42498b?auto=format&fit=crop&w=1400&q=82",
    gallery: [
      "https://images.unsplash.com/photo-1600607687644-c7171b42498b?auto=format&fit=crop&w=1400&q=82",
      "https://images.unsplash.com/photo-1600566752229-250ed79470c8?auto=format&fit=crop&w=1400&q=82",
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=82",
    ],
    description:
      "A private duplex residence with balanced indoor-outdoor living, refined finishes, and a location near the quiet eastern walking trail.",
    highlights: ["Trail access", "Double-height living", "Private terrace", "Staff room"],
    amenities: ["Access control", "Estate shuttle", "Walking trail", "Garden care", "Power backup"],
    floorPlan: "Double-height lounge, terrace-facing dining, four ensuite rooms, family lounge, and service quarters.",
  },
];

export const services = [
  ["Property management", "Structured operations, owner reporting, resident communications, and vendor supervision."],
  ["Estate maintenance", "Preventive maintenance for roads, utilities, landscaping, common areas, and shared facilities."],
  ["Leasing support", "Listing preparation, guided inspections, application handling, and move-in coordination."],
  ["Property inspections", "Detailed condition checks, handover reports, and routine quality audits."],
  ["Tenant support", "Responsive helpdesk support for repairs, access, billing questions, and resident requests."],
  ["Security coordination", "Access protocols, patrol coordination, visitor control, and incident escalation."],
  ["Client advisory services", "Guidance for owners, investors, and families choosing the right estate residence."],
];

export const blogPosts = [
  {
    slug: "choosing-a-secure-estate",
    title: "What to Look for When Choosing a Secure Residential Estate",
    category: "Housing tips",
    date: "May 12, 2026",
    excerpt: "A practical guide to access control, community design, maintenance culture, and long-term comfort.",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=82",
  },
  {
    slug: "maintenance-seasonal-checklist",
    title: "A Seasonal Maintenance Checklist for Modern Homes",
    category: "Maintenance",
    date: "April 28, 2026",
    excerpt: "Small checks that protect finishes, improve efficiency, and keep residential living calm year-round.",
    image: "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?auto=format&fit=crop&w=1200&q=82",
  },
  {
    slug: "community-living",
    title: "Designing Community Living Without Losing Privacy",
    category: "Community",
    date: "April 9, 2026",
    excerpt: "How walkways, green buffers, amenities, and good management shape a better daily rhythm.",
    image: "https://images.unsplash.com/photo-1600607688066-890987f18a86?auto=format&fit=crop&w=1200&q=82",
  },
];

export const testimonials = [
  {
    name: "Maya Ellison",
    role: "Resident, Meadowline Villa",
    quote:
      "The estate feels considered in every detail. Security is discreet, the grounds are immaculate, and inspections were handled with real care.",
  },
  {
    name: "Daniel Reyes",
    role: "Owner client",
    quote:
      "Ernest Ofori made the leasing process feel calm and transparent. The reporting is clear, and the management team is easy to reach.",
  },
  {
    name: "Nora Whitaker",
    role: "Resident, Cedar Terrace",
    quote:
      "It is the first place we have lived where maintenance feels proactive. The community spaces are beautiful without being noisy.",
  },
];
