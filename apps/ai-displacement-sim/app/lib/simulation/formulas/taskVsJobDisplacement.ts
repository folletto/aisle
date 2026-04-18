import type { SimParams } from "../types";

/**
 * Converts task-level automation fraction into actual job loss fraction.
 * taskBundleResistance captures that most roles mix automatable and
 * non-automatable tasks — reducing total job loss below task automation rate.
 */
export function taskVsJobDisplacement(taskAutomationRate: number, params: SimParams): number {
  const { taskBundleResistance } = params;
  return Math.max(0, taskAutomationRate * (1 - taskBundleResistance));
}
