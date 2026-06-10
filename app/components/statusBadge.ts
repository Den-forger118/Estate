export function statusClassForLabel(label: string): string {
  const normalized = label.toUpperCase();

  if (
    normalized.includes("COMPLETED") ||
    normalized.includes("AVAILABLE") ||
    normalized.includes("ACTIVE") ||
    normalized.includes("APPROVED") ||
    normalized.includes("PAID")
  ) {
    return "status-available";
  }

  if (
    normalized.includes("PENDING") ||
    normalized.includes("PROGRESS") ||
    normalized.includes("LIMITED") ||
    normalized.includes("SCREENING")
  ) {
    return "status-pending";
  }

  if (
    normalized.includes("URGENT") ||
    normalized.includes("ERROR") ||
    normalized.includes("OVERDUE") ||
    normalized.includes("REJECTED")
  ) {
    return "status-urgent";
  }

  if (
    normalized.includes("INSPECTION") ||
    normalized.includes("FEATURED") ||
    normalized.includes("NEW")
  ) {
    return "status-featured";
  }

  if (
    normalized.includes("RESERVED") ||
    normalized.includes("INACTIVE") ||
    normalized.includes("STABLE")
  ) {
    return "status-reserved";
  }

  return "status-reserved";
}

export function availabilityClass(availability: string): string {
  switch (availability) {
    case "Available":
      return "status-available";
    case "Inspection Open":
      return "status-featured";
    case "Limited Units":
      return "status-pending";
    case "Reserved":
      return "status-reserved";
    default:
      return "status-reserved";
  }
}
