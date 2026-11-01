import { describe, expect, it } from 'vitest';
import { diatonicIndex, formatLabel, midiOf, noteFromMidi, noteName, parseNote } from '../../src/core/notes';
import { buildPool, createRng, pickNote, rangeOptions, whiteNotesBetween } from '../../src/core/pool';
import { DEFAULT_SETTINGS, normaliseSettings, updateSettings } from '../../src/core/settings';
import { centredStart, clampVisible, defaultVisible, hiddenCounts, pinchVisible } from '../../src/core/keyboard';
import { computeLayout, noteOffsetY } from '../../src/components/ks-score/layout';
import { KEY_OFFSETS, midiForKey } from '../../src/input/keyboard-map';

const n = parseNote;

describe('notes', () => {
  it('computes midi', () => {
    expect(midiOf(n('C4'))).toBe(60);
    expect(midiOf(n('A4'))).toBe(69);
    expect(midiOf(n('C#4'))).toBe(midiOf(n('Db4')));
  });
  it('round-trips midi with spelling preference', () => {
    expect(noteName(noteFromMidi(61))).toBe('C#4');
    expect(noteName(noteFromMidi(61, 'b'))).toBe('Db4');
  });
  it('formats labels', () => {
    expect(formatLabel(n('C#4'), 'letters')).toBe('C♯ 4');
    expect(formatLabel(n('C4'), 'both')).toBe('Do / C 4');
    expect(formatLabel(n('Eb4'), 'both')).toBe('Mi♭ / E♭ 4');
    expect(formatLabel(n('C4'), 'none')).toBe('');
  });
  it('rejects bad names', () => expect(() => parseNote('H9')).toThrow());
});

describe('staff positions', () => {
  it('treble: F5 is the top line, C4 is below the staff', () => {
    expect(noteOffsetY(n('F5'), 'treble')).toBe(0);
    expect(noteOffsetY(n('E4'), 'treble')).toBe(40); // bottom line
    expect(noteOffsetY(n('C4'), 'treble')).toBe(50); // first ledger line below the staff
  });
  it('bass: A3 is the top line', () => {
    expect(noteOffsetY(n('A3'), 'bass')).toBe(0);
    expect(noteOffsetY(n('G2'), 'bass')).toBe(40);
  });
  it('accidentals do not move a note', () => {
    expect(diatonicIndex(n('C#4'))).toBe(diatonicIndex(n('C4')));
  });
  it('layout fits the height', () => {
    const l = computeLayout(400, 300, 'treble', 'C4', 'C6');
    expect(l.vh * l.scale).toBeCloseTo(300);
    expect(l.vw * l.scale).toBeCloseTo(400);
  });
});

describe('pool and generator', () => {
  const low = n('C4');
  const high = n('B4');
  it('naturals only by default', () => {
    expect(buildPool(low, high, 'none').map(noteName)).toEqual(['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4']);
  });
  it('sharps add C# D# F# G# A#', () => {
    const names = buildPool(low, high, 'sharps').map(noteName);
    expect(names).toHaveLength(12);
    expect(names).toContain('A#4');
    expect(names).not.toContain('Bb4');
  });
  it('flats add Db Eb Gb Ab Bb, never E# or Cb', () => {
    const names = buildPool(low, high, 'flats').map(noteName);
    expect(names).toContain('Bb4');
    expect(names).not.toContain('E#4');
    expect(names).not.toContain('Cb4');
  });
  it('both spells a black key twice', () => {
    expect(buildPool(low, high, 'both')).toHaveLength(17);
  });
  it('never repeats the same note twice in a row', () => {
    const rng = createRng(7);
    const pool = buildPool(low, high, 'none');
    let prev = null as ReturnType<typeof n> | null;
    for (let i = 0; i < 500; i++) {
      const next = pickNote(pool, prev, rng);
      if (prev) expect(midiOf(next)).not.toBe(midiOf(prev));
      prev = next;
    }
  });
  it('is deterministic for a seed', () => {
    const a = createRng(1);
    const b = createRng(1);
    expect([a(), a()]).toEqual([b(), b()]);
  });
  it('range options per clef', () => {
    expect(rangeOptions('treble')[0]).toBe('C4');
    expect(rangeOptions('treble').at(-1)).toBe('C6');
    expect(rangeOptions('bass')[0]).toBe('E2');
    expect(rangeOptions('bass').at(-1)).toBe('C4');
  });
  it('whiteNotesBetween', () => expect(whiteNotesBetween(low, high)).toHaveLength(7));
});

describe('settings', () => {
  it('defaults', () => {
    expect(normaliseSettings({})).toEqual(DEFAULT_SETTINGS);
  });
  it('resets the range when it does not fit the clef', () => {
    const s = normaliseSettings({ clef: 'bass', rangeLow: 'C4', rangeHigh: 'B4' });
    expect([s.rangeLow, s.rangeHigh]).toEqual(['C3', 'B3']);
  });
  it('rejects low >= high', () => {
    expect(normaliseSettings({ rangeLow: 'E4', rangeHigh: 'D4' }).rangeLow).toBe('C4');
  });
  it('clef change resets range', () => {
    const s = updateSettings(DEFAULT_SETTINGS, { clef: 'bass' });
    expect([s.clef, s.rangeLow, s.rangeHigh]).toEqual(['bass', 'C3', 'B3']);
  });
  it('clamps length', () => {
    expect(normaliseSettings({ lengthMin: 99 }).lengthMin).toBe(10);
    expect(normaliseSettings({ lengthMin: 0 }).lengthMin).toBe(1);
  });
});

describe('keyboard fit and pinch', () => {
  it('uses an integer number of keys', () => {
    expect(Number.isInteger(defaultVisible(7, 390))).toBe(true);
    expect(defaultVisible(7, 390)).toBe(7);
    expect(defaultVisible(15, 390)).toBe(10); // capped by comfortable key width
  });
  it('pinch: spreading shows fewer keys, clamped', () => {
    expect(pinchVisible(10, 2, 390)).toBe(5);
    expect(pinchVisible(10, 10, 390)).toBe(5);
    expect(pinchVisible(10, 0.1, 390)).toBe(21);
    expect(clampVisible(1000, 390)).toBe(21);
  });
  it('centres the range', () => {
    const start = centredStart(n('C4'), n('B4'), 7);
    const { left, right } = hiddenCounts(n('C4'), n('B4'), start, 7);
    expect([left, right]).toEqual([0, 0]);
  });
  it('counts hidden range keys on each side', () => {
    // 5 visible keys starting at E4 over C4..B4: C D hidden left, A B hidden right
    const start = centredStart(n('E4'), n('E4'), 5) - 0;
    void start;
    const e4 = 7 * 2 + 2; // white index of E4 (C2=0)
    expect(hiddenCounts(n('C4'), n('B4'), e4, 5)).toEqual({ left: 2, right: 0 });
    expect(hiddenCounts(n('C4'), n('B4'), e4 - 2, 5)).toEqual({ left: 0, right: 2 });
  });
});

describe('computer keyboard map', () => {
  it('maps the bottom row to white keys and the row above to black keys', () => {
    const notes = ['KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyB', 'KeyN', 'KeyM'].map((c) => noteName(noteFromMidi(midiForKey(c, 4)!)));
    expect(notes).toEqual(['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4']);
    const blacks = ['KeyS', 'KeyD', 'KeyG', 'KeyH', 'KeyJ'].map((c) => noteName(noteFromMidi(midiForKey(c, 4)!)));
    expect(blacks).toEqual(['C#4', 'D#4', 'F#4', 'G#4', 'A#4']);
    expect(Object.keys(KEY_OFFSETS)).toHaveLength(12);
  });
  it('ignores other keys', () => expect(midiForKey('KeyQ', 4)).toBeNull());
});
