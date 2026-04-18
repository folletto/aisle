import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { SimParams, PresetName, YearlyRecord } from "~/lib/simulation/types";
import { runSimulation } from "~/lib/simulation/runner";
import { openaiAssumptions, empiricallyGrounded } from "~/lib/simulation/presets";

interface SimulationContextValue {
  params: SimParams;
  preset: PresetName;
  compareMode: boolean;
  results: YearlyRecord[];
  compareResults: YearlyRecord[] | null;
  setParam: (key: keyof SimParams, value: number) => void;
  setPreset: (name: PresetName) => void;
  setCompareMode: (enabled: boolean) => void;
}

const SimulationContext = createContext<SimulationContextValue | null>(null);

export function SimulationProvider({ children }: { children: React.ReactNode }) {
  const [params, setParams] = useState<SimParams>(empiricallyGrounded);
  const [preset, setPresetName] = useState<PresetName>("realistic");
  const [compareMode, setCompareMode] = useState(false);

  const results = useMemo(() => runSimulation(params), [params]);

  const compareResults = useMemo(() => {
    if (!compareMode) return null;
    // Compare against the other main preset
    const otherPreset = preset === "openai" ? empiricallyGrounded : openaiAssumptions;
    return runSimulation(otherPreset);
  }, [compareMode, preset]);

  const setParam = useCallback((key: keyof SimParams, value: number) => {
    setPresetName("custom");
    setParams((prev) => ({ ...prev, [key]: value }));
  }, []);

  const setPreset = useCallback((name: PresetName) => {
    if (name === "openai") {
      setParams(openaiAssumptions);
    } else if (name === "realistic") {
      setParams(empiricallyGrounded);
    }
    setPresetName(name);
  }, []);

  const value = useMemo(
    () => ({
      params,
      preset,
      compareMode,
      results,
      compareResults,
      setParam,
      setPreset,
      setCompareMode,
    }),
    [params, preset, compareMode, results, compareResults, setParam, setPreset]
  );

  return (
    <SimulationContext.Provider value={value}>
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulation(): SimulationContextValue {
  const ctx = useContext(SimulationContext);
  if (!ctx) {
    throw new Error("useSimulation must be used within a SimulationProvider");
  }
  return ctx;
}
