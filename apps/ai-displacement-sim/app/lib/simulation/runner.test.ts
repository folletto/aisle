import { describe, it, expect } from "vitest";
import { runSimulation } from "./runner";
import { openaiAssumptions, empiricallyGrounded } from "./presets";

describe("runSimulation", () => {
  it("produces exactly 20 records", () => {
    expect(runSimulation(openaiAssumptions)).toHaveLength(20);
    expect(runSimulation(empiricallyGrounded)).toHaveLength(20);
  });

  it("records span years 2025–2044", () => {
    const records = runSimulation(openaiAssumptions);
    expect(records[0].year).toBe(2025);
    expect(records[19].year).toBe(2044);
  });

  it("all records have non-negative displacement values", () => {
    for (const preset of [openaiAssumptions, empiricallyGrounded]) {
      for (const r of runSimulation(preset)) {
        expect(r.displacedPool).toBeGreaterThanOrEqual(0);
        expect(r.netDisplaced).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it("Gini stays in [0, 1] for both presets", () => {
    for (const preset of [openaiAssumptions, empiricallyGrounded]) {
      for (const r of runSimulation(preset)) {
        expect(r.giniCoefficient).toBeGreaterThanOrEqual(0);
        expect(r.giniCoefficient).toBeLessThanOrEqual(1);
      }
    }
  });

  it("productivity gains are monotonically non-decreasing", () => {
    const records = runSimulation(openaiAssumptions);
    for (let i = 1; i < records.length; i++) {
      expect(records[i].productivityGains).toBeGreaterThanOrEqual(
        records[i - 1].productivityGains
      );
    }
  });

  it("OpenAI preset produces higher peak displacement than realistic", () => {
    const openai = runSimulation(openaiAssumptions);
    const realistic = runSimulation(empiricallyGrounded);
    const maxOpenAI = Math.max(...openai.map((r) => r.displacedPool));
    const maxRealistic = Math.max(...realistic.map((r) => r.displacedPool));
    expect(maxOpenAI).toBeGreaterThan(maxRealistic);
  });

  it("Gini ends higher under OpenAI preset (larger gains flowing to shareholders)", () => {
    const openai = runSimulation(openaiAssumptions);
    const realistic = runSimulation(empiricallyGrounded);
    const finalOpenAI = openai[19].giniCoefficient;
    const finalRealistic = realistic[19].giniCoefficient;
    // OpenAI preset has near-1.0 capability ceiling → large gains mostly to shareholders
    // Realistic preset has 0.65 ceiling and later inflection → smaller absolute gains
    expect(finalOpenAI).toBeGreaterThan(finalRealistic);
  });

  it("policy effectiveness is 0 in early years", () => {
    const records = runSimulation(openaiAssumptions);
    // policyStartYear=2, so t=0 and t=1 should have 0 effectiveness
    expect(records[0].policyEffectivenessLevel).toBe(0);
    expect(records[1].policyEffectivenessLevel).toBe(0);
  });
});
