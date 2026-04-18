import { useSimulation } from "~/context/SimulationContext";
import type { PresetName } from "~/lib/simulation/types";
import styles from "./PresetSelector.module.css";

export function PresetSelector() {
  const { preset, setPreset } = useSimulation();

  const btn = (name: PresetName, label: string, styleName: string) => {
    const isActive = preset === name;
    return (
      <button
        key={name}
        className={[styles.btn, styles[styleName as keyof typeof styles], isActive ? styles.btnActive : ""].join(" ")}
        onClick={() => setPreset(name)}
        aria-pressed={isActive}
      >
        {label}
      </button>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.label}>Scenario</div>
      <div className={styles.buttons}>
        {btn("openai", "OpenAI", "btnOpenai")}
        {btn("realistic", "Realistic", "btnRealistic")}
        {btn("custom", "Custom", "btnCustom")}
      </div>
    </div>
  );
}
