import { describe, it, expect } from "vitest";
import { productivityDistribution } from "./productivityDistribution";
import type { SimParams } from "../types";

function p(overrides: Partial<SimParams> = {}): SimParams {
  return {
    baseShareholderShare: 0.3,
    baseWorkerShare: 0.3,
    marketConcentration: 0.5,
    laborBargainingPower: 0.4,
    priceReductionPassthrough: 0.1,
    taxCaptureRate: 0.1,
    ...overrides,
  } as SimParams;
}

describe("productivityDistribution", () => {
  it("returns zero gains when capability is 0", () => {
    const result = productivityDistribution(0, p());
    expect(result.total).toBe(0);
    expect(result.shareholder).toBe(0);
  });

  it("shareholder share increases with market concentration", () => {
    const low = productivityDistribution(0.5, p({ marketConcentration: 0.1 }));
    const high = productivityDistribution(0.5, p({ marketConcentration: 0.9 }));
    expect(high.shareholder).toBeGreaterThan(low.shareholder);
  });

  it("worker share decreases when laborBargainingPower falls", () => {
    const high = productivityDistribution(0.5, p({ laborBargainingPower: 0.8 }));
    const low = productivityDistribution(0.5, p({ laborBargainingPower: 0.1 }));
    expect(high.worker).toBeGreaterThan(low.worker);
  });

  it("all shares are non-negative", () => {
    const result = productivityDistribution(0.8, p());
    expect(result.shareholder).toBeGreaterThanOrEqual(0);
    expect(result.worker).toBeGreaterThanOrEqual(0);
    expect(result.consumer).toBeGreaterThanOrEqual(0);
    expect(result.public).toBeGreaterThanOrEqual(0);
  });

  it("total equals capability", () => {
    const result = productivityDistribution(0.7, p());
    expect(result.total).toBeCloseTo(0.7, 10);
  });
});
