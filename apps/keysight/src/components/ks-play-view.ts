// Play view: score area (staff, countdown, warning badges, results) over the piano.
// Owns the running session: wires piano / computer keyboard -> input bus -> session engine -> score.
import './ks-score/ks-score';
import './ks-piano/ks-piano';
import './ks-results';
import type { KsScore } from './ks-score/ks-score';
import type { KsPiano } from './ks-piano/ks-piano';
import type { KsResults } from './ks-results';
import { SessionEngine } from '../core/session';
import { noteFromMidi, parseNote } from '../core/notes';
import { InputBus } from '../input/bus';
import { attachKeyboardInput } from '../input/keyboard-map';
import { saveCompletedSession } from '../data/storage';
import { settingsStore } from '../state';
import { icon } from '../icons';
import { hapticTick } from '../haptics';

const STYLE = `
:host { display: grid; height: 100%; grid-template-rows: 1fr 1fr; background: #1b1d23; }
@media (orientation: landscape) { :host { grid-template-rows: 1fr 2fr; } }
.score-area { position: relative; background: #fff; min-height: 0; }
ks-score { position: absolute; inset: 0; top: calc(56px + env(safe-area-inset-top)); }
@media (orientation: landscape) { ks-score { top: calc(50px + env(safe-area-inset-top)); } }
ks-results { position: absolute; inset: 0; z-index: 3; }
.count { position: absolute; top: calc(14px + env(safe-area-inset-top)); right: calc(16px + env(safe-area-inset-right));
  font: 600 15px system-ui, sans-serif; font-variant-numeric: tabular-nums; color: #4a5060; }
.badge { position: absolute; bottom: 6px; z-index: 4; display: none; align-items: center; gap: 4px; padding: 3px 9px 3px 7px;
  border-radius: 999px; background: #fff3cd; color: #8a5a00; border: 1px solid #f0c36d; font: 700 13px system-ui, sans-serif; }
.badge.on { display: inline-flex; }
.badge.left { left: calc(8px + env(safe-area-inset-left)); }
.badge.right { right: calc(8px + env(safe-area-inset-right)); }
ks-piano { min-height: 0; padding-bottom: env(safe-area-inset-bottom); background: #1b1d23; }
`;

export class KsPlayView extends HTMLElement {
  private score!: KsScore;
  private piano!: KsPiano;
  private results!: KsResults;
  private countEl!: HTMLElement;
  private engine: SessionEngine | null = null;
  private raf = 0;
  private wakeLock: { release(): Promise<void> } | null = null;
  private bus = new InputBus();
  private cleanups: Array<() => void> = [];

  connectedCallback(): void {
    const root = this.shadowRoot ?? this.attachShadow({ mode: 'open' });
    root.innerHTML = `<style>${STYLE}</style>
      <section class="score-area">
        <ks-score></ks-score>
        <span class="count" hidden></span>
        <span class="badge left">${icon('warning', 14)}<b></b></span>
        <span class="badge right">${icon('warning', 14)}<b></b></span>
        <ks-results></ks-results>
      </section>
      <ks-piano></ks-piano>`;
    this.score = root.querySelector('ks-score') as KsScore;
    this.piano = root.querySelector('ks-piano') as KsPiano;
    this.results = root.querySelector('ks-results') as KsResults;
    this.countEl = root.querySelector('.count') as HTMLElement;
    const badgeL = root.querySelector('.badge.left') as HTMLElement;
    const badgeR = root.querySelector('.badge.right') as HTMLElement;

    this.applySettings();
    this.cleanups.push(settingsStore.subscribe(() => this.applySettings()));

    // Piano touches -> bus
    this.piano.addEventListener('ks-key-down', (e) => {
      if (settingsStore.get().haptics) hapticTick();
      const midi = (e as CustomEvent).detail.midi as number;
      const prefer = settingsStore.get().accidentals === 'flats' ? 'b' : '#';
      this.bus.emit({ note: noteFromMidi(midi, prefer), midi, source: 'touch', timestamp: performance.now() });
    });
    // Computer keyboard -> bus
    this.cleanups.push(
      attachKeyboardInput({
        bus: this.bus,
        getBaseOctave: () => parseNote(settingsStore.get().rangeLow).octave,
        onKeyState: (m, d) => this.piano.setKeyDown(m, d),
      }),
    );
    // Bus -> session
    this.cleanups.push(this.bus.onPress((kp) => this.engine?.press(kp, performance.now())));
    this.score.addEventListener('ks-note-missed', () => this.engine?.noteMissed(performance.now()));
    // Warning badge: range keys scrolled off screen
    this.piano.addEventListener('ks-window-change', (e) => {
      const { left, right } = (e as CustomEvent).detail as { left: number; right: number };
      for (const [el, n] of [[badgeL, left], [badgeR, right]] as const) {
        el.classList.toggle('on', n > 0);
        el.querySelector('b')!.textContent = String(n);
        el.setAttribute('aria-label', `${n} notes of the range are off screen`);
      }
    });
    // Leaving the page mid-session counts as Stop.
    const onHide = () => document.hidden && this.stopSession();
    document.addEventListener('visibilitychange', onHide);
    this.cleanups.push(() => document.removeEventListener('visibilitychange', onHide));
  }

  disconnectedCallback(): void {
    this.stopSession();
    this.cleanups.forEach((fn) => fn());
    this.cleanups = [];
  }

  get running(): boolean {
    return this.engine?.state === 'running';
  }

  private applySettings(): void {
    const s = settingsStore.get();
    this.score.setAttribute('clef', s.clef);
    this.score.setAttribute('labels', s.labels);
    this.score.setAttribute('range-low', s.rangeLow);
    this.score.setAttribute('range-high', s.rangeHigh);
    this.piano.setAttribute('labels', s.labels);
    this.piano.setAttribute('accidentals', s.accidentals);
    this.piano.toggleAttribute('show-labels', s.pianoLabels);
    this.piano.setAttribute('range-low', s.rangeLow);
    this.piano.setAttribute('range-high', s.rangeHigh);
  }

  async startSession(): Promise<void> {
    if (this.running) return;
    await this.score.ready;
    this.results.dismiss();
    const engine = new SessionEngine(settingsStore.get(), this.score);
    engine.onFinish = (result) => {
      void saveCompletedSession(engine.record(), engine.events);
      this.endRun();
      this.results.show(result);
    };
    this.engine = engine;
    this.piano.locked = true;
    this.countEl.hidden = false;
    this.setState(true);
    void this.requestWakeLock();
    engine.start(performance.now());
    const loop = (now: number) => {
      if (this.engine !== engine || engine.state !== 'running') return;
      engine.tick(now);
      const sec = Math.ceil(engine.remainingMs(now) / 1000);
      this.countEl.textContent = `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  /** Abort: no results panel, nothing saved, back to the blank staff. */
  stopSession(): void {
    if (!this.engine || this.engine.state !== 'running') return;
    this.engine.stop();
    this.endRun();
  }

  private endRun(): void {
    cancelAnimationFrame(this.raf);
    this.piano.locked = false;
    this.countEl.hidden = true;
    void this.wakeLock?.release().catch(() => {});
    this.wakeLock = null;
    this.setState(false);
  }

  private setState(running: boolean): void {
    this.dispatchEvent(new CustomEvent('ks-session-state', { detail: { running }, bubbles: true, composed: true }));
  }

  private async requestWakeLock(): Promise<void> {
    try {
      this.wakeLock = (await (navigator as Navigator & { wakeLock?: { request(t: 'screen'): Promise<{ release(): Promise<void> }> } }).wakeLock?.request('screen')) ?? null;
    } catch {
      /* not supported or denied: fine */
    }
  }
}
if (!customElements.get('ks-play-view')) customElements.define('ks-play-view', KsPlayView);
