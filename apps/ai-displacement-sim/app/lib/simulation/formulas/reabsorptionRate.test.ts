import { describe, it, expect } from "vitest";
import { reabsorptionRate } from "./reabsorptionRate";
import type { SimParams } from "../types";

function p(overrides: Partial<SimParams> = {}): SimParams {
  return {
    reabsorptionSpeed: 0.2,
    skillMismatchPenalty: 0.3,
    ...overrides,
  } as SimParams;
}

describe("reabsorptionRate", () => {
  it("returns 0 when displaced pool is 0", () => {
    expect(reabsorptionRate(0, p())).toBe(0);
  });

  it("returns 0 when skillMismatchPenalty is 1", () => {
    expect(reabsorptionRate(0.5, p({ skillMismatchPenalty: 1 }))).toBe(0);
  });

  it("increases with higher reabsorptionSpeed", () => {
    const low = reabsorptionRate(0.4, p({ reabsorptionSpeed: 0.1 }));
    const high = reabsorptionRate(0.4, p({ reabsorptionSpeed: 0.5 }));
    expect(high).toBeGreaterThan(low);
  });

  it("decreases with higher skillMismatchPenalty", () => {
    const low = reabsorptionRate(0.4, p({ skillMismatchPenalty: 0.1 }));
    const high = reabsorptionRate(0.4, p({ skillMismatchPenalty: 0.7 }));
    expect(low).toBeGreaterThan(high);
  });

  it("is never negative", () => {
    expect(reabsorptionRate(0, p())).toBeGreaterThanOrEqual(0);
  });

  it("scales linearly with pool size", () => {
    const half = reabsorptionRate(0.2, p());
    const full = reabsorptionRate(0.4, p());
    expect(full).toBeCloseTo(half * 2, 10);
  });
});
