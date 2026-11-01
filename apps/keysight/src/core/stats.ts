// Stats from completed sessions. Pure logic.
// "Last N days" is anchored on the day of the most recent session, not on today,
// so a break from practice doesn't empty the stats.
import { SessionRecord } from './session';

export interface Average {
  percent: number; // pooled: all correct / all notes in the window
  sessions: number;
  correct: number;
  total: number;
}

export interface Stats<T extends SessionRecord = SessionRecord> {
  last7: Average | null;
  last30: Average | null;
  latest: T[]; // newest first, at most 5
}

const DAY = 86_400_000;

function startOfDay(ms: number): number {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function average(list: SessionRecord[]): Average | null {
  const total = list.reduce((a, s) => a + s.total, 0);
  if (!list.length || !total) return null;
  const correct = list.reduce((a, s) => a + s.correct, 0);
  return { percent: Math.round((correct / total) * 100), sessions: list.length, correct, total };
}

/** `sessions` in any order. Window = the last `days` calendar days up to and including the latest session's day. */
export function computeStats<T extends SessionRecord>(sessions: T[]): Stats<T> {
  const sorted = [...sessions].sort((a, b) => b.startedAt - a.startedAt);
  if (!sorted.length) return { last7: null, last30: null, latest: [] };
  const anchorDay = startOfDay(sorted[0].startedAt);
  const within = (days: number) => sorted.filter((s) => startOfDay(s.startedAt) > anchorDay - days * DAY + DAY / 2);
  return { last7: average(within(7)), last30: average(within(30)), latest: sorted.slice(0, 5) };
}
