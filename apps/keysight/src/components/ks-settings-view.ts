// Settings view: every change is saved immediately through the settings store.
import { LabelMode, midiOf, parseNote } from '../core/notes';
import { Accidentals, Clef, rangeOptions } from '../core/pool';
import { Settings, Speed } from '../core/settings';
import { settingsStore } from '../state';

const STYLE = `
:host { display: block; height: 100%; overflow-y: auto; box-sizing: border-box; background: #f6f7fb; color: #1b1d23;
  padding: calc(72px + env(safe-area-inset-top)) max(16px, env(safe-area-inset-right)) calc(32px + env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-left));
  font-family: system-ui, sans-serif; -webkit-overflow-scrolling: touch; }
form { max-width: 520px; margin: 0 auto; display: grid; gap: 14px; }
h1 { margin: 0 0 4px; font-size: 22px; }
fieldset, .row { border: 1px solid #dfe2ea; border-radius: 14px; background: #fff; padding: 12px 14px; margin: 0; }
legend, .row > label:first-child { font-size: 12px; font-weight: 700; letter-spacing: .05em; text-transform: uppercase; color: #6b7080; padding: 0 4px; }
.seg { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 6px; }
.seg label { position: relative; flex: 1 1 auto; }
.seg input { position: absolute; opacity: 0; inset: 0; margin: 0; cursor: pointer; }
.seg span { display: block; text-align: center; padding: 9px 10px; border-radius: 10px; background: #eef0f6; font-size: 15px; font-weight: 600; min-width: 48px; }
.seg input:checked + span { background: #1d4ed8; color: #fff; }
.seg input:focus-visible + span { outline: 2px solid #1d4ed8; outline-offset: 2px; }
.pair { display: flex; gap: 10px; align-items: center; margin-top: 6px; }
select { flex: 1; min-width: 0; font: inherit; font-size: 16px; color: #1b1d23; padding: 9px 36px 9px 12px; border-radius: 10px; border: 1px solid #cfd3de;
  -webkit-appearance: none; appearance: none; cursor: pointer;
  background: #fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7080' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E") no-repeat right 12px center; }
select:focus-visible { outline: 2px solid #1d4ed8; outline-offset: 2px; }
input[type=range] { width: 100%; margin-top: 8px; }
.len { display: flex; justify-content: space-between; align-items: baseline; }
.len output { font-weight: 700; font-size: 15px; }
.toggle { display: flex; justify-content: space-between; align-items: center; }
.toggle input { width: 22px; height: 22px; accent-color: #1d4ed8; }
`;

function seg(name: string, options: Array<[string, string]>): string {
  return `<div class="seg">${options
    .map(([v, t]) => `<label><input type="radio" name="${name}" value="${v}"><span>${t}</span></label>`)
    .join('')}</div>`;
}

export class KsSettingsView extends HTMLElement {
  private unsub?: () => void;

  connectedCallback(): void {
    const root = this.shadowRoot ?? this.attachShadow({ mode: 'open' });
    root.innerHTML = `<style>${STYLE}</style>
    <form onsubmit="return false">
      <h1>Settings</h1>
      <fieldset><legend>Clef</legend>${seg('clef', [['treble', 'Treble'], ['bass', 'Bass']])}</fieldset>
      <fieldset><legend>Labels</legend>${seg('labels', [['none', 'None'], ['solfege', 'Do Re Mi'], ['letters', 'C D E'], ['both', 'Both']])}</fieldset>
      <fieldset><legend>Range</legend><div class="pair"><select name="rangeLow" aria-label="Lowest note"></select><span>to</span><select name="rangeHigh" aria-label="Highest note"></select></div></fieldset>
      <fieldset><legend>Sharps and flats</legend>${seg('accidentals', [['none', 'None'], ['sharps', 'Sharps ♯'], ['flats', 'Flats ♭'], ['both', 'Both']])}</fieldset>
      <fieldset><legend>Speed</legend>${seg('speed', [['static', 'Static'], ['20', '20 bpm'], ['40', '40 bpm'], ['80', '80 bpm']])}</fieldset>
      <fieldset><legend>Length</legend><div class="len"><span></span><output></output></div><input type="range" name="lengthMin" min="1" max="10" step="1" aria-label="Session length in minutes"></fieldset>
      <div class="row toggle"><label for="scaleStart">Scale start</label><input type="checkbox" id="scaleStart" name="scaleStart"></div>
    </form>`;
    root.addEventListener('change', (e) => this.onChange(e.target as HTMLInputElement));
    root.addEventListener('input', (e) => {
      const t = e.target as HTMLInputElement;
      if (t.name === 'lengthMin') this.onChange(t);
    });
    this.sync(settingsStore.get());
    this.unsub = settingsStore.subscribe((s) => this.sync(s));
  }

  disconnectedCallback(): void {
    this.unsub?.();
  }

  private onChange(t: HTMLInputElement): void {
    switch (t.name) {
      case 'clef': return settingsStore.set({ clef: t.value as Clef });
      case 'labels': return settingsStore.set({ labels: t.value as LabelMode });
      case 'accidentals': return settingsStore.set({ accidentals: t.value as Accidentals });
      case 'speed': return settingsStore.set({ speed: (t.value === 'static' ? 'static' : Number(t.value)) as Speed });
      case 'rangeLow': return settingsStore.set({ rangeLow: t.value });
      case 'rangeHigh': return settingsStore.set({ rangeHigh: t.value });
      case 'lengthMin': return settingsStore.set({ lengthMin: Number(t.value) });
      case 'scaleStart': return settingsStore.set({ scaleStart: t.checked });
    }
  }

  /** Push stored values into the controls without rebuilding them (keeps focus / slider drag). */
  private sync(s: Settings): void {
    const root = this.shadowRoot!;
    const check = (name: string, value: string) =>
      root.querySelectorAll<HTMLInputElement>(`input[name="${name}"]`).forEach((i) => (i.checked = i.value === value));
    check('clef', s.clef);
    check('labels', s.labels);
    check('accidentals', s.accidentals);
    check('speed', String(s.speed));
    // Range dropdowns: options depend on the clef; low must stay below high.
    const opts = rangeOptions(s.clef);
    const fill = (name: 'rangeLow' | 'rangeHigh', allowed: string[], value: string) => {
      const sel = root.querySelector<HTMLSelectElement>(`select[name="${name}"]`)!;
      sel.innerHTML = allowed.map((o) => `<option value="${o}">${o}</option>`).join('');
      sel.value = value;
    };
    fill('rangeLow', opts.filter((o) => midiOf(parseNote(o)) < midiOf(parseNote(s.rangeHigh))), s.rangeLow);
    fill('rangeHigh', opts.filter((o) => midiOf(parseNote(o)) > midiOf(parseNote(s.rangeLow))), s.rangeHigh);
    const slider = root.querySelector<HTMLInputElement>('input[name="lengthMin"]')!;
    slider.value = String(s.lengthMin);
    root.querySelector('.len span')!.textContent = 'Minutes';
    root.querySelector('.len output')!.textContent = `${s.lengthMin} min`;
    root.querySelector<HTMLInputElement>('#scaleStart')!.checked = s.scaleStart;
  }
}
if (!customElements.get('ks-settings-view')) customElements.define('ks-settings-view', KsSettingsView);
