import type { SimParams } from "../types";

/**
 * Models the lag between disruption onset and effective policy response.
 * Starts from policyStartYear and ramps linearly over policyRampUpYears,
 * then scaled by political will and reduced by regulatory capture.
 */
export function policyEffectiveness(t: number, params: SimParams): number {
  const { policyStartYear, policyRampUpYears, policyPoliticalWill, regulatoryCaptureRate } =
    params;

  const rampProgress = Math.max(0, Math.min(1, (t - policyStartYear) / policyRampUpYears));
  return rampProgress * policyPoliticalWill * (1 - regulatoryCaptureRate);
}
