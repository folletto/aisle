import { Settings } from "lucide-react";
import { Link } from "react-router";
import { formatInterval, getNextInterval } from "~/engine/timeWindows";
import type { TimeWindow, TimeInterval } from "~/types";
import styles from "./Header.module.css";

interface HeaderProps {
  window?: TimeWindow | null;
  intervals?: TimeInterval[];
}

export default function Header({ window: timeWindow, intervals }: HeaderProps) {
  const windowLabel = timeWindow
    ? `${formatTime(timeWindow.start)} – ${formatTime(timeWindow.end)}`
    : null;

  const next =
    intervals && intervals.length > 0
      ? getNextInterval(intervals)
      : null;

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <Link to="/" className={styles.title}>
          AT Particle
        </Link>
        {windowLabel && (
          <span className={styles.window}>{windowLabel}</span>
        )}
      </div>
      <div className={styles.right}>
        {next && (
          <span className={styles.next}>
            Next: {formatInterval(next.interval)}
          </span>
        )}
        <Link to="/settings" className={styles.settingsLink} aria-label="Settings">
          <Settings size={20} />
        </Link>
      </div>
    </header>
  );
}

function formatTime(date: Date): string {
  const h = date.getHours() % 12 || 12;
  const m = date.getMinutes().toString().padStart(2, "0");
  const ampm = date.getHours() < 12 ? "am" : "pm";
  return `${h}:${m}${ampm}`;
}
