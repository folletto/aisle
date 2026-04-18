import type { SimParams } from "../types";

/**
 * S-curve: capability(t) = ceiling / (1 + exp(-growthRate * (t - inflectionYear)))
 * Returns a value in [0, ceiling]. At t=inflectionYear, returns ceiling/2.
 */
export function aiCapabilityGrowth(t: number, params: SimParams): number {
  const { growthRate, inflectionYear, ceiling } = params;
  return ceiling / (1 + Math.exp(-growthRate * (t - inflectionYear)));
}
