// Minimal i18n: English (source), French, Italian. No library.
// Add a key to `en` first; TypeScript then forces fr and it to provide it too.

export type Lang = 'en' | 'fr' | 'it';
export const LANGS: Array<{ code: Lang; name: string }> = [
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'Français' },
  { code: 'it', name: 'Italiano' },
];

const en = {
  main: 'Main',
  play: 'Play',
  stop: 'Stop',
  settings: 'Settings',
  stats: 'Stats',
  clef: 'Clef',
  treble: 'Treble',
  bass: 'Bass',
  showLabels: 'Show note labels',
  underNote: 'Under note',
  onKey: 'On key',
  labels: 'Label format',
  none: 'None',
  solfege: 'Do Re Mi',
  letters: 'C D E',
  both: 'Both',
  range: 'Range',
  lowestNote: 'Lowest note',
  highestNote: 'Highest note',
  to: 'to',
  accidentals: 'Sharps and flats',
  sharps: 'Sharps ♯',
  flats: 'Flats ♭',
  speed: 'Speed',
  static: 'Static',
  bpm: '{n} bpm',
  length: 'Length',
  minutes: 'Minutes',
  lengthAria: 'Session length in minutes',
  minShort: '{n} min',
  scaleStart: 'Scale start',
  haptics: 'Haptic feedback',
  sound: 'Key sound',
  language: 'Language',
  last7: 'Last 7 days',
  last30: 'Last 30 days',
  notesOf: '{c} of {t} notes',
  sessions_one: '{n} session',
  sessions_other: '{n} sessions',
  noSessionsShort: 'No sessions yet',
  latest: 'Latest scores',
  when: 'When',
  hit: 'Hit',
  total: 'Total',
  statsEmpty: 'No sessions yet. Finish a session and your scores will show up here.',
  statsError: 'Could not load your sessions.',
  correct: 'Correct',
  hiddenNotes: '{n} notes of the range are off screen',
  fitKeys: 'Tap to fit all keys on screen',
};
type Dict = Record<keyof typeof en, string>;

const fr: Dict = {
  main: 'Principal',
  play: 'Jouer',
  stop: 'Arrêter',
  settings: 'Réglages',
  stats: 'Statistiques',
  clef: 'Clé',
  treble: 'Sol',
  bass: 'Fa',
  showLabels: 'Afficher les noms des notes',
  underNote: 'Sous la note',
  onKey: 'Sur la touche',
  labels: 'Format des étiquettes',
  none: 'Aucune',
  solfege: 'Do Ré Mi',
  letters: 'C D E',
  both: 'Les deux',
  range: 'Étendue',
  lowestNote: 'Note la plus grave',
  highestNote: 'Note la plus aiguë',
  to: 'à',
  accidentals: 'Dièses et bémols',
  sharps: 'Dièses ♯',
  flats: 'Bémols ♭',
  speed: 'Vitesse',
  static: 'Statique',
  bpm: '{n} bpm',
  length: 'Durée',
  minutes: 'Minutes',
  lengthAria: 'Durée de la séance en minutes',
  minShort: '{n} min',
  scaleStart: 'Début par la gamme',
  haptics: 'Retour haptique',
  sound: 'Son des touches',
  language: 'Langue',
  last7: '7 derniers jours',
  last30: '30 derniers jours',
  notesOf: '{c} notes sur {t}',
  sessions_one: '{n} séance',
  sessions_other: '{n} séances',
  noSessionsShort: 'Aucune séance',
  latest: 'Derniers scores',
  when: 'Date',
  hit: 'Justes',
  total: 'Total',
  statsEmpty: "Aucune séance pour l'instant. Terminez une séance et vos scores apparaîtront ici.",
  statsError: 'Impossible de charger vos séances.',
  correct: 'Justes',
  hiddenNotes: "{n} notes de l'étendue hors de l'écran",
  fitKeys: "Touchez pour afficher toutes les touches",
};

const it: Dict = {
  main: 'Principale',
  play: 'Gioca',
  stop: 'Ferma',
  settings: 'Impostazioni',
  stats: 'Statistiche',
  clef: 'Chiave',
  treble: 'Violino',
  bass: 'Basso',
  showLabels: 'Mostra i nomi delle note',
  underNote: 'Sotto la nota',
  onKey: 'Sul tasto',
  labels: 'Formato etichette',
  none: 'Nessuna',
  solfege: 'Do Re Mi',
  letters: 'C D E',
  both: 'Entrambe',
  range: 'Estensione',
  lowestNote: 'Nota più bassa',
  highestNote: 'Nota più alta',
  to: 'a',
  accidentals: 'Diesis e bemolli',
  sharps: 'Diesis ♯',
  flats: 'Bemolli ♭',
  speed: 'Velocità',
  static: 'Statico',
  bpm: '{n} bpm',
  length: 'Durata',
  minutes: 'Minuti',
  lengthAria: 'Durata della sessione in minuti',
  minShort: '{n} min',
  scaleStart: 'Inizia con la scala',
  haptics: 'Feedback aptico',
  sound: 'Suono dei tasti',
  language: 'Lingua',
  last7: 'Ultimi 7 giorni',
  last30: 'Ultimi 30 giorni',
  notesOf: '{c} note su {t}',
  sessions_one: '{n} sessione',
  sessions_other: '{n} sessioni',
  noSessionsShort: 'Nessuna sessione',
  latest: 'Ultimi punteggi',
  when: 'Quando',
  hit: 'Giuste',
  total: 'Totale',
  statsEmpty: 'Ancora nessuna sessione. Completa una sessione e i tuoi punteggi appariranno qui.',
  statsError: 'Impossibile caricare le sessioni.',
  correct: 'Giuste',
  hiddenNotes: "{n} note dell'estensione fuori schermo",
  fitKeys: 'Tocca per mostrare tutti i tasti',
};

const DICTS: Record<Lang, Dict> = { en, fr, it };
export type Key = keyof typeof en;

let current: Lang = 'en';

export function isLang(v: unknown): v is Lang {
  return v === 'en' || v === 'fr' || v === 'it';
}

/** First supported language in the browser's preference list, else English. */
export function detectLanguage(preferred: readonly string[] = []): Lang {
  for (const p of preferred) {
    const base = p.toLowerCase().split('-')[0];
    if (isLang(base)) return base;
  }
  return 'en';
}

export function setLanguage(lang: Lang): void {
  current = lang;
  if (typeof document !== 'undefined') document.documentElement.lang = lang;
}
export function getLanguage(): Lang {
  return current;
}

/** Translate a key; `{name}` placeholders are replaced from `vars`. */
export function t(key: Key, vars?: Record<string, string | number>): string {
  let s = DICTS[current][key];
  for (const [k, v] of Object.entries(vars ?? {})) s = s.replaceAll(`{${k}}`, String(v));
  return s;
}

/** "1 session" / "3 sessions" with the language's plural rule. */
export function sessionsLabel(n: number): string {
  const one = current === 'fr' ? n < 2 : n === 1;
  return t(one ? 'sessions_one' : 'sessions_other', { n });
}
