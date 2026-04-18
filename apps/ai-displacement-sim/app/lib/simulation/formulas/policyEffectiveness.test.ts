import { describe, it, expect } from "vitest";
import { policyEffectiveness } from "./policyEffectiveness";
import type { SimParams } from "../types";

function p(overrides: Partial<SimParams> = {}): SimParams {
  return {
    policyStartYear: 3,
    policyRampUpYears: 8,
    policyPoliticalWill: 0.8,
    regulatoryCaptureRate: 0.2,
    ...overrides,
  } as SimParams;
}

describe("policyEffectiveness", () => {
  it("returns 0 before policy start year", () => {
    expect(policyEffectiveness(2, p())).toBe(0);
  });

  it("returns 0 at policy start year", () => {
    expect(policyEffectiveness(3, p())).toBe(0);
  });

  it("reaches max after full ramp", () => {
    const max = policyEffectiveness(11, p()); // 3 + 8
    expect(max).toBeCloseTo(0.8 * (1 - 0.2), 5);
  });

  it("does not exceed max after ramp period", () => {
    const atRamp = policyEffectiveness(11, p());
    const after = policyEffectiveness(19, p());
    expect(after).toBeCloseTo(atRamp, 10);
  });

  it("is reduced by regulatory capture", () => {
    const low = policyEffectiveness(15, p({ regulatoryCaptureRate: 0.1 }));
    const high = policyEffectiveness(15, p({ regulatoryCaptureRate: 0.7 }));
    expect(low).toBeGreaterThan(high);
  });

  it("is zero when political will is 0", () => {
    expect(policyEffectiveness(15, p({ policyPoliticalWill: 0 }))).toBe(0);
  });
});
