import styles from "./OpenAIAssumptionsList.module.css";

const ASSUMPTIONS = [
  "AI capability inflects within 3 years and approaches superintelligence",
  "~90% of digital-cognitive work is automatable (minimal human premium)",
  "Robotics reaches scale within 7 years",
  "Weak task bundling — most jobs lose their non-automatable components",
  "Strong policy political will with low regulatory capture",
  "Global South faces similar displacement rates to Global North",
  "Tax capture rate achieves 25% of AI productivity gains",
];

export function OpenAIAssumptionsList() {
  return (
    <div className={styles.container}>
      <div className={styles.heading}>Required simultaneous assumptions</div>
      <p className={styles.warning}>
        This scenario requires all of the following to hold at once:
      </p>
      <ul className={styles.list}>
        {ASSUMPTIONS.map((a) => (
          <li key={a} className={styles.item}>
            {a}
          </li>
        ))}
      </ul>
    </div>
  );
}
