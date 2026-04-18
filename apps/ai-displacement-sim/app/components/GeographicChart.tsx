import {
  BarChart,
  Bar,
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
}

const pct = (v: number) => `${(v * 100).toFixed(1)}%`;

export function GeographicChart({ data }: Props) {
  // Sample every 4 years for readability
  const chartData = data
    .filter((_, i) => i % 4 === 0 || i === data.length - 1)
    .map((r) => ({
      year: r.year,
      north: r.displacedNorth,
      south: r.displacedSouth,
    }));

  return (
    <div className={styles.container}>
      <div className={styles.title}>Geographic Impact</div>
      <div className={styles.subtitle}>
        Displaced workforce fraction by region — Global South has smaller digital-cognitive sector
      </div>
      <div className={styles.chart}>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
            <title>Geographic Impact Chart</title>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="year" tick={{ fontSize: 11, fill: "var(--color-text-muted)" }} />
            <YAxis tickFormatter={pct} tick={{ fontSize: 11, fill: "var(--color-text-muted)" }} width={48} />
            <Tooltip
              formatter={(v: number, name: string) => [pct(v), name]}
              contentStyle={{ background: "var(--color-surface-raised)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", fontSize: 12 }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="north" name="Global North" fill="var(--color-chart-1)" radius={[2, 2, 0, 0]} />
            <Bar dataKey="south" name="Global South" fill="var(--color-chart-4)" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
