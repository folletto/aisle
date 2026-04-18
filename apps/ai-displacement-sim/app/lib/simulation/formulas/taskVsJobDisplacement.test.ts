import { describe, it, expect } from "vitest";
import { taskVsJobDisplacement } from "./taskVsJobDisplacement";
import type { SimParams } from "../types";

function p(overrides: Partial<SimParams> = {}): SimParams {
  return { taskBundleResistance: 0.4, ...overrides } as SimParams;
}

describe("taskVsJobDisplacement", () => {
  it("returns 0 when taskAutomationRate is 0", () => {
    expect(taskVsJobDisplacement(0, p())).toBe(0);
  });

  it("returns 0 when taskBundleResistance is 1", () => {
    expect(taskVsJobDisplacement(0.8, p({ taskBundleResistance: 1 }))).toBe(0);
  });

  it("returns full rate when taskBundleResistance is 0", () => {
    expect(taskVsJobDisplacement(0.8, p({ taskBundleResistance: 0 }))).toBeCloseTo(0.8, 5);
  });

  it("is reduced by bundle resistance", () => {
    const low = taskVsJobDisplacement(0.6, p({ taskBundleResistance: 0.6 }));
    const high = taskVsJobDisplacement(0.6, p({ taskBundleResistance: 0.1 }));
    expect(high).toBeGreaterThan(low);
  });

  it("is never negative", () => {
    expect(taskVsJobDisplacement(-0.1, p())).toBeGreaterThanOrEqual(0);
  });
});
