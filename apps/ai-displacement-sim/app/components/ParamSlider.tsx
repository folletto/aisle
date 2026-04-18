import styles from "./ParamSlider.module.css";
import type { SimParams } from "~/lib/simulation/types";
import { useSimulation } from "~/context/SimulationContext";

interface Props {
  paramKey: keyof SimParams;
  label: string;
  min: number;
  max: number;
  step: number;
  format?: (v: number) => string;
}

const defaultFormat = (v: number) => v.toFixed(2);

export function ParamSlider({ paramKey, label, min, max, step, format = defaultFormat }: Props) {
  const { params, setParam } = useSimulation();
  const value = params[paramKey] as number;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <label htmlFor={`slider-${paramKey}`} className={styles.labelText}>
          {label}
        </label>
        <span className={styles.value} aria-live="polite">
          {format(value)}
        </span>
      </div>
      <input
        id={`slider-${paramKey}`}
        type="range"
        className={styles.slider}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => setParam(paramKey, parseFloat(e.target.value))}
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={format(value)}
      />
      <div className={styles.range}>
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </div>
  );
}
