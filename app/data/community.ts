/** Stitch: resident_dashboard */
export type CommunityModule =
  | "community"
  | "events"
  | "directory"
  | "marketplace"
  | "security"
  | "report"
  | "bookings";

export const residentProfile = {
  name: "Alex Johnson",
  unit: "Penthouse 4B",
  estate: "Ernest Ofori — Premium Estates",
  initials: "AJ",
};

export const communityModuleMeta: Record<
  Exclude<CommunityModule, "community">,
  { label: string; href: string; icon: string; summary: string; searchPlaceholder: string }
> = {
  events: {
    label: "Events",
    href: "/community/events",
    icon: "E",
    summary: "Estate events, RSVPs, and reminders for residents.",
    searchPlaceholder: "Search events…",
  },
  directory: {
    label: "Directory",
    href: "/community/directory",
    icon: "D",
    summary: "Verified neighbour profiles with visibility controls.",
    searchPlaceholder: "Search residents…",
  },
  marketplace: {
    label: "Marketplace",
    href: "/community/marketplace",
    icon: "M",
    summary: "Trusted local services with ratings and verified providers.",
    searchPlaceholder: "Search services…",
  },
  security: {
    label: "Security",
    href: "/community/security",
    icon: "S",
    summary: "Security announcements, protocols, and emergency alerts.",
    searchPlaceholder: "Search security protocols or history…",
  },
  report: {
    label: "Report",
    href: "/community/report",
    icon: "R",
    summary: "Report suspicious activity or estate incidents to security.",
    searchPlaceholder: "Search reports…",
  },
  bookings: {
    label: "Bookings",
    href: "/community/bookings",
    icon: "B",
    summary: "Reserve pool, gym, meeting rooms, and parking without conflicts.",
    searchPlaceholder: "Search facilities…",
  },
};

export const communityNavItems = [
  { label: "Dashboard", href: "/community", icon: "H", module: "community" as const },
  ...Object.entries(communityModuleMeta).map(([key, meta]) => ({
    label: meta.label,
    href: meta.href,
    icon: meta.icon,
    module: key as Exclude<CommunityModule, "community">,
  })),
];

export const hubQuickActions = [
  { label: "Report incident", href: "/community/report", icon: "!" },
  { label: "Book facility", href: "/community/bookings", icon: "B" },
  { label: "View upcoming events", href: "/community/events", icon: "E" },
  { label: "Find local service", href: "/community/marketplace", icon: "M" },
];

export const upcomingEvents = [
  {
    title: "Resident Networking Evening",
    tag: "Community Exclusive",
    when: "This Friday, 7:00 PM",
    where: "Sky Lounge",
    image:
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=82",
  },
  {
    title: "Family Park Picnic",
    tag: "All residents",
    when: "Jun 14, 11:00 AM",
    where: "Meadow Green",
    image:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=82",
  },
  {
    title: "Estate AGM Briefing",
    tag: "Committee",
    when: "Jun 22, 6:30 PM",
    where: "Club lounge",
    image:
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=82",
  },
];

export const securityNotices = [
  {
    title: "Gate 2 maintenance",
    text: "Technicians will service Gate 2 tomorrow from 10 AM to 2 PM. Please use the north entrance.",
    posted: "Posted 2h ago",
  },
  {
    title: "CCTV upgrade complete",
    text: "Phase 1 of HD camera installation on Perimeter A is now finished.",
    posted: "Posted yesterday",
  },
];

export const reservedAmenities = [
  { name: "Elite Fitness Center", detail: "Private gym session", when: "Tomorrow, 8:00 AM", icon: "Gym" },
  { name: "Lap Pool (Lane 2)", detail: "Resident swim", when: "Sat, 11 AM", icon: "Pool" },
];

export const emergencyContacts = [
  { name: "Estate Security", detail: "Dial Ext. 999", tone: "urgent" as const },
  { name: "Facility Manager", detail: "Dial Ext. 104", tone: "support" as const },
];

export const estateEvents = [
  ["Resident Networking Evening", "Fri 7:00 PM", "Sky Lounge", "RSVP open", "48 attending"],
  ["Family Park Picnic", "Jun 14", "Meadow Green", "RSVP open", "120 attending"],
  ["Estate AGM Briefing", "Jun 22", "Club lounge", "Committee", "18 attending"],
  ["Pool safety workshop", "Jul 3", "Pool deck", "Mandatory for families", "—"],
];

export const directoryResidents = [
  ["Maya Chen", "Meadowline Villa", "Visible", "Committee — Events"],
  ["Daniel Reyes", "Oak Court", "Visible", "Neighbour"],
  ["Nora Whitaker", "Cedar Terrace", "Hidden", "—"],
  ["Eleanor Vance", "Penthouse 4B", "Visible", "Committee — Security"],
];

export const marketplaceProviders = [
  ["Precision Plumbing & Design", "Plumber", "4.9", "$120/hr", "Verified", "Leak detection, luxury fixtures"],
  ["BrightSpark Electrical", "Electrician", "4.8", "$95/hr", "Verified", "Smart home, emergency 24/7"],
  ["Harmony Home Tutoring", "Tutor", "5.0", "$65/hr", "Verified", "STEM, exam prep"],
  ["GreenLeaf Estate Care", "Cleaner", "4.7", "$80/visit", "Verified", "Deep clean, move-in"],
];

export const marketplaceCategories = [
  "All Services",
  "Plumbers",
  "Electricians",
  "Tutors",
  "Cleaners",
  "Handymen",
];

export const securityAnnouncements = [
  [
    "CCTV Phase III deployment complete",
    "AI-enhanced thermal monitoring along the perimeter forest path is operational.",
    "Today, 9:15 AM",
    "New",
  ],
  [
    "Scheduled gate maintenance",
    "South entrance biometric scanner calibration Friday 01:00–03:00.",
    "May 29, 2026",
    "Update",
  ],
];

export const incidentTypes = [
  "Suspicious activity",
  "Noise disturbance",
  "Property damage",
  "Access / gate issue",
  "Emergency medical",
  "Other",
];

export const bookingFacilities = [
  ["Elite Fitness Center", "Gym", "6 slots today"],
  ["Sky Lounge", "Meeting room", "2 slots today"],
  ["Lap Pool", "Pool", "4 lanes available"],
  ["Visitor parking B12", "Parking", "1 bay left"],
];

export const bookingWeekDays = ["Mon 14", "Tue 15", "Wed 16", "Thu 17", "Fri 18", "Sat 19", "Sun 20"];
