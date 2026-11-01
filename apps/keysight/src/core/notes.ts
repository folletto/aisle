// Note model: spelling (letter + accidental + octave), MIDI maths, labels.
// Pure logic, no DOM.

export type Letter = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B';
export type Accidental = '' | '#' | 'b';
export type LabelMode = 'none' | 'solfege' | 'letters' | 'both';

export interface Note {
  letter: Letter;
  accidental: Accidental;
  octave: number;
}

export const LETTERS: Letter[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const SEMITONE: Record<Letter, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const SOLFEGE: Record<Letter, string> = { C: 'Do', D: 'Re', E: 'Mi', F: 'Fa', G: 'Sol', A: 'La', B: 'Si' };
const SHARP_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

export function midiOf(n: Note): number {
  const acc = n.accidental === '#' ? 1 : n.accidental === 'b' ? -1 : 0;
  return (n.octave + 1) * 12 + SEMITONE[n.letter] + acc;
}

/** Parse "C4", "F#3", "Bb2" (also accepts ♯ / ♭). */
export function parseNote(s: string): Note {
  const m = /^([A-G])([#b♯♭]?)(-?\d+)$/.exec(s.trim());
  if (!m) throw new Error(`Invalid note: ${s}`);
  const accidental = m[2] === '♯' ? '#' : m[2] === '♭' ? 'b' : (m[2] as Accidental);
  return { letter: m[1] as Letter, accidental, octave: Number(m[3]) };
}

/** ASCII name, e.g. "C#4". Stable id for a spelled note. */
export function noteName(n: Note): string {
  return `${n.letter}${n.accidental}${n.octave}`;
}

export function noteFromMidi(midi: number, prefer: '#' | 'b' = '#'): Note {
  const pc = ((midi % 12) + 12) % 12;
  const name = (prefer === '#' ? SHARP_NAMES : FLAT_NAMES)[pc];
  return parseNote(`${name}${Math.floor(midi / 12) - 1}`);
}

/** Position on the staff in diatonic steps (C0 = 0, D0 = 1 ...). Accidentals do not move a note. */
export function diatonicIndex(n: Note): number {
  return n.octave * 7 + LETTERS.indexOf(n.letter);
}

export function isBlackKey(midi: number): boolean {
  return [1, 3, 6, 8, 10].includes(((midi % 12) + 12) % 12);
}

const SYMBOL: Record<Accidental, string> = { '': '', '#': '♯', b: '♭' };

/** Label shown under a note: "C♯ 4", "Do♯ 4", "Do♯ / C♯ 4". Empty when mode is none. */
export function formatLabel(n: Note, mode: LabelMode): string {
  if (mode === 'none') return '';
  const letter = `${n.letter}${SYMBOL[n.accidental]}`;
  const solfege = `${SOLFEGE[n.letter]}${SYMBOL[n.accidental]}`;
  const name = mode === 'letters' ? letter : mode === 'solfege' ? solfege : `${solfege} / ${letter}`;
  return `${name} ${n.octave}`;
}
