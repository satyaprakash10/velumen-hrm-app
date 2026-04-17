function getEntry(p, key) {
  return p.payslipEntries?.find((e) => e.key === key);
}

function getCurrency(p) {
  return p.payslipEntries?.[0]?.currency || "USD";
}

/**
 * Monthly net pay totals for a currency from an already access-filtered payslip list.
 */
export function monthlyNetSeriesFromRows(rows, currency = "USD") {
  const byMonth = new Map();
  for (const p of rows || []) {
    if (getCurrency(p) !== currency) continue;
    const net = getEntry(p, "NET PAY")?.amount;
    if (net == null) continue;
    const d = new Date(p.payrollDate);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    byMonth.set(key, (byMonth.get(key) || 0) + net);
  }
  const sorted = [...byMonth.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  return {
    labels: sorted.map(([k]) => {
      const [y, m] = k.split("-");
      return `${y}-${m}`;
    }),
    data: sorted.map(([, v]) => v),
  };
}
