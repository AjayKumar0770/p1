import { describe, it, expect } from "vitest";
import { formatCurrency, formatVolume } from "../utils/formatters";

describe("formatCurrency", () => {
  it("should return ₹0.00 for undefined or NaN", () => {
    expect(formatCurrency(undefined)).toBe("₹0.00");
    expect(formatCurrency(NaN)).toBe("₹0.00");
    expect(formatCurrency("invalid" as any)).toBe("₹0.00");
  });

  it("should format large abbreviations correctly (Lakh Crore)", () => {
    expect(formatCurrency(1.5e12)).toBe("₹1.50 LCr");
    expect(formatCurrency(1e12)).toBe("₹1.00 LCr");
  });

  it("should format large abbreviations correctly (Crore)", () => {
    expect(formatCurrency(1.5e7)).toBe("₹1.50 Cr");
    expect(formatCurrency(1e7)).toBe("₹1.00 Cr");
  });

  it("should format smaller numbers using Indian numbering system", () => {
    expect(formatCurrency(1000)).toMatch(/₹( |)1,000.00/);
    expect(formatCurrency(100000)).toMatch(/₹( |)1,00,000.00/);
    expect(formatCurrency(123456.78)).toMatch(/₹( |)1,23,456.78/);
  });
});

describe("formatVolume", () => {
  it("should return 0 for undefined or NaN", () => {
    expect(formatVolume(undefined)).toBe("0");
    expect(formatVolume(NaN)).toBe("0");
    expect(formatVolume("invalid" as any)).toBe("0");
  });

  it("should format Crore correctly", () => {
    expect(formatVolume(1.5e7)).toBe("1.50 Cr");
  });

  it("should format Lakh correctly", () => {
    expect(formatVolume(1.5e5)).toBe("1.50 L");
  });

  it("should format Thousands correctly", () => {
    expect(formatVolume(1.5e3)).toBe("1.50 K");
  });

  it("should format smaller numbers using Indian numbering system", () => {
    expect(formatVolume(900)).toBe("900");
  });
});
