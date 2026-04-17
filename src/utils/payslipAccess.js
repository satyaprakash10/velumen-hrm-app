/**
 * Payslip rows may include `viewerEmails` (non-empty). Only signed-in users whose
 * email matches (case-insensitive) may see the row. Rows without `viewerEmails` are hidden.
 * In production, enforce the same rules on the server; static PDF URLs are not secret.
 */
export function normalizeEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase();
}

export function isPayslipVisibleForUser(payslipRow, viewerEmail) {
  const em = normalizeEmail(viewerEmail);
  if (!em) return false;
  const list = payslipRow?.viewerEmails;
  if (!Array.isArray(list) || list.length === 0) return false;
  const set = new Set(list.map(normalizeEmail));
  return set.has(em);
}

export function filterPayslipsForViewer(allRows, viewerEmail) {
  if (!normalizeEmail(viewerEmail)) return [];
  return (allRows || []).filter((p) => isPayslipVisibleForUser(p, viewerEmail));
}
