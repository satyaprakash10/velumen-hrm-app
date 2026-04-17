import { describe, it, expect } from "vitest";
import {
  normalizeEmail,
  isPayslipVisibleForUser,
  filterPayslipsForViewer,
} from "@/utils/payslipAccess.js";

describe("payslipAccess", () => {
  it("normalizes email", () => {
    expect(normalizeEmail("  Test@Example.COM ")).toBe("test@example.com");
    expect(normalizeEmail("")).toBe("");
  });

  it("hides rows without viewerEmails", () => {
    expect(isPayslipVisibleForUser({}, "a@b.com")).toBe(false);
    expect(isPayslipVisibleForUser({ viewerEmails: [] }, "a@b.com")).toBe(false);
  });

  it("matches viewerEmails case-insensitively", () => {
    const row = { viewerEmails: ["Ted@Example.com"] };
    expect(isPayslipVisibleForUser(row, "ted@example.com")).toBe(true);
    expect(isPayslipVisibleForUser(row, "other@example.com")).toBe(false);
  });

  it("filterPayslipsForViewer returns nothing without viewer email", () => {
    expect(filterPayslipsForViewer([{ viewerEmails: ["a@b.com"] }], "")).toEqual([]);
  });

  it("filterPayslipsForViewer keeps visible rows only", () => {
    const rows = [
      { id: 1, viewerEmails: ["x@y.com"] },
      { id: 2, viewerEmails: ["a@b.com"] },
    ];
    expect(filterPayslipsForViewer(rows, "x@y.com")).toEqual([rows[0]]);
  });
});
