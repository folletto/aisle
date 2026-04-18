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

const dec = (v: number) => v.toFixed(3);

export function GainsDistributionChart({ data }: Props) {
  const chartData = data
    .filter((_, i) => i % 4 === 0 || i === data.length - 1)
    .map((r) => ({
      year: r.year,
      shareholder: r.gainsShareShareholder,
      worker: r.gainsShareWorker,
      consumer: r.gainsShareConsumer,
      public: r.gainsSharePublic,
    }));

  return (
    <div className={styles.container}>
      <div className={styles.title}>Productivity Gains Distribution</div>
      <div className={styles.subtitle}>
        Who captures AI productivity gains each year
      </div>
      <div className={styles.chart}>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
            <title>Gains Distribution Chart</title>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="year" tick={{ fontSize: 11, fill: "var(--color-text-muted)" }} />
            <YAxis tickFormatter={dec} tick={{ fontSize: 11, fill: "var(--color-text-muted)" }} width={40} />
            <Tooltip
              contentStyle={{ background: "var(--color-surface-raised)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", fontSize: 12 }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="shareholder" name="Shareholders" stackId="a" fill="var(--color-chart-2)" />
            <Bar dataKey="worker" name="Workers" stackId="a" fill="var(--color-chart-5)" />
            <Bar dataKey="consumer" name="Consumers" stackId="a" fill="var(--color-chart-4)" />
            <Bar dataKey="public" name="Public revenue" stackId="a" fill="var(--color-chart-3)" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
