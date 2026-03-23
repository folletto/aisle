import { FolderOpen, LogIn } from "lucide-react";
import styles from "./LoginPrompt.module.css";

interface LoginPromptProps {
  providerName: string;
  folderId: string;
  onLogin(): void;
  isLoading: boolean;
  error: string | null;
}

export default function LoginPrompt({
  providerName,
  folderId,
  onLogin,
  isLoading,
  error,
}: LoginPromptProps) {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.iconWrap}>
          <FolderOpen size={32} className={styles.icon} />
        </div>
        <h1 className={styles.title}>Sign in to access this folder</h1>
        <p className={styles.subtitle}>
          Sign in with {providerName} to browse the folder{" "}
          <span className={styles.folderId}>{folderId}</span>.
        </p>

        {error && <p className={styles.error}>{error}</p>}

        <button
          className={styles.signInBtn}
          onClick={onLogin}
          disabled={isLoading}
        >
          <LogIn size={18} />
          {isLoading ? "Signing in…" : `Sign in with ${providerName}`}
        </button>

        <a href="/open" className={styles.backLink}>
          Use a different folder
        </a>
      </div>
    </div>
  );
}
