import styles from "./Footer.module.css";

declare const __BUILD_TIME__: string;

function formatBuildTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
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
