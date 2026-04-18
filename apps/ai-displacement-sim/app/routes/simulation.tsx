import { Nav } from "~/components/Nav";
import { PresetSelector } from "~/components/PresetSelector";
import { CompareToggle } from "~/components/CompareToggle";
import { OpenAIAssumptionsList } from "~/components/OpenAIAssumptionsList";
import { SliderPanel } from "~/components/SliderPanel";
import { ChartPanel } from "~/components/ChartPanel";
import { useSimulation } from "~/context/SimulationContext";
import styles from "./simulation.module.css";

function TopBar() {
  const { preset } = useSimulation();
  return (
    <div className={styles.topBar}>
      <PresetSelector />
      <CompareToggle />
      {preset === "openai" && <OpenAIAssumptionsList />}
    </div>
  );
}

export default function SimulationRoute() {
  return (
    <div className={styles.page}>
      <Nav />
      <TopBar />
      <div className={styles.body}>
        <div className={styles.sidebar}>
          <SliderPanel />
        </div>
        <div className={styles.main}>
          <ChartPanel />
        </div>
      </div>
    </div>
  );
}
