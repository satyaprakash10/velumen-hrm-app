/**
 * Browser-only credential helpers. Passwords are never stored in plain text
 * for registered users; demo accounts use a precomputed SHA-256 hex of the demo password.
 */

const encoder = new TextEncoder();

/** SHA-256 as lowercase hex (Web Crypto). */
export async function hashPassword(plain) {
  const data = encoder.encode(String(plain).normalize("NFKC"));
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Compare two hex strings in roughly constant time (length-normalized). */
export function timingSafeEqualHex(a, b) {
  const x = String(a || "");
  const y = String(b || "");
  if (x.length !== y.length) return false;
  let out = 0;
  for (let i = 0; i < x.length; i++) {
    out |= x.charCodeAt(i) ^ y.charCodeAt(i);
  }
  return out === 0;
}
