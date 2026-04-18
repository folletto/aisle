import type { SimParams } from "../types";

export interface GeographicResult {
  north: number;
  south: number;
}

/**
 * Separates displacement effects across Global North vs. South.
 * The document is US-centric; southDigitalIntensity is typically much lower,
 * and the infrastructureGap further reduces impact in the Global South.
 */
export function geographicImpact(
  displacedPool: number,
  params: SimParams
): GeographicResult {
  const { northDigitalIntensity, southDigitalIntensity, infrastructureGap } = params;
  return {
    north: displacedPool * northDigitalIntensity,
    south: displacedPool * southDigitalIntensity * (1 - infrastructureGap),
  };
}
