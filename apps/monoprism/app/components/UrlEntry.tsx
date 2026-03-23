import { useState } from "react";
import type { UserInfo } from "~/providers/types";
import styles from "./UrlEntry.module.css";

interface UrlEntryProps {
  onSubmit(url: string): void;
  error: { supportedSources: string[] } | null;
  user: UserInfo | null;
  onLogout(): void;
}

export default function UrlEntry({ onSubmit, error, user, onLogout }: UrlEntryProps) {
  const [url, setUrl] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (url.trim()) onSubmit(url.trim());
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const pasted = e.clipboardData.getData("text").trim();
    if (pasted) onSubmit(pasted);
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Monoprism</h1>
        <p className={styles.subtitle}>Paste the URL of a Google Drive folder you want to open</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            type="url"
            className={styles.input}
            placeholder="https://drive.google.com/drive/folders/…"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onPaste={handlePaste}
            autoFocus
            required
          />
          <button type="submit" className={styles.btn}>
            Open folder
          </button>
        </form>

        {user && (
          <div className={styles.userRow}>
            <span className={styles.userName}>{user.name}</span>
            <button className={styles.logoutBtn} onClick={onLogout}>log out</button>
          </div>
        )}

        {error && (
          <div className={styles.errorBox}>
            <p className={styles.errorTitle}>Unsupported URL</p>
            <p className={styles.errorText}>
              Monoprism currently supports:
            </p>
            <ul className={styles.sourceList}>
              {error.supportedSources.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
