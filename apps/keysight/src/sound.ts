// Key press sound, synthesised with Web Audio (no audio files). A short triangle-wave note with a
// quick attack and decay. iOS only allows audio after a user gesture, so the context is created
// lazily on the first press. Silently does nothing where Web Audio is unavailable.

let ctx: AudioContext | null = null;

export function frequencyOfMidi(midi: number): number {
  return 440 * 2 ** ((midi - 69) / 12);
}

function audioContext(): AudioContext | null {
  if (!ctx) {
    const Ctor = typeof AudioContext !== 'undefined' ? AudioContext : (globalThis as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

/** Start the audio engine with an inaudible note, so the first real key press is not delayed. Call from a user gesture. */
export function primeAudio(): void {
  try {
    const c = audioContext();
    if (!c) return;
    const osc = c.createOscillator();
    const gain = c.createGain();
    gain.gain.value = 0; // silent
    osc.connect(gain).connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + 0.05);
  } catch {
    /* ignore */
  }
}

export function playNote(midi: number): void {
  try {
    const c = audioContext();
    if (!c) return;
    const ctx = c;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = frequencyOfMidi(midi);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.35, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.75);
  } catch {
    /* ignore */
  }
}
