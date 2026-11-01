// Note pools, ranges and the random note generator.
import { Note, isBlackKey, midiOf, noteFromMidi, parseNote } from './notes';

export type Accidentals = 'none' | 'sharps' | 'flats' | 'both';
export type Clef = 'treble' | 'bass';

export interface ClefInfo {
  /** First and last white key offered in the range dropdowns. */
  low: string;
  high: string;
  defaultLow: string;
  defaultHigh: string;
  /** Note sitting on the top staff line. */
  topLine: string;
}

export const CLEFS: Record<Clef, ClefInfo> = {
  treble: { low: 'C4', high: 'C6', defaultLow: 'C4', defaultHigh: 'B4', topLine: 'F5' },
  bass: { low: 'E2', high: 'C4', defaultLow: 'C3', defaultHigh: 'B3', topLine: 'A3' },
};

/** All natural notes with midi in [low, high], ascending. */
export function whiteNotesBetween(low: Note, high: Note): Note[] {
  const out: Note[] = [];
  for (let m = midiOf(low); m <= midiOf(high); m++) {
    if (!isBlackKey(m)) out.push(noteFromMidi(m));
  }
  return out;
}

/** White-key note names a clef offers in its range dropdowns. */
export function rangeOptions(clef: Clef): string[] {
  const c = CLEFS[clef];
  return whiteNotesBetween(parseNote(c.low), parseNote(c.high)).map((n) => `${n.letter}${n.octave}`);
}

/**
 * Notes that may be asked in a session. White-key spellings E#, B#, Fb, Cb are never produced.
 * With "both", a black key appears twice (sharp and flat spelling).
 */
export function buildPool(low: Note, high: Note, acc: Accidentals): Note[] {
  const out: Note[] = [];
  for (let m = midiOf(low); m <= midiOf(high); m++) {
    if (!isBlackKey(m)) out.push(noteFromMidi(m));
    else {
      if (acc === 'sharps' || acc === 'both') out.push(noteFromMidi(m, '#'));
      if (acc === 'flats' || acc === 'both') out.push(noteFromMidi(m, 'b'));
    }
  }
  return out;
}

/** Small seeded PRNG (mulberry32) so tests are deterministic. */
export function createRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Random note from the pool, never the same pitch twice in a row (unless the pool has one pitch). */
export function pickNote(pool: Note[], prev: Note | null, rng: () => number): Note {
  const candidates = prev && new Set(pool.map(midiOf)).size > 1 ? pool.filter((n) => midiOf(n) !== midiOf(prev)) : pool;
  return candidates[Math.floor(rng() * candidates.length)];
}
