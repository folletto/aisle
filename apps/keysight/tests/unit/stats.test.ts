import { describe, expect, it } from 'vitest';
import { computeStats } from '../../src/core/stats';
import { SessionRecord } from '../../src/core/session';

const day = (d: number, h = 12) => new Date(2026, 0, d, h).getTime(); // local time
const s = (startedAt: number, correct: number, total: number): SessionRecord => ({
  correct, total, percent: Math.round((correct / total) * 100), mode: 'static', startedAt, endedAt: startedAt + 1,
  bpm: null, clef: 'treble', range: 'C4-B4', accidentals: 'none', labels: 'letters', scaleStart: false,
});

describe('computeStats', () => {
  it('handles no sessions', () => {
    expect(computeStats([])).toEqual({ last7: null, last30: null, latest: [], longestStreak: null });
  });
  it('anchors the windows on the last session, not today', () => {
    // last session is on 20 Jan (months before "now"); 14 Jan is 6 days earlier (in), 13 Jan is 7 days earlier (out)
    const list = [s(day(20), 8, 10), s(day(14), 6, 10), s(day(13), 0, 10), s(day(1), 10, 10)];
    const st = computeStats(list);
    expect(st.last7).toMatchObject({ sessions: 2, correct: 14, total: 20, percent: 70 });
    expect(st.last30).toMatchObject({ sessions: 4, percent: 60 });
  });
  it('30 days excludes older sessions', () => {
    const st = computeStats([s(day(31), 10, 10), s(day(2), 0, 10), s(day(1), 0, 10)]);
    expect(st.last30?.sessions).toBe(2); // 2 Jan is 29 days before 31 Jan, 1 Jan is 30
  });
  it('returns the 5 latest, newest first', () => {
    const list = Array.from({ length: 8 }, (_, i) => s(day(i + 1), i, 10));
    expect(computeStats(list).latest.map((x) => x.correct)).toEqual([7, 6, 5, 4, 3]);
  });
  it('reports the longest streak ever, ignoring sessions that did not record one', () => {
    const list = [{ ...s(day(3), 5, 10), bestStreak: 4 }, { ...s(day(2), 5, 10), bestStreak: 9 }, s(day(1), 5, 10)];
    expect(computeStats(list).longestStreak).toBe(9);
    expect(computeStats([s(day(1), 5, 10)]).longestStreak).toBeNull();
  });
});
