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

export function DisplacementChart({ data, compareData }: Props) {
  const chartData = data.map((r) => ({
    year: r.year,
    digital: r.displacedDigital,
    partial: r.displacedPartial,
    physRoutine: r.displacedPhysicalRoutine,
    physSkilled: r.displacedPhysicalSkilled,
    compareNet: compareData?.find((c) => c.year === r.year)?.netDisplaced,
  }));

  return (
    <div className={styles.container}>
      <div className={styles.title}>Labour Displacement</div>
      <div className={styles.subtitle}>
        Fraction of workforce displaced per year by category
      </div>
      <div className={styles.chart}>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
            <title>Labour Displacement Chart</title>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="year" tick={{ fontSize: 11, fill: "var(--color-text-muted)" }} />
            <YAxis tickFormatter={pct} tick={{ fontSize: 11, fill: "var(--color-text-muted)" }} width={48} />
            <Tooltip
              formatter={(v: number, name: string) => [pct(v), name]}
              contentStyle={{ background: "var(--color-surface-raised)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", fontSize: 12 }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Area type="monotone" dataKey="digital" name="Digital-cognitive" stackId="1" stroke="var(--color-chart-1)" fill="var(--color-chart-1)" fillOpacity={0.6} />
            <Area type="monotone" dataKey="partial" name="Partial-digital" stackId="1" stroke="var(--color-chart-2)" fill="var(--color-chart-2)" fillOpacity={0.6} />
            <Area type="monotone" dataKey="physRoutine" name="Physical routine" stackId="1" stroke="var(--color-chart-3)" fill="var(--color-chart-3)" fillOpacity={0.6} />
            <Area type="monotone" dataKey="physSkilled" name="Physical skilled" stackId="1" stroke="var(--color-chart-4)" fill="var(--color-chart-4)" fillOpacity={0.6} />
            {compareData && (
              <Area type="monotone" dataKey="compareNet" name="Compare: net displaced" stackId="2" stroke="var(--color-realistic)" fill="var(--color-realistic)" fillOpacity={0.15} strokeDasharray="5 3" />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
