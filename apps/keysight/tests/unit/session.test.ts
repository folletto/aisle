import { describe, expect, it } from 'vitest';
import { Note, midiOf, noteFromMidi, noteName, parseNote } from '../../src/core/notes';
import { JudgeResult, ScoreLike, SessionEngine } from '../../src/core/session';
import { DEFAULT_SETTINGS, Settings } from '../../src/core/settings';
import { createRng } from '../../src/core/pool';
import { KeyPress } from '../../src/input/types';

/** Fake score that mimics ks-score's target rules. */
class FakeScore implements ScoreLike {
  streaks: Array<number | null> = [];
  setStreak(n: number | null) { this.streaks.push(n); }
  shown: Note | null = null;
  queue: Note[] = [];
  calls: string[] = [];
  clear() { this.calls.push('clear'); this.shown = null; this.queue = []; }
  showNote(n: Note) { this.shown = n; }
  enqueue(ns: Note[]) { this.queue.push(...ns); }
  start() { this.calls.push('start'); }
  stop() { this.calls.push('stop'); }
  target() { return this.shown ?? this.queue[0] ?? null; }
  judge(pressed: Note): JudgeResult {
    const t = this.target();
    if (!t) return { correct: false, expected: null, pressed };
    const correct = midiOf(t) === midiOf(pressed);
    if (correct) { if (this.shown) this.shown = null; else this.queue.shift(); }
    return { correct, expected: t, pressed };
  }
}
const press = (n: Note): KeyPress => ({ note: n, midi: midiOf(n), source: 'keyboard', timestamp: 0 });
const settings = (s: Partial<Settings>): Settings => ({ ...DEFAULT_SETTINGS, scaleStart: false, ...s });
const wrongNote = (t: Note) => noteFromMidi(midiOf(t) === 71 ? 60 : 71);

describe('static session', () => {
  it('scores first-try answers and logs wrong presses without lowering the target count', () => {
    const score = new FakeScore();
    const e = new SessionEngine(settings({}), score, createRng(3));
    e.start(0);
    // 1st target: right immediately
    e.press(press(score.shown!), 100);
    // 2nd target: wrong then right
    const second = score.shown!;
    e.press(press(wrongNote(second)), 200);
    expect(score.shown).toBe(second); // target stays
    e.press(press(second), 300);
    expect(e.result()).toMatchObject({ correct: 1, total: 2, percent: 50, mode: 'static' });
    expect(e.events.map((x) => x.correct)).toEqual([true, false, true]);
    expect(e.events[2].reactionMs).toBe(300 - 100);
  });
  it('finishes after the length, clears the score and reports', () => {
    const score = new FakeScore();
    const e = new SessionEngine(settings({ lengthMin: 1 }), score, createRng(1));
    let done = false;
    e.onFinish = () => (done = true);
    e.start(0);
    e.tick(59_999);
    expect(e.state).toBe('running');
    e.tick(60_000);
    expect(e.state).toBe('finished');
    expect(done).toBe(true);
    expect(score.calls.at(-1)).toBe('clear');
  });
  it('stop discards: no result callback, state stopped, ignores presses', () => {
    const score = new FakeScore();
    const e = new SessionEngine(settings({}), score, createRng(1));
    let done = false;
    e.onFinish = () => (done = true);
    e.start(0);
    e.stop();
    e.press(press(parseNote('C4')), 10);
    e.tick(10_000_000);
    expect(done).toBe(false);
    expect(e.state).toBe('stopped');
    expect(e.events).toHaveLength(0);
  });
  it('scale start opens with the ascending naturals and counts', () => {
    const score = new FakeScore();
    const e = new SessionEngine(settings({ scaleStart: true, accidentals: 'both' }), score, createRng(1));
    e.start(0);
    const seen: string[] = [];
    for (let i = 0; i < 7; i++) {
      seen.push(noteName(score.shown!));
      e.press(press(score.shown!), i * 10);
    }
    expect(seen).toEqual(['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4']);
    expect(e.result().total).toBe(7);
  });
  it('the opening scale does not count towards the streak', () => {
    const score = new FakeScore();
    const e = new SessionEngine(settings({ scaleStart: true }), score, createRng(1));
    e.start(0);
    for (let i = 0; i < 7; i++) e.press(press(score.shown!), i * 10); // the scale
    expect(e.streak).toBe(0);
    expect(e.bestStreak).toBe(0);
    e.press(press(score.shown!), 100);
    e.press(press(score.shown!), 110);
    expect(e.streak).toBe(2);
  });
  it('accepts either spelling of a black key', () => {
    const score = new FakeScore();
    const e = new SessionEngine(settings({ accidentals: 'both' }), score, createRng(2));
    e.start(0);
    for (let i = 0; i < 40; i++) e.press(press(noteFromMidi(midiOf(score.shown!))), i);
    expect(e.result().correct).toBe(40);
  });
});

describe('timed session', () => {
  it('spawns one note per beat (40 bpm = every 1.5 s)', () => {
    const score = new FakeScore();
    const e = new SessionEngine(settings({ speed: 40 }), score, createRng(1));
    e.start(0);
    expect(score.queue).toHaveLength(1);
    e.tick(1_499);
    expect(score.queue).toHaveLength(1);
    e.tick(1_500);
    expect(score.queue).toHaveLength(2);
    e.tick(3_000);
    expect(score.queue).toHaveLength(3);
  });
  it('counts a note reaching the clef as a failure; wrong presses leave the note playable', () => {
    const score = new FakeScore();
    const e = new SessionEngine(settings({ speed: 80 }), score, createRng(4));
    e.start(0);
    e.tick(750);
    e.tick(1500);
    const first = score.queue[0];
    e.press(press(wrongNote(first)), 1600);
    expect(score.queue[0]).toBe(first);
    e.noteMissed(2000); // first reaches the clef
    score.queue.shift(); // score component removes it
    const second = score.queue[0];
    e.press(press(second), 2100);
    expect(e.result()).toMatchObject({ correct: 1, total: 2, mode: 80 });
    expect(e.events.some((x) => x.pressed === null && !x.correct)).toBe(true);
  });
  it('builds a session record', () => {
    const score = new FakeScore();
    const e = new SessionEngine(settings({ speed: 20, lengthMin: 1 }), score, createRng(1));
    e.start(0, 1_000_000);
    e.tick(60_000);
    expect(e.record()).toMatchObject({ bpm: 20, clef: 'treble', range: 'C4-B4', startedAt: 1_000_000, endedAt: 1_060_000 });
  });

  it('tracks the streak of notes hit with no mistake', () => {
    const score = new FakeScore();
    const e = new SessionEngine(settings({}), score, createRng(3));
    e.start(0);
    const hit = (t: number) => e.press(press(score.target()!), t);
    hit(100); hit(200); hit(300);
    expect(e.streak).toBe(3);
    e.press(press(wrongNote(score.target()!)), 400); // mistake resets
    expect(e.streak).toBe(0);
    hit(500); // answered after a mistake: not a clean hit
    expect(e.streak).toBe(0);
    hit(600);
    expect(e.streak).toBe(1);
    expect(score.streaks[0]).toBe(0);
    expect(e.bestStreak).toBe(3);
    expect(e.record().bestStreak).toBe(3);
  });
});
