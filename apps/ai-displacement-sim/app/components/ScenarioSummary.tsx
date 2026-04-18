import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { PresetName } from "~/lib/simulation/types";
import styles from "./ScenarioSummary.module.css";

const CONTENT: Record<"openai" | "realistic", { summary: string; items: string[] }> = {
  openai: {
    summary: "7 aggressive assumptions must all hold simultaneously",
    items: [
      "AI capability inflects within 3 years and approaches superintelligence",
      "~90% of digital-cognitive work is automatable (minimal human premium)",
      "Robotics reaches scale within 7 years",
      "Weak task bundling — most jobs lose their non-automatable components",
      "Strong policy political will with low regulatory capture",
      "Global South faces similar displacement rates to Global North",
      "Tax capture achieves 25% of AI productivity gains",
    ],
  },
  realistic: {
    summary: "Grounded in historical precedent and empirical research",
    items: [
      "AI capability takes 12+ years to inflect, plateauing at 65% of theoretical max",
      "Strong task bundling — 60% of automatable tasks are bundled with non-automatable work",
      "Robotics remains economically unviable at scale for 25+ years (IFR data)",
      "Market concentration is higher (75%), shrinking workers' share of gains",
      "Policy takes 12 years to ramp; 35% regulatory capture is historically typical",
      "Global South digital workforce is only ~8% — far lower than OpenAI assumes",
      "Without structural reform, tax captures only 8% of productivity gains",
    ],
  },
};

interface Props {
  preset: "openai" | "realistic";
}

export function ScenarioSummary({ preset }: Props) {
  const [open, setOpen] = useState(false);
  const { summary, items } = CONTENT[preset];
  const isOpenAI = preset === "openai";

  return (
    <div className={`${styles.container} ${isOpenAI ? styles.openai : styles.realistic}`}>
      <button
        className={styles.header}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className={styles.summary}>{summary}</span>
        <ChevronDown
          size={14}
          className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}
        />
      </button>
      {open && (
        <ul className={styles.list}>
          {items.map((item) => (
            <li key={item} className={styles.item}>
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
