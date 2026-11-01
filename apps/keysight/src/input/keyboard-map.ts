// Computer keyboard laid out like a piano: Z X C V B N M = C D E F G A B,
// S D = C#/D#, G H J = F#/G#/A# (no black key above E-F or B-C).
import { InputBus } from './bus';
import { noteFromMidi } from '../core/notes';

/** Semitone offset above the base C for each KeyboardEvent.code. */
export const KEY_OFFSETS: Record<string, number> = {
  KeyZ: 0, KeyS: 1, KeyX: 2, KeyD: 3, KeyC: 4, KeyV: 5, KeyG: 6, KeyB: 7, KeyH: 8, KeyN: 9, KeyJ: 10, KeyM: 11,
};

export function midiForKey(code: string, baseOctave: number): number | null {
  const off = KEY_OFFSETS[code];
  return off === undefined ? null : (baseOctave + 1) * 12 + off;
}

export interface KeyboardInputOptions {
  bus: InputBus;
  /** Lowest octave of the selected range; reset the shift when it changes. */
  getBaseOctave: () => number;
  /** Called with the highlighted midi so the on-screen piano can show it. */
  onKeyState?: (midi: number, down: boolean) => void;
}

/** Listens on document. Returns a detach function. Holding a key (auto-repeat) is ignored. */
export function attachKeyboardInput(opts: KeyboardInputOptions): () => void {
  let shift = 0;
  const down = new Map<string, number>(); // code -> midi that was pressed
  const isTyping = (t: EventTarget | null) =>
    t instanceof HTMLElement && (t.isContentEditable || ['INPUT', 'SELECT', 'TEXTAREA'].includes(t.tagName));

  const keydown = (e: KeyboardEvent) => {
    if (e.repeat || e.ctrlKey || e.metaKey || e.altKey || isTyping(e.target)) return;
    if (e.code === 'Comma' || e.code === 'ArrowLeft') return void (shift = Math.max(-2, shift - 1));
    if (e.code === 'Period' || e.code === 'ArrowRight') return void (shift = Math.min(3, shift + 1));
    const midi = midiForKey(e.code, opts.getBaseOctave() + shift);
    if (midi === null) return;
    down.set(e.code, midi);
    opts.onKeyState?.(midi, true);
    opts.bus.emit({ note: noteFromMidi(midi), midi, source: 'keyboard', timestamp: performance.now() });
  };
  const keyup = (e: KeyboardEvent) => {
    const midi = down.get(e.code);
    if (midi === undefined) return;
    down.delete(e.code);
    opts.onKeyState?.(midi, false);
  };
  document.addEventListener('keydown', keydown);
  document.addEventListener('keyup', keyup);
  return () => {
    document.removeEventListener('keydown', keydown);
    document.removeEventListener('keyup', keyup);
  };
}
