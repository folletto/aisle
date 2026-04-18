# AI Displacement Sim

Interactive simulation of AI-driven labour displacement assumptions. Exposes the hidden parameters behind OpenAI's "Industrial Policy for the Intelligence Age" and lets users compare an "OpenAI" preset against an empirically grounded baseline.

## Architecture

- **React Router v7** (SPA mode, `ssr: false`)
- **React 18** with CSS Modules for styling
- **Recharts** for all output charts
- **React Context** (`SimulationContext`) for shared state — no external state library

## Key Directories

```
app/
├── lib/simulation/        # All computation — pure functions, no React
│   ├── types.ts           # SimParams, YearlyRecord, PresetName
│   ├── runner.ts          # runSimulation(params): YearlyRecord[] — 20-year loop
│   ├── presets.ts         # openaiAssumptions, empiricallyGrounded
│   └── formulas/          # One file per formula, each with a co-located .test.ts
├── context/
│   └── SimulationContext.tsx  # Provider + useSimulation() hook
├── components/            # UI components with CSS Modules
└── routes/                # simulation, _index, methodology, sources
```

## Adding a New Parameter

1. Add the key and type to `SimParams` in `app/lib/simulation/types.ts`
2. Add a default value to **both** presets in `app/lib/simulation/presets.ts`
3. Use the parameter in the appropriate formula file under `app/lib/simulation/formulas/`
4. Add a `<ParamSlider>` entry in `app/components/SliderPanel.tsx` under the relevant group

## Adding a New Formula

1. Create `app/lib/simulation/formulas/myFormula.ts` — export a single pure function
2. Create `app/lib/simulation/formulas/myFormula.test.ts` — test boundary values, monotonicity, and clamps
3. Import and call the formula in `app/lib/simulation/runner.ts`
4. Add the output field to `YearlyRecord` in `types.ts`

## Running Locally

```bash
npm install
npm run dev       # Dev server at localhost:5173
npm run test      # Vitest unit + integration tests
npm run typecheck # TypeScript strict check
npm run build     # Production build to build/client/
```

## State Flow

```
SliderPanel / PresetSelector
  → setParam() / setPreset()
    → SimulationContext (useMemo re-runs simulation)
      → results: YearlyRecord[]
        → ChartPanel renders 5 charts
```

When `compareMode` is on, `compareResults` is also computed (the other main preset) and passed to charts as a second dashed series.
