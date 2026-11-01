import { describe, expect, it } from 'vitest';
import { frequencyOfMidi, playNote, primeAudio } from '../../src/sound';

describe('sound', () => {
  it('maps midi to frequency', () => {
    expect(frequencyOfMidi(69)).toBeCloseTo(440);
    expect(frequencyOfMidi(60)).toBeCloseTo(261.63, 1);
  });
  it('priming never throws without Web Audio', () => {
    expect(() => primeAudio()).not.toThrow();
  });
  it('never throws without Web Audio', () => {
    expect(() => playNote(60)).not.toThrow();
  });
});
