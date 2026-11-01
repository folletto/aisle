// Key press sound, synthesised with Web Audio (no audio files). A short triangle-wave note with a
// quick attack and decay. iOS only allows audio after a user gesture, so the context is created
// lazily on the first press. Silently does nothing where Web Audio is unavailable.

let ctx: AudioContext | null = null;

export function frequencyOfMidi(midi: number): number {
  return 440 * 2 ** ((midi - 69) / 12);
}

export function playNote(midi: number): void {
  try {
    if (!ctx) {
      const Ctor = typeof AudioContext !== 'undefined' ? AudioContext : (globalThis as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return;
      ctx = new Ctor();
    }
    if (ctx.state === 'suspended') void ctx.resume();
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
