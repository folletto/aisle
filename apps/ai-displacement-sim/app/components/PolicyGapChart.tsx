import {
  AreaChart,
  Area,
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

const pct = (v: number) => `${(v * 100).toFixed(1)}%`;

export function PolicyGapChart({ data, compareData }: Props) {
  const chartData = data.map((r) => ({
    year: r.year,
    disruption: r.disruptionIndex,
    policy: r.policyEffectivenessLevel,
    comparePolicy: compareData?.find((c) => c.year === r.year)?.policyEffectivenessLevel,
  }));

  return (
    <div className={styles.container}>
      <div className={styles.title}>Policy Effectiveness Gap</div>
      <div className={styles.subtitle}>
        Disruption level vs. policy response capacity — the gap is the democratic speed problem
      </div>
      <div className={styles.chart}>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
            <title>Policy Gap Chart</title>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="year" tick={{ fontSize: 11, fill: "var(--color-text-muted)" }} />
            <YAxis tickFormatter={pct} tick={{ fontSize: 11, fill: "var(--color-text-muted)" }} width={48} />
            <Tooltip
              formatter={(v: number, name: string) => [pct(v), name]}
              contentStyle={{ background: "var(--color-surface-raised)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", fontSize: 12 }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Area type="monotone" dataKey="disruption" name="Disruption level" stroke="var(--color-danger-light)" fill="var(--color-danger-light)" fillOpacity={0.3} />
            <Area type="monotone" dataKey="policy" name="Policy response" stroke="var(--color-chart-5)" fill="var(--color-chart-5)" fillOpacity={0.3} />
            {compareData && (
              <Area type="monotone" dataKey="comparePolicy" name="Compare: policy" stroke="var(--color-realistic)" fill="none" strokeDasharray="5 3" />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
