import { useState } from "react";
import { Zap, Monitor, Bot, Users, Landmark, Globe } from "lucide-react";
import type { LucideProps } from "lucide-react";
import { SliderGroup } from "./SliderGroup";
import { ParamSlider } from "./ParamSlider";
import type { SimParams } from "~/lib/simulation/types";
import styles from "./SliderPanel.module.css";

interface SliderDef {
  paramKey: keyof SimParams;
  label: string;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
}

interface GroupDef {
  key: string;
  title: string;
  shortTitle: string;
  Icon: React.FC<LucideProps>;
  defaultOpen: boolean;
  sliders: SliderDef[];
}

const pct = (v: number) => `${(v * 100).toFixed(0)}%`;
const yr = (v: number) => `yr ${v.toFixed(0)}`;
const dec = (v: number) => v.toFixed(2);

const GROUPS: GroupDef[] = [
  {
    key: "ai",
    title: "AI Capability",
    shortTitle: "AI",
    Icon: Zap,
    defaultOpen: true,
    sliders: [
      { paramKey: "growthRate", label: "S-curve growth rate", min: 0.1, max: 1.5, step: 0.05, format: dec },
      { paramKey: "inflectionYear", label: "Inflection year", min: 1, max: 19, step: 1, format: yr },
      { paramKey: "ceiling", label: "Capability ceiling", min: 0.2, max: 1.0, step: 0.05, format: pct },
    ],
  },
  {
    key: "digital",
    title: "Digital Job Exposure",
    shortTitle: "Digital",
    Icon: Monitor,
    defaultOpen: true,
    sliders: [
      { paramKey: "digitalExposureMultiplier", label: "Exposure multiplier", min: 0.1, max: 1.0, step: 0.05, format: dec },
      { paramKey: "humanPremium", label: "Human premium (trust/relational)", min: 0.0, max: 0.8, step: 0.05, format: pct },
      { paramKey: "taskBundleResistance", label: "Task bundle resistance", min: 0.0, max: 0.9, step: 0.05, format: pct },
    ],
  },
  {
    key: "robotics",
    title: "Robotics & Physical Jobs",
    shortTitle: "Robots",
    Icon: Bot,
    defaultOpen: false,
    sliders: [
      { paramKey: "roboticsInflection", label: "Robotics inflection year", min: 3, max: 30, step: 1, format: yr },
      { paramKey: "roboticsGrowthRate", label: "Robotics growth rate", min: 0.1, max: 1.0, step: 0.05, format: dec },
      { paramKey: "physicalTaskCoverage", label: "Physical task coverage", min: 0.1, max: 0.9, step: 0.05, format: pct },
      { paramKey: "costDeclineRate", label: "Robotics cost decline rate", min: 0.02, max: 0.3, step: 0.02, format: dec },
    ],
  },
  {
    key: "labour",
    title: "Labour Market",
    shortTitle: "Labour",
    Icon: Users,
    defaultOpen: false,
    sliders: [
      { paramKey: "reabsorptionSpeed", label: "Reabsorption speed", min: 0.05, max: 0.5, step: 0.05, format: dec },
      { paramKey: "skillMismatchPenalty", label: "Skill mismatch penalty", min: 0.0, max: 0.8, step: 0.05, format: pct },
      { paramKey: "marketConcentration", label: "Market concentration", min: 0.1, max: 0.95, step: 0.05, format: pct },
      { paramKey: "laborBargainingPower", label: "Labour bargaining power", min: 0.05, max: 0.8, step: 0.05, format: pct },
    ],
  },
  {
    key: "policy",
    title: "Policy & Redistribution",
    shortTitle: "Policy",
    Icon: Landmark,
    defaultOpen: false,
    sliders: [
      { paramKey: "policyStartYear", label: "Policy start year", min: 0, max: 10, step: 1, format: yr },
      { paramKey: "policyRampUpYears", label: "Policy ramp-up years", min: 2, max: 18, step: 1, format: yr },
      { paramKey: "policyPoliticalWill", label: "Political will", min: 0.1, max: 1.0, step: 0.05, format: pct },
      { paramKey: "regulatoryCaptureRate", label: "Regulatory capture rate", min: 0.0, max: 0.8, step: 0.05, format: pct },
      { paramKey: "taxCaptureRate", label: "Tax capture rate", min: 0.02, max: 0.4, step: 0.02, format: pct },
    ],
  },
  {
    key: "geo",
    title: "Geography",
    shortTitle: "Geo",
    Icon: Globe,
    defaultOpen: false,
    sliders: [
      { paramKey: "northDigitalIntensity", label: "Global North digital intensity", min: 0.05, max: 0.9, step: 0.05, format: pct },
      { paramKey: "southDigitalIntensity", label: "Global South digital intensity", min: 0.02, max: 0.6, step: 0.02, format: pct },
      { paramKey: "infrastructureGap", label: "Infrastructure gap", min: 0.0, max: 0.8, step: 0.05, format: pct },
    ],
  },
];

export function SliderPanel() {
  const [activeGroup, setActiveGroup] = useState("ai");

  return (
    <div className={styles.panel}>
      {/* Mobile: horizontal icon tab bar */}
      <div className={styles.iconBar} role="tablist" aria-label="Parameter groups">
        {GROUPS.map((g) => (
          <button
            key={g.key}
            role="tab"
            aria-selected={activeGroup === g.key}
            className={`${styles.iconBtn} ${activeGroup === g.key ? styles.iconBtnActive : ""}`}
            onClick={() => setActiveGroup(g.key)}
            title={g.title}
          >
            <g.Icon size={18} />
            <span className={styles.iconLabel}>{g.shortTitle}</span>
          </button>
        ))}
      </div>

      {/* Desktop: "Parameters" header */}
      <div className={styles.panelHeader}>Parameters</div>

      {/* Groups — desktop: all shown as accordion; mobile: only active shown */}
      {GROUPS.map((g) => (
        <div
          key={g.key}
          className={`${styles.groupWrapper} ${activeGroup === g.key ? styles.groupActive : ""}`}
          role="tabpanel"
          aria-hidden={activeGroup !== g.key}
        >
          <SliderGroup title={g.title} defaultOpen={g.defaultOpen}>
            {g.sliders.map((s) => (
              <ParamSlider key={String(s.paramKey)} {...s} />
            ))}
          </SliderGroup>
        </div>
      ))}
    </div>
  );
}
