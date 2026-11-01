import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { KeySightDB } from '../../src/data/db';
import { deleteSession, getSettings, listSessions, saveCompletedSession, saveSettings, useDatabase } from '../../src/data/storage';
import { DEFAULT_SETTINGS } from '../../src/core/settings';
import { SessionRecord } from '../../src/core/session';

const record = (over: Partial<SessionRecord> = {}): SessionRecord => ({
  correct: 3, total: 4, percent: 75, mode: 'static', startedAt: 1000, endedAt: 2000, bpm: null,
  clef: 'treble', range: 'C4-B4', accidentals: 'none', labels: 'letters', scaleStart: false, ...over,
});

let n = 0;
beforeEach(() => useDatabase(new KeySightDB(`test-${n++}`)));

describe('storage', () => {
  it('returns defaults, then persists settings', async () => {
    expect(await getSettings()).toEqual(DEFAULT_SETTINGS);
    await saveSettings({ ...DEFAULT_SETTINGS, clef: 'bass', rangeLow: 'C3', rangeHigh: 'B3' });
    expect((await getSettings()).clef).toBe('bass');
  });
  it('saves a completed session with its events and lists newest first', async () => {
    const ev = [{ t: 1, expected: 'C4', pressed: 'C4', correct: true, reactionMs: 400, source: 'touch' as const }];
    const id = await saveCompletedSession(record(), ev);
    await saveCompletedSession(record({ startedAt: 5000, mode: 40, bpm: 40 }), []);
    expect(id).toBeTypeOf('number');
    const all = await listSessions();
    expect(all.map((s) => s.startedAt)).toEqual([5000, 1000]);
    expect(await listSessions({ mode: 40 })).toHaveLength(1);
    expect(await listSessions({ since: 2000 })).toHaveLength(1);
  });
  it('deletes a single session and its events', async () => {
    const ev = [{ t: 1, expected: 'C4', pressed: 'C4', correct: true, reactionMs: 400, source: 'touch' as const }];
    const a = await saveCompletedSession(record({ startedAt: 1000 }), ev);
    await saveCompletedSession(record({ startedAt: 5000 }), ev);
    expect(await deleteSession(a!)).toBe(true);
    expect((await listSessions()).map((x) => x.startedAt)).toEqual([5000]);
  });
});
