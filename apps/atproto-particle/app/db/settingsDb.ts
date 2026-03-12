import { DEFAULT_INTERVALS } from "~/types";
import type { TimeInterval, UserSettings } from "~/types";

const STORAGE_KEY = "atparticle_settings";
const SESSION_KEY = "atparticle_session";

export interface StoredSession {
  did: string;
  handle: string;
  accessJwt: string;
  refreshJwt: string;
  service: string;
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export const settingsDb = {
  getSettings(): UserSettings {
    return read<UserSettings>(STORAGE_KEY, {
      intervals: DEFAULT_INTERVALS,
    });
  },

  saveSettings(settings: UserSettings): void {
    write(STORAGE_KEY, settings);
  },

  getIntervals(): TimeInterval[] {
    return this.getSettings().intervals;
  },

  saveIntervals(intervals: TimeInterval[]): void {
    const settings = this.getSettings();
    settings.intervals = intervals;
    this.saveSettings(settings);
  },

  getSession(): StoredSession | null {
    return read<StoredSession | null>(SESSION_KEY, null);
  },

  saveSession(session: StoredSession): void {
    write(SESSION_KEY, session);
  },

  clearSession(): void {
    localStorage.removeItem(SESSION_KEY);
  },
};
