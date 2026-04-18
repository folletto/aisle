import type { SimParams } from "../types";

/**
 * Fraction of digital-cognitive jobs exposed given AI capability c.
 * Clamped to [0, 1]. When humanPremium=1, returns 0 (all work remains human).
 */
export function digitalJobExposure(capability: number, params: SimParams): number {
  const { digitalExposureMultiplier, humanPremium } = params;
  return Math.min(1, Math.max(0, capability * digitalExposureMultiplier * (1 - humanPremium)));
}
