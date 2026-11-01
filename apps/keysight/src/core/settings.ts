// Settings model, defaults and validation.
import { Lang, isLang } from '../i18n';
import { LabelMode, midiOf, parseNote } from './notes';
import { Accidentals, CLEFS, Clef, rangeOptions } from './pool';

export type Speed = 'static' | 20 | 40 | 80;
/** Where note names are shown: under the score note, on the piano keys, both or nowhere. */
export type ShowLabels = 'none' | 'note' | 'key' | 'both';
const SHOW_LABELS: ShowLabels[] = ['none', 'note', 'key', 'both'];

export interface Settings {
  clef: Clef;
  showLabels: ShowLabels;
  /** Label format (solfege, letters or both), used wherever labels are shown. */
  labels: LabelMode;
  /** Show the label under a correctly matched note. Always on when labels show under the note. */
  matchLabel: boolean;
  rangeLow: string;
  rangeHigh: string;
  accidentals: Accidentals;
  speed: Speed;
  lengthMin: number;
  scaleStart: boolean;
  /** Haptic tick when a piano key is pressed (where supported). */
  haptics: boolean;
  /** Play a note when a key is pressed. */
  sound: boolean;
  language: Lang;
}

export const DEFAULT_SETTINGS: Settings = {
  clef: 'treble',
  showLabels: 'note',
  labels: 'letters',
  matchLabel: false,
  rangeLow: 'C4',
  rangeHigh: 'B4',
  accidentals: 'none',
  speed: 'static',
  lengthMin: 1,
  scaleStart: true,
  haptics: true,
  sound: false,
  language: 'en',
};

export function rangeIsValid(clef: Clef, low: string, high: string): boolean {
  const opts = rangeOptions(clef);
  return opts.includes(low) && opts.includes(high) && midiOf(parseNote(low)) < midiOf(parseNote(high));
}

/** Fill in missing / invalid fields. Used for stored data and after every change. */
export function normaliseSettings(input: Partial<Settings> | undefined): Settings {
  const raw = (input ?? {}) as Partial<Settings> & { pianoLabels?: unknown };
  const { pianoLabels, ...rest } = raw;
  const s: Settings = { ...DEFAULT_SETTINGS, ...rest };
  // Migrate the old model (labels 'none' + pianoLabels toggle) to showLabels.
  if (raw.showLabels === undefined && (raw.labels !== undefined || pianoLabels !== undefined)) {
    const note = raw.labels !== 'none';
    const key = raw.labels !== 'none' && Boolean(pianoLabels);
    s.showLabels = note && key ? 'both' : note ? 'note' : key ? 'key' : 'none';
  }
  if (!SHOW_LABELS.includes(s.showLabels)) s.showLabels = DEFAULT_SETTINGS.showLabels;
  if (s.clef !== 'treble' && s.clef !== 'bass') s.clef = DEFAULT_SETTINGS.clef;
  if (!['solfege', 'letters', 'both'].includes(s.labels)) s.labels = DEFAULT_SETTINGS.labels;
  if (!['none', 'sharps', 'flats', 'both'].includes(s.accidentals)) s.accidentals = 'none';
  if (![ 'static', 20, 40, 80].includes(s.speed)) s.speed = 'static';
  s.lengthMin = Math.min(10, Math.max(1, Math.round(Number.isFinite(Number(s.lengthMin)) ? Number(s.lengthMin) : DEFAULT_SETTINGS.lengthMin)));
  s.scaleStart = Boolean(s.scaleStart);
  s.matchLabel = Boolean(s.matchLabel);
  if (!isLang(s.language)) s.language = DEFAULT_SETTINGS.language;
  s.haptics = typeof s.haptics === 'boolean' ? s.haptics : DEFAULT_SETTINGS.haptics;
  s.sound = typeof s.sound === 'boolean' ? s.sound : DEFAULT_SETTINGS.sound;
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

/** Labels under the target note: always when shown under the note, else only on a match if enabled. */
export function labelsUnderNote(s: Settings): boolean {
  return s.showLabels === 'note' || s.showLabels === 'both';
}
export function labelOnMatch(s: Settings): boolean {
  return labelsUnderNote(s) || s.matchLabel;
}
