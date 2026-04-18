import { describe, it, expect } from "vitest";
import { physicalJobExposure } from "./physicalJobExposure";
import type { SimParams } from "../types";

function p(overrides: Partial<SimParams> = {}): SimParams {
  return {
    roboticsInflection: 15,
    roboticsGrowthRate: 0.4,
    physicalTaskCoverage: 0.8,
    ...overrides,
  } as SimParams;
}

describe("physicalJobExposure", () => {
  it("is near zero well before robotics inflection", () => {
    expect(physicalJobExposure(0, p())).toBeLessThan(0.05);
  });

  it("is close to physicalTaskCoverage well after inflection", () => {
    const result = physicalJobExposure(40, p({ roboticsInflection: 5, roboticsGrowthRate: 1 }));
    expect(result).toBeGreaterThan(0.79);
  });

  it("is monotonically non-decreasing over time", () => {
    let prev = physicalJobExposure(0, p());
    for (let t = 1; t <= 20; t++) {
      const curr = physicalJobExposure(t, p());
      expect(curr).toBeGreaterThanOrEqual(prev);
      prev = curr;
    }
  });

  it("never exceeds 1", () => {
    for (let t = 0; t <= 50; t++) {
      expect(physicalJobExposure(t, p())).toBeLessThanOrEqual(1);
    }
  });

  it("is never negative", () => {
    expect(physicalJobExposure(0, p())).toBeGreaterThanOrEqual(0);
  });

  it("scales with physicalTaskCoverage", () => {
    const low = physicalJobExposure(30, p({ physicalTaskCoverage: 0.3 }));
    const high = physicalJobExposure(30, p({ physicalTaskCoverage: 0.9 }));
    expect(high).toBeGreaterThan(low);
  });
});
