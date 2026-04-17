/**
 * Shared Tailwind classes for form controls with validation and theme contrast.
 * @param {boolean} invalid - Vuelidate $error or manual
 */
/** Same as inputFieldClass but no top margin + fixed height — for horizontal rows (e.g. comment + button). */
export function inlineInputFieldClass(invalid) {
  const base =
    "mt-0 h-11 w-full rounded-lg px-3 py-2 text-sm outline-none transition-[border-color,box-shadow,background-color] duration-200 box-border";
  const valid =
    "border border-slate-200 bg-white text-gray-900 shadow-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-600 dark:bg-slate-950 dark:text-gray-100 dark:shadow-none dark:focus:border-sky-400 dark:focus:ring-sky-400/25";
  const error =
    "border-2 border-red-500 bg-white text-gray-900 ring-0 focus:border-red-600 focus:ring-2 focus:ring-red-500/30 dark:border-red-500 dark:bg-red-950/20 dark:text-gray-100 dark:focus:border-red-400 dark:focus:ring-red-400/30";
  return `${base} ${invalid ? error : valid}`;
}

export function inputFieldClass(invalid) {
  const base =
    "mt-1.5 w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-[border-color,box-shadow,background-color] duration-200";
  const valid =
    "border border-slate-200 bg-white text-gray-900 shadow-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-600 dark:bg-slate-950 dark:text-gray-100 dark:shadow-none dark:focus:border-sky-400 dark:focus:ring-sky-400/25";
  const error =
    "border-2 border-red-500 bg-white text-gray-900 ring-0 focus:border-red-600 focus:ring-2 focus:ring-red-500/30 dark:border-red-500 dark:bg-red-950/20 dark:text-gray-100 dark:focus:border-red-400 dark:focus:ring-red-400/30";
  return `${base} ${invalid ? error : valid}`;
}

export function selectFieldClass(invalid) {
  return `${inputFieldClass(invalid)} appearance-none bg-[length:1rem] bg-[right_0.65rem_center] bg-no-repeat pr-10`;
}

/** Primary actions: strong contrast in light & dark */
export const btnPrimaryClass =
  "inline-flex h-11 items-center justify-center rounded-xl px-6 text-sm font-semibold text-white shadow-sm transition-[background-color,transform,box-shadow] duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950 bg-[#001738] hover:bg-[#0a2540] focus-visible:ring-[#001738]/40 dark:bg-sky-600 dark:hover:bg-sky-500 dark:focus-visible:ring-sky-400/60";

export const btnSecondaryClass =
  "inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-semibold text-[#001738] shadow-sm transition duration-200 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/30 dark:border-slate-600 dark:bg-slate-800 dark:text-sky-100 dark:hover:bg-slate-700 dark:focus-visible:ring-slate-500/40";
