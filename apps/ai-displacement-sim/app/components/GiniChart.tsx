import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { YearlyRecord } from "~/lib/simulation/types";
import styles from "./DisplacementChart.module.css";

interface Props {
  data: YearlyRecord[];
  compareData?: YearlyRecord[] | null;
}

export function GiniChart({ data, compareData }: Props) {
  const chartData = data.map((r) => ({
    year: r.year,
    gini: r.giniCoefficient,
    compareGini: compareData?.find((c) => c.year === r.year)?.giniCoefficient,
  }));

  return (
    <div className={styles.container}>
      <div className={styles.title}>Wealth Inequality (Gini)</div>
      <div className={styles.subtitle}>Gini coefficient trajectory — higher means more unequal</div>
      <div className={styles.chart}>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
            <title>Gini Coefficient Chart</title>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="year" tick={{ fontSize: 11, fill: "var(--color-text-muted)" }} />
            <YAxis domain={[0.3, 0.9]} tick={{ fontSize: 11, fill: "var(--color-text-muted)" }} width={40} />
            <Tooltip
              contentStyle={{ background: "var(--color-surface-raised)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", fontSize: 12 }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line type="monotone" dataKey="gini" name="Gini" stroke="var(--color-chart-2)" strokeWidth={2} dot={false} />
            {compareData && (
              <Line type="monotone" dataKey="compareGini" name="Compare: Gini" stroke="var(--color-realistic)" strokeWidth={2} strokeDasharray="5 3" dot={false} />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
