import { describe, it, expect } from "vitest";
import { displacementRate } from "./displacementRate";
import type { SimParams } from "../types";

function p(overrides: Partial<SimParams> = {}): SimParams {
  return {
    digitalCognitiveFraction: 0.2,
    partialDigitalFraction: 0.3,
    physicalRoutineFraction: 0.3,
    physicalSkilledFraction: 0.2,
    partialDampening: 0.5,
    taskBundleResistance: 0.4,
    ...overrides,
  } as SimParams;
}

describe("displacementRate", () => {
  it("returns zeros when both exposures are 0", () => {
    const result = displacementRate(0, 0, p());
    expect(result.total).toBe(0);
    expect(result.displacedDigital).toBe(0);
    expect(result.displacedPhysicalRoutine).toBe(0);
  });

  it("total equals sum of categories", () => {
    const result = displacementRate(0.5, 0.3, p());
    const sum =
      result.displacedDigital +
      result.displacedPartial +
      result.displacedPhysicalRoutine +
      result.displacedPhysicalSkilled;
    expect(result.total).toBeCloseTo(sum, 10);
  });

  it("physical displacement scales with physicalExposure", () => {
    const low = displacementRate(0.5, 0.1, p());
    const high = displacementRate(0.5, 0.8, p());
    expect(high.displacedPhysicalRoutine).toBeGreaterThan(low.displacedPhysicalRoutine);
  });

  it("digital displacement scales with digitalExposure", () => {
    const low = displacementRate(0.1, 0.0, p());
    const high = displacementRate(0.9, 0.0, p());
    expect(high.displacedDigital).toBeGreaterThan(low.displacedDigital);
  });

  it("partial displacement is damped relative to digital", () => {
    const result = displacementRate(0.8, 0, p({ taskBundleResistance: 0 }));
    expect(result.displacedPartial).toBeLessThan(result.displacedDigital);
  });

  it("all values are non-negative", () => {
    const result = displacementRate(0.5, 0.3, p());
    expect(result.displacedDigital).toBeGreaterThanOrEqual(0);
    expect(result.displacedPartial).toBeGreaterThanOrEqual(0);
    expect(result.displacedPhysicalRoutine).toBeGreaterThanOrEqual(0);
    expect(result.displacedPhysicalSkilled).toBeGreaterThanOrEqual(0);
  });
});
