// Dexie database "keysight". Schema is versioned from day one.
import Dexie, { Table } from 'dexie';
import { Settings } from '../core/settings';
import { EventRecord, SessionRecord } from '../core/session';

export interface SettingsRow extends Settings {
  id: 'settings';
}
export type SessionRow = SessionRecord & { id?: number };
export type EventRow = EventRecord & { id?: number; sessionId: number };

export class KeySightDB extends Dexie {
  settings!: Table<SettingsRow, string>;
  sessions!: Table<SessionRow, number>;
  events!: Table<EventRow, number>;

  constructor(name = 'keysight') {
    super(name);
    this.version(1).stores({
      settings: 'id',
      sessions: '++id, startedAt, mode',
      events: '++id, sessionId',
    });
    // Future schema changes: add this.version(2).stores({...}).upgrade(...) here.
  }
}
