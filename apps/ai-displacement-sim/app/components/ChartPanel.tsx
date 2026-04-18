import { useSimulation } from "~/context/SimulationContext";
import { DisplacementChart } from "./DisplacementChart";
import { GiniChart } from "./GiniChart";
import { PolicyGapChart } from "./PolicyGapChart";
import { GeographicChart } from "./GeographicChart";
import { GainsDistributionChart } from "./GainsDistributionChart";
import styles from "./ChartPanel.module.css";

export function ChartPanel() {
  const { results, compareResults } = useSimulation();

  return (
    <div className={styles.panel}>
      <DisplacementChart data={results} compareData={compareResults} />
      <GiniChart data={results} compareData={compareResults} />
      <PolicyGapChart data={results} compareData={compareResults} />
      <GeographicChart data={results} />
      <GainsDistributionChart data={results} />
    </div>
  );
}
