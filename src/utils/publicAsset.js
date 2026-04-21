/**
 * Resolve a path served from `/public` for the current Vite `base`.
 * Use for `<img src>`, `new Image().src`, etc. so deploys under a subpath work.
 *
 * @param {string} path - e.g. `/landing/board.png` or `landing/board.png`
 * @returns {string}
 */
export function publicUrl(path) {
  if (!path) return path;
  if (/^https?:\/\//i.test(path)) return path;
  const base = import.meta.env.BASE_URL || "/";
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const root = base.endsWith("/") ? base.slice(0, -1) : base;
  if (!root || root === "") return normalized;
  return `${root}${normalized}`;
}
