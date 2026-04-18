import type { SimParams } from "../types";

/**
 * Cost index for deploying physical robotics at time t.
 * Even when robots can do a job, the economic case depends on this cost
 * relative to human labour — especially in low-wage sectors.
 * Returns a cost index (1 = baseline year 0 cost).
 */
export function robotAdoptionCost(t: number, params: SimParams): number {
  const { initialRoboticsCost, costDeclineRate, maintenanceOverhead } = params;
  const deploymentCost = initialRoboticsCost * Math.exp(-costDeclineRate * t);
  return Math.max(0, deploymentCost * maintenanceOverhead);
}
