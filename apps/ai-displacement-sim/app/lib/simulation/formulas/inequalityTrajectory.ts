import type { SimParams } from "../types";
import type { GainsDistribution } from "./productivityDistribution";

/**
 * Updates Gini coefficient based on how gains are distributed.
 * Rising shareholder share relative to worker share increases inequality.
 */
export function inequalityTrajectory(
  currentGini: number,
  gains: GainsDistribution,
  params: SimParams
): number {
  const { inequalitySensitivity } = params;
  const delta = (gains.shareholder - gains.worker) * inequalitySensitivity;
  return Math.min(1, Math.max(0, currentGini + delta));
}
