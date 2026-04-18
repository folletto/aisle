export type PresetName = "openai" | "realistic" | "custom";

export interface SimParams {
  // AI capability growth (S-curve)
  growthRate: number;
  inflectionYear: number;
  ceiling: number;

  // Digital job exposure
  digitalExposureMultiplier: number;
  humanPremium: number;

  // Physical job exposure / robotics
  roboticsInflection: number;
  roboticsGrowthRate: number;
  physicalTaskCoverage: number;

  // Task vs job displacement
  taskBundleResistance: number;

  // Job category sizes (fractions of total workforce, must sum to 1)
  digitalCognitiveFraction: number;
  partialDigitalFraction: number;
  physicalRoutineFraction: number;
  physicalSkilledFraction: number;

  // Partial digital dampening
  partialDampening: number;

  // Reabsorption
  reabsorptionSpeed: number;
  skillMismatchPenalty: number;

  // Productivity distribution
  baseShareholderShare: number;
  baseWorkerShare: number;
  marketConcentration: number;
  laborBargainingPower: number;
  priceReductionPassthrough: number;
  taxCaptureRate: number;

  // Inequality
  baseGini: number;
  inequalitySensitivity: number;

  // Policy effectiveness
  policyStartYear: number;
  policyRampUpYears: number;
  policyPoliticalWill: number;
  regulatoryCaptureRate: number;

  // Safety net
  baseSafetyNet: number;
  policyStrength: number;
  supportAdequacy: number;

  // Geography
  northDigitalIntensity: number;
  southDigitalIntensity: number;
  infrastructureGap: number;

  // Robotics cost
  initialRoboticsCost: number;
  costDeclineRate: number;
  maintenanceOverhead: number;
}

export interface YearlyRecord {
  year: number;
  aiCapability: number;

  // Displacement by category (fraction of that category displaced this year)
  displacedDigital: number;
  displacedPartial: number;
  displacedPhysicalRoutine: number;
  displacedPhysicalSkilled: number;

  // Cumulative displaced pool (% of total workforce)
  displacedPool: number;

  // Reabsorbed this year (% of total workforce)
  reabsorbed: number;

  // Net displaced cumulative
  netDisplaced: number;

  // Gini coefficient
  giniCoefficient: number;

  // Productivity gains (index, 1 = baseline)
  productivityGains: number;

  // Gains distribution (fractions of total gains this year)
  gainsShareShareholder: number;
  gainsShareWorker: number;
  gainsShareConsumer: number;
  gainsSharePublic: number;

  // Policy
  policyEffectivenessLevel: number;
  disruptionIndex: number;

  // Safety net
  safetyNetCoverage: number;

  // Geography (% of respective workforce displaced)
  displacedNorth: number;
  displacedSouth: number;

  // Robotics cost index
  robotAdoptionCost: number;
}
