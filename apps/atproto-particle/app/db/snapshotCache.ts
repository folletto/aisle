import type {
  AggregatedAuthor,
  NotificationItem,
  ReshareItem,
  TimeWindow,
} from "~/types";

const CACHE_KEY = "atparticle_snapshot_cache";

interface CachedSnapshot {
  windowStart: string;
  windowEnd: string;
  fetchedAt: string;
  authors: AggregatedAuthor[];
  reshares: ReshareItem[];
  notifications: NotificationItem[];
}

function windowKey(w: TimeWindow): string {
  return `${w.start.toISOString()}|${w.end.toISOString()}`;
}

export const snapshotCache = {
  get(
    window: TimeWindow
  ): {
    authors: AggregatedAuthor[];
    reshares: ReshareItem[];
    notifications: NotificationItem[];
  } | null {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const cached: CachedSnapshot = JSON.parse(raw);
      const key = windowKey(window);
      const cachedKey = `${cached.windowStart}|${cached.windowEnd}`;
      if (key !== cachedKey) return null;
      return {
        authors: cached.authors,
        reshares: cached.reshares,
        notifications: cached.notifications,
      };
    } catch {
      return null;
    }
  },

  set(
    window: TimeWindow,
    authors: AggregatedAuthor[],
    reshares: ReshareItem[],
    notifications: NotificationItem[]
  ): void {
    const cached: CachedSnapshot = {
      windowStart: window.start.toISOString(),
      windowEnd: window.end.toISOString(),
      fetchedAt: new Date().toISOString(),
      authors,
      reshares,
      notifications,
    };
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(cached));
    } catch {
      // Storage full — silently ignore
    }
  },

  clear(): void {
    localStorage.removeItem(CACHE_KEY);
  },
};
