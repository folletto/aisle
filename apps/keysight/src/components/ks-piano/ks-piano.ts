// <ks-piano>: on-screen keyboard.
//  - Always shows an integer number of white keys that exactly fills the width (no half keys).
//  - Two-finger pinch changes that integer; a pan strip on top slides the window (one finger).
//  - Multi-touch via Pointer Events; touch-action: none so iOS never scrolls / zooms.
//  - Emits raw 'ks-key-down' / 'ks-key-up' events {midi}; the input layer turns them into KeyPress.
//  - Reports hidden range keys via 'ks-window-change' {left, right} for the warning badge.
import {
  WHITE_MIDIS,
  centredStart,
  clampStart,
  defaultVisible,
  hiddenCounts,
  pinchVisible,
} from '../../core/keyboard';
import { midiOf, parseNote } from '../../core/notes';
import { whiteNotesBetween } from '../../core/pool';

const STYLE = `
:host { display: block; position: relative; background: #1b1d23; touch-action: none;
  user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; }
.pan { position: absolute; left: 0; right: 0; top: 0; height: 20px; z-index: 5; cursor: grab; touch-action: none; }
.pan::after { content: ''; position: absolute; left: 50%; top: 8px; width: 44px; height: 4px; margin-left: -22px;
  border-radius: 2px; background: #5b6070; }
:host([locked]) .pan { opacity: 0; pointer-events: none; }
.keys { position: absolute; left: 0; right: 0; top: 20px; bottom: 0; touch-action: none; }
.key { position: absolute; box-sizing: border-box; touch-action: none; }
.white { top: 0; bottom: 0; background: #fff; border: 1px solid #b8bcc8; border-top: 0; border-radius: 0 0 6px 6px; }
.white.dim { background: #eceef3; }
.white span { position: absolute; bottom: 8px; left: 0; right: 0; text-align: center; font: 600 11px system-ui, sans-serif; color: #7a8090; pointer-events: none; }
.black { top: 0; height: 62%; background: #15161a; border-radius: 0 0 5px 5px; z-index: 2; box-shadow: inset 0 -6px 0 #2c2f38; }
.down.white { background: #8fd0ff; }
.down.black { background: #2f8fd8; }
`;

export class KsPiano extends HTMLElement {
  static observedAttributes = ['range-low', 'range-high', 'locked'];

  private keysEl: HTMLDivElement;
  private ro: ResizeObserver;
  private start = 0;
  private visible = 7;
  private width = 0;
  private initialised = false;
  private touches = new Map<number, { x: number; midi: number | null }>();
  private pinch: { startVisible: number; startDist: number } | null = null;
  private pan: { x: number; start: number } | null = null;

  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = `<style>${STYLE}</style><div class="pan"></div><div class="keys"></div>`;
    this.keysEl = root.querySelector('.keys') as HTMLDivElement;
    const panEl = root.querySelector('.pan') as HTMLDivElement;
    this.ro = new ResizeObserver(() => this.onResize());
    this.keysEl.addEventListener('pointerdown', (e) => this.onDown(e));
    this.keysEl.addEventListener('pointerup', (e) => this.onUp(e));
    this.keysEl.addEventListener('pointercancel', (e) => this.onUp(e));
    this.keysEl.addEventListener('pointermove', (e) => this.onMove(e));
    panEl.addEventListener('pointerdown', (e) => {
      panEl.setPointerCapture(e.pointerId);
      this.pan = { x: e.clientX, start: this.start };
    });
    panEl.addEventListener('pointermove', (e) => {
      if (!this.pan || this.locked) return;
      const keyW = this.width / this.visible;
      this.start = clampStart(this.pan.start - (e.clientX - this.pan.x) / keyW, this.visible);
      this.render();
    });
    const endPan = () => (this.pan = null);
    panEl.addEventListener('pointerup', endPan);
    panEl.addEventListener('pointercancel', endPan);
  }

  get locked(): boolean {
    return this.hasAttribute('locked');
  }
  set locked(v: boolean) {
    this.toggleAttribute('locked', v);
  }
  get rangeLow(): string {
    return this.getAttribute('range-low') ?? 'C4';
  }
  get rangeHigh(): string {
    return this.getAttribute('range-high') ?? 'B4';
  }

  connectedCallback(): void {
    this.ro.observe(this);
  }
  disconnectedCallback(): void {
    this.ro.disconnect();
  }
  attributeChangedCallback(name: string): void {
    if (name === 'locked') return;
    if (this.initialised) this.fitToRange();
  }

  /** Light a key from outside (computer keyboard presses). */
  setKeyDown(midi: number, down: boolean): void {
    this.keysEl.querySelector(`[data-midi="${midi}"]`)?.classList.toggle('down', down);
  }

  /** Re-centre on the range with the default number of keys. */
  fitToRange(): void {
    if (!this.width) return;
    const count = whiteNotesBetween(parseNote(this.rangeLow), parseNote(this.rangeHigh)).length;
    this.visible = defaultVisible(count, this.width);
    this.start = centredStart(parseNote(this.rangeLow), parseNote(this.rangeHigh), this.visible);
    this.render();
  }

  private onResize(): void {
    const w = this.keysEl.getBoundingClientRect().width;
    if (!w || w === this.width) return;
    this.width = w;
    this.initialised = true;
    this.fitToRange();
  }

  private render(): void {
    const keyW = this.width / this.visible;
    const low = parseNote(this.rangeLow);
    const high = parseNote(this.rangeHigh);
    const lowIdx = WHITE_MIDIS.findIndex((m) => m >= midiOf(low));
    const highIdx = WHITE_MIDIS.findLastIndex((m) => m <= midiOf(high));
    const frag = document.createDocumentFragment();
    for (let i = 0; i <= this.visible; i++) {
      const idx = this.start + i;
      if (idx >= WHITE_MIDIS.length || i === this.visible) {
        // the black key hanging off the right edge of the last white key is not shown
        break;
      }
      const midi = WHITE_MIDIS[idx];
      const w = document.createElement('div');
      w.className = 'key white' + (idx < lowIdx || idx > highIdx ? ' dim' : '');
      w.dataset.midi = String(midi);
      w.style.left = `${i * keyW}px`;
      w.style.width = `${keyW}px`;
      if (midi % 12 === 0) w.innerHTML = `<span>C${Math.floor(midi / 12) - 1}</span>`;
      frag.appendChild(w);
      // Black key between this white key and the next, if it exists and both are visible.
      const nextMidi = WHITE_MIDIS[idx + 1];
      if (i < this.visible - 1 && nextMidi !== undefined && nextMidi - midi === 2) {
        const b = document.createElement('div');
        b.className = 'key black';
        b.dataset.midi = String(midi + 1);
        const bw = keyW * 0.6;
        b.style.width = `${bw}px`;
        b.style.left = `${(i + 1) * keyW - bw / 2}px`;
        frag.appendChild(b);
      }
    }
    this.keysEl.replaceChildren(frag);
    const { left, right } = hiddenCounts(low, high, this.start, this.visible);
    this.dispatchEvent(new CustomEvent('ks-window-change', { detail: { left, right }, bubbles: true, composed: true }));
  }

  private midiAt(e: PointerEvent): number | null {
    const el = (e.target as HTMLElement).closest?.('.key') as HTMLElement | null;
    return el ? Number(el.dataset.midi) : null;
  }

  private emit(type: 'ks-key-down' | 'ks-key-up', midi: number): void {
    this.setKeyDown(midi, type === 'ks-key-down');
    this.dispatchEvent(new CustomEvent(type, { detail: { midi, timestamp: performance.now() }, bubbles: true, composed: true }));
  }

  private onDown(e: PointerEvent): void {
    e.preventDefault();
    const midi = this.midiAt(e);
    this.touches.set(e.pointerId, { x: e.clientX, midi });
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    if (this.touches.size === 2 && !this.locked) {
      const [a, b] = [...this.touches.values()];
      this.pinch = { startVisible: this.visible, startDist: Math.max(1, Math.abs(a.x - b.x)) };
    }
    if (midi !== null && !this.pinch) this.emit('ks-key-down', midi);
  }

  private onMove(e: PointerEvent): void {
    const t = this.touches.get(e.pointerId);
    if (!t) return;
    t.x = e.clientX;
    if (!this.pinch || this.touches.size < 2) return;
    const [a, b] = [...this.touches.values()];
    const dist = Math.max(1, Math.abs(a.x - b.x));
    if (Math.abs(dist - this.pinch.startDist) < 24) return;
    // Fingers are pinching, not playing: release anything we pressed.
    this.touches.forEach((v) => {
      if (v.midi !== null) this.emit('ks-key-up', v.midi);
      v.midi = null;
    });
    const mid = this.start + this.visible / 2;
    this.visible = pinchVisible(this.pinch.startVisible, dist / this.pinch.startDist, this.width);
    this.start = clampStart(mid - this.visible / 2, this.visible);
    this.render();
  }

  private onUp(e: PointerEvent): void {
    const t = this.touches.get(e.pointerId);
    this.touches.delete(e.pointerId);
    if (t?.midi != null) this.emit('ks-key-up', t.midi);
    if (this.touches.size < 2) this.pinch = null;
  }
}

if (!customElements.get('ks-piano')) customElements.define('ks-piano', KsPiano);
