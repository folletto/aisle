import { describe, it, expect } from "vitest";
import { robotAdoptionCost } from "./robotAdoptionCost";
import type { SimParams } from "../types";

function p(overrides: Partial<SimParams> = {}): SimParams {
  return {
    initialRoboticsCost: 1.0,
    costDeclineRate: 0.1,
    maintenanceOverhead: 1.2,
    ...overrides,
  } as SimParams;
}

describe("robotAdoptionCost", () => {
  it("returns initialCost * maintenanceOverhead at t=0", () => {
    expect(robotAdoptionCost(0, p())).toBeCloseTo(1.0 * 1.2, 5);
  });

  it("decreases over time", () => {
    const early = robotAdoptionCost(2, p());
    const late = robotAdoptionCost(15, p());
    expect(early).toBeGreaterThan(late);
  });

  it("is monotonically decreasing", () => {
    let prev = robotAdoptionCost(0, p());
    for (let t = 1; t <= 20; t++) {
      const curr = robotAdoptionCost(t, p());
      expect(curr).toBeLessThanOrEqual(prev);
      prev = curr;
    }
  });

  it("is never negative", () => {
    for (let t = 0; t <= 20; t++) {
      expect(robotAdoptionCost(t, p())).toBeGreaterThanOrEqual(0);
    }
  });

  it("higher costDeclineRate leads to faster reduction", () => {
    const slow = robotAdoptionCost(10, p({ costDeclineRate: 0.05 }));
    const fast = robotAdoptionCost(10, p({ costDeclineRate: 0.3 }));
    expect(fast).toBeLessThan(slow);
  });
});
