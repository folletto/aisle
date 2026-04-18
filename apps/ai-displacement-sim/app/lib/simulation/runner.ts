import type { SimParams, YearlyRecord } from "./types";
import { aiCapabilityGrowth } from "./formulas/aiCapabilityGrowth";
import { digitalJobExposure } from "./formulas/digitalJobExposure";
import { physicalJobExposure } from "./formulas/physicalJobExposure";
import { displacementRate } from "./formulas/displacementRate";
import { reabsorptionRate } from "./formulas/reabsorptionRate";
import { productivityDistribution } from "./formulas/productivityDistribution";
import { inequalityTrajectory } from "./formulas/inequalityTrajectory";
import { policyEffectiveness } from "./formulas/policyEffectiveness";
import { safetyNetCoverage } from "./formulas/safetyNetCoverage";
import { geographicImpact } from "./formulas/geographicImpact";
import { robotAdoptionCost } from "./formulas/robotAdoptionCost";

const HORIZON = 20;
const START_YEAR = 2025;

export function runSimulation(params: SimParams): YearlyRecord[] {
  const records: YearlyRecord[] = [];
  let displacedPool = 0;
  let gini = params.baseGini;
  let cumulativeProductivity = 0;

  for (let t = 0; t < HORIZON; t++) {
    const capability = aiCapabilityGrowth(t, params);
    const digitalExposure = digitalJobExposure(capability, params);
    const physExposure = physicalJobExposure(t, params);

    const displaced = displacementRate(digitalExposure, physExposure, params);
    const reabsorbed = reabsorptionRate(displacedPool, params);

    displacedPool = Math.max(0, displacedPool + displaced.total - reabsorbed);

    const policyEff = policyEffectiveness(t, params);
    const safetyNet = safetyNetCoverage(policyEff, params);

    const gains = productivityDistribution(capability, params);
    cumulativeProductivity += gains.total;

    gini = inequalityTrajectory(gini, gains, params);

    const geo = geographicImpact(displacedPool, params);
    const robotCost = robotAdoptionCost(t, params);

    // disruptionIndex: ratio of displaced pool to policy effectiveness
    const disruptionIndex = displacedPool;

    records.push({
      year: START_YEAR + t,
      aiCapability: capability,
      displacedDigital: displaced.displacedDigital,
      displacedPartial: displaced.displacedPartial,
      displacedPhysicalRoutine: displaced.displacedPhysicalRoutine,
      displacedPhysicalSkilled: displaced.displacedPhysicalSkilled,
      displacedPool,
      reabsorbed,
      netDisplaced: displacedPool,
      giniCoefficient: gini,
      productivityGains: cumulativeProductivity,
      gainsShareShareholder: gains.shareholder,
      gainsShareWorker: gains.worker,
      gainsShareConsumer: gains.consumer,
      gainsSharePublic: gains.public,
      policyEffectivenessLevel: policyEff,
      disruptionIndex,
      safetyNetCoverage: safetyNet,
      displacedNorth: geo.north,
      displacedSouth: geo.south,
      robotAdoptionCost: robotCost,
    });
  }

  return records;
}
