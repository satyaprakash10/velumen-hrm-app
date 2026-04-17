/**
 * Single source of truth for product naming (UI, router titles, demo documents).
 * Keep `index.html` meta tags aligned when changing copy here.
 */
export const BRAND = Object.freeze({
  /** Primary product name (invented; not a registered trademark claim). */
  name: "Velumen",
  /** Short line under the name in auth / marketing. */
  tagline: "Employee Workspace",
  /** Browser tab suffix after an em dash, e.g. "Dashboard — Velumen". */
  titleSuffix: "Velumen",
  /** Default document title when no route title is set. */
  defaultPageTitle: "Velumen — Employee Workspace",
  /** Demo employer label on payslips and salary UI (fictional). */
  documentEmployerName: "Velumen Demo Employer",
  /** Footer / copyright line (year appended in UI). */
  copyrightHolder: "Velumen",
});

export function formatPageTitle(routeTitle) {
  const t = String(routeTitle || "").trim();
  if (!t) return BRAND.defaultPageTitle;
  return `${t} — ${BRAND.titleSuffix}`;
}
