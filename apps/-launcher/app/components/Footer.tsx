import styles from "./Footer.module.css";

declare const __BUILD_TIME__: string;

function formatBuildTime(iso: string): string {
  const d = new Date(iso);
  const year = d.getFullYear();
  const month = d.toLocaleString("en-US", { month: "short" });
  const day = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${year} ${month} ${day} at ${hh}:${mm}`;
}

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <span className={styles.buildTime}>
        Last build: {formatBuildTime(__BUILD_TIME__)}
      </span>
    </footer>
  );
}
