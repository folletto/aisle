import { useState } from "react";
import { FolderOpen } from "lucide-react";
import styles from "./UrlEntry.module.css";

interface UrlEntryProps {
  onSubmit(url: string): void;
  error: { supportedSources: string[] } | null;
}

export default function UrlEntry({ onSubmit, error }: UrlEntryProps) {
  const [url, setUrl] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (url.trim()) onSubmit(url.trim());
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logoWrap}>
          <FolderOpen size={36} className={styles.logoIcon} />
        </div>
        <h1 className={styles.title}>Monoprism</h1>
        <p className={styles.subtitle}>Enter the URL of a cloud storage folder to get started.</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            type="url"
            className={styles.input}
            placeholder="https://drive.google.com/drive/folders/…"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            autoFocus
            required
          />
          <button type="submit" className={styles.btn}>
            Open folder
          </button>
        </form>

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
