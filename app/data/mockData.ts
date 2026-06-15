import { estateImages } from "./images";

// ─── PROPERTIES (public listings) ───────────────────────────────────────────

export const properties = [
  {
    id: "EO-7701",
    slug: "meadowline-villa",
    name: "Meadowline Villa",
    type: "Detached Villa",
    location: "East Legon Residential, Accra",
    price: 845000,
    priceType: "sale" as const,
    rentPerMonth: null as number | null,
    beds: 5,
    baths: 4,
    sqft: 4200,
    status: "Inspection Open" as const,
    availability: true,
    description:
      "A sprawling contemporary villa situated within the gated Meadowline precinct. Floor-to-ceiling glazing, a 25-metre lap pool, and direct estate road access make this one of the most sought-after addresses in East Legon.",
    highlights: ["25m Lap Pool", "Home Cinema", "Staff Quarters", "Solar Backup", "4-Car Garage"],
    amenities: ["Gated Access", "Landscaped Gardens", "Smart Home System", "Backup Generator", "CCTV"],
    images: [estateImages.villaPool, estateImages.modernVilla, estateImages.livingRoom],
    gallery: [estateImages.villaPool, estateImages.modernVilla, estateImages.livingRoom, estateImages.brightLiving],
    floorPlan:
      "5 bedrooms across 2 floors. Master suite with en-suite on upper level. Open-plan kitchen and dining on ground floor. Separate staff wing adjacent to garage.",
    coordinates: { lat: 5.6357, lng: -0.1695 },
    listedDate: "2024-01-15",
  },
  {
    id: "EO-8199",
    slug: "oak-court-townhome",
    name: "Oak Court Townhome",
    type: "Townhome",
    location: "Cantonments District, Accra",
    price: 520000,
    priceType: "sale" as const,
    rentPerMonth: null,
    beds: 4,
    baths: 3,
    sqft: 2850,
    status: "Available" as const,
    availability: true,
    description:
      "A meticulously maintained townhome in the heart of Cantonments. Double-volume living room, landscaped rear courtyard, and proximity to the Accra Ridge Club distinguish this property.",
    highlights: ["Double-Volume Living Room", "Rear Courtyard", "Study/Home Office", "Built-in Wardrobes"],
    amenities: ["Gated Complex", "Visitor Parking", "Intercom System", "Solar Water Heating"],
    images: [estateImages.whiteEstate, estateImages.patioHome, estateImages.kitchen],
    gallery: [estateImages.whiteEstate, estateImages.patioHome, estateImages.kitchen, estateImages.contemporaryHome],
    floorPlan:
      "4 bedrooms across 3 floors. Ground floor: kitchen, dining, living, guest WC. First floor: 2 bedrooms, shared bathroom. Second floor: master suite and study.",
    coordinates: { lat: 5.5717, lng: -0.1888 },
    listedDate: "2024-02-03",
  },
  {
    id: "EO-2031",
    slug: "cedar-terrace-apartment",
    name: "Cedar Terrace Apartment",
    type: "Apartment",
    location: "Airport Residential Area, Accra",
    price: 315000,
    priceType: "sale" as const,
    rentPerMonth: 3200,
    beds: 3,
    baths: 2,
    sqft: 1600,
    status: "Limited Units" as const,
    availability: true,
    description:
      "A contemporary apartment on the 8th floor of the Cedar Terrace complex with panoramic views toward the Accra skyline. Open-plan design, premium finishes, and access to the resident rooftop terrace.",
    highlights: ["Panoramic City View", "Rooftop Terrace Access", "Concierge Service", "Underground Parking"],
    amenities: ["Gym", "Swimming Pool", "Concierge", "EV Charging", "High-Speed Internet"],
    images: [estateImages.heroInterior, estateImages.apartmentInterior, estateImages.ensuiteBath],
    gallery: [estateImages.heroInterior, estateImages.apartmentInterior, estateImages.ensuiteBath, estateImages.brightLiving],
    floorPlan:
      "3 bedrooms in open-plan configuration. Master bedroom with en-suite and walk-in wardrobe. Two secondary bedrooms with shared bathroom. Large balcony off living room.",
    coordinates: { lat: 5.6037, lng: -0.187 },
    listedDate: "2024-02-18",
  },
  {
    id: "EO-3344",
    slug: "willow-garden-duplex",
    name: "Willow Garden Duplex",
    type: "Duplex",
    location: "Labone District, Accra",
    price: 690000,
    priceType: "sale" as const,
    rentPerMonth: null,
    beds: 4,
    baths: 4,
    sqft: 3100,
    status: "Reserved" as const,
    availability: false,
    description:
      "A striking duplex property within the Willow Garden enclave. Mirrored architectural wings, integrated garage, and mature garden borders. Currently reserved — expressions of interest welcome for waitlist.",
    highlights: ["Integrated 2-Car Garage", "Mature Garden", "Private Courtyard", "Generator Included"],
    amenities: ["Gated Estate", "Perimeter Lighting", "Borehole Water", "Security Post"],
    images: [estateImages.duplexExterior, estateImages.contemporaryHome, estateImages.gardenWalkway],
    gallery: [estateImages.duplexExterior, estateImages.contemporaryHome, estateImages.gardenWalkway, estateImages.duskResidence],
    floorPlan:
      "4 bedrooms split across two mirrored wings. Wing A: master suite + 1 bedroom. Wing B: 2 bedrooms. Shared central living and kitchen on ground level.",
    coordinates: { lat: 5.5585, lng: -0.1731 },
    listedDate: "2024-01-28",
  },
];

// ─── DASHBOARD PORTFOLIO ──────────────────────────────────────────────────

export const dashboardProperties = [
  {
    name: "Meadowline Estate",
    address: "East Legon Residential, Accra",
    status: "Active",
    units: "86",
    occupancy: "96%",
    revenue: "GH₵ 4.2M",
    image: estateImages.villaPool,
    tab: "Active" as const,
  },
  {
    name: "Cedar Terrace Complex",
    address: "Airport Residential Area, Accra",
    status: "Active",
    units: "124",
    occupancy: "94%",
    revenue: "GH₵ 3.1M",
    image: estateImages.heroInterior,
    tab: "Active" as const,
  },
  {
    name: "Harbor Plaza Commercial",
    address: "Tema Port Access Road",
    status: "Development",
    units: "48",
    occupancy: "62%",
    revenue: "Q4 2026",
    image: estateImages.grandDevelopment,
    tab: "Development" as const,
  },
  {
    name: "Oak Court Residences",
    address: "Cantonments District, Accra",
    status: "Maintenance",
    units: "32",
    occupancy: "91%",
    revenue: "GH₵ 1.8M",
    image: estateImages.whiteEstate,
    tab: "Maintenance" as const,
  },
];

// ─── TENANTS ──────────────────────────────────────────────────────────────

export const tenants = [
  { id: "T-001", name: "Adrian Sterling", unit: "Cedar Terrace, Apt 402", status: "Active", balance: 0, leaseEnd: "2025-03-31", phone: "+233 24 512 8801", email: "a.sterling@email.com", note: "Early payer" },
  { id: "T-002", name: "Elena Martinez", unit: "Heritage Lofts, 12A", status: "Active", balance: 0, leaseEnd: "2024-12-31", phone: "+233 20 774 3302", email: "e.martinez@email.com", note: "" },
  { id: "T-003", name: "Kwame Asante", unit: "Oak Court, Unit 3B", status: "Active", balance: -1200, leaseEnd: "2025-06-30", phone: "+233 55 102 9981", email: "k.asante@email.com", note: "Outstanding balance" },
  { id: "T-004", name: "Dr. Nana Boateng", unit: "Meadowline Villa", status: "Active", balance: 0, leaseEnd: "2026-01-15", phone: "+233 24 887 6610", email: "n.boateng@email.com", note: "VIP tenant" },
  { id: "T-005", name: "Abena Owusu", unit: "Cedar Terrace, Apt 308", status: "Notice Given", balance: 0, leaseEnd: "2024-11-30", phone: "+233 26 334 5501", email: "a.owusu@email.com", note: "Vacating Nov 30" },
  { id: "T-006", name: "James Ofori-Mensah", unit: "Willow Garden, Unit A", status: "Pending Approval", balance: 0, leaseEnd: null, phone: "+233 20 991 2234", email: "j.ofori@email.com", note: "Application under review" },
];

// ─── LEASES ───────────────────────────────────────────────────────────────

export const leases = [
  { id: "LSE-2024-001", tenant: "Adrian Sterling", property: "Cedar Terrace", unit: "Apt 402", status: "Active", startDate: "2024-04-01", endDate: "2025-03-31", rentMonthly: 3200, deposit: 6400 },
  { id: "LSE-2024-002", tenant: "Elena Martinez", property: "Heritage Lofts", unit: "12A", status: "Active", startDate: "2024-01-01", endDate: "2024-12-31", rentMonthly: 2800, deposit: 5600 },
  { id: "LSE-2024-003", tenant: "Kwame Asante", property: "Oak Court", unit: "3B", status: "Active", startDate: "2024-07-01", endDate: "2025-06-30", rentMonthly: 4100, deposit: 8200 },
  { id: "LSE-2024-004", tenant: "Dr. Nana Boateng", property: "Meadowline Villa", unit: "Full Property", status: "Active", startDate: "2024-02-01", endDate: "2026-01-15", rentMonthly: 8500, deposit: 17000 },
  { id: "LSE-2024-005", tenant: "Abena Owusu", property: "Cedar Terrace", unit: "Apt 308", status: "Notice Given", startDate: "2023-12-01", endDate: "2024-11-30", rentMonthly: 2950, deposit: 5900 },
];

// ─── PAYMENTS ─────────────────────────────────────────────────────────────

export const payments = [
  { ref: "PAY-20240324-001", tenant: "Adrian Sterling", property: "Cedar Terrace, Apt 402", status: "Completed", amount: 4250, date: "2024-03-24", method: "Bank Transfer", receipt_hash: "PAY-20240324-001" },
  { ref: "PAY-20240323-002", tenant: "Global Logistics Ltd", property: "Harbor Plaza, Ground Floor", status: "Pending", amount: 12800, date: "2024-03-23", method: "Cheque", receipt_hash: null },
  { ref: "PAY-20240322-003", tenant: "Elena Martinez", property: "Heritage Lofts, 12A", status: "Completed", amount: 3100, date: "2024-03-22", method: "Mobile Money", receipt_hash: "PAY-20240322-003" },
  { ref: "PAY-20240320-004", tenant: "Dr. Nana Boateng", property: "Meadowline Villa", status: "Completed", amount: 8500, date: "2024-03-20", method: "Bank Transfer", receipt_hash: "PAY-20240320-004" },
  { ref: "PAY-20240318-005", tenant: "Kwame Asante", property: "Oak Court, 3B", status: "Overdue", amount: 4100, date: "2024-03-18", method: null, receipt_hash: null },
  { ref: "PAY-20240315-006", tenant: "Abena Owusu", property: "Cedar Terrace, Apt 308", status: "Completed", amount: 2950, date: "2024-03-15", method: "Mobile Money", receipt_hash: "PAY-20240315-006" },
];

// ─── MAINTENANCE ──────────────────────────────────────────────────────────

export const maintenanceTickets = [
  { id: "TKT-001", title: "Leak repair in Penthouse B-12", property: "Cedar Terrace", unit: "Penthouse B-12", priority: "Urgent", status: "New" as const, assignee: "Kofi Mensah", createdDate: "2024-03-24", dueDate: "2024-03-24", description: "Tenant reports water ingress from the ceiling of the master bathroom following heavy rains." },
  { id: "TKT-004", title: "Perimeter lighting fault — Gate C", property: "Meadowline Villa", unit: "Perimeter", priority: "Medium", status: "New" as const, assignee: null, createdDate: "2024-03-23", dueDate: "2024-03-25", description: "Three perimeter lights on Gate C sector are non-functional. Security flagged." },
  { id: "TKT-002", title: "Elevator compliance inspection", property: "Cedar Terrace", unit: "Building Common", priority: "Medium", status: "In Progress" as const, assignee: "James Hackman", createdDate: "2024-03-22", dueDate: "2024-03-26", description: "Annual elevator safety certification due. Inspector visit scheduled." },
  { id: "TKT-003", title: "Gym HVAC filter replacement", property: "Oak Court", unit: "Gym", priority: "Low", status: "In Progress" as const, assignee: "Emmanuel Tetteh", createdDate: "2024-03-20", dueDate: "2024-03-31", description: "Quarterly HVAC filter change required for gym air handling units." },
  { id: "TKT-005", title: "Pool pump servicing", property: "Willow Garden", unit: "Pool Area", priority: "Low", status: "Resolved" as const, assignee: "Kofi Mensah", createdDate: "2024-03-10", dueDate: "2024-03-15", description: "Routine annual pool pump service and chemical balance check." },
  { id: "TKT-006", title: "Intercom system reset — Block A", property: "Cedar Terrace", unit: "Block A", priority: "Medium", status: "Resolved" as const, assignee: "James Hackman", createdDate: "2024-03-08", dueDate: "2024-03-10", description: "Intercom panel in Block A lobby required firmware reset after power fluctuation." },
];

// ─── MESSAGES ─────────────────────────────────────────────────────────────

export const messages = [
  { id: "MSG-001", sender: "Dr. Nana Boateng", avatar: "NB", unit: "Meadowline Villa", subject: "Regarding the perimeter lighting", preview: "Good morning, I wanted to follow up on the reported fault at Gate C...", time: "09:14", date: "2024-03-24", unread: true, body: "Good morning, I wanted to follow up on the reported fault at Gate C. My security team noticed the lights were still off last night. Could you give me an update on the repair timeline? Thank you." },
  { id: "MSG-002", sender: "Abena Owusu", avatar: "AO", unit: "Cedar Terrace, Apt 308", subject: "Move-out checklist request", preview: "Hello, as I am vacating at end of November, please could you send...", time: "08:30", date: "2024-03-24", unread: true, body: "Hello, as I am vacating at end of November, please could you send me the official move-out checklist and schedule a final inspection? I want to ensure the deposit is fully returned." },
  { id: "MSG-003", sender: "Kwame Asante", avatar: "KA", unit: "Oak Court, 3B", subject: "Payment arrangement request", preview: "I apologise for the delay on this month's rent. I would like to...", time: "Yesterday", date: "2024-03-23", unread: false, body: "I apologise for the delay on this month's rent. I would like to request a short payment arrangement — I can settle the full outstanding by the 31st. Please advise if this is acceptable." },
  { id: "MSG-004", sender: "Estate Security", avatar: "ES", unit: "Operations", subject: "Nightly patrol report — 23 Mar", preview: "All sectors completed. No irregularities. Gate A manual override tested...", time: "Yesterday", date: "2024-03-23", unread: false, body: "All sectors completed. No irregularities. Gate A manual override tested and confirmed operational. Gate C lights still awaiting maintenance — logged as TKT-004." },
  { id: "MSG-005", sender: "Elena Martinez", avatar: "EM", unit: "Heritage Lofts, 12A", subject: "Lease renewal enquiry", preview: "My lease expires December 31st. I would love to renew for another year...", time: "Mon", date: "2024-03-21", unread: false, body: "My lease expires December 31st. I would love to renew for another year if terms remain similar. Could you send me the renewal proposal at your earliest convenience?" },
];

// ─── COMMUNITY ────────────────────────────────────────────────────────────

export const events = [
  { id: "EVT-001", title: "Wine & Jazz Soirée", date: "2024-10-28", time: "7:00 PM", location: "Estate Lounge, Ground Floor", category: "Social", capacity: 40, rsvp: 27, description: "Join fellow residents for an evening of vintage jazz performed by the Accra String Quartet and a sommelier-curated wine selection.", image: estateImages.networking, when: "Fri 7:00 PM", tag: "Community Exclusive" },
  { id: "EVT-002", title: "Roof Garden Yoga", date: "2024-11-02", time: "8:00 AM", location: "Terrace West", category: "Wellness", capacity: 20, rsvp: 12, description: "A guided sunrise yoga session on the west terrace. Mats provided. All levels welcome.", image: estateImages.communityGathering, when: "Sat 8:00 AM", tag: "Wellness" },
  { id: "EVT-003", title: "Art Gallery Opening", date: "2024-11-05", time: "6:00 PM", location: "Main Lobby Gallery", category: "Culture", capacity: 60, rsvp: 38, description: "The opening of Kwabena Acheampong's residency exhibition \"Between Borders\" — a collection of large-format photography.", image: estateImages.briefing, when: "Tue 6:00 PM", tag: "Culture" },
  { id: "EVT-004", title: "Estate AGM", date: "2024-11-15", time: "10:00 AM", location: "Conference Room B", category: "Official", capacity: 80, rsvp: 54, description: "Annual General Meeting covering estate budget review, service charge update, and resident committee elections.", image: estateImages.communityLobby, when: "Fri 10:00 AM", tag: "Committee" },
];

export const directory = [
  { id: "RES-001", name: "Alex Morgan", unit: "Penthouse 4B", role: "Resident", committee: "Social Committee", visibility: "Residents Only", verified: true },
  { id: "RES-002", name: "Dr. Nana Boateng", unit: "Meadowline Villa", role: "Resident", committee: "Estate Committee Chair", visibility: "Public", verified: true },
  { id: "RES-003", name: "Elena Martinez", unit: "Heritage Lofts, 12A", role: "Resident", committee: null, visibility: "Residents Only", verified: true },
  { id: "RES-004", name: "Adrian Sterling", unit: "Cedar Terrace, Apt 402", role: "Resident", committee: "Security Liaison", visibility: "Residents Only", verified: true },
  { id: "RES-005", name: "Abena Owusu", unit: "Cedar Terrace, Apt 308", role: "Resident", committee: null, visibility: "Hidden", verified: true },
];

export const securityNotices = [
  { id: "SEC-001", type: "Alert", title: "Main Gate Maintenance", text: "Maintenance on the automatic recognition system between 22:00 and 02:00 tonight. Please use manual entry.", status: "Active", log: "4928", date: "2024-03-24", posted: "Posted 2h ago" },
  { id: "SEC-002", type: "Notice", title: "Pool Deck Reservation", text: "The north pool deck will be reserved for a private corporate event this Thursday from 14:00 to 18:00.", status: "Scheduled", log: "4912", date: "2024-03-21", posted: "Posted yesterday" },
];

export const marketplaceProviders = [
  { id: "PRV-001", name: "CleanPro Estate Services", category: "Cleaning", rating: 4.8, priceRange: "GH₵ 150–400 / visit", verified: true, description: "Professional deep-clean and maintenance cleaning for residential units.", phone: "+233 24 500 1122", image: estateImages.cleaningSession },
  { id: "PRV-002", name: "GreenThumb Landscaping", category: "Gardening", rating: 4.6, priceRange: "GH₵ 200–600 / session", verified: true, description: "Specialist estate landscaping, hedge trimming, and garden maintenance.", phone: "+233 55 312 8800", image: estateImages.serviceGardening },
  { id: "PRV-003", name: "SwiftFix Plumbing & Gas", category: "Plumbing", rating: 4.5, priceRange: "GH₵ 100–350 / job", verified: true, description: "Licensed plumbing, gas fitting, and emergency leak response.", phone: "+233 20 678 4401", image: estateImages.servicePlumbing },
  { id: "PRV-004", name: "AirCool HVAC Specialists", category: "HVAC", rating: 4.7, priceRange: "GH₵ 250–800 / service", verified: true, description: "Air conditioning installation, servicing, and emergency repairs.", phone: "+233 26 551 9902", image: estateImages.serviceHvac },
];

export const marketplaceCategories = ["All Services", "Cleaning", "Gardening", "Plumbing", "HVAC"];

export const facilityBookings = [
  { id: "BKG-001", facility: "Rooftop Terrace", resident: "Alex Morgan", date: "2024-10-26", startTime: "10:00", endTime: "12:00", status: "Confirmed" },
  { id: "BKG-002", facility: "Conference Room B", resident: "Dr. Nana Boateng", date: "2024-10-28", startTime: "09:00", endTime: "11:00", status: "Confirmed" },
  { id: "BKG-003", facility: "BBQ Area", resident: "Adrian Sterling", date: "2024-10-27", startTime: "16:00", endTime: "20:00", status: "Pending" },
];

// ─── KPI & CHARTS ─────────────────────────────────────────────────────────

export const kpiSummary = {
  grossRevenue: 842400,
  revenueChange: 12.5,
  occupancyRate: 94.2,
  occupancyChange: -0.8,
  vacantUnits: 12,
  totalUnits: 180,
  activeTickets: 42,
  urgentTickets: 14,
  pendingTasks: 18,
  nextInspectionDays: 2,
  rentCollectionRate: 98,
  openMaintenanceCount: 12,
};

export const kpis = [
  { label: "Occupancy Rate", value: "94.2%", trend: "+2.1%", text: "Across 180 managed units" },
  { label: "Monthly Revenue", value: "GH₵ 842k", trend: "+12.5%", text: "Collections this month" },
  { label: "Rent Collection", value: "98%", trend: "On plan", text: "6 payments pending" },
  { label: "Open Maintenance", value: "12", trend: "-4", text: "2 urgent tickets" },
];

export const revenueChartData = [
  { month: "JAN", residential: 58000, commercial: 24000, value: 82000 },
  { month: "FEB", residential: 63000, commercial: 28000, value: 91000 },
  { month: "MAR", residential: 74000, commercial: 31000, value: 105000 },
  { month: "APR", residential: 52000, commercial: 22000, value: 74000 },
  { month: "MAY", residential: 68000, commercial: 29000, value: 97000 },
  { month: "JUN", residential: 81000, commercial: 35000, value: 116000 },
];

// ─── PUBLIC CONTENT ───────────────────────────────────────────────────────

export const testimonials = [
  {
    quote:
      "The transition to our new estate was seamless. Special Gardens represents a standard of management we had not found elsewhere in the region.",
    name: "Mr. Kwame Adu",
    role: "Resident since 2019",
    unit: "Oak Court",
    avatar: estateImages.testimonialKwame,
  },
  {
    quote:
      "Quiet luxury is not just a tagline here — it is a daily experience. Every detail from landscaping to security is handled with supreme discretion.",
    name: "Elena Ross",
    role: "Senior Partner",
    unit: "Cedar Terrace, Penthouse",
    avatar: estateImages.testimonialElena,
  },
  {
    quote:
      "Management that understands the value of time and privacy. The institutional excellence here is palpable in every interaction.",
    name: "Dr. Samuel Osei",
    role: "Resident since 2021",
    unit: "Meadowline Villa",
    avatar: estateImages.testimonialSamuel,
  },
];

export const blogPosts = [
  {
    id: "BLG-001",
    slug: "choosing-a-secure-estate",
    title: "What to Look for When Choosing a Secure Residential Estate",
    category: "Housing Tips",
    date: "2024-05-12",
    excerpt:
      "Security infrastructure, management track record, and community culture are the three pillars that separate a great estate from a merely expensive one.",
    readTime: "5 min read",
    image: estateImages.keysHandover,
    content: [
      "Choosing a residential estate is one of the most consequential housing decisions a family can make — and security is rarely the only variable, even when it feels like the most urgent.",
      "Start with physical infrastructure: perimeter fencing, controlled access points, CCTV coverage, and lighting along pedestrian routes. A well-designed estate makes security visible without making residents feel surveilled.",
      "Management track record matters just as much. Ask how visitor access is logged, how incidents are escalated, and how quickly maintenance issues at gates or barriers are resolved. A beautiful entrance is only as reliable as the team maintaining it.",
      "Finally, observe community culture during a visit. Are shared spaces cared for? Do residents seem at ease? The best estates combine hardware, protocols, and a management culture that treats safety as a daily practice — not a marketing line.",
    ],
  },
  {
    id: "BLG-002",
    slug: "seasonal-maintenance-checklist",
    title: "A Seasonal Maintenance Checklist for Modern Homes",
    category: "Maintenance",
    date: "2024-04-28",
    excerpt:
      "Proactive seasonal maintenance is the single highest-return investment a homeowner can make. Our estate managers share their annual checklist.",
    readTime: "7 min read",
    image: estateImages.cleaningSession,
    content: [
      "Seasonal maintenance protects both comfort and property value. The goal is not a single annual overhaul, but a predictable rhythm that catches small issues before they become expensive repairs.",
      "At the start of the dry season, inspect roofing, gutters, and exterior drainage. Clear debris, check for cracks in render, and service air-conditioning units before sustained heat increases load on the system.",
      "During the rainy season, focus on water management: test sump pumps, verify balcony and window seals, and examine perimeter landscaping to ensure water flows away from foundations and shared roads.",
      "Inside the home, schedule filter changes, test smoke detectors, and review generator or backup power systems on a fixed calendar. At Special Gardens, our maintenance desk coordinates vendor access so residents do not have to manage every appointment alone.",
    ],
  },
  {
    id: "BLG-003",
    slug: "community-living-and-privacy",
    title: "Designing Community Living Without Losing Privacy",
    category: "Community",
    date: "2024-04-09",
    excerpt:
      "The tension between community and privacy is the defining design challenge of estate living. Here is how thoughtful architecture resolves it.",
    readTime: "6 min read",
    image: estateImages.estateAerial,
    content: [
      "Estate living promises the best of both worlds — neighbours, shared amenities, and security — without sacrificing the privacy of a standalone home. Achieving that balance begins with master planning.",
      "Setbacks, orientation, and landscaping create natural buffers between properties. Mature planting, staggered building lines, and limited frontage onto shared roads all reduce sightlines without requiring high walls on every boundary.",
      "Shared facilities should feel optional, not obligatory. A resident lounge, family parks, and fitness areas work best when they are accessible but separated from private driveways and home entrances.",
      "Management plays a quiet role too: clear rules on events, parking, and contractor access prevent the friction that makes residents feel exposed. At Special Gardens, we design community life around discretion — spaces to gather, and space to retreat.",
    ],
  },
  {
    id: "BLG-004",
    slug: "diaspora-fraud-protection-ledger",
    title: "Say Goodbye to Land Fraud: How Special Gardens Uses Cryptographic Verification to Protect Diaspora Buyers",
    category: "Technology",
    date: "2026-05-14",
    excerpt:
      "Cross-border property fraud costs diaspora families millions annually. Discover how Special Gardens' Trust Layer — built around unguessable cryptographic receipt hashes — makes every transaction independently verifiable, from London, New York, or anywhere on earth.",
    readTime: "7 min read",
    image: estateImages.networking,
    content: [
      "Property fraud targeting diaspora buyers is not a niche risk. It is the defining vulnerability of long-distance real estate investment in West Africa. Fake receipts, duplicate plot allocations, ghost developers, and compromised agents have cost Ghanaian families abroad — conservative estimates place the figure in the hundreds of millions of cedis each year. Distance is the root cause. When you cannot inspect, verify, or confront in person, you rely on documents. And documents can be forged.",
      "Special Gardens Estate was designed to make document forgery irrelevant. Our Trust Layer transforms every financial transaction — initial deposits, structural phase payments, final property handovers — into a publicly verifiable entry in an immutable digital ledger. Think of it like a DHL tracking code for your investment, except the parcel is your title deed and the tracking number is cryptographically unique and cannot be duplicated.",
      "The mechanism is straightforward. When a buyer's payment is processed, our system assigns a unique receipt hash — a long, algorithmically generated reference number that cannot be guessed, constructed, or reproduced by any third party. This hash is attached to the transaction in our internal records and simultaneously published to our public-facing Trust Ledger. At any point, the buyer's solicitor, family member, or bank can visit specialgardens.example/verify, enter the reference, and pull up a certificate displaying the property name, transaction amount, issue date, and current standing — all without a system login.",
      "The critical design principle is that the institution confirms, not the counterparty. Just as a wire transfer is confirmed by the receiving bank rather than the sender, a Special Gardens receipt is confirmed by the estate's ledger rather than the agent or developer. An agent cannot fabricate a receipt that passes our verification check. A developer cannot claim a phase payment was received when it was not logged. The ledger is the single source of truth.",
      "For diaspora buyers in particular, this eliminates the single most common attack vector: the fraudulent receipt. Previously, a buyer in Manchester would wire funds, receive a PDF receipt by email, and have no practical way to confirm its legitimacy without flying to Accra. With Special Gardens, that five-minute portal check carries the same legal and evidential weight as standing in our corporate offices with the document in hand.",
      "Our Trust Layer currently covers all financial transactions against registered properties in the Special Gardens portfolio. As we expand, structural phase milestones and land allocation certificates will each receive their own verifiable entries. The goal is complete transparency: every material event in your property lifecycle logged, timestamped, and publicly confirmable — with no intermediary required and no opportunity for fraud.",
    ],
  },
  {
    id: "BLG-005",
    slug: "day-in-the-life-gate-pass",
    title: "Frictionless Borders: A Day in the Life of a Special Gardens Resident",
    category: "Technology",
    date: "2026-05-28",
    excerpt:
      "From generating a QR visitor pass for a delivery driver in thirty seconds flat to filing an instant hazard report on a cracked pavement — here is what daily estate life feels like when the technology actually works.",
    readTime: "5 min read",
    image: estateImages.gatedEntrance,
    content: [
      "It is 8:47 AM on a Wednesday. You are standing in the kitchen of your Special Gardens villa, coffee in hand, when your phone buzzes. A message from your plumber: he will arrive in roughly an hour. In a conventional estate, the next steps would be a phone call to the security desk, a prayer that someone picks up, a verbal handover of the plumber's name, and then anxious waiting to see whether the guard at the gate received the message at all. Queues. Confusion. Occasionally, a forty-minute delay while staff locate the right logbook.",
      "Instead, you open the Resident OS on your phone, navigate to Gate Pass, and fill in a form that takes thirty seconds: your plumber's full name, his phone number, his expected arrival window, the purpose of the visit, and — since he is driving — his vehicle registration plate. You tap Generate Pass. A QR code appears on screen alongside a shareable URL. You copy the URL and send it to your plumber via WhatsApp. Done.",
      "At the perimeter, your plumber arrives, presents the QR code on his phone screen, and the gate guard scans it with the estate's handheld terminal. The system confirms: pass is valid, time window matches, vehicle registration is logged. The barrier lifts within seconds. No queues. No paper logbooks. No human error in transcribing names. The entire access event is timestamped and added to the estate's digital gate log, which management can review at any time.",
      "Later that morning, you notice a section of pavement along the eastern path has developed a crack — the kind of hazard that, left unaddressed, becomes a liability. In previous estate management models, reporting this would mean a phone call, waiting on hold, and eventually relying on someone to transcribe the issue correctly. At Special Gardens, you open the Incident Report module in the Resident OS, enter a title, select the category (Structural), set urgency (Medium), describe the location and nature of the crack, and optionally attach a photo. Tap Submit. The report is immediately logged as a resident-origin ticket on the estate's Dual-Engine Maintenance dashboard, visible to both estate management and the property owner.",
      "No ticket is duplicated. No call goes unanswered. The resident who reported the hazard receives a confirmation with their ticket ID — the same ID that management uses to track progress from 'New' to 'In Progress' to 'Resolved'. When the pavement is repaired, the ticket is closed and the audit trail is preserved.",
      "This is the everyday reality of the Special Gardens Resident OS: not a collection of impressive-sounding features, but a coherent operational system that removes friction at every interaction point — gate access, incident reporting, utility management, and visitor logistics — so that life inside the estate runs the way it should.",
    ],
  },
  {
    id: "BLG-006",
    slug: "modern-landlord-rental-ecosystem",
    title: "Hands-Off Wealth: The Modern Landlord's Guide to Our Digital Rental Ecosystem",
    category: "Property Investment",
    date: "2026-06-03",
    excerpt:
      "Own a unit in Special Gardens from London, New York, or Toronto and manage it entirely from your phone — linking tenants, tracking rental collections, and monitoring structural maintenance without paying a single predatory management agency fee.",
    readTime: "6 min read",
    image: estateImages.keysHandover,
    content: [
      "The classic diaspora landlord story has not changed in decades. You purchased a property in Accra. You handed it to a property management agency because managing remotely felt impossible. You now receive a monthly bank transfer with a single-line memo and an occasional WhatsApp message. You have no visibility into whether your unit is actually tenanted. You cannot verify whether rent was collected on time, or at all. Maintenance issues are handled — or not handled — entirely at the agency's discretion, with costs deducted from your income before you ever see a figure. You own the asset, but someone else controls it entirely.",
      "The Special Gardens Owner Dashboard was built to end this arrangement permanently. Owners who log in to the platform see a real-time view of their complete portfolio: every unit they own, its current occupancy status, the name and contact details of the current tenant, the lease start and end date, and monthly rent denominated in either GHS or USD. There is no intermediary between the owner and this information. It updates in real time.",
      "When a unit becomes vacant, the owner does not wait weeks for an agency to advertise, screen, and negotiate on their behalf. They open the My Rentals module, select the vacant unit, and click Invite New Tenant. A form appears asking for the prospective tenant's full name, email address, phone number, proposed lease dates, and agreed monthly rent. The owner fills this in — directly, with full control over the terms — and submits. The system generates a lease record, sends the tenant an onboarding invitation, and marks the unit as 'In Progress' until the tenant confirms.",
      "Rental payments flow through the Trust Layer. When a tenant pays their monthly rent, the owner can see a verified badge against that transaction in the payment ledger — the same public-facing ledger that corporate executives and solicitors use to confirm transaction legitimacy. There is no delay, no bank statement required, and no agency withholding confirmation to maintain leverage. If a payment has been made, the ledger shows it. If it has not, the owner knows immediately.",
      "Maintenance operates on a dual-engine model that further reduces the management burden on both owner and tenant. Estate management runs its own scheduled maintenance calendar — semi-annual utility overhauls, perimeter inspections, road resurfacing, fire suppression checks — and these appear on the dashboard as 'Estate-origin' tickets. When a tenant encounters an issue inside the unit — a leaking pipe, a faulty air conditioning unit, an intercom fault — they submit it directly through the Resident OS as a 'Resident-origin' ticket. Both streams converge on the same operational dashboard. Neither stream blocks the other. Nothing falls between the cracks.",
      "The combined effect is a property ownership experience that, for the first time, genuinely feels like passive income. You own the asset, you see all activity in real time, you retain full control over tenanting decisions and lease terms, and the estate's operational infrastructure handles the daily logistics. Whether you are sitting in a boardroom in Toronto or on a beach in Portugal, your Special Gardens investment is running — and you can see exactly how.",
    ],
  },
];

export const documents = [
  { id: "DOC-001", folder: "Lease Agreements", fileCount: 14, lastUpdated: "2024-03-20", icon: "L" },
  { id: "DOC-002", folder: "Inspection Reports", fileCount: 8, lastUpdated: "2024-03-15", icon: "I" },
  { id: "DOC-003", folder: "Financial Statements", fileCount: 6, lastUpdated: "2024-03-01", icon: "F" },
  { id: "DOC-004", folder: "Compliance Certificates", fileCount: 11, lastUpdated: "2024-02-28", icon: "C" },
];

export const documentFiles: Record<string, string[]> = {
  "Lease Agreements": ["Lease_AdrianSterling_2024.pdf", "Lease_ElenaMartinez_2024.pdf", "Lease_KwameAsante_2024.pdf", "Lease_NanaBoateng_2024.pdf"],
  "Inspection Reports": ["Inspection_CedarTerrace_Q1.pdf", "Inspection_Meadowline_Mar.pdf", "Inspection_OakCourt_Feb.pdf"],
  "Financial Statements": ["Financial_Q1_2024.pdf", "Financial_FY2023.pdf", "Budget_2024_Draft.pdf"],
  "Compliance Certificates": ["Elevator_Cert_2024.pdf", "Fire_Safety_Cert.pdf", "Pool_Compliance_2024.pdf", "Generator_Test_Log.pdf"],
};

export const invoices = [
  { id: "INV-2048", vendor: "Precision Plumbing & Design", status: "Pending", amount: 8400 },
  { id: "INV-2047", vendor: "GreenThumb Landscaping", status: "Paid", amount: 3250 },
  { id: "INV-2046", vendor: "AirCool HVAC Specialists", status: "Draft", amount: 1875 },
];

export const units = [
  { id: "U-1204", property: "Cedar Terrace", unit: "Apt 402", status: "Leased", layout: "3 bed", rent: "GH₵ 3,200" },
  { id: "U-0311", property: "Oak Court", unit: "3B", status: "Available", layout: "4 bed", rent: "GH₵ 4,100" },
  { id: "U-0902", property: "Harbor Plaza", unit: "Ground Floor", status: "Inspection", layout: "Commercial", rent: "GH₵ 12,800" },
  { id: "U-018", property: "Meadowline Villa", unit: "Full Property", status: "Leased", layout: "5 bed", rent: "GH₵ 8,500" },
];

export const notifications = [
  { id: "N-001", text: "TKT-001: Leak repair assigned to Kofi Mensah", time: "2 hours ago", href: "/dashboard/maintenance" },
  { id: "N-002", text: "PAY-20240323-002: Global Logistics payment pending approval", time: "5 hours ago", href: "/dashboard/payments" },
  { id: "N-003", text: "Abena Owusu submitted a move-out request", time: "Yesterday", href: "/dashboard/tenants" },
];

export const brand = {
  name: "Special Gardens",
  phone: "+233 24 024 8176",
  email: "hello@specialgardens.com",
  whatsapp: "+233240248176",
  address: "14 Airport Bypass Road, East Legon, Accra",
  officeCoordinates: { lat: 5.6362, lng: -0.1678 },
};

export const emergencyContacts = [
  { name: "Estate Security", detail: "Dial Ext. 999", tone: "urgent" as const, phone: "+233302481176" },
  { name: "Facility Manager", detail: "Dial Ext. 104", tone: "support" as const, phone: "+233302481104" },
];

export const reservedAmenities = [
  { name: "Elite Fitness Center", detail: "Private gym session", when: "Tomorrow, 8:00 AM", icon: "Gym" },
  { name: "Lap Pool (Lane 2)", detail: "Resident swim", when: "Sat, 11 AM", icon: "Pool" },
];

export const securityAnnouncements = [
  { title: "CCTV Phase III deployment complete", body: "AI-enhanced thermal monitoring along the perimeter forest path is operational.", date: "Today, 9:15 AM", tag: "New" },
  { title: "Scheduled gate maintenance", body: "South entrance biometric scanner calibration Friday 01:00–03:00.", date: "2024-03-21", tag: "Update" },
];

export const incidentTypes = ["Suspicious activity", "Noise disturbance", "Property damage", "Access / gate issue", "Emergency medical", "Other"];

export const bookingFacilities = [
  { name: "Elite Fitness Center", type: "Gym", slots: "6 slots today" },
  { name: "Sky Lounge", type: "Meeting room", slots: "2 slots today" },
  { name: "Lap Pool", type: "Pool", slots: "4 lanes available" },
  { name: "Visitor parking B12", type: "Parking", slots: "1 bay left" },
];

export const bookingWeekDays = ["Mon 14", "Tue 15", "Wed 16", "Thu 17", "Fri 18", "Sat 19", "Sun 20"];

export const periodOptions = ["This Month", "Last Month", "Last Quarter", "This Year"];

// Search index builder
export function buildSearchIndex() {
  const items: { label: string; sub: string; href: string }[] = [];
  properties.forEach((p) => items.push({ label: p.name, sub: p.location, href: `/properties/${p.slug}` }));
  dashboardProperties.forEach((p) => items.push({ label: p.name, sub: p.address, href: "/dashboard/properties" }));
  tenants.forEach((t) => items.push({ label: t.name, sub: t.unit, href: "/dashboard/tenants" }));
  maintenanceTickets.forEach((t) => items.push({ label: t.title, sub: t.id, href: "/dashboard/maintenance" }));
  return items;
}
