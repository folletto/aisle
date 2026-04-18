import { SliderGroup } from "./SliderGroup";
import { ParamSlider } from "./ParamSlider";
import styles from "./SliderPanel.module.css";

const pct = (v: number) => `${(v * 100).toFixed(0)}%`;
const yr = (v: number) => `yr ${v.toFixed(0)}`;
const x = (v: number) => `${v.toFixed(2)}×`;
const dec = (v: number) => v.toFixed(2);

export function SliderPanel() {
  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>Parameters</div>

      <SliderGroup title="AI Capability" defaultOpen>
        <ParamSlider paramKey="growthRate" label="S-curve growth rate" min={0.1} max={1.5} step={0.05} format={dec} />
        <ParamSlider paramKey="inflectionYear" label="Inflection year" min={1} max={19} step={1} format={yr} />
        <ParamSlider paramKey="ceiling" label="Capability ceiling" min={0.2} max={1.0} step={0.05} format={pct} />
      </SliderGroup>

      <SliderGroup title="Digital Job Exposure" defaultOpen>
        <ParamSlider paramKey="digitalExposureMultiplier" label="Exposure multiplier" min={0.1} max={1.0} step={0.05} format={dec} />
        <ParamSlider paramKey="humanPremium" label="Human premium (trust/relational)" min={0.0} max={0.8} step={0.05} format={pct} />
        <ParamSlider paramKey="taskBundleResistance" label="Task bundle resistance" min={0.0} max={0.9} step={0.05} format={pct} />
      </SliderGroup>

      <SliderGroup title="Robotics & Physical Jobs" defaultOpen={false}>
        <ParamSlider paramKey="roboticsInflection" label="Robotics inflection year" min={3} max={30} step={1} format={yr} />
        <ParamSlider paramKey="roboticsGrowthRate" label="Robotics growth rate" min={0.1} max={1.0} step={0.05} format={dec} />
        <ParamSlider paramKey="physicalTaskCoverage" label="Physical task coverage" min={0.1} max={0.9} step={0.05} format={pct} />
        <ParamSlider paramKey="costDeclineRate" label="Robotics cost decline rate" min={0.02} max={0.3} step={0.02} format={dec} />
      </SliderGroup>

      <SliderGroup title="Labour Market" defaultOpen={false}>
        <ParamSlider paramKey="reabsorptionSpeed" label="Reabsorption speed" min={0.05} max={0.5} step={0.05} format={dec} />
        <ParamSlider paramKey="skillMismatchPenalty" label="Skill mismatch penalty" min={0.0} max={0.8} step={0.05} format={pct} />
        <ParamSlider paramKey="marketConcentration" label="Market concentration" min={0.1} max={0.95} step={0.05} format={pct} />
        <ParamSlider paramKey="laborBargainingPower" label="Labour bargaining power" min={0.05} max={0.8} step={0.05} format={pct} />
      </SliderGroup>

      <SliderGroup title="Policy & Redistribution" defaultOpen={false}>
        <ParamSlider paramKey="policyStartYear" label="Policy start year" min={0} max={10} step={1} format={yr} />
        <ParamSlider paramKey="policyRampUpYears" label="Policy ramp-up years" min={2} max={18} step={1} format={yr} />
        <ParamSlider paramKey="policyPoliticalWill" label="Political will" min={0.1} max={1.0} step={0.05} format={pct} />
        <ParamSlider paramKey="regulatoryCaptureRate" label="Regulatory capture rate" min={0.0} max={0.8} step={0.05} format={pct} />
        <ParamSlider paramKey="taxCaptureRate" label="Tax capture rate" min={0.02} max={0.4} step={0.02} format={pct} />
      </SliderGroup>

      <SliderGroup title="Geography" defaultOpen={false}>
        <ParamSlider paramKey="northDigitalIntensity" label="Global North digital intensity" min={0.05} max={0.9} step={0.05} format={pct} />
        <ParamSlider paramKey="southDigitalIntensity" label="Global South digital intensity" min={0.02} max={0.6} step={0.02} format={pct} />
        <ParamSlider paramKey="infrastructureGap" label="Infrastructure gap" min={0.0} max={0.8} step={0.05} format={pct} />
      </SliderGroup>
    </div>
  );
}
