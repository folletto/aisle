import { afterEach, describe, expect, it } from 'vitest';
import { detectLanguage, sessionsLabel, setLanguage, t } from '../../src/i18n';
import { formatLabel, parseNote } from '../../src/core/notes';
import { normaliseSettings } from '../../src/core/settings';

afterEach(() => setLanguage('en'));

describe('i18n', () => {
  it('detects the first supported browser language', () => {
    expect(detectLanguage(['de-DE', 'fr-CA', 'en'])).toBe('fr');
    expect(detectLanguage(['it'])).toBe('it');
    expect(detectLanguage(['ja'])).toBe('en');
    expect(detectLanguage([])).toBe('en');
  });
  it('translates and fills placeholders', () => {
    expect(t('bpm', { n: 40 })).toBe('40 bpm');
    setLanguage('fr');
    expect(t('settings')).toBe('Réglages');
    expect(t('notesOf', { c: 3, t: 5 })).toBe('3 notes sur 5');
    setLanguage('it');
    expect(t('language')).toBe('Lingua');
  });
  it('applies plural rules', () => {
    expect(sessionsLabel(1)).toBe('1 session');
    expect(sessionsLabel(0)).toBe('0 sessions');
    setLanguage('fr');
    expect(sessionsLabel(0)).toBe('0 séance');
    expect(sessionsLabel(2)).toBe('2 séances');
    setLanguage('it');
    expect(sessionsLabel(2)).toBe('2 sessioni');
  });
  it('French writes Ré, Italian keeps Re', () => {
    expect(formatLabel(parseNote('D4'), 'solfege', 'fr')).toBe('Ré 4');
    expect(formatLabel(parseNote('D4'), 'solfege', 'it')).toBe('Re 4');
    expect(formatLabel(parseNote('D4'), 'both', 'fr')).toBe('Ré / D 4');
  });
  it('settings keep a valid language and reject others', () => {
    expect(normaliseSettings({ language: 'it' }).language).toBe('it');
    expect(normaliseSettings({ language: 'de' as never }).language).toBe('en');
  });
});
