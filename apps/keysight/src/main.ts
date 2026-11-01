import { registerSW } from 'virtual:pwa-register';
import './styles.css';
import './components/ks-app';
import { settingsStore } from './state';
import { requestPersistence } from './data/storage';

async function boot(): Promise<void> {
  await settingsStore.load();
  void requestPersistence();
  document.getElementById('app')!.appendChild(document.createElement('ks-app'));
  registerSW({ immediate: true });
}
boot();
