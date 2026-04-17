import {
  parsePhoneNumberFromString,
  isValidPhoneNumber,
} from "libphonenumber-js";

/**
 * @param {string} stored E.164 or loose string
 * @param {string} countryCode ISO2
 */
export function splitStoredPhone(stored, countryCode = "US") {
  if (!stored || typeof stored !== "string") {
    return { countryCode, national: "" };
  }
  const parsed = parsePhoneNumberFromString(stored);
  if (parsed) {
    return {
      countryCode: parsed.country || countryCode,
      national: String(parsed.nationalNumber || ""),
    };
  }
  return { countryCode, national: stored.replace(/\D/g, "") };
}

export function toE164(nationalDigits, countryCode) {
  if (!nationalDigits || !String(nationalDigits).trim()) return "";
  const raw = String(nationalDigits).replace(/\D/g, "");
  const parsed = parsePhoneNumberFromString(raw, countryCode);
  if (!parsed) return "";
  return parsed.format("E.164");
}

export function isPhoneValidForCountry(nationalDigits, countryCode) {
  if (!nationalDigits || !String(nationalDigits).trim()) return true;
  const raw = String(nationalDigits).replace(/\D/g, "");
  return isValidPhoneNumber(raw, countryCode);
}
