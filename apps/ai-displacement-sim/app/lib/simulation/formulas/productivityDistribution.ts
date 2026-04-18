import type { SimParams } from "../types";

export interface GainsDistribution {
  shareholder: number;
  worker: number;
  consumer: number;
  public: number;
  total: number;
}

/**
 * Splits AI productivity gains across stakeholder groups.
 * Higher market concentration shifts gains toward shareholders.
 * Lower labour bargaining power reduces worker share.
 */
export function productivityDistribution(
  capability: number,
  params: SimParams
): GainsDistribution {
  const {
    baseShareholderShare,
    baseWorkerShare,
    marketConcentration,
    laborBargainingPower,
    priceReductionPassthrough,
    taxCaptureRate,
  } = params;

  const totalGains = capability;

  const shareholderShare =
    baseShareholderShare * (1 + marketConcentration) * totalGains;
  const workerShare =
    baseWorkerShare * (1 - marketConcentration) * laborBargainingPower * totalGains;
  const consumerShare = priceReductionPassthrough * totalGains;
  const publicShare = taxCaptureRate * totalGains;

  return {
    shareholder: Math.max(0, shareholderShare),
    worker: Math.max(0, workerShare),
    consumer: Math.max(0, consumerShare),
    public: Math.max(0, publicShare),
    total: totalGains,
  };
}
