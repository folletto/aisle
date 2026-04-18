import type { SimParams } from "../types";
import { taskVsJobDisplacement } from "./taskVsJobDisplacement";

export interface DisplacementResult {
  displacedDigital: number;
  displacedPartial: number;
  displacedPhysicalRoutine: number;
  displacedPhysicalSkilled: number;
  total: number;
}

/**
 * Yearly net displacement across job categories.
 * Returns fractions of total workforce newly displaced this year.
 */
export function displacementRate(
  digitalExposure: number,
  physicalExposure: number,
  params: SimParams
): DisplacementResult {
  const {
    digitalCognitiveFraction,
    partialDigitalFraction,
    physicalRoutineFraction,
    physicalSkilledFraction,
    partialDampening,
  } = params;

  const digitalJobLoss = taskVsJobDisplacement(digitalExposure, params);
  const partialJobLoss = taskVsJobDisplacement(digitalExposure * partialDampening, params);

  const displacedDigital = digitalCognitiveFraction * digitalJobLoss;
  const displacedPartial = partialDigitalFraction * partialJobLoss;
  const displacedPhysicalRoutine = physicalRoutineFraction * physicalExposure;
  const displacedPhysicalSkilled = physicalSkilledFraction * physicalExposure * 0.5;

  return {
    displacedDigital,
    displacedPartial,
    displacedPhysicalRoutine,
    displacedPhysicalSkilled,
    total: displacedDigital + displacedPartial + displacedPhysicalRoutine + displacedPhysicalSkilled,
  };
}
