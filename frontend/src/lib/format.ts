const LOCALE_MAP = { de: "de-DE", en: "en-US" } as const;
type Locale = keyof typeof LOCALE_MAP;

export function formatNumber(n: number, locale: Locale = "de"): string {
  return new Intl.NumberFormat(LOCALE_MAP[locale]).format(n);
}

export function formatCurrency(
  n: number,
  locale: Locale = "de",
  currency = "EUR",
  maximumFractionDigits = 0,
): string {
  return new Intl.NumberFormat(LOCALE_MAP[locale], {
    style: "currency",
    currency,
    maximumFractionDigits,
  }).format(n);
}

export function toMonthKey(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function parseMonthKey(key: string): Date {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, (m || 1) - 1, 1);
}

export function formatMonthLabel(key: string, locale: Locale = "de"): string {
  const d = parseMonthKey(key);
  return new Intl.DateTimeFormat(LOCALE_MAP[locale], {
    month: "long",
    year: "numeric",
  }).format(d);
}

export function formatShortMonth(monthIndex: number, locale: Locale = "de"): string {
  const d = new Date(2000, monthIndex, 1);
  return new Intl.DateTimeFormat(LOCALE_MAP[locale], { month: "short" }).format(d);
}
