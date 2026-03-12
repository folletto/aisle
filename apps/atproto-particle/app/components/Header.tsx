import { ChevronLeft, ChevronRight, MessageSquareQuote, RefreshCw, Settings } from "lucide-react";
import { Link } from "react-router";
import { formatInterval, getNextInterval } from "~/engine/timeWindows";
import type { TimeWindow, TimeInterval } from "~/types";
import styles from "./Header.module.css";

interface HeaderProps {
  window?: TimeWindow | null;
  intervals?: TimeInterval[];
  onRefresh?: () => void;
  onPrev?: (() => void) | null;
  onNext?: (() => void) | null;
  isLoading?: boolean;
}

export default function Header({
  window: timeWindow,
  intervals,
  onRefresh,
  onPrev,
  onNext,
  isLoading,
}: HeaderProps) {
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
          <MessageSquareQuote size={20} />
          Particle
        </Link>
        {windowLabel && (
          <span className={styles.window}>
            {onPrev && (
              <button
                onClick={onPrev}
                className={styles.chevronBtn}
                aria-label="Previous window"
                disabled={isLoading}
              >
                <ChevronLeft size={16} />
              </button>
            )}
            {windowLabel}
            {onNext && (
              <button
                onClick={onNext}
                className={styles.chevronBtn}
                aria-label="Next window"
                disabled={isLoading}
              >
                <ChevronRight size={16} />
              </button>
            )}
            {onRefresh && (
              <button
                onClick={onRefresh}
                className={`${styles.refreshBtn} ${isLoading ? styles.spinning : ""}`}
                aria-label="Refresh"
                disabled={isLoading}
              >
                <RefreshCw size={13} />
              </button>
            )}
          </span>
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
