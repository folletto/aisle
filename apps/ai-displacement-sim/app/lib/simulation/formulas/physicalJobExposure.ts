import type { SimParams } from "../types";

/** Sigmoid: 1 / (1 + exp(-k*(x - midpoint))) */
function sigmoid(x: number, midpoint: number, k = 0.5): number {
  return 1 / (1 + Math.exp(-k * (x - midpoint)));
}

/**
 * Physical job exposure is gated by robotics deployment, not AI capability.
 * roboticsInflection is the year at which robotics reaches its midpoint.
 * Well before that year, exposure is near zero.
 */
export function physicalJobExposure(t: number, params: SimParams): number {
  const { roboticsInflection, roboticsGrowthRate, physicalTaskCoverage } = params;
  const roboticsCapability = sigmoid(t, roboticsInflection, roboticsGrowthRate);
  return Math.min(1, Math.max(0, roboticsCapability * physicalTaskCoverage));
}
