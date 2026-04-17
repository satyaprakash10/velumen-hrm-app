import { describe, it, expect } from "vitest";
import { BRAND, formatPageTitle } from "@/config/brand.js";

describe("brand config", () => {
  it("exposes stable string constants", () => {
    expect(BRAND.name.length).toBeGreaterThan(0);
    expect(BRAND.defaultPageTitle).toContain(BRAND.name);
  });

  it("formatPageTitle uses default when route title empty", () => {
    expect(formatPageTitle("")).toBe(BRAND.defaultPageTitle);
    expect(formatPageTitle("   ")).toBe(BRAND.defaultPageTitle);
  });

  it("formatPageTitle suffixes route titles", () => {
    expect(formatPageTitle("Dashboard")).toBe(`Dashboard — ${BRAND.titleSuffix}`);
  });
});
