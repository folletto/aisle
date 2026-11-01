// Settings model, defaults and validation.
import { Lang, isLang } from '../i18n';
import { LabelMode, midiOf, parseNote } from './notes';
import { Accidentals, CLEFS, Clef, rangeOptions } from './pool';

export type Speed = 'static' | 20 | 40 | 80;

export interface Settings {
  clef: Clef;
  labels: LabelMode;
  rangeLow: string;
  rangeHigh: string;
  accidentals: Accidentals;
  speed: Speed;
  lengthMin: number;
  scaleStart: boolean;
  /** Show key names on the piano keys, formatted like the Labels setting. */
  pianoLabels: boolean;
  /** Haptic tick when a piano key is pressed (where supported). */
  haptics: boolean;
  language: Lang;
}

export const DEFAULT_SETTINGS: Settings = {
  clef: 'treble',
  labels: 'letters',
  rangeLow: 'C4',
  rangeHigh: 'B4',
  accidentals: 'none',
  speed: 'static',
  lengthMin: 2,
  scaleStart: true,
  pianoLabels: false,
  haptics: true,
  language: 'en',
};

export function rangeIsValid(clef: Clef, low: string, high: string): boolean {
  const opts = rangeOptions(clef);
  return opts.includes(low) && opts.includes(high) && midiOf(parseNote(low)) < midiOf(parseNote(high));
}

/** Fill in missing / invalid fields. Used for stored data and after every change. */
export function normaliseSettings(input: Partial<Settings> | undefined): Settings {
  const s: Settings = { ...DEFAULT_SETTINGS, ...(input ?? {}) };
  if (s.clef !== 'treble' && s.clef !== 'bass') s.clef = DEFAULT_SETTINGS.clef;
  if (!['none', 'solfege', 'letters', 'both'].includes(s.labels)) s.labels = DEFAULT_SETTINGS.labels;
  if (!['none', 'sharps', 'flats', 'both'].includes(s.accidentals)) s.accidentals = 'none';
  if (![ 'static', 20, 40, 80].includes(s.speed)) s.speed = 'static';
  s.lengthMin = Math.min(10, Math.max(1, Math.round(Number.isFinite(Number(s.lengthMin)) ? Number(s.lengthMin) : DEFAULT_SETTINGS.lengthMin)));
  s.scaleStart = Boolean(s.scaleStart);
  s.pianoLabels = Boolean(s.pianoLabels);
  if (!isLang(s.language)) s.language = DEFAULT_SETTINGS.language;
  s.haptics = typeof s.haptics === 'boolean' ? s.haptics : DEFAULT_SETTINGS.haptics;
  if (!rangeIsValid(s.clef, s.rangeLow, s.rangeHigh)) {
    s.rangeLow = CLEFS[s.clef].defaultLow;
    s.rangeHigh = CLEFS[s.clef].defaultHigh;
  }
  return s;
}

/** Apply a change; switching clef resets the range when it no longer fits. */
export function updateSettings(current: Settings, change: Partial<Settings>): Settings {
  const next = { ...current, ...change };
  if (change.clef && change.clef !== current.clef && !change.rangeLow && !change.rangeHigh) {
    next.rangeLow = CLEFS[next.clef].defaultLow;
    next.rangeHigh = CLEFS[next.clef].defaultHigh;
  }
  return normaliseSettings(next);
}
