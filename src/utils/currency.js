/**
 * Canonical currency table used by `CurrencySelect`, the time entry table,
 * the payslip currency tabs, and anywhere else a quick lookup is needed.
 *
 * Keeping this in a single module means adding a new currency is a one-line
 * change — the rest of the app picks up the symbol / tone automatically.
 */

export const CURRENCIES = [
  {
    code: "USD",
    symbol: "$",
    label: "US Dollar",
    tone: "emerald",
    // Tailwind classes kept in sync with `CurrencySelect.vue`.
    chip: "bg-emerald-50 text-emerald-700 ring-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300 dark:ring-emerald-900/60",
  },
  {
    code: "EUR",
    symbol: "€",
    label: "Euro",
    tone: "sky",
    chip: "bg-sky-50 text-sky-700 ring-sky-100 dark:bg-sky-950/50 dark:text-sky-300 dark:ring-sky-900/60",
  },
  {
    code: "INR",
    symbol: "₹",
    label: "Indian Rupee",
    tone: "violet",
    chip: "bg-violet-50 text-violet-700 ring-violet-100 dark:bg-violet-950/50 dark:text-violet-300 dark:ring-violet-900/60",
  },
];

const BY_CODE = new Map(CURRENCIES.map((c) => [c.code, c]));

export function currencyByCode(code) {
  return BY_CODE.get(String(code || "").toUpperCase()) || CURRENCIES[0];
}

export function currencySymbol(code) {
  return currencyByCode(code).symbol;
}
