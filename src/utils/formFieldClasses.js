/**
 * Shared Tailwind classes for form controls with validation and theme contrast.
 * @param {boolean} invalid - Vuelidate $error or manual
 */
/** Same as inputFieldClass but no top margin + fixed height — for horizontal rows (e.g. comment + button). */
export function inlineInputFieldClass(invalid) {
  const base =
    "mt-0 h-11 w-full rounded-lg px-3 py-2 text-sm outline-none transition-[border-color,box-shadow,background-color] duration-200 box-border";
  const valid =
    "border border-slate-200 bg-white text-gray-900 shadow-sm accent-focus focus:accent-border dark:border-slate-600 dark:bg-slate-950 dark:text-gray-100 dark:shadow-none";
  const error =
    "border-2 border-red-500 bg-white text-gray-900 ring-0 focus:border-red-600 focus:ring-2 focus:ring-red-500/30 dark:border-red-500 dark:bg-red-950/20 dark:text-gray-100 dark:focus:border-red-400 dark:focus:ring-red-400/30";
  return `${base} ${invalid ? error : valid}`;
}

export function inputFieldClass(invalid) {
  const base =
    "mt-1.5 w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-[border-color,box-shadow,background-color] duration-200";
  const valid =
    "border border-slate-200 bg-white text-gray-900 shadow-sm accent-focus focus:accent-border dark:border-slate-600 dark:bg-slate-950 dark:text-gray-100 dark:shadow-none";
  const error =
    "border-2 border-red-500 bg-white text-gray-900 ring-0 focus:border-red-600 focus:ring-2 focus:ring-red-500/30 dark:border-red-500 dark:bg-red-950/20 dark:text-gray-100 dark:focus:border-red-400 dark:focus:ring-red-400/30";
  return `${base} ${invalid ? error : valid}`;
}

export function selectFieldClass(invalid) {
  return `${inputFieldClass(invalid)} appearance-none bg-[length:1rem] bg-[right_0.65rem_center] bg-no-repeat pr-10`;
}

/**
 * Primary actions: accented via the runtime CSS tokens set by
 * `utils/accentTheme.js`. Uses the `accent-gradient` + `accent-focus`
 * helpers from `main.css` so a single Settings change repaints every
 * primary button across the app.
 */
export const btnPrimaryClass =
  "inline-flex h-11 items-center justify-center gap-2 rounded-xl px-6 text-sm font-semibold text-white shadow-sm transition-[filter,transform,box-shadow] duration-200 accent-gradient accent-focus hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60";

export const btnSecondaryClass =
  "inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 text-sm font-semibold text-[#001738] shadow-sm transition duration-200 hover:bg-slate-50 accent-focus dark:border-slate-600 dark:bg-slate-800 dark:text-sky-100 dark:hover:bg-slate-700";

/**
 * Outline button: transparent background, accent-tinted border + text. Used
 * for secondary affirmative actions where a filled button would fight the
 * primary CTA for attention (e.g. "Cancel" in a dangerous flow, "Reset
 * filters", etc.).
 */
export const btnOutlineClass =
  "inline-flex h-11 items-center justify-center gap-2 rounded-xl border-2 bg-transparent px-6 text-sm font-semibold transition duration-200 accent-focus accent-border accent-text hover:bg-[color-mix(in_srgb,var(--accent-fg)_12%,transparent)]";
