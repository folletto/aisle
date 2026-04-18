import { describe, it, expect } from "vitest";
import { aiCapabilityGrowth } from "./aiCapabilityGrowth";
import type { SimParams } from "../types";

const base: Partial<SimParams> = {
  growthRate: 0.5,
  inflectionYear: 10,
  ceiling: 1.0,
};

function p(overrides: Partial<SimParams> = {}): SimParams {
  return { ...base, ...overrides } as SimParams;
}

describe("aiCapabilityGrowth", () => {
  it("returns ceiling/2 at inflection year", () => {
    const result = aiCapabilityGrowth(10, p());
    expect(result).toBeCloseTo(0.5, 5);
  });

  it("returns close to 0 well before inflection", () => {
    const result = aiCapabilityGrowth(0, p({ growthRate: 1, inflectionYear: 20 }));
    expect(result).toBeLessThan(0.01);
  });

  it("approaches ceiling well after inflection", () => {
    const result = aiCapabilityGrowth(40, p({ growthRate: 1, inflectionYear: 10 }));
    expect(result).toBeGreaterThan(0.99);
  });

  it("never exceeds ceiling", () => {
    for (let t = 0; t <= 20; t++) {
      expect(aiCapabilityGrowth(t, p())).toBeLessThanOrEqual(1.0);
    }
  });

  it("is monotonically increasing over time", () => {
    let prev = aiCapabilityGrowth(0, p());
    for (let t = 1; t <= 20; t++) {
      const curr = aiCapabilityGrowth(t, p());
      expect(curr).toBeGreaterThanOrEqual(prev);
      prev = curr;
    }
  });

  it("respects a ceiling lower than 1", () => {
    const result = aiCapabilityGrowth(10, p({ ceiling: 0.65 }));
    expect(result).toBeCloseTo(0.325, 5);
  });
});
