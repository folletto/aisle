import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <p>
        Built with{" "}
        <a
          href="https://claude.ai/code"
          target="_blank"
          rel="noopener noreferrer"
        >
          Claude Code
        </a>{" "}
        &middot;{" "}
        <a
          href="https://github.com/folletto/aisle"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
      </p>
    </footer>
  );
}
