import { authUser } from "@/composables/useAuth.js";
import { entries as timeEntriesRef } from "@/composables/useTimeEntry.js";
import { downloadPdf } from "@/utils/pdfDownload.js";

/**
 * Payslip generator
 * ---------------------------------------------------------------------------
 * Produces a payslip dynamically from the current user's workspace state:
 *   - Identity from the authenticated user (name, email, role)
 *   - Hours from `useTimeEntry`'s shared `entries` ref, filtered to the
 *     requested month
 *   - A per-role base rate drives gross/net math, with a demo 22% combined
 *     tax + contributions rate applied on top
 *
 * The produced payslip is an instant PDF download via `downloadPdf()` — no
 * backend, no storage. For production you'd replace the math section with a
 * call to your payroll provider and feed the same PDF renderer.
 */

const DEFAULT_CURRENCY = "USD";
const ROLE_HOURLY_RATE = {
  admin: 62,
  employee: 38,
  candidate: 24,
};
const WEEKLY_EXPECTED_HOURS = 40;
const TAX_RATE = 0.22;
const OVERTIME_MULTIPLIER = 1.5;

function formatCurrency(amount, currency = DEFAULT_CURRENCY) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

function startOfMonth(year, monthIndex) {
  return new Date(year, monthIndex, 1);
}

function endOfMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);
}

function sameMonth(dateString, year, monthIndex) {
  if (!dateString) return false;
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return false;
  return d.getFullYear() === year && d.getMonth() === monthIndex;
}

function weeksInMonth(year, monthIndex) {
  const start = startOfMonth(year, monthIndex);
  const end = endOfMonth(year, monthIndex);
  const days = Math.ceil((end - start) / 86400000) + 1;
  return Math.max(1, Math.round(days / 7));
}

/**
 * Build a payslip for the given user + period, using the in-memory state.
 *
 * @param {Object} [opts]
 * @param {number} [opts.year]   4-digit year. Defaults to current year.
 * @param {number} [opts.month]  0-based month index. Defaults to current month.
 * @param {string} [opts.currency] Currency code for display.
 * @returns {Object} payslip object ready for rendering / PDF export
 */
export function buildPayslip(opts = {}) {
  const now = new Date();
  const year = Number.isFinite(opts.year) ? opts.year : now.getFullYear();
  const month = Number.isFinite(opts.month) ? opts.month : now.getMonth();
  const currency = opts.currency || DEFAULT_CURRENCY;

  const user = authUser?.value;
  const role = (user?.role || "employee").toLowerCase();
  const hourlyRate = ROLE_HOURLY_RATE[role] || ROLE_HOURLY_RATE.employee;
  const expectedHours = weeksInMonth(year, month) * WEEKLY_EXPECTED_HOURS;

  const monthEntries = (timeEntriesRef?.value || []).filter((e) =>
    sameMonth(e.date, year, month),
  );
  const loggedHours = monthEntries.reduce(
    (sum, e) => sum + Number(e.hours || 0),
    0,
  );
  const regularHours = Math.min(loggedHours, expectedHours);
  const overtimeHours = Math.max(0, loggedHours - expectedHours);

  const baseSalary = regularHours * hourlyRate;
  const overtimePay = overtimeHours * hourlyRate * OVERTIME_MULTIPLIER;
  const gross = baseSalary + overtimePay;
  const tax = Number((gross * TAX_RATE).toFixed(2));
  const net = Number((gross - tax).toFixed(2));

  const periodLabel = startOfMonth(year, month).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  const projectsBreakdown = Object.values(
    monthEntries.reduce((map, e) => {
      const key = e.project || "Unassigned";
      if (!map[key]) map[key] = { project: key, hours: 0 };
      map[key].hours += Number(e.hours || 0);
      return map;
    }, {}),
  ).sort((a, b) => b.hours - a.hours);

  return {
    id: `slip-${year}-${String(month + 1).padStart(2, "0")}-${user?.id || "anon"}`,
    periodLabel,
    year,
    month,
    currency,
    employee: {
      id: user?.id || null,
      name: user?.name || "Employee",
      email: user?.email || "",
      role: user?.role || "employee",
    },
    hourlyRate,
    expectedHours,
    loggedHours: Number(loggedHours.toFixed(2)),
    regularHours: Number(regularHours.toFixed(2)),
    overtimeHours: Number(overtimeHours.toFixed(2)),
    baseSalary: Number(baseSalary.toFixed(2)),
    overtimePay: Number(overtimePay.toFixed(2)),
    gross: Number(gross.toFixed(2)),
    tax,
    net,
    projects: projectsBreakdown,
    generatedAt: new Date().toISOString(),
    taxRate: TAX_RATE,
    overtimeMultiplier: OVERTIME_MULTIPLIER,
  };
}

function leftRight(label, value, width = 86) {
  const pad = Math.max(1, width - label.length - value.length);
  return label + " ".repeat(pad) + value;
}

function renderPayslipBody(slip) {
  const fmt = (v) => formatCurrency(v, slip.currency);
  const lines = [
    "Pay period:  " + slip.periodLabel,
    `Employee:    ${slip.employee.name} (${slip.employee.email || "—"})`,
    `Role:        ${slip.employee.role}`,
    `Generated:   ${new Date(slip.generatedAt).toLocaleString()}`,
    "",
    "Summary",
    "-------",
    leftRight("Expected hours",  `${slip.expectedHours.toFixed(0)} h`),
    leftRight("Hours logged",    `${slip.loggedHours.toFixed(2)} h`),
    leftRight("Regular hours",   `${slip.regularHours.toFixed(2)} h @ ${fmt(slip.hourlyRate)}/h`),
    leftRight("Overtime hours",  `${slip.overtimeHours.toFixed(2)} h @ ${slip.overtimeMultiplier}x`),
    "",
    "Earnings",
    "--------",
    leftRight("Base salary",     fmt(slip.baseSalary)),
    leftRight("Overtime",        fmt(slip.overtimePay)),
    leftRight("Gross",           fmt(slip.gross)),
    "",
    "Deductions",
    "----------",
    leftRight(`Tax & contributions (${Math.round(slip.taxRate * 100)}%)`, fmt(slip.tax)),
    "",
    "Net pay",
    "-------",
    leftRight("NET PAY",         fmt(slip.net)),
  ];

  if (slip.projects.length) {
    lines.push("", "Project breakdown", "-----------------");
    for (const p of slip.projects) {
      lines.push(leftRight(p.project, `${p.hours.toFixed(2)} h`));
    }
  }

  lines.push(
    "",
    "Notes",
    "-----",
    "This payslip is generated client-side from your tracked hours and role-based rate. Production deployments would replace the math section with a call to your payroll provider.",
  );

  return lines.join("\n");
}

/**
 * Convenience wrapper: build the payslip and trigger a PDF download.
 */
export function generatePayslipPdf(opts = {}) {
  const slip = buildPayslip(opts);
  const filenameDate = `${slip.year}-${String(slip.month + 1).padStart(2, "0")}`;
  const safeName = String(slip.employee.name || "employee")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
  downloadPdf({
    filename: `payslip-${safeName}-${filenameDate}.pdf`,
    title: `Payslip · ${slip.periodLabel}`,
    subtitle: `${slip.employee.name} · ${slip.employee.role}`,
    body: renderPayslipBody(slip),
    footer: "Generated on this device by the Velumen workspace demo.",
  });
  return slip;
}

export { formatCurrency };
