/**
 * Inline SVGs for row / menu actions (currentColor, 24 viewBox).
 * Used by DropdownMenu and other action menus — keep paths minimal.
 */

const wrap = (paths) =>
  `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" aria-hidden="true">${paths}</svg>`;

export const MENU_ICONS = {
  eye: wrap('<path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>'),
  pencil: wrap(
    '<path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>',
  ),
  trash: wrap(
    '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>',
  ),
  download: wrap('<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/>'),
  mail: wrap(
    '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="M22 6l-10 7L2 6"/>',
  ),
  clipboard: wrap(
    '<path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><path d="M15 2H9a1 1 0 00-1 1v2a1 1 0 001 1h6a1 1 0 001-1V3a1 1 0 00-1-1z"/>',
  ),
  clipboardList: wrap(
    '<path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><path d="M15 2H9a1 1 0 00-1 1v2a1 1 0 001 1h6a1 1 0 001-1V3a1 1 0 00-1-1z"/><path d="M9 12h6"/><path d="M9 16h6"/><path d="M9 8h2"/>',
  ),
  printer: wrap(
    '<path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><path d="M6 14h12v8H6z"/>',
  ),
  cog: wrap(
    '<path d="M12 15a3 3 0 100-6 3 3 0 000 6z"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>',
  ),
  user: wrap(
    '<path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  ),
  logout: wrap(
    '<path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/>',
  ),
  building: wrap(
    '<path d="M6 22V4a2 2 0 012-2h8a2 2 0 012 2v18"/><path d="M6 12h12"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>',
  ),
  link: wrap(
    '<path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>',
  ),
  check: wrap('<path d="M20 6L9 17l-5-5"/>'),
  duplicate: wrap(
    '<path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><path d="M9 4v2a2 2 0 002 2h2a2 2 0 002-2V4"/><path d="M9 14h6"/><path d="M9 18h4"/>',
  ),
  timer: wrap('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/><path d="M12 3V2"/>'),
};

function inferKind(item) {
  if (item.icon === false) return null;
  if (typeof item.icon === "string" && MENU_ICONS[item.icon]) return item.icon;

  const L = (item.label || "").toLowerCase().trim();

  if (L.includes("delete")) return "trash";
  if (L.includes("download")) return "download";
  if (L.includes("print")) return "printer";
  if (L.includes("view") || L.includes("detail")) return "eye";
  if (L.includes("edit") || L.includes("rename")) return "pencil";
  if (L.includes("hris")) return "cog";
  if (L.includes("copy") && L.includes("email")) return "clipboard";
  if (L === "email" || (L.includes("mail") && !L.includes("copy"))) return "mail";
  if (L.includes("waive") || L.includes("enroll") || L.includes("opt out")) return "clipboardList";
  if (L.includes("clone") || L.includes("duplicate")) return "duplicate";
  if (L.includes("mark as complete") || L === "complete" || L.includes("mark complete")) return "check";
  if (L.includes("copy url") || L.includes("copy link") || (L.includes("copy") && L.includes("url"))) return "link";
  if (L.includes("track time") || L.includes("timer") || L.includes("time track")) return "timer";

  return null;
}

/** @returns {string} SVG html or empty string */
export function menuIconHtmlForItem(item) {
  const kind = inferKind(item);
  if (!kind) return "";
  return MENU_ICONS[kind] || "";
}

export function menuIconHtml(kind) {
  return MENU_ICONS[kind] || "";
}
