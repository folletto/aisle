import { describe, it, expect } from "vitest";
import { digitalJobExposure } from "./digitalJobExposure";
import type { SimParams } from "../types";

function p(overrides: Partial<SimParams> = {}): SimParams {
  return {
    digitalExposureMultiplier: 0.9,
    humanPremium: 0.1,
    ...overrides,
  } as SimParams;
}

describe("digitalJobExposure", () => {
  it("returns 0 when capability is 0", () => {
    expect(digitalJobExposure(0, p())).toBe(0);
  });

  it("returns 0 when humanPremium is 1", () => {
    expect(digitalJobExposure(1, p({ humanPremium: 1 }))).toBe(0);
  });

  it("never exceeds 1", () => {
    expect(digitalJobExposure(10, p())).toBe(1);
  });

  it("scales with capability", () => {
    const low = digitalJobExposure(0.3, p());
    const high = digitalJobExposure(0.8, p());
    expect(high).toBeGreaterThan(low);
  });

  it("reduces with higher humanPremium", () => {
    const low = digitalJobExposure(0.5, p({ humanPremium: 0.1 }));
    const high = digitalJobExposure(0.5, p({ humanPremium: 0.5 }));
    expect(low).toBeGreaterThan(high);
  });

  it("is never negative", () => {
    expect(digitalJobExposure(0, p({ humanPremium: 0 }))).toBeGreaterThanOrEqual(0);
  });
});
