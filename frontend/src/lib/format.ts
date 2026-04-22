/** German number formatting (matches mockup: "5.465" / "120.000"). */
const deNumber = new Intl.NumberFormat("de-DE");
const enNumber = new Intl.NumberFormat("en-US");

export function formatNumber(value: number, locale: string = "de"): string {
  return (locale === "de" ? deNumber : enNumber).format(value);
}

export function formatPercent(value: number, locale: string = "de"): string {
  const formatter = new Intl.NumberFormat(locale === "de" ? "de-DE" : "en-US", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  return formatter.format(value / 100);
}

export function formatMonthLabel(date: Date, locale: string = "de"): string {
  return new Intl.DateTimeFormat(locale === "de" ? "de-DE" : "en-US", {
    year: "numeric",
    month: "long",
  }).format(date);
}

export function toMonthKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export function parseMonthKey(key: string): Date {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, 1);
}
