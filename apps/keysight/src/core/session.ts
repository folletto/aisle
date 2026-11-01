// Session engine: drives a training session through the ScoreLike API.
// Pure logic. Time is injected (tick(now)), so tests use a fake clock.
//
// Scoring rule (assumption, see spec open question 1): a target counts as correct only if it is
// answered correctly with no wrong press before it. Wrong presses are logged, never subtracted.
import { Note, noteName } from './notes';
import { Settings } from './settings';
import { buildPool, createRng, pickNote, whiteNotesBetween } from './pool';
import { parseNote } from './notes';
import { KeyPress } from '../input/types';

export interface JudgeResult {
  correct: boolean;
  expected: Note | null;
  pressed: Note;
}

/** What the engine needs from the score component (ks-score implements it). */
export interface ScoreLike {
  clear(): void;
  showNote(note: Note): void;
  enqueue(notes: Note[], opts: { bpm: number }): void;
  judge(pressed: Note): JudgeResult;
  start(): void;
  stop(): void;
  /** Show the current streak under the clef (null hides it). Optional: not every score has one. */
  setStreak?(n: number | null): void;
}

export interface EventRecord {
  t: number; // ms since session start
  expected: string;
  pressed: string | null; // null = note reached the clef unplayed
  correct: boolean;
  reactionMs: number;
  source: 'touch' | 'keyboard' | null;
}

export interface SessionResult {
  correct: number;
  total: number;
  percent: number;
  mode: 'static' | number;
}

export interface SessionRecord extends SessionResult {
  startedAt: number;
  endedAt: number;
  bpm: number | null;
  clef: string;
  range: string;
  accidentals: string;
  labels: string;
  scaleStart: boolean;
  /** Longest run of notes hit with no mistake. Missing on sessions saved before this was tracked. */
  bestStreak?: number;
}

interface Target {
  note: Note;
  since: number;
  wrong: boolean;
}

export type SessionState = 'idle' | 'running' | 'finished' | 'stopped';

export class SessionEngine {
  state: SessionState = 'idle';
  events: EventRecord[] = [];
  onFinish?: (result: SessionResult) => void;

  private pending: Target[] = [];
  private queued: Note[];
  private pool: Note[];
  private rng: () => number;
  private prev: Note | null = null;
  private startAt = 0;
  private endAt = 0;
  private nextSpawn = 0;
  private correct = 0;
  /** Notes hit in a row with no mistake. */
  streak = 0;
  /** Longest streak so far in this session. */
  bestStreak = 0;
  private total = 0;
  private startedAtWall = 0;
  private endedAtWall = 0;

  constructor(
    private settings: Settings,
    private score: ScoreLike,
    rng?: () => number,
  ) {
    const low = parseNote(settings.rangeLow);
    const high = parseNote(settings.rangeHigh);
    this.pool = buildPool(low, high, settings.accidentals);
    // Scale start: naturals only, ascending, always first.
    this.queued = settings.scaleStart ? whiteNotesBetween(low, high) : [];
    this.rng = rng ?? createRng(Date.now());
  }

  get bpm(): number | null {
    return this.settings.speed === 'static' ? null : this.settings.speed;
  }

  start(now: number, wallClock = Date.now()): void {
    this.state = 'running';
    this.startAt = now;
    this.endAt = now + this.settings.lengthMin * 60_000;
    this.nextSpawn = now;
    this.startedAtWall = wallClock;
    this.streak = 0;
    this.bestStreak = 0;
    this.score.clear();
    this.score.setStreak?.(0);
    this.score.start();
    if (this.bpm === null) this.showNext(now);
    else this.tick(now);
  }

  remainingMs(now: number): number {
    return Math.max(0, this.endAt - now);
  }

  tick(now: number): void {
    if (this.state !== 'running') return;
    if (now >= this.endAt) return this.finish(now);
    const bpm = this.bpm;
    if (bpm === null) return;
    const interval = 60_000 / bpm;
    while (now >= this.nextSpawn && this.nextSpawn < this.endAt) {
      const note = this.nextNote();
      this.pending.push({ note, since: this.nextSpawn, wrong: false });
      this.score.enqueue([note], { bpm });
      this.nextSpawn += interval;
    }
  }

  press(kp: KeyPress, now: number): void {
    if (this.state !== 'running') return;
    const result = this.score.judge(kp.note);
    const target = this.pending[0];
    if (!result.expected || !target) return;
    this.events.push({
      t: now - this.startAt,
      expected: noteName(result.expected),
      pressed: noteName(kp.note),
      correct: result.correct,
      reactionMs: Math.round(now - target.since),
      source: kp.source,
    });
    if (!result.correct) {
      target.wrong = true;
      this.setStreak(0);
      return;
    }
    this.total++;
    if (!target.wrong) {
      this.correct++;
      this.setStreak(this.streak + 1);
    }
    this.pending.shift();
    if (this.bpm === null) this.showNext(now);
  }

  /** Timed mode: the leftmost note reached the clef unplayed. */
  noteMissed(now: number): void {
    if (this.state !== 'running') return;
    const target = this.pending.shift();
    if (!target) return;
    this.total++;
    this.setStreak(0);
    this.events.push({
      t: now - this.startAt,
      expected: noteName(target.note),
      pressed: null,
      correct: false,
      reactionMs: Math.round(now - target.since),
      source: null,
    });
  }

  /** Abort: nothing is kept. */
  stop(): void {
    if (this.state !== 'running') return;
    this.state = 'stopped';
    this.score.stop();
    this.score.clear();
    this.score.setStreak?.(null);
  }

  result(): SessionResult {
    return {
      correct: this.correct,
      total: this.total,
      percent: this.total ? Math.round((this.correct / this.total) * 100) : 0,
      mode: this.bpm ?? 'static',
    };
  }

  record(): SessionRecord {
    const s = this.settings;
    return {
      ...this.result(),
      startedAt: this.startedAtWall,
      endedAt: this.endedAtWall,
      bpm: this.bpm,
      clef: s.clef,
      range: `${s.rangeLow}-${s.rangeHigh}`,
      accidentals: s.accidentals,
      labels: s.showLabels === 'note' || s.showLabels === 'both' ? s.labels : 'none',
      scaleStart: s.scaleStart,
      bestStreak: this.bestStreak,
    };
  }

  private finish(now: number): void {
    this.state = 'finished';
    this.endedAtWall = this.startedAtWall + (now - this.startAt);
    this.score.stop();
    this.score.clear();
    this.score.setStreak?.(null);
    this.onFinish?.(this.result());
  }

  private setStreak(n: number): void {
    this.streak = n;
    this.bestStreak = Math.max(this.bestStreak, n);
    this.score.setStreak?.(n);
  }

  private nextNote(): Note {
    const note = this.queued.length ? this.queued.shift()! : pickNote(this.pool, this.prev, this.rng);
    this.prev = note;
    return note;
  }

  private showNext(now: number): void {
    const note = this.nextNote();
    this.pending = [{ note, since: now, wrong: false }];
    this.score.showNote(note);
  }
}

