// Standardized formatting utilities for the application

/**
 * Format Ghana Cedis currency with proper spacing
 * @param amount - The amount to format
 * @param options - Formatting options
 * @returns Formatted currency string with proper spacing (e.g., "GH₵ 842,000")
 */
export function formatGHS(
  amount: number,
  options: {
    compact?: boolean;
    decimals?: number;
  } = {}
): string {
  const { compact = false, decimals = 0 } = options;

  if (compact && amount >= 1_000_000) {
    const millions = amount / 1_000_000;
    const rounded = millions.toFixed(decimals > 0 ? decimals : 1);
    return `GH₵ ${rounded}M`;
  }

  if (compact && amount >= 1000) {
    const thousands = amount / 1000;
    const rounded = decimals > 0 ? thousands.toFixed(decimals) : Math.round(thousands);
    return `GH₵ ${rounded}k`;
  }

  return `GH₵ ${amount.toLocaleString("en-GH", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

/**
 * Format USD currency with proper spacing
 */
export function formatUSD(
  amount: number,
  options: {
    compact?: boolean;
    decimals?: number;
  } = {}
): string {
  const { compact = false, decimals = 0 } = options;

  if (compact && amount >= 1000) {
    const thousands = amount / 1000;
    const rounded = decimals > 0 ? thousands.toFixed(decimals) : Math.round(thousands);
    return `$ ${rounded}k`;
  }

  return `$ ${amount.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

/**
 * Format currency based on currency code
 */
export function formatCurrency(
  amount: number,
  currency: "GHS" | "USD" = "GHS",
  options: {
    compact?: boolean;
    decimals?: number;
  } = {}
): string {
  return currency === "USD" ? formatUSD(amount, options) : formatGHS(amount, options);
}

/**
 * Format date to localized string
 */
export function formatDate(dateString: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  return date.toLocaleDateString("en-GB", options || {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Format date to relative time (e.g., "2 days ago", "in 3 weeks")
 */
export function formatRelativeDate(dateString: string | Date): string {
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays === -1) return "Tomorrow";
  if (diffDays > 0 && diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 0 && diffDays > -7) return `in ${Math.abs(diffDays)} days`;
  if (diffDays > 0 && diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 0 && diffDays > -30) return `in ${Math.floor(Math.abs(diffDays) / 7)} weeks`;
  
  return formatDate(date);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format square meters
 */
export function formatSqm(value: number): string {
  return `${value.toLocaleString()} m²`;
}
