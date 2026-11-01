// Settings view: every change is saved immediately through the settings store.
import { LabelMode, midiOf, parseNote } from '../core/notes';
import { Accidentals, Clef, rangeOptions } from '../core/pool';
import { Settings, Speed } from '../core/settings';
import { LANGS, Lang, getLanguage, t } from '../i18n';
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
  private builtFor: Lang | null = null;
  private listening = false;

  connectedCallback(): void {
    this.build();
    this.sync(settingsStore.get());
    this.unsub = settingsStore.subscribe((s) => {
      const langChanged = this.builtFor !== getLanguage();
      if (langChanged) this.build();
      this.sync(s);
      if (langChanged) this.shadowRoot!.querySelector<HTMLSelectElement>('select[name="language"]')?.focus();
    });
  }

  disconnectedCallback(): void {
    this.unsub?.();
  }

  /** (Re)build the form in the current language. Listeners live on the shadow root, so they survive rebuilds. */
  private build(): void {
    const root = this.shadowRoot ?? this.attachShadow({ mode: 'open' });
    this.builtFor = getLanguage();
    const toggle = (name: string, label: string) =>
      `<div class="row toggle"><label for="${name}">${label}</label><input type="checkbox" id="${name}" name="${name}"></div>`;
    root.innerHTML = `<style>${STYLE}</style>
    <form onsubmit="return false">
      <h1>${t('settings')}</h1>
      <fieldset><legend>${t('clef')}</legend>${seg('clef', [['treble', t('treble')], ['bass', t('bass')]])}</fieldset>
      <fieldset><legend>${t('labels')}</legend>${seg('labels', [['none', t('none')], ['solfege', t('solfege')], ['letters', t('letters')], ['both', t('both')]])}</fieldset>
      <fieldset><legend>${t('range')}</legend><div class="pair"><select name="rangeLow" aria-label="${t('lowestNote')}"></select><span>${t('to')}</span><select name="rangeHigh" aria-label="${t('highestNote')}"></select></div></fieldset>
      <fieldset><legend>${t('accidentals')}</legend>${seg('accidentals', [['none', t('none')], ['sharps', t('sharps')], ['flats', t('flats')], ['both', t('both')]])}</fieldset>
      <fieldset><legend>${t('speed')}</legend>${seg('speed', [['static', t('static')], ['20', t('bpm', { n: 20 })], ['40', t('bpm', { n: 40 })], ['80', t('bpm', { n: 80 })]])}</fieldset>
      <fieldset><legend>${t('length')}</legend><div class="len"><span>${t('minutes')}</span><output></output></div><input type="range" name="lengthMin" min="1" max="10" step="1" aria-label="${t('lengthAria')}"></fieldset>
      ${toggle('scaleStart', t('scaleStart'))}
      ${toggle('pianoLabels', t('pianoLabels'))}
      ${toggle('haptics', t('haptics'))}
      <fieldset><legend>${t('language')}</legend><div class="pair"><select name="language" aria-label="${t('language')}">${LANGS.map((l) => `<option value="${l.code}">${l.name}</option>`).join('')}</select></div></fieldset>
    </form>`;
    if (!this.listening) {
      this.listening = true;
      root.addEventListener('change', (e) => this.onChange(e.target as HTMLInputElement));
      root.addEventListener('input', (e) => {
        const el = e.target as HTMLInputElement;
        if (el.name === 'lengthMin') this.onChange(el);
      });
    }
  }

  private onChange(el: HTMLInputElement): void {
    switch (el.name) {
      case 'clef': return settingsStore.set({ clef: el.value as Clef });
      case 'labels': return settingsStore.set({ labels: el.value as LabelMode });
      case 'accidentals': return settingsStore.set({ accidentals: el.value as Accidentals });
      case 'speed': return settingsStore.set({ speed: (el.value === 'static' ? 'static' : Number(el.value)) as Speed });
      case 'rangeLow': return settingsStore.set({ rangeLow: el.value });
      case 'rangeHigh': return settingsStore.set({ rangeHigh: el.value });
      case 'lengthMin': return settingsStore.set({ lengthMin: Number(el.value) });
      case 'scaleStart': return settingsStore.set({ scaleStart: el.checked });
      case 'pianoLabels': return settingsStore.set({ pianoLabels: el.checked });
      case 'haptics': return settingsStore.set({ haptics: el.checked });
      case 'language': return settingsStore.set({ language: el.value as Lang });
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
    root.querySelector('.len output')!.textContent = t('minShort', { n: s.lengthMin });
    for (const id of ['scaleStart', 'pianoLabels', 'haptics'] as const) root.querySelector<HTMLInputElement>(`#${id}`)!.checked = s[id];
    root.querySelector<HTMLSelectElement>('select[name="language"]')!.value = s.language;
  }
}
if (!customElements.get('ks-settings-view')) customElements.define('ks-settings-view', KsSettingsView);
