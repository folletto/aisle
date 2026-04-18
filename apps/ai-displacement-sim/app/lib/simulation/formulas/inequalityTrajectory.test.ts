import { describe, it, expect } from "vitest";
import { inequalityTrajectory } from "./inequalityTrajectory";
import type { SimParams } from "../types";
import type { GainsDistribution } from "./productivityDistribution";

function p(overrides: Partial<SimParams> = {}): SimParams {
  return { inequalitySensitivity: 0.1, ...overrides } as SimParams;
}

function gains(overrides: Partial<GainsDistribution> = {}): GainsDistribution {
  return { shareholder: 0.4, worker: 0.2, consumer: 0.2, public: 0.1, total: 0.9, ...overrides };
}

describe("inequalityTrajectory", () => {
  it("increases Gini when shareholder > worker", () => {
    const result = inequalityTrajectory(0.35, gains(), p());
    expect(result).toBeGreaterThan(0.35);
  });

  it("decreases Gini when worker > shareholder", () => {
    const result = inequalityTrajectory(0.5, gains({ shareholder: 0.1, worker: 0.5 }), p());
    expect(result).toBeLessThan(0.5);
  });

  it("clamps at 0", () => {
    const result = inequalityTrajectory(0.01, gains({ shareholder: 0, worker: 1 }), p({ inequalitySensitivity: 10 }));
    expect(result).toBeGreaterThanOrEqual(0);
  });

  it("clamps at 1", () => {
    const result = inequalityTrajectory(0.99, gains({ shareholder: 1, worker: 0 }), p({ inequalitySensitivity: 10 }));
    expect(result).toBeLessThanOrEqual(1);
  });

  it("does not change when shareholder equals worker", () => {
    const result = inequalityTrajectory(0.4, gains({ shareholder: 0.3, worker: 0.3 }), p());
    expect(result).toBeCloseTo(0.4, 5);
  });
});
