/** Regional-indicator pair for a two-letter ISO 3166-1 alpha-2 code (e.g. US → 🇺🇸). */
export function flagEmojiFromIso2(code) {
  const c = String(code || "")
    .trim()
    .toUpperCase();
  if (c.length !== 2 || !/^[A-Z]{2}$/.test(c)) return "";
  const A = 0x1f1e6;
  const cp = (ch) => ch.charCodeAt(0) - 0x41 + A;
  return String.fromCodePoint(cp(c[0]), cp(c[1]));
}
