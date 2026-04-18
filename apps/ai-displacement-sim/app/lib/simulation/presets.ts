import type { SimParams } from "./types";

/** Reproduces the implicit model in OpenAI's "Industrial Policy for the Intelligence Age" */
export const openaiAssumptions: SimParams = {
  // AI capability — steep, near-term, near-superintelligence ceiling
  growthRate: 0.8,
  inflectionYear: 3,
  ceiling: 1.0,

  // Digital exposure — almost all digital work exposed
  digitalExposureMultiplier: 0.9,
  humanPremium: 0.1,

  // Robotics — close behind AI
  roboticsInflection: 7,
  roboticsGrowthRate: 0.6,
  physicalTaskCoverage: 0.7,

  // Task bundling — weak resistance
  taskBundleResistance: 0.2,

  // Job categories
  digitalCognitiveFraction: 0.3,
  partialDigitalFraction: 0.35,
  physicalRoutineFraction: 0.25,
  physicalSkilledFraction: 0.1,
  partialDampening: 0.5,

  // Reabsorption — slow, justifying safety nets
  reabsorptionSpeed: 0.15,
  skillMismatchPenalty: 0.5,

  // Gains distribution
  baseShareholderShare: 0.3,
  baseWorkerShare: 0.3,
  marketConcentration: 0.6,
  laborBargainingPower: 0.3,
  priceReductionPassthrough: 0.15,
  taxCaptureRate: 0.25,

  // Inequality
  baseGini: 0.39,
  inequalitySensitivity: 0.08,

  // Policy — strong political will, low capture (optimistic)
  policyStartYear: 2,
  policyRampUpYears: 8,
  policyPoliticalWill: 0.8,
  regulatoryCaptureRate: 0.1,

  // Safety net
  baseSafetyNet: 0.3,
  policyStrength: 0.6,
  supportAdequacy: 0.7,

  // Geography — also high for Global South (unrealistic in the document)
  northDigitalIntensity: 0.7,
  southDigitalIntensity: 0.5,
  infrastructureGap: 0.2,

  // Robotics cost — declining fast
  initialRoboticsCost: 1.0,
  costDeclineRate: 0.15,
  maintenanceOverhead: 1.1,
};

/** Values grounded in empirical research and historical precedent */
export const empiricallyGrounded: SimParams = {
  // AI capability — slower, later inflection, significant plateau
  growthRate: 0.3,
  inflectionYear: 12,
  ceiling: 0.65,

  // Digital exposure — task-level, not job-level
  digitalExposureMultiplier: 0.4,
  humanPremium: 0.35,

  // Robotics — genuinely decades away at scale
  roboticsInflection: 25,
  roboticsGrowthRate: 0.3,
  physicalTaskCoverage: 0.5,

  // Task bundling — strong resistance (most jobs mix task types)
  taskBundleResistance: 0.6,

  // Job categories
  digitalCognitiveFraction: 0.22,
  partialDigitalFraction: 0.28,
  physicalRoutineFraction: 0.3,
  physicalSkilledFraction: 0.2,
  partialDampening: 0.4,

  // Reabsorption — closer to historical norm
  reabsorptionSpeed: 0.25,
  skillMismatchPenalty: 0.4,

  // Gains distribution — higher concentration, lower bargaining power
  baseShareholderShare: 0.3,
  baseWorkerShare: 0.3,
  marketConcentration: 0.75,
  laborBargainingPower: 0.2,
  priceReductionPassthrough: 0.08,
  taxCaptureRate: 0.08,

  // Inequality
  baseGini: 0.39,
  inequalitySensitivity: 0.12,

  // Policy — weaker political will, higher capture (historically typical)
  policyStartYear: 4,
  policyRampUpYears: 12,
  policyPoliticalWill: 0.4,
  regulatoryCaptureRate: 0.35,

  // Safety net
  baseSafetyNet: 0.2,
  policyStrength: 0.4,
  supportAdequacy: 0.5,

  // Geography — ~22% in Global North, much smaller in Global South
  northDigitalIntensity: 0.22,
  southDigitalIntensity: 0.08,
  infrastructureGap: 0.4,

  // Robotics cost — slower decline
  initialRoboticsCost: 1.0,
  costDeclineRate: 0.07,
  maintenanceOverhead: 1.3,
};
