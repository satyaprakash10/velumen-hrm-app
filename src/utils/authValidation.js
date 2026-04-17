/** Basic email shape check (client-side; server must validate in production). */
export function isValidEmailFormat(s) {
  const t = String(s || "").trim();
  if (t.length < 5 || t.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t);
}

export const AUTH = {
  nameMin: 2,
  nameMax: 80,
  passwordMin: 10,
  passwordMax: 128,
};
