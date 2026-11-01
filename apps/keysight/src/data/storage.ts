// The only module the app uses to reach IndexedDB.
import { DEFAULT_SETTINGS, Settings, normaliseSettings } from '../core/settings';
import { EventRecord, SessionRecord } from '../core/session';
import { EventRow, KeySightDB, SessionRow } from './db';

let db = new KeySightDB();

/** Test hook: use another database instance. */
export function useDatabase(instance: KeySightDB): void {
  db = instance;
}

export async function getSettings(): Promise<Settings> {
  try {
    const row = await db.settings.get('settings');
    if (!row) return { ...DEFAULT_SETTINGS };
    const { id: _id, ...rest } = row;
    return normaliseSettings(rest);
  } catch (err) {
    console.warn('Could not read settings', err);
    return { ...DEFAULT_SETTINGS };
  }
}

export async function saveSettings(s: Settings): Promise<void> {
  try {
    await db.settings.put({ ...s, id: 'settings' });
  } catch (err) {
    console.warn('Could not save settings', err);
  }
}

/** Writes the session and all its events in one transaction. Returns the session id. */
export async function saveCompletedSession(session: SessionRecord, events: EventRecord[]): Promise<number | null> {
  try {
    return await db.transaction('rw', db.sessions, db.events, async () => {
      const id = await db.sessions.add({ ...session });
      const rows: EventRow[] = events.map((e) => ({ ...e, sessionId: id }));
      await db.events.bulkAdd(rows);
      return id;
    });
  } catch (err) {
    console.warn('Could not save session', err);
    return null;
  }
}

export interface SessionFilter {
  mode?: 'static' | number;
  since?: number;
}

export async function listSessions(filter: SessionFilter = {}): Promise<SessionRow[]> {
  const all = await db.sessions.orderBy('startedAt').reverse().toArray();
  return all.filter((s) => (filter.mode === undefined || s.mode === filter.mode) && (filter.since === undefined || s.startedAt >= filter.since));
}

/** Ask the browser not to evict our data (helps on iOS). */
export async function requestPersistence(): Promise<void> {
  try {
    await navigator.storage?.persist?.();
  } catch {
    /* not supported */
  }
}
