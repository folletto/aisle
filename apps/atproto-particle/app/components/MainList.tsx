import type { AggregatedAuthor, NotificationItem, ReshareItem } from "~/types";
import type { TabId } from "./TabBar";
import AggregatedCard from "./AggregatedCard";
import ReshareCard from "./ReshareCard";
import NotificationCard from "./NotificationCard";
import styles from "./MainList.module.css";

interface MainListProps {
  activeTab: TabId;
  authors: AggregatedAuthor[];
  reshares: ReshareItem[];
  notifications: NotificationItem[];
  isLoading: boolean;
  progress?: string | null;
  loadDurationMs?: number;
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function ListFooter({ count, label, durationMs }: { count: number; label: string; durationMs: number }) {
  if (count === 0) return null;
  return (
    <div className={styles.footer}>
      <span>{count} {label}</span>
      {durationMs > 0 && <span>Loaded in {formatDuration(durationMs)}</span>}
    </div>
  );
}

export default function MainList({
  activeTab,
  authors,
  reshares,
  notifications,
  isLoading,
  progress,
  loadDurationMs = 0,
}: MainListProps) {
  if (isLoading) {
    return (
      <div className={styles.status}>
        <p>Loading timeline...</p>
        {progress && <p className={styles.progress}>{progress}</p>}
      </div>
    );
  }

  if (activeTab === "snapshot") {
    if (authors.length === 0) {
      return (
        <div className={styles.status}>
          <p>No posts in this time window.</p>
        </div>
      );
    }
    return (
      <div className={styles.list}>
        {authors.map((author) => (
          <AggregatedCard key={author.did} author={author} />
        ))}
        <ListFooter
          count={authors.length}
          label={authors.length === 1 ? "author" : "authors"}
          durationMs={loadDurationMs}
        />
      </div>
    );
  }

  if (activeTab === "reshares") {
    if (reshares.length === 0) {
      return (
        <div className={styles.status}>
          <p>No reshares in this time window.</p>
        </div>
      );
    }
    return (
      <div className={styles.list}>
        {reshares.map((item, i) => (
          <ReshareCard key={`${item.post.uri}-${item.resharedBy.did}-${i}`} item={item} />
        ))}
        <ListFooter
          count={reshares.length}
          label={reshares.length === 1 ? "reshare" : "reshares"}
          durationMs={loadDurationMs}
        />
      </div>
    );
  }

  // notifications
  if (notifications.length === 0) {
    return (
      <div className={styles.status}>
        <p>No notifications in this time window.</p>
      </div>
    );
  }
  return (
    <div className={styles.list}>
      {notifications.map((item, i) => (
        <NotificationCard key={`${item.uri}-${i}`} item={item} />
      ))}
      <ListFooter
        count={notifications.length}
        label={notifications.length === 1 ? "notification" : "notifications"}
        durationMs={loadDurationMs}
      />
    </div>
  );
}
