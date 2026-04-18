import type { SimParams } from "../types";

/**
 * Workers reabsorbed from the displaced pool this year.
 * Returns a fraction of total workforce reabsorbed.
 */
export function reabsorptionRate(displacedPool: number, params: SimParams): number {
  const { reabsorptionSpeed, skillMismatchPenalty } = params;
  return Math.max(0, displacedPool * reabsorptionSpeed * (1 - skillMismatchPenalty));
}
