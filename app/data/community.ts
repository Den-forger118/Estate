import {
  bookingFacilities as mockBookingFacilities,
  bookingWeekDays,
  directory as mockDirectory,
  emergencyContacts as mockEmergencyContacts,
  events,
  facilityBookings,
  incidentTypes,
  marketplaceCategories,
  marketplaceProviders as mockMarketplaceProviders,
  reservedAmenities as mockReservedAmenities,
  securityAnnouncements as mockSecurityAnnouncements,
  securityNotices as mockSecurityNotices,
} from "./content";

export type CommunityModule =
  | "community"
  | "events"
  | "directory"
  | "marketplace"
  | "security"
  | "report"
  | "bookings";

export const residentProfile = {
  name: "Alex Morgan",
  unit: "Penthouse 4B",
  estate: "Special Gardens — Premium Estates",
  initials: "AM",
};

export const communityModuleMeta: Record<
  Exclude<CommunityModule, "community">,
  { label: string; href: string; icon: string; summary: string; searchPlaceholder: string }
> = {
  events: { label: "Events", href: "/community/events", icon: "E", summary: "Estate events, RSVPs, and reminders for residents.", searchPlaceholder: "Search events…" },
  directory: { label: "Directory", href: "/community/directory", icon: "D", summary: "Verified neighbour profiles with visibility controls.", searchPlaceholder: "Search residents…" },
  marketplace: { label: "Marketplace", href: "/community/marketplace", icon: "M", summary: "Trusted local services with ratings and verified providers.", searchPlaceholder: "Search services…" },
  security: { label: "Security", href: "/community/security", icon: "S", summary: "Security announcements, protocols, and emergency alerts.", searchPlaceholder: "Search security protocols or history…" },
  report: { label: "Report", href: "/community/report", icon: "R", summary: "Report suspicious activity or estate incidents to security.", searchPlaceholder: "Search reports…" },
  bookings: { label: "Bookings", href: "/community/bookings", icon: "B", summary: "Reserve pool, gym, meeting rooms, and parking without conflicts.", searchPlaceholder: "Search facilities…" },
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

export const upcomingEvents = events.map((e) => ({
  title: e.title,
  tag: e.category,
  when: e.when,
  where: e.location,
  image: e.image,
  id: e.id,
  category: e.category,
}));

export const securityNotices = mockSecurityNotices.map((n) => ({
  title: n.title,
  text: n.text,
  posted: n.posted,
}));

export const reservedAmenities = mockReservedAmenities;

export const emergencyContacts = mockEmergencyContacts;

export const estateEvents = events.map((e) => [
  e.title,
  e.when,
  e.location,
  e.category === "Official" ? "Committee" : "RSVP open",
  `${e.rsvp} attending`,
]);

export { events as communityEvents };

export const directoryResidents = mockDirectory.map((d) => [
  d.name,
  d.unit,
  d.visibility,
  d.committee ?? "—",
]);

export { mockDirectory as directoryEntries };

export const marketplaceProviders = mockMarketplaceProviders.map((p) => [
  p.name,
  p.category,
  String(p.rating),
  p.priceRange,
  p.verified ? "Verified" : "Unverified",
  p.description,
  p.id,
]);

export { mockMarketplaceProviders as marketplaceProviderDetails };

export { marketplaceCategories };

export const securityAnnouncements = mockSecurityAnnouncements.map((a) => [
  a.title,
  a.body,
  a.date,
  a.tag,
]);

export { incidentTypes };

export const bookingFacilities = mockBookingFacilities.map((f) => [f.name, f.type, f.slots]);

export { bookingWeekDays, facilityBookings };
