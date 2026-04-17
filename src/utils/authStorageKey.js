import { authUser } from "@/composables/useAuth.js";

/**
 * Namespace localStorage keys per authenticated user so demo data and settings
 * never leak between accounts on the same browser.
 */
export function authStorageKey(baseKey) {
  const id = authUser.value?.id;
  if (!id) return `${baseKey}__preauth`;
  return `${baseKey}__${id}`;
}
