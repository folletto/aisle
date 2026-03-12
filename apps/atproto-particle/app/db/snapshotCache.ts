import type {
  AggregatedAuthor,
  NotificationItem,
  ReshareItem,
  TimeWindow,
} from "~/types";

const CACHE_KEY = "atparticle_snapshot_cache";

interface CachedEntry {
  fetchedAt: string;
  authors: AggregatedAuthor[];
  reshares: ReshareItem[];
  notifications: NotificationItem[];
}

type CacheMap = Record<string, CachedEntry>;

function windowKey(w: TimeWindow): string {
  return `${w.start.toISOString()}|${w.end.toISOString()}`;
}

function readAll(): CacheMap {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as CacheMap;
  } catch {
    return {};
  }
}

function writeAll(map: CacheMap): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(map));
  } catch {
    // Storage full — silently ignore
  }
}

export const snapshotCache = {
  get(
    window: TimeWindow
  ): {
    authors: AggregatedAuthor[];
    reshares: ReshareItem[];
    notifications: NotificationItem[];
  } | null {
    const map = readAll();
    const entry = map[windowKey(window)];
    if (!entry) return null;
    return {
      authors: entry.authors,
      reshares: entry.reshares,
      notifications: entry.notifications,
    };
  },

  set(
    window: TimeWindow,
    authors: AggregatedAuthor[],
    reshares: ReshareItem[],
    notifications: NotificationItem[]
  ): void {
    const map = readAll();
    map[windowKey(window)] = {
      fetchedAt: new Date().toISOString(),
      authors,
      reshares,
      notifications,
    };
    writeAll(map);
  },

  /** Remove cache for a specific window. */
  remove(window: TimeWindow): void {
    const map = readAll();
    delete map[windowKey(window)];
    writeAll(map);
  },

  /** Clear all cached windows. */
  clearAll(): void {
    localStorage.removeItem(CACHE_KEY);
  },
};
