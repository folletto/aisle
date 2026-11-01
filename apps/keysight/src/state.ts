// App-wide settings store, backed by the data layer. Saved immediately on change.
import { Settings, normaliseSettings, updateSettings } from './core/settings';
import { getSettings, saveSettings } from './data/storage';
import { setLanguage } from './i18n';

type Listener = (s: Settings) => void;
let current: Settings = normaliseSettings({});
const listeners = new Set<Listener>();

export const settingsStore = {
  get: (): Settings => current,
  async load(): Promise<Settings> {
    current = await getSettings();
    setLanguage(current.language);
    listeners.forEach((l) => l(current));
    return current;
  },
  set(change: Partial<Settings>): void {
    current = updateSettings(current, change);
    setLanguage(current.language);
    void saveSettings(current);
    listeners.forEach((l) => l(current));
  },
  subscribe(fn: Listener): () => void {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};
