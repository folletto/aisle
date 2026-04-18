import type { SimParams } from "../types";

/**
 * Fraction of displaced workers covered by safety net,
 * and the effective support level they receive.
 */
export function safetyNetCoverage(
  policyEffectivenessLevel: number,
  params: SimParams
): number {
  const { baseSafetyNet, policyStrength, supportAdequacy } = params;
  const coverage = Math.min(1, baseSafetyNet + policyStrength * policyEffectivenessLevel);
  return coverage * supportAdequacy;
}
