import { describe, it, expect } from "vitest";
import { geographicImpact } from "./geographicImpact";
import type { SimParams } from "../types";

function p(overrides: Partial<SimParams> = {}): SimParams {
  return {
    northDigitalIntensity: 0.22,
    southDigitalIntensity: 0.08,
    infrastructureGap: 0.4,
    ...overrides,
  } as SimParams;
}

describe("geographicImpact", () => {
  it("returns zero for both when pool is 0", () => {
    const result = geographicImpact(0, p());
    expect(result.north).toBe(0);
    expect(result.south).toBe(0);
  });

  it("north is higher than south with realistic values", () => {
    const result = geographicImpact(0.5, p());
    expect(result.north).toBeGreaterThan(result.south);
  });

  it("south is reduced by infrastructure gap", () => {
    const low = geographicImpact(0.5, p({ infrastructureGap: 0.8 }));
    const high = geographicImpact(0.5, p({ infrastructureGap: 0.1 }));
    expect(high.south).toBeGreaterThan(low.south);
  });

  it("both values are non-negative", () => {
    const result = geographicImpact(0.3, p());
    expect(result.north).toBeGreaterThanOrEqual(0);
    expect(result.south).toBeGreaterThanOrEqual(0);
  });

  it("scales linearly with pool size", () => {
    const half = geographicImpact(0.2, p());
    const full = geographicImpact(0.4, p());
    expect(full.north).toBeCloseTo(half.north * 2, 10);
  });
});
