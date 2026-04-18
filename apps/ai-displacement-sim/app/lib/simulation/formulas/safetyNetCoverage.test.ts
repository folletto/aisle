import { describe, it, expect } from "vitest";
import { safetyNetCoverage } from "./safetyNetCoverage";
import type { SimParams } from "../types";

function p(overrides: Partial<SimParams> = {}): SimParams {
  return {
    baseSafetyNet: 0.2,
    policyStrength: 0.5,
    supportAdequacy: 0.7,
    ...overrides,
  } as SimParams;
}

describe("safetyNetCoverage", () => {
  it("returns baseSafetyNet * supportAdequacy when policyEffectiveness is 0", () => {
    expect(safetyNetCoverage(0, p())).toBeCloseTo(0.2 * 0.7, 5);
  });

  it("increases with policy effectiveness", () => {
    const low = safetyNetCoverage(0, p());
    const high = safetyNetCoverage(1, p());
    expect(high).toBeGreaterThan(low);
  });

  it("coverage is capped at 1 before adequacy multiplier", () => {
    // baseSafetyNet=0.8 + policyStrength=0.8 * effectiveness=1 > 1; should cap
    const result = safetyNetCoverage(1, p({ baseSafetyNet: 0.8, policyStrength: 0.8, supportAdequacy: 1 }));
    expect(result).toBeLessThanOrEqual(1);
  });

  it("is never negative", () => {
    expect(safetyNetCoverage(0, p({ baseSafetyNet: 0, policyStrength: 0 }))).toBeGreaterThanOrEqual(0);
  });

  it("scales with supportAdequacy", () => {
    const low = safetyNetCoverage(0.5, p({ supportAdequacy: 0.3 }));
    const high = safetyNetCoverage(0.5, p({ supportAdequacy: 0.9 }));
    expect(high).toBeGreaterThan(low);
  });
});
