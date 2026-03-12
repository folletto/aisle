import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Bug, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router";
import { useAuth } from "~/context/AuthContext";
import Button from "~/components/Button";
import Layout from "~/components/Layout";
import { settingsDb } from "~/db/settingsDb";
import { formatInterval, sortIntervals } from "~/engine/timeWindows";
import type { TimeInterval } from "~/types";
import styles from "./settings.module.css";

export default function SettingsRoute() {
  const { session, logout } = useAuth();
  const navigate = useNavigate();
  const [intervals, setIntervals] = useState<TimeInterval[]>(() =>
    sortIntervals(settingsDb.getIntervals())
  );
  const [newHour, setNewHour] = useState("12");
  const [newMinute, setNewMinute] = useState("00");

  useEffect(() => {
    if (!session) {
      navigate("/login", { replace: true });
    }
  }, [session, navigate]);

  const save = useCallback(
    (updated: TimeInterval[]) => {
      const sorted = sortIntervals(updated);
      setIntervals(sorted);
      settingsDb.saveIntervals(sorted);
    },
    []
  );

  function addInterval() {
    const hour = parseInt(newHour, 10);
    const minute = parseInt(newMinute, 10);
    if (isNaN(hour) || isNaN(minute)) return;

    // Check for duplicates
    const exists = intervals.some(
      (i) => i.hour === hour && i.minute === minute
    );
    if (exists) return;

    save([...intervals, { hour, minute }]);
  }

  function removeInterval(index: number) {
    if (intervals.length <= 1) return;
    save(intervals.filter((_, i) => i !== index));
  }

  function handleLogout() {
    logout();
    navigate("/logged-out", { replace: true });
  }

  if (!session) return null;

  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.topBar}>
          <Link to="/" className={styles.backLink}>
            <ArrowLeft size={18} />
            Back
          </Link>
        </div>

        <h1 className={styles.heading}>Settings</h1>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Time Intervals</h2>
          <p className={styles.sectionDesc}>
            Define moments during the day when snapshots are taken.
          </p>

          <ul className={styles.intervalList}>
            {intervals.map((interval, idx) => (
              <li key={`${interval.hour}-${interval.minute}`} className={styles.intervalItem}>
                <span className={styles.intervalLabel}>
                  {formatInterval(interval)}
                </span>
                <button
                  onClick={() => removeInterval(idx)}
                  className={styles.removeBtn}
                  disabled={intervals.length <= 1}
                  aria-label="Remove interval"
                >
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>

          <div className={styles.addRow}>
            <select
              value={newHour}
              onChange={(e) => setNewHour(e.target.value)}
              className={styles.select}
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>
                  {i.toString().padStart(2, "0")}
                </option>
              ))}
            </select>
            <span className={styles.colon}>:</span>
            <select
              value={newMinute}
              onChange={(e) => setNewMinute(e.target.value)}
              className={styles.select}
            >
              {["00", "15", "30", "45"].map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <Button variant="secondary" onClick={addInterval}>
              <Plus size={16} />
              Add
            </Button>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Account</h2>
          <p className={styles.sectionDesc}>
            Signed in as <strong>@{session.handle}</strong>
          </p>
          <Button variant="danger" onClick={handleLogout}>
            Sign Out
          </Button>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Debug</h2>
          <p className={styles.sectionDesc}>
            View raw data and generate a report for troubleshooting.
          </p>
          <Link to="/debug" className={styles.debugLink}>
            <Bug size={16} />
            Debug Report
          </Link>
        </section>
      </div>
    </Layout>
  );
}
