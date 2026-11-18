import { format, formatDistanceToNow, isValid } from "date-fns";

/** Format a number as USD currency. */
export function currency(value = 0, { compact = false } = {}) {
  const n = Number(value);

  if (!Number.isFinite(n)) return "$0";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: compact ? "compact" : "standard",
    maximumFractionDigits: compact ? 1 : 0,
  }).format(n);
}

/** Format date: "16 Jun 2025". */
export function shortDate(value) {
  const d = new Date(value);
  return isValid(d) ? format(d, "dd MMM yyyy") : "—";
}

/** Format time: "10:30 PM". */
export function timeOf(value) {
  const d = new Date(value);
  return isValid(d) ? format(d, "hh:mm a") : "";
}

/** Format relative time: "3 days ago" or "in 2 days". */
export function relative(value) {
  const d = new Date(value);

  return isValid(d)
    ? formatDistanceToNow(d, { addSuffix: true })
    : "";
}

/** Format date for HTML date inputs: "YYYY-MM-DD". */
export function dateInputValue(value) {
  const d = new Date(value);
  return isValid(d) ? format(d, "yyyy-MM-dd") : "";
}