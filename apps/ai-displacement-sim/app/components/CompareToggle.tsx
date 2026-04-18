import { useSimulation } from "~/context/SimulationContext";
import styles from "./CompareToggle.module.css";

export function CompareToggle() {
  const { compareMode, setCompareMode, preset } = useSimulation();
  const otherLabel = preset === "openai" ? "Realistic" : "OpenAI";

  return (
    <div className={styles.container}>
      <label className={styles.toggle} htmlFor="compare-toggle">
        <input
          id="compare-toggle"
          type="checkbox"
          checked={compareMode}
          onChange={(e) => setCompareMode(e.target.checked)}
        />
        <span className={styles.track} />
      </label>
      <label htmlFor="compare-toggle" className={styles.label}>
        Overlay {otherLabel} scenario
      </label>
    </div>
  );
}
