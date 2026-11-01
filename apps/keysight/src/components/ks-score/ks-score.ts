// <ks-score>: standalone single-staff score with note judging. No dependency on the rest of the app.
// Depends only on VexFlow (drawing) and the pure helpers in ./layout and ../../core/notes.
//
// How it works:
//  - The staff + clef are drawn once by VexFlow (again only on resize / clef / range change).
//  - Every note is drawn once into its own SVG <g>, then moved (Web Animations API) and recoloured.
//    Each note has an outer <g> (position / scroll) and an inner <g> (VexFlow output + feedback animations).
//  - Timed mode: each note gets a linear WAAPI translateX animation; its end = reaching the clef = miss.
//    Being time-based, frame drops cannot change tempo.
import { Accidental, Renderer, Stave, StaveNote, TickContext } from 'vexflow/bravura';
import { LabelMode, Locale, Note, formatLabel, midiOf } from '../../core/notes';
import { Clef } from '../../core/pool';
import type { JudgeResult } from '../../core/session';
import { LINE_GAP, Layout, computeLayout, noteOffsetY } from './layout';

const SVG_NS = 'http://www.w3.org/2000/svg';
const BASE_X = 80; // where VexFlow draws a note before we translate it
const RED = '#d92d20';
const GREEN = '#12a150';
const GOLD = '#d49b00';

interface Entry {
  note: Note;
  outer: SVGGElement;
  inner: SVGGElement;
  cx: number; // notehead centre in outer's own coordinates
  anim?: Animation;
  startX: number;
  endX: number;
  durationMs: number;
}

const STYLE = `
:host { display: block; position: relative; min-height: 60px; overflow: hidden; background: #f6f7fb; }
.wrap { position: absolute; inset: 0; }
svg { width: 100%; height: 100%; display: block; }
`;

export class KsScore extends HTMLElement {
  static observedAttributes = ['clef', 'labels', 'match-labels', 'locale', 'range-low', 'range-high'];

  /** Resolves once the music font is ready and the staff is drawn. */
  ready: Promise<void>;

  private wrap: HTMLDivElement;
  private svgEl: SVGSVGElement | null = null;
  private renderer: Renderer | null = null;
  private stave: Stave | null = null;
  private layout: Layout | null = null;
  private ro: ResizeObserver;
  private mode: 'static' | 'timed' | null = null;
  private bpm = 40;
  private running = false;
  private staticEntry: Entry | null = null;
  private queue: Entry[] = [];
  private fontsReady = false;
  private streak: number | null = null;
  private streakEl: SVGTextElement | null = null;

  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = `<style>${STYLE}</style><div class="wrap"></div>`;
    this.wrap = root.querySelector('.wrap') as HTMLDivElement;
    this.ro = new ResizeObserver(() => this.relayout());
    this.ready = this.loadFonts();
  }

  get clef(): Clef {
    return this.getAttribute('clef') === 'bass' ? 'bass' : 'treble';
  }
  get labels(): LabelMode {
    const v = this.getAttribute('labels');
    return v === 'none' || v === 'solfege' || v === 'both' ? v : 'letters';
  }
  /** Label format shown only on a matched note (while `labels` is none). */
  get matchLabels(): LabelMode {
    const v = this.getAttribute('match-labels');
    return v === 'solfege' || v === 'letters' || v === 'both' ? v : 'none';
  }
  get locale(): Locale {
    const v = this.getAttribute('locale');
    return v === 'fr' || v === 'it' ? v : 'en';
  }
  get rangeLow(): string {
    return this.getAttribute('range-low') ?? (this.clef === 'bass' ? 'C3' : 'C4');
  }
  get rangeHigh(): string {
    return this.getAttribute('range-high') ?? (this.clef === 'bass' ? 'B3' : 'B4');
  }

  connectedCallback(): void {
    this.ro.observe(this);
    this.ready.then(() => this.relayout());
  }
  disconnectedCallback(): void {
    this.ro.disconnect();
    this.stop();
  }
  attributeChangedCallback(): void {
    if (this.isConnected && this.fontsReady) this.relayout();
  }

  // ---- Public API -------------------------------------------------------------------------

  /** Back to the blank staff (clef + lines only). */
  clear(): void {
    this.staticEntry?.outer.remove();
    this.staticEntry = null;
    this.queue.forEach((e) => {
      e.anim?.cancel();
      e.outer.remove();
    });
    this.queue = [];
    this.mode = null;
    this.svgEl?.querySelectorAll('.flash').forEach((n) => n.remove());
  }

  /** Static mode: one note, notehead centred horizontally, label underneath. */
  showNote(note: Note): void {
    if (!this.layout || !this.stave) return;
    this.clear();
    this.mode = 'static';
    const e = this.drawEntry(note);
    const x = this.staticCentre() - e.cx;
    e.outer.setAttribute('transform', `translate(${x} 0)`);
    this.staticEntry = e;
  }

  /** Timed mode: notes enter from the right and scroll left at a speed derived from bpm. */
  enqueue(notes: Note[], opts: { bpm: number }): void {
    if (!this.layout || !this.stave) return;
    this.mode = 'timed';
    this.bpm = opts.bpm;
    for (const note of notes) this.queue.push(this.makeScrolling(note, 0));
  }

  /** Compare against the current target (centred note, or leftmost scrolling note). */
  judge(pressed: Note): JudgeResult {
    const target = this.mode === 'static' ? this.staticEntry : this.queue[0];
    if (!target) return { correct: false, expected: null, pressed };
    const correct = midiOf(target.note) === midiOf(pressed);
    if (correct) {
      if (this.mode === 'static') this.staticEntry = null;
      else this.queue.shift();
      target.anim?.pause();
      this.feedback(target, 'success');
    } else {
      this.flashWrong(pressed, target);
    }
    return { correct, expected: target.note, pressed };
  }

  /** Streak (star + number, gold) under the clef; shown from 2 up, null hides it. Survives relayouts. */
  setStreak(n: number | null): void {
    this.streak = n;
    this.drawStreak();
  }

  /** Start / freeze the scrolling clock. */
  start(): void {
    this.running = true;
    this.queue.forEach((e) => e.anim?.play());
  }
  stop(): void {
    this.running = false;
    this.queue.forEach((e) => e.anim?.pause());
  }

  // ---- Rendering --------------------------------------------------------------------------

  private async loadFonts(): Promise<void> {
    try {
      // The Bravura font is bundled inside vexflow/bravura (never fetched from a CDN).
      await document.fonts.load('30px Bravura');
      await document.fonts.ready;
    } catch {
      /* draw anyway with the fallback */
    }
    this.fontsReady = true;
  }

  private staticCentre(): number {
    return (this.stave!.getNoteStartX() + this.layout!.vw) / 2;
  }

  /** Redraw the staff and re-create every note from the model, keeping scroll progress. */
  private relayout(): void {
    if (!this.fontsReady) return;
    const { width, height } = this.getBoundingClientRect();
    if (width < 10 || height < 10) return;

    const keepStatic = this.staticEntry?.note;
    const keepQueue = this.queue.map((e) => ({
      note: e.note,
      progress: e.anim ? Number(e.anim.currentTime ?? 0) / e.durationMs : 0,
    }));
    this.staticEntry?.outer.remove();
    this.queue.forEach((e) => e.anim?.cancel());

    this.wrap.innerHTML = '';
    const div = document.createElement('div');
    div.style.cssText = 'width:100%;height:100%';
    this.wrap.appendChild(div);
    this.layout = computeLayout(width, height, this.clef, this.rangeLow, this.rangeHigh);
    const { vw, vh, topLineY } = this.layout;

    const renderer = new Renderer(div, Renderer.Backends.SVG);
    renderer.resize(vw, vh);
    const svg = div.querySelector('svg') as SVGSVGElement;
    svg.setAttribute('viewBox', `0 0 ${vw} ${vh}`);
    svg.removeAttribute('width');
    svg.removeAttribute('height');
    svg.style.cssText = 'width:100%;height:100%;display:block';
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    const ctx = renderer.getContext();
    this.renderer = renderer;
    this.svgEl = svg;

    // VexFlow's stave "y" is the top of its box; find where its top line lands, then shift.
    const probe = new Stave(0, 0, vw);
    const stave = new Stave(4, topLineY - probe.getYForLine(0), vw - 8);
    stave.addClef(this.clef);
    stave.setContext(ctx).draw();
    this.stave = stave;
    this.streakEl = null;
    this.drawStreak();

    this.staticEntry = null;
    this.queue = [];
    if (keepStatic) this.showNote(keepStatic);
    for (const k of keepQueue) this.queue.push(this.makeScrolling(k.note, k.progress));
  }

  private drawStreak(): void {
    if (!this.svgEl || !this.stave || !this.layout) return;
    if (this.streak === null || this.streak < 2) {
      this.streakEl?.remove();
      this.streakEl = null;
      return;
    }
    if (!this.streakEl) {
      const t = document.createElementNS(SVG_NS, 'text');
      // Centred under the clef: the clef sits between the stave's left edge and where notes start.
      t.setAttribute('x', String((this.stave.getX() + this.stave.getNoteStartX()) / 2));
      t.setAttribute('y', String(this.layout.topLineY + 4 * LINE_GAP + 34));
      t.setAttribute('text-anchor', 'middle');
      t.setAttribute('font-size', '16');
      t.setAttribute('font-family', 'system-ui, sans-serif');
      t.setAttribute('font-weight', '700');
      t.setAttribute('fill', GOLD);
      t.setAttribute('stroke', 'none');
      t.setAttribute('class', 'streak');
      t.style.fontVariantNumeric = 'tabular-nums';
      this.svgEl.appendChild(t);
      this.streakEl = t;
    }
    this.streakEl.textContent = `\u2605\uFE0E ${this.streak}`; // black star, forced to text (not emoji) presentation
  }

  /** Draw one note (stem, ledger lines, accidental, label) into its own group. */
  private drawEntry(note: Note, opts: { color?: string; label?: boolean } = {}): Entry {
    const ctx = this.renderer!.getContext();
    const stave = this.stave!;
    const key = `${note.letter.toLowerCase()}${note.accidental}/${note.octave}`;
    const sn = new StaveNote({
      clef: this.clef,
      keys: [key],
      duration: 'q',
      autoStem: true,
    });
    if (note.accidental) sn.addModifier(new Accidental(note.accidental));
    if (opts.color) sn.setStyle({ fillStyle: opts.color, strokeStyle: opts.color });
    sn.setStave(stave);
    sn.setContext(ctx);
    const tc = new TickContext();
    tc.addTickable(sn).preFormat().setX(BASE_X);

    const outer = document.createElementNS(SVG_NS, 'g') as SVGGElement;
    this.svgEl!.appendChild(outer);
    const inner = ctx.openGroup() as SVGGElement;
    sn.draw();
    ctx.closeGroup();
    outer.appendChild(inner);

    const cx = (sn.getNoteHeadBeginX() + sn.getNoteHeadEndX()) / 2;
    if (opts.label ?? true) this.drawLabel(inner, note, cx, this.labels, opts.color);
    return { note, outer, inner, cx, startX: 0, endX: 0, durationMs: 0 };
  }

  /** Note name under the notehead, formatted with `mode` (nothing when the mode is none). */
  private drawLabel(inner: SVGGElement, note: Note, cx: number, mode: LabelMode, color?: string): void {
    const text = formatLabel(note, mode, this.locale);
    if (!text) return;
    const noteY = this.layout!.topLineY + noteOffsetY(note, this.clef);
    const labelY = Math.max(noteY + 34, this.layout!.topLineY + 4 * LINE_GAP + 26);
    const t = document.createElementNS(SVG_NS, 'text');
    t.setAttribute('x', String(cx));
    t.setAttribute('y', String(labelY));
    t.setAttribute('text-anchor', 'middle');
    t.setAttribute('font-size', '14');
    t.setAttribute('font-family', 'system-ui, sans-serif');
    t.setAttribute('font-weight', '600');
    t.setAttribute('fill', color ?? '#333');
    t.setAttribute('stroke', 'none');
    t.textContent = text;
    inner.appendChild(t);
  }

  /** A scrolling note: linear translateX from the right edge to the clef. */
  private makeScrolling(note: Note, progress: number): Entry {
    const layout = this.layout!;
    const e = this.drawEntry(note);
    const spacing = Math.max(64, (layout.vw - this.stave!.getNoteStartX()) / 5);
    const speed = (spacing * this.bpm) / 60; // virtual px per second
    e.startX = layout.vw + 30;
    e.endX = this.stave!.getNoteStartX() + 14;
    e.durationMs = ((e.startX - e.endX) / speed) * 1000;
    const from = e.startX - e.cx;
    const to = e.endX - e.cx;
    e.outer.setAttribute('transform', `translate(${from} 0)`);
    const anim = e.outer.animate([{ transform: `translate(${from}px, 0px)` }, { transform: `translate(${to}px, 0px)` }], {
      duration: e.durationMs,
      easing: 'linear',
      fill: 'forwards',
    });
    anim.currentTime = progress * e.durationMs;
    if (!this.running) anim.pause();
    anim.onfinish = () => this.miss(e);
    e.anim = anim;
    return e;
  }

  private miss(e: Entry): void {
    const i = this.queue.indexOf(e);
    if (i < 0) return;
    this.queue.splice(i, 1);
    this.feedback(e, 'miss');
    this.dispatchEvent(new CustomEvent('ks-note-missed', { detail: { note: e.note }, bubbles: true, composed: true }));
  }

  private motion(ms: number): number {
    return matchMedia('(prefers-reduced-motion: reduce)').matches ? ms * 0.3 : ms;
  }

  private tint(g: Element, color: string): void {
    g.querySelectorAll('path, rect, text, line').forEach((n) => {
      const el = n as SVGElement;
      el.style.fill = color;
      if (n.tagName !== 'text') el.style.stroke = color;
    });
  }

  /** Success (green pop) or miss (red shake) animation, then the note leaves the staff. */
  private feedback(e: Entry, kind: 'success' | 'miss'): void {
    const ok = kind === 'success';
    if (ok && this.labels === 'none') this.drawLabel(e.inner, e.note, e.cx, this.matchLabels);
    this.tint(e.inner, ok ? GREEN : RED);
    e.inner.style.transformBox = 'fill-box';
    e.inner.style.transformOrigin = 'center';
    const frames: Keyframe[] = ok
      ? [{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(1.5)', opacity: 0 }]
      : [
          { transform: 'translateX(0)', opacity: 1 },
          { transform: 'translateX(-6px)', opacity: 1, offset: 0.25 },
          { transform: 'translateX(6px)', opacity: 0.8, offset: 0.5 },
          { transform: 'translateX(0)', opacity: 0 },
        ];
    const a = e.inner.animate(frames, { duration: this.motion(ok ? 320 : 480), easing: 'ease-out', fill: 'forwards' });
    const done = () => {
      e.anim?.cancel();
      e.outer.remove();
      this.dispatchEvent(
        new CustomEvent('ks-note-cleared', { detail: { note: e.note, reason: ok ? 'played' : 'missed' }, bubbles: true, composed: true }),
      );
    };
    a.onfinish = done;
    a.oncancel = () => e.outer.remove();
  }

  /** Wrong press: the pressed note shows in red at its own pitch next to the target, then fades. */
  private flashWrong(pressed: Note, target: Entry): void {
    if (!this.layout || !this.stave) return;
    const e = this.drawEntry(pressed, { color: RED, label: false });
    // Current x of the target's notehead (virtual px).
    let targetX: number;
    if (this.mode === 'static' || !target.anim) targetX = this.staticCentre();
    else {
      const p = Math.min(1, Number(target.anim.currentTime ?? 0) / target.durationMs);
      targetX = target.startX + (target.endX - target.startX) * p;
    }
    const x = Math.min(this.layout.vw - 24, targetX + 38);
    e.outer.setAttribute('transform', `translate(${x - e.cx} 0)`);
    e.outer.classList.add('flash');
    const a = e.outer.animate([{ opacity: 1 }, { opacity: 1, offset: 0.4 }, { opacity: 0 }], {
      duration: this.motion(900),
      easing: 'ease-in',
      fill: 'forwards',
    });
    a.onfinish = () => e.outer.remove();
  }
}

if (!customElements.get('ks-score')) customElements.define('ks-score', KsScore);
